package org.example.school_demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.request.CalendarSubmitReq;
import org.example.school_demo.dto.response.CalendarGetResp;
import org.example.school_demo.dto.response.CalendarSubmitResp;
import org.example.school_demo.entity.DisabledDateEntity;
import org.example.school_demo.entity.SemesterCalendarEntity;
import org.example.school_demo.exception.BusinessException;
import org.example.school_demo.repository.DisabledDateRepo;
import org.example.school_demo.repository.SemesterCalendarRepo;
import org.example.school_demo.service.SemesterCalendarService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SemesterCalendarServiceImpl implements SemesterCalendarService {

    private final SemesterCalendarRepo semesterCalendarRepo;
    private final DisabledDateRepo disabledDateRepo;

    @Override
    @Transactional
    public Map<String, Object> submit(CalendarSubmitReq req) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BusinessException("结束日期不能早于开始日期");
        }

        List<SemesterCalendarEntity> existingCalendars = semesterCalendarRepo.findAll();
        if (!existingCalendars.isEmpty()) {
            for (SemesterCalendarEntity calendar : existingCalendars) {
                List<DisabledDateEntity> disabledDates = disabledDateRepo.findByCalendarId(calendar.getCalendarId());
                for (DisabledDateEntity d : disabledDates) {
                    disabledDateRepo.delete(d);
                }
                semesterCalendarRepo.delete(calendar);
            }
            semesterCalendarRepo.flush();
        }

        String semesterName = buildSemesterName(req.getStartDate(), req.getEndDate());

        SemesterCalendarEntity calendar = SemesterCalendarEntity.builder()
                .semesterName(semesterName)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();

        SemesterCalendarEntity saved = semesterCalendarRepo.save(calendar);

        for (CalendarSubmitReq.DisabledDateItem item : req.getDisabledDates()) {
            DisabledDateEntity entity = DisabledDateEntity.builder()
                    .calendarId(saved.getCalendarId())
                    .date(item.getDate())
                    .remark(item.getRemark())
                    .build();
            disabledDateRepo.save(entity);
        }

        log.info("学期日历提交成功，学期：{}，禁用日期数：{}", semesterName, req.getDisabledDates().size());

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
        return semesterCalendarRepo.findAll().stream().findFirst()
                .map(this::toGetResp)
                .orElseGet(() -> CalendarGetResp.builder().build());
    }

    private CalendarGetResp toGetResp(SemesterCalendarEntity calendar) {
        List<DisabledDateEntity> disabledDates = disabledDateRepo.findByCalendarId(calendar.getCalendarId());

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

    private String buildSemesterName(LocalDate startDate, LocalDate endDate) {
        DateTimeFormatter y = DateTimeFormatter.ofPattern("yyyy");
        String year1 = startDate.format(y);
        String year2 = endDate.format(y);
        return year1 + "-" + year2 + "第一学期";
    }
}
