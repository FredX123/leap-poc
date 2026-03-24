package com.leappoc.shared.exception;

/**
 * Base class for application-level business exceptions.
 * Carries an HTTP status code for the global exception handler.
 */
public abstract class BusinessException extends RuntimeException {

    private final int status;

    protected BusinessException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() { return status; }
}
