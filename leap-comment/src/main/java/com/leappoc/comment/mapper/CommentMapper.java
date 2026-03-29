package com.leappoc.comment.mapper;

import com.leappoc.comment.model.Comment;
import com.leappoc.shared.dto.CommentDto;
import com.leappoc.shared.dto.CommentThreadDto;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentDto toDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUserId());
        dto.setDisplayName(comment.getDisplayName());
        dto.setEmail(comment.getEmail());
        dto.setContent(comment.getContent());
        dto.setParentId(comment.getParentId());
        dto.setEntityType(comment.getEntityType());
        dto.setEntityId(comment.getEntityId());
        dto.setEventType(comment.getEventType());
        dto.setMetadata(comment.getMetadata());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setEdited(comment.isEdited());
        return dto;
    }

    public CommentThreadDto toThreadDto(Comment comment) {
        CommentThreadDto dto = new CommentThreadDto();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUserId());
        dto.setDisplayName(comment.getDisplayName());
        dto.setEmail(comment.getEmail());
        dto.setContent(comment.getContent());
        dto.setParentId(comment.getParentId());
        dto.setEntityType(comment.getEntityType());
        dto.setEntityId(comment.getEntityId());
        dto.setEventType(comment.getEventType());
        dto.setMetadata(comment.getMetadata());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setEdited(comment.isEdited());
        return dto;
    }
}
