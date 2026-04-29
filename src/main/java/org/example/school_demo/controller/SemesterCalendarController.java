package org.example.school_demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.request.CalendarSubmitReq;
import org.example.school_demo.dto.response.CalendarGetResp;
import org.example.school_demo.dto.response.CalendarSubmitResp;
import org.example.school_demo.service.SemesterCalendarService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/base-data/calendar")
@RequiredArgsConstructor
public class SemesterCalendarController {

    private final SemesterCalendarService semesterCalendarService;
    @GetMapping
    public Result<CalendarGetResp> get() {
        log.info("【获取学期日历】请求");

        CalendarGetResp resp = semesterCalendarService.get();
        return Result.success(resp);
    }
    @PostMapping
    public Result<CalendarSubmitResp> submit(@Validated @RequestBody CalendarSubmitReq req) {
        log.info("【提交学期日历】请求 - startDate: {}, endDate: {}, disabledCount: {}",
                req.getStartDate(), req.getEndDate(), req.getDisabledDates().size());

        Map<String, Object> result = semesterCalendarService.submit(req);
        boolean success = (boolean) result.get("success");

        if (success) {
            return Result.success((CalendarSubmitResp) result.get("data"));
        } else {
            String message = (String) result.get("message");
            return Result.error(400, message);
        }
    }


}
