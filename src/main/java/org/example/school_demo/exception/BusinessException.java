package org.example.school_demo.exception;

/**
 * 业务异常（通用）
 * 用于各业务模块的异常抛出（ID重复、字段缺失等）
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
