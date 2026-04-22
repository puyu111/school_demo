package org.example.school_demo.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.PageResult;
import org.example.school_demo.service.IBaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.function.Function;

/**
 * 通用分页查询服务实现类
 *
 * 这是一个通用实现类，封装了分页查询的通用逻辑。
 * 具体的服务实现类可以继承此类以避免重复代码。
 *
 * 使用示例：
 * <pre>
 * &#64;Service
 * public class TeacherServiceImpl extends BaseServiceImpl&lt;TeacherListResp, Long, TeacherEntity&gt;
 *         implements TeacherService {
 *
 *     public TeacherServiceImpl(TeacherRepo repo) {
 *         super(repo, this::entityToResp);
 *     }
 *
 *     private Function&lt;TeacherEntity, TeacherListResp&gt; entityToResp = entity -&gt; {
 *         return TeacherListResp.builder()...build();
 *     };
 * }
 * </pre>
 *
 * @param <T> 响应 DTO 类型
 * @param <ID> 主键 ID 类型
 * @param <E> 实体类型
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@RequiredArgsConstructor
public abstract class BaseServiceImpl<T, ID, E> implements IBaseService<T, ID> {

    private final JpaRepository<E, ID> repository;
    private final Function<E, T> entityToDtoConverter;

    @Override
    public PageResult<T> getPageList(PageReq pageReq) {
        Page<E> page = repository.findAll(pageReq.toPageable());
        return PageResult.of(
                page.getContent().stream().map(entityToDtoConverter).toList(),
                page.getTotalElements()
        );
    }

    @Override
    public T getById(ID id) {
        return repository.findById(id)
                .map(entityToDtoConverter)
                .orElseThrow(() -> new RuntimeException("记录不存在，ID: " + id));
    }
}