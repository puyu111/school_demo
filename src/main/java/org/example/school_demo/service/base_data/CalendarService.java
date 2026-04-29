package org.example.school_demo.service.base_data;

import org.example.school_demo.dto.base_data.request.CalendarSubmitReq;
import org.example.school_demo.dto.base_data.response.CalendarGetResp;
import org.example.school_demo.dto.base_data.response.CalendarSubmitResp;

import java.util.Map;

public interface CalendarService {

    CalendarGetResp get();

    Map<String, Object> submit(CalendarSubmitReq req);
}
