package com.leappoc.shared.exception;

public class CrossEntityReplyException extends BusinessException {

    public CrossEntityReplyException() {
        super("Reply must belong to the same entity as the parent comment", 400);
    }
}
