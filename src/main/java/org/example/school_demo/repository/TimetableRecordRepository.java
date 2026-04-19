package org.example.school_demo.repository;

import org.example.school_demo.entity.TimetableRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 排课结果 Repository 接口
 */
@Repository
public interface TimetableRecordRepository extends JpaRepository<TimetableRecordEntity, Long> {

    /**
     * 按任务 ID 查询所有记录
     */
    List<TimetableRecordEntity> findByTaskId(String taskId);

    /**
     * 按方案 ID 查询所有记录
     */
    List<TimetableRecordEntity> findBySolutionId(String solutionId);

    /**
     * 按课程 ID 查询记录
     */
    List<TimetableRecordEntity> findByCourseId(String courseId);

    /**
     * 查询某时间段已被占用的教室
     */
    @Query("SELECT t.classroomId FROM TimetableRecordEntity t WHERE t.timeSlotId = :timeSlotId")
    List<String> findOccupiedClassroomsByTimeSlot(@Param("timeSlotId") String timeSlotId);

    /**
     * 查询某教师在某时间段是否有课
     */
    boolean existsByTeacherIdAndTimeSlotId(String teacherId, String timeSlotId);

    /**
     * 按任务 ID 和状态查询
     */
    List<TimetableRecordEntity> findByTaskIdAndStatus(String taskId, TimetableRecordEntity.TimetableStatus status);
}
