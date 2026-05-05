package org.example.school_demo.service.schedule;

import org.example.school_demo.dto.schedule.request.*;
import org.example.school_demo.dto.schedule.response.*;

import java.util.List;
import java.util.Map;

public interface ScheduleService {

    List<ScheduleVO> getScheduleList(Integer week, Long teacherId, String classId, Long roomId);

    Map<String, Object> getScheduleDetail(Long id);

    Map<String, Object> createSchedule(ScheduleCreateReq req);

    Map<String, Object> updateSchedule(Long id, ScheduleUpdateReq req);

    Map<String, Object> deleteSchedule(Long id);

    Map<String, Object> batchDeleteSchedule(ScheduleBatchDeleteReq req);

    Map<String, Object> moveSchedule(ScheduleMoveReq req);

    Map<String, Object> saveSchedule(ScheduleSaveReq req);

    Map<String, Object> checkConflict(ScheduleConflictCheckReq req);

    ScheduleStatsResp getStats();

    Map<String, Object> exportSchedule(Integer week, String classId);

    Map<String, Object> importSchedule(List<ScheduleCreateReq> courses);
}
