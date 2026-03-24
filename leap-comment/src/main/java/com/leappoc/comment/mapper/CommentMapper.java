package com.leappoc.comment.mapper;

import com.leappoc.comment.model.Comment;
import com.leappoc.shared.dto.CommentDto;
import com.leappoc.shared.dto.CommentThreadDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "edited", expression = "java(comment.isEdited())")
    @Mapping(target = "owner", ignore = true)
    CommentDto toDto(Comment comment);

    @Mapping(target = "edited", expression = "java(comment.isEdited())")
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "replies", ignore = true)
    CommentThreadDto toThreadDto(Comment comment);
}
