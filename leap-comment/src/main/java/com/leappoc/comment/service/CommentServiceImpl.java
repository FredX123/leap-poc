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
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    @Value("${comment.max-thread-depth:5}")
    private int maxThreadDepth;

    private final CommentRepository repository;
    private final CommentMapper mapper;

    public CommentServiceImpl(CommentRepository repository, CommentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentThreadDto> getThread(String reportType, String lineKey, String segmentName, String currentUserId) {
        validateReportType(reportType);

        List<Comment> comments = (segmentName != null)
                ? repository.findThread(reportType, lineKey, segmentName)
                : repository.findThreadNoSegment(reportType, lineKey);

        Map<Long, CommentThreadDto> dtoMap = new LinkedHashMap<>();
        for (Comment c : comments) {
            CommentThreadDto dto = mapper.toThreadDto(c);
            dto.setOwner(c.getUserId().equals(currentUserId));
            dtoMap.put(c.getId(), dto);
        }

        List<CommentThreadDto> roots = new ArrayList<>();
        for (Comment c : comments) {
            CommentThreadDto dto = dtoMap.get(c.getId());
            if (c.getParentId() != null && dtoMap.containsKey(c.getParentId())) {
                dtoMap.get(c.getParentId()).getReplies().add(dto);
            } else {
                roots.add(dto);
            }
        }

        for (CommentThreadDto dto : dtoMap.values()) {
            dto.setHasReplies(!dto.getReplies().isEmpty());
        }

        return roots;
    }

    @Override
    @Transactional
    public CommentDto createComment(CreateCommentRequest request,
                                    String userId, String displayName, String email) {
        validateReportType(request.getReportType());

        String eventType = CommentEventType.COMMENT.name();

        if (request.getParentId() != null) {
            Comment parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment", request.getParentId()));

            if (parent.getDeletedAt() != null) {
                throw new ResourceNotFoundException("Parent comment", request.getParentId());
            }

            if (!parent.getReportType().equals(request.getReportType())
                    || !parent.getLineKey().equals(request.getLineKey())) {
                throw new CrossEntityReplyException();
            }

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
        comment.setReportType(request.getReportType());
        comment.setLineKey(request.getLineKey());
        comment.setSegmentName(request.getSegmentName());
        comment.setCategoryCode(request.getCategoryCode() != null ? request.getCategoryCode() : "NONE");
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

        softDeleteRecursively(id);
    }

    private void softDeleteRecursively(Long commentId) {
        List<Comment> children = repository.findByParentId(commentId);
        for (Comment child : children) {
            if (child.getDeletedAt() == null) {
                softDeleteRecursively(child.getId());
            }
        }
        Comment comment = repository.findById(commentId).orElse(null);
        if (comment != null && comment.getDeletedAt() == null) {
            comment.setDeletedAt(LocalDateTime.now());
            repository.save(comment);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getCounts(String reportType, String segmentName) {
        validateReportType(reportType);

        List<Object[]> rows = (segmentName != null)
                ? repository.countByReportTypeAndSegment(reportType, segmentName)
                : repository.countByReportTypeNoSegment(reportType);

        return rows.stream().collect(Collectors.toMap(
                r -> (String) r[0],
                r -> (Long) r[1]
        ));
    }

    // --------------- private helpers ---------------

    private Comment findActiveComment(Long id) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", id));
        if (comment.getDeletedAt() != null) {
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

    private void validateReportType(String reportType) {
        try {
            CommentEntityType.valueOf(reportType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid report type: " + reportType);
        }
    }
}
