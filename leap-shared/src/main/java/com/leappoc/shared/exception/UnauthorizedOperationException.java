package com.leappoc.shared.exception;

public class UnauthorizedOperationException extends BusinessException {

    public UnauthorizedOperationException(String message) {
        super(message, 403);
    }
}
