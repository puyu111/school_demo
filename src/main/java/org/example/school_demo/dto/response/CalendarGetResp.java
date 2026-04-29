package org.example.school_demo.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class CalendarGetResp {

    private Long calendarId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private List<DisabledDateItem> disabledDates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisabledDateItem {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;

        private String remark;
    }
}
