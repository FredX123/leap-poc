package com.leappoc.shared.exception;

public class CommentDepthExceededException extends BusinessException {

    public CommentDepthExceededException(int maxDepth) {
        super("Maximum comment thread depth of " + maxDepth + " exceeded", 400);
    }
}
