package com.leappoc.comment.service;

import com.leappoc.comment.mapper.CommentMapper;
import com.leappoc.comment.model.Comment;
import com.leappoc.comment.repository.CommentRepository;
import com.leappoc.shared.dto.*;
import com.leappoc.shared.enums.CommentEntityType;
import com.leappoc.shared.enums.CommentEventType;
import com.leappoc.shared.exception.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CommentServiceImpl implements CommentService {

    @Value( "${comment.max-thread-depth:5}")
    private int maxThreadDepth;

    private final CommentRepository repository;
    private final CommentMapper mapper;

    public CommentServiceImpl(CommentRepository repository, CommentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentThreadDto> getThread(String entityType, Long entityId, String currentUserId) {
        validateEntityType(entityType);

        List<Comment> comments = repository
                .findByEntityTypeAndEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(entityType, entityId);

        // Map entities → DTOs and index by ID
        Map<Long, CommentThreadDto> dtoMap = new LinkedHashMap<>();
        for (Comment c : comments) {
            CommentThreadDto dto = mapper.toThreadDto(c);
            dto.setOwner(c.getUserId().equals(currentUserId));
            dtoMap.put(c.getId(), dto);
        }

        // Assemble adjacency tree
        List<CommentThreadDto> roots = new ArrayList<>();
        for (Comment c : comments) {
            CommentThreadDto dto = dtoMap.get(c.getId());
            if (c.getParentId() != null && dtoMap.containsKey(c.getParentId())) {
                dtoMap.get(c.getParentId()).getReplies().add(dto);
            } else {
                roots.add(dto);
            }
        }

        return roots;
    }

    @Override
    @Transactional
    public CommentDto createComment(CreateCommentRequest request,
                                    String userId, String displayName, String email) {
        validateEntityType(request.getEntityType());

        String eventType = CommentEventType.COMMENT.name();

        if (request.getParentId() != null) {
            Comment parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment", request.getParentId()));

            // Replies must belong to the same entity
            if (!parent.getEntityType().equals(request.getEntityType())
                    || !parent.getEntityId().equals(request.getEntityId())) {
                throw new CrossEntityReplyException();
            }

            // Enforce max thread depth
            int depth = calculateDepth(parent);
            if (depth >= maxThreadDepth) {
                throw new CommentDepthExceededException(maxThreadDepth);
            }

            eventType = CommentEventType.REPLY.name();
        }

        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setDisplayName(displayName);
        comment.setEmail(email);
        comment.setContent(request.getContent());
        comment.setParentId(request.getParentId());
        comment.setEntityType(request.getEntityType());
        comment.setEntityId(request.getEntityId());
        comment.setEventType(eventType);

        Comment saved = repository.save(comment);

        CommentDto dto = mapper.toDto(saved);
        dto.setOwner(true);
        return dto;
    }

    @Override
    @Transactional
    public CommentDto updateComment(Long id, String content, String currentUserId) {
        Comment comment = findActiveComment(id);

        if (!comment.getUserId().equals(currentUserId)) {
            throw new UnauthorizedOperationException("You can only edit your own comments");
        }

        comment.setContent(content);
        Comment saved = repository.save(comment);

        CommentDto dto = mapper.toDto(saved);
        dto.setOwner(true);
        return dto;
    }

    @Override
    @Transactional
    public void deleteComment(Long id, String currentUserId, boolean isAdmin) {
        Comment comment = findActiveComment(id);

        if (!isAdmin && !comment.getUserId().equals(currentUserId)) {
            throw new UnauthorizedOperationException("You can only delete your own comments");
        }

        comment.setDeletedAt(LocalDateTime.now());
        repository.save(comment);
    }

    // --------------- private helpers ---------------

    private Comment findActiveComment(Long id) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", id));
        if (comment.isDeleted()) {
            throw new ResourceNotFoundException("Comment", id);
        }
        return comment;
    }

    private int calculateDepth(Comment comment) {
        int depth = 1;
        Long parentId = comment.getParentId();
        while (parentId != null && depth < maxThreadDepth + 1) {
            Comment parent = repository.findById(parentId).orElse(null);
            if (parent == null) break;
            parentId = parent.getParentId();
            depth++;
        }
        return depth;
    }

    private void validateEntityType(String entityType) {
        try {
            CommentEntityType.valueOf(entityType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid entity type: " + entityType);
        }
    }
}
