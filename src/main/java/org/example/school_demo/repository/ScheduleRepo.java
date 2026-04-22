package org.example.school_demo.repository;

import org.example.school_demo.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 排课记录数据访问层接口
 */
@Repository
public interface ScheduleRepo extends JpaRepository<ScheduleEntity, Long> {

    /**
     * 根据课程 ID 查询排课记录
     */
    List<ScheduleEntity> findByCourseId(Long courseId);

    /**
     * 根据教师 ID 查询排课记录
     */
    List<ScheduleEntity> findByTeacherId(Long teacherId);

    /**
     * 根据班级 ID 查询排课记录
     */
    List<ScheduleEntity> findByClassId(Long classId);

    /**
     * 根据教室 ID 查询排课记录
     */
    List<ScheduleEntity> findByRoomId(Long roomId);

    /**
     * 根据学期 ID 查询排课记录
     */
    List<ScheduleEntity> findBySemesterId(Long semesterId);

    /**
     * 根据上课日期范围查询
     */
    List<ScheduleEntity> findByClassTimeBetween(LocalDate startDate, LocalDate endDate);

    /**
     * 根据教师和日期查询
     */
    List<ScheduleEntity> findByTeacherIdAndClassTime(Long teacherId, LocalDate date);

    /**
     * 根据教室和日期查询
     */
    List<ScheduleEntity> findByRoomIdAndClassTime(Long roomId, LocalDate date);

    /**
     * 根据周次和节次查询（用于检查时间冲突）
     */
    List<ScheduleEntity> findByWeekAndPeriod(Integer week, Integer period);

    /**
     * 查询指定学期的排课记录
     */
    @Query("SELECT s FROM ScheduleEntity s WHERE s.semesterId = :semesterId")
    List<ScheduleEntity> findBySemester(@Param("semesterId") Long semesterId);
}