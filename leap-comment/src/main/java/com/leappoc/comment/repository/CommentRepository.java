package com.leappoc.comment.repository;

import com.leappoc.comment.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByEntityTypeAndEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(
            String entityType, Long entityId);

    /** Fetch ALL comments (including soft-deleted) for tree assembly with deleted placeholders. */
    List<Comment> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
            String entityType, Long entityId);

    /** Count non-deleted comments for a single entity. */
    long countByEntityTypeAndEntityIdAndDeletedAtIsNull(String entityType, Long entityId);

    /** Count non-deleted comments for multiple entities in one query. */
    @Query("SELECT c.entityId, COUNT(c) FROM Comment c " +
           "WHERE c.entityType = :entityType AND c.entityId IN :entityIds AND c.deletedAt IS NULL " +
           "GROUP BY c.entityId")
    List<Object[]> countByEntityTypeAndEntityIds(@Param("entityType") String entityType,
                                                  @Param("entityIds") List<Long> entityIds);
}
