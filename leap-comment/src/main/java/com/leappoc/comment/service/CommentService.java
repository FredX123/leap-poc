package com.leappoc.comment.service;

import com.leappoc.shared.dto.*;

import java.util.List;
import java.util.Map;

public interface CommentService {

    List<CommentThreadDto> getThread(String entityType, Long entityId, String currentUserId);

    CommentDto createComment(CreateCommentRequest request,
                             String userId, String displayName, String email);

    CommentDto updateComment(Long id, String content, String currentUserId);

    void deleteComment(Long id, String currentUserId, boolean isAdmin);

    /** Returns entityId → commentCount for the given entity IDs. */
    Map<Long, Long> getCounts(String entityType, List<Long> entityIds);
}
