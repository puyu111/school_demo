package org.example.school_demo.listener.base_data;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import lombok.Getter;
import org.example.school_demo.dto.base_data.response.ImportError;
import org.example.school_demo.exception.BusinessException;

import java.util.ArrayList;
import java.util.List;

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

    protected java.util.Map<String, Object> buildErrorData(T data, BusinessException e) {
        return null;
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
    }

    protected abstract void validate(T data, int rowNum);

    protected abstract R convertToEntity(T data);
}
