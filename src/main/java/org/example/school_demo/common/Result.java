package org.example.school_demo.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用响应实体类
 * <p>
 * 所有 REST API 接口的响应都使用此类进行包装，确保返回格式统一。
 *
 * @param <T> 响应数据的泛型类型
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {

    /**
     * 状态码
     * 200: 成功
     * 400: 请求参数错误
     * 401: 未授权
     * 403: 禁止访问
     * 404: 资源不存在
     * 500: 服务器内部错误
     */
    private Integer code;

    /**
     * 响应消息
     * 成功时为 "success"，失败时为错误描述
     */
    private String message;

    /**
     * 响应数据主体
     * 具体业务数据封装在此字段中
     */
    private T data;

    /**
     * 响应时间戳
     * Unix 毫秒时间戳 (13 位)
     */
    private Long timestamp;

    /**
     * 是否成功（前端 ApiResponse 兼容字段）
     */
    public boolean isSuccess() {
        return code != null && code == 200;
    }

    /**
     * 构造成功响应（带数据）
     */
    public static <T> Result<T> success(T data) {
        return Result.<T>builder()
                .code(200)
                .message("success")
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * 构造成功响应（自定义消息 + 数据）
     */
    public static <T> Result<T> success(String message, T data) {
        return Result.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * 构造失败响应
     */
    public static <T> Result<T> error(String message) {
        return Result.<T>builder()
                .code(500)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * 构造失败响应（自定义状态码 + 消息）
     */
    public static <T> Result<T> error(Integer code, String message) {
        return Result.<T>builder()
                .code(code)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}