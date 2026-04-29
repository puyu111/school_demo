package org.example.school_demo.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarSubmitReq {

    @NotNull(message = "开始日期不能为空")
    private LocalDate startDate;

    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;

    @NotEmpty(message = "禁用日期列表不能为空")
    @Valid
    private List<DisabledDateItem> disabledDates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisabledDateItem {
        @NotNull(message = "日期不能为空")
        private LocalDate date;

        private String remark;
    }
}
