package org.example.school_demo.controller.base_data;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.request.CalendarSubmitReq;
import org.example.school_demo.dto.base_data.response.CalendarGetResp;
import org.example.school_demo.dto.base_data.response.CalendarSubmitResp;
import org.example.school_demo.service.base_data.CalendarService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/base-data/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public Result<CalendarGetResp> get() {
        log.info("【获取学期日历】请求");
        return Result.success(calendarService.get());
    }

    @PostMapping
    public Result<CalendarSubmitResp> submit(@Validated @RequestBody CalendarSubmitReq req) {
        log.info("【提交学期日历】请求 - startDate: {}, endDate: {}, disabledCount: {}",
                req.getStartDate(), req.getEndDate(), req.getDisabledDates().size());
        Map<String, Object> result = calendarService.submit(req);
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((CalendarSubmitResp) result.get("data"));
        } else {
            return Result.error(400, (String) result.get("message"));
        }
    }
}
