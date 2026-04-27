package com.leappoc.comment.repository;

import com.leappoc.comment.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c WHERE c.reportType = :reportType " +
           "AND c.lineKey = :lineKey AND c.segmentName = :segmentName " +
           "AND c.deletedAt IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findThread(@Param("reportType") String reportType,
                             @Param("lineKey") String lineKey,
                             @Param("segmentName") String segmentName);

    @Query("SELECT c FROM Comment c WHERE c.reportType = :reportType " +
           "AND c.lineKey = :lineKey AND c.segmentName IS NULL " +
           "AND c.deletedAt IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findThreadNoSegment(@Param("reportType") String reportType,
                                      @Param("lineKey") String lineKey);

    List<Comment> findByParentId(Long parentId);

    @Query("SELECT c.lineKey, COUNT(c) FROM Comment c " +
           "WHERE c.reportType = :reportType AND c.segmentName = :segmentName " +
           "AND c.deletedAt IS NULL GROUP BY c.lineKey")
    List<Object[]> countByReportTypeAndSegment(@Param("reportType") String reportType,
                                                @Param("segmentName") String segmentName);

    @Query("SELECT c.lineKey, COUNT(c) FROM Comment c " +
           "WHERE c.reportType = :reportType AND c.segmentName IS NULL " +
           "AND c.deletedAt IS NULL GROUP BY c.lineKey")
    List<Object[]> countByReportTypeNoSegment(@Param("reportType") String reportType);
}
