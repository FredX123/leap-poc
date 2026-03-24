package com.leappoc.comment.repository;

import com.leappoc.comment.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
            String entityType, Long entityId);

    /** Find all direct and indirect children of a comment (by parentId chain). */
    List<Comment> findByParentId(Long parentId);

    /** Count comments for multiple entities in one query. */
    @Query("SELECT c.entityId, COUNT(c) FROM Comment c " +
           "WHERE c.entityType = :entityType AND c.entityId IN :entityIds " +
           "GROUP BY c.entityId")
    List<Object[]> countByEntityTypeAndEntityIds(@Param("entityType") String entityType,
                                                  @Param("entityIds") List<Long> entityIds);
}
