package org.example.school_demo.service;

import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.PageResult;

import java.util.function.Function;

/**
 * 通用分页查询服务接口
 *
 * 这是一个通用接口，定义了分页查询的基本方法。
 * 具体的服务接口可以继承此接口以获得通用的分页能力。
 *
 * @param <T> 响应 DTO 类型
 * @param <ID> 主键 ID 类型
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
public interface IBaseService<T, ID> {

    /**
     * 分页获取列表
     *
     * @param pageReq 分页请求参数
     * @return 分页结果
     */
    PageResult<T> getPageList(PageReq pageReq);

    /**
     * 根据 ID 获取详情
     *
     * @param id 主键 ID
     * @return 详情数据
     */
    T getById(ID id);
}