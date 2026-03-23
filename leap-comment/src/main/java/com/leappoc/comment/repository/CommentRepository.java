package com.leappoc.comment.repository;

import com.leappoc.comment.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByEntityTypeValueAndEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(
            String entityType, Long entityId);
}
