package org.example.school_demo.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import lombok.Getter;
import org.example.school_demo.dto.response.ImportError;

import java.util.ArrayList;
import java.util.List;

/**
 * Excel 导入监听器（抽象基类）
 * 子类实现 validate() 和 convertToEntity() 即可复用解析流程
 *
 * @param <T> Excel 行数据 DTO 类型
 * @param <R> 创建成功后的响应类型
 */
public abstract class BaseExcelListener<T, R> implements ReadListener<T> {

    @Getter
    protected final List<R> createdRecords = new ArrayList<>();
    @Getter
    protected final List<ImportError> errors = new ArrayList<>();

    @Override
    public void invoke(T data, AnalysisContext context) {
        int rowNum = context.readRowHolder().getRowIndex() + 1;
        try {
            validate(data, rowNum);
            R record = convertToEntity(data);
            createdRecords.add(record);
        } catch (org.example.school_demo.exception.BusinessException e) {
            errors.add(ImportError.builder()
                    .row(rowNum)
                    .message(e.getMessage())
                    .data(buildErrorData(data, e))
                    .build());
        }
    }

    /**
     * 构建错误详情数据（默认返回 null，子类可重写）
     */
    protected java.util.Map<String, Object> buildErrorData(T data, org.example.school_demo.exception.BusinessException e) {
        return null;
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 全部解析完成
    }

    /**
     * 校验单行数据
     */
    protected abstract void validate(T data, int rowNum);

    /**
     * 转换为实体并持久化
     */
    protected abstract R convertToEntity(T data);
}
