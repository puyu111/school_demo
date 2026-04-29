package org.example.school_demo.service;

import org.example.school_demo.dto.request.CalendarSubmitReq;
import org.example.school_demo.dto.response.CalendarGetResp;
import org.example.school_demo.dto.response.CalendarSubmitResp;

import java.util.Map;

public interface SemesterCalendarService {

    Map<String, Object> submit(CalendarSubmitReq req);

    CalendarGetResp get();
}
