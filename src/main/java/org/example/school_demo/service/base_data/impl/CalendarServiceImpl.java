package org.example.school_demo.service.base_data.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.request.CalendarSubmitReq;
import org.example.school_demo.dto.base_data.response.CalendarGetResp;
import org.example.school_demo.dto.base_data.response.CalendarSubmitResp;
import org.example.school_demo.entity.Calendar;
import org.example.school_demo.entity.DisabledDate;
import org.example.school_demo.exception.BusinessException;
import org.example.school_demo.repository.CalendarRepository;
import org.example.school_demo.repository.DisabledDateRepository;
import org.example.school_demo.service.base_data.CalendarService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarServiceImpl implements CalendarService {

    private final CalendarRepository calendarRepo;
    private final DisabledDateRepository disabledDateRepo;

    @Override
    @Transactional
    public Map<String, Object> submit(CalendarSubmitReq req) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BusinessException("结束日期不能早于开始日期");
        }

        List<Calendar> existing = calendarRepo.findAll();
        for (Calendar cal : existing) {
            disabledDateRepo.deleteByCalendarId(cal.getCalendarId());
            calendarRepo.delete(cal);
        }
        calendarRepo.flush();

        Calendar calendar = Calendar.builder()
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();

        Calendar saved = calendarRepo.save(calendar);

        for (CalendarSubmitReq.DisabledDateItem item : req.getDisabledDates()) {
            DisabledDate dd = DisabledDate.builder()
                    .calendarId(saved.getCalendarId())
                    .date(item.getDate())
                    .remark(item.getRemark())
                    .build();
            disabledDateRepo.save(dd);
        }

        log.info("学期日历提交成功，禁用日期数：{}", req.getDisabledDates().size());

        CalendarSubmitResp resp = CalendarSubmitResp.builder()
                .calendarId(saved.getCalendarId())
                .startDate(saved.getStartDate())
                .endDate(saved.getEndDate())
                .disabledCount(req.getDisabledDates().size())
                .build();

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    public CalendarGetResp get() {
        return calendarRepo.findAll().stream().findFirst()
                .map(this::toGetResp)
                .orElseGet(() -> CalendarGetResp.builder().build());
    }

    private CalendarGetResp toGetResp(Calendar calendar) {
        List<DisabledDate> disabledDates = disabledDateRepo.findByCalendarId(calendar.getCalendarId());

        List<CalendarGetResp.DisabledDateItem> items = disabledDates.stream()
                .map(d -> CalendarGetResp.DisabledDateItem.builder()
                        .date(d.getDate())
                        .remark(d.getRemark())
                        .build())
                .collect(Collectors.toList());

        return CalendarGetResp.builder()
                .calendarId(calendar.getCalendarId())
                .startDate(calendar.getStartDate())
                .endDate(calendar.getEndDate())
                .disabledDates(items)
                .build();
    }
}
