package com.leappoc.comment.service;

import com.leappoc.shared.dto.*;

import java.util.List;
import java.util.Map;

public interface CommentService {

    List<CommentThreadDto> getThread(String reportType, String lineKey, String segmentName, String currentUserId);

    Map<String, List<CommentThreadDto>> getHierarchyThreads(String reportType, String segmentName,
                                                             String lineKey, String currentUserId);

    CommentDto createComment(CreateCommentRequest request,
                             String userId, String displayName, String email);

    CommentDto updateComment(Long id, String content, String driverCode, String currentUserId);

    void deleteComment(Long id, String currentUserId, boolean isAdmin);

    Map<String, Long> getCounts(String reportType, String segmentName);
}
