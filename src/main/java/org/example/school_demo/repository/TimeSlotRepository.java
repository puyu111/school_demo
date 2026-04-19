package org.example.school_demo.repository;

import org.example.school_demo.entity.TimeSlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 时间段 Repository 接口
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlotEntity, String> {

    /**
     * 按星期几分组查询
     */
    List<TimeSlotEntity> findByDayOfWeekOrderByPeriod(int dayOfWeek);

    /**
     * 查询所有时间段 ID
     */
    @Query("SELECT t.id FROM TimeSlotEntity t ORDER BY t.dayOfWeek, t.period")
    List<String> findAllTimeSlotIds();
}
