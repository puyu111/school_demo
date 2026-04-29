package org.example.school_demo.repository;

import org.example.school_demo.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {

    @Query(value = "SELECT * FROM schedule WHERE JSON_CONTAINS(weeks, CAST(:week AS JSON))", nativeQuery = true)
    List<ScheduleEntity> findByWeek(@Param("week") Integer week);

    @Query(value = "SELECT * FROM schedule WHERE JSON_CONTAINS(weeks, CAST(:week AS JSON)) AND weekday = :weekday", nativeQuery = true)
    List<ScheduleEntity> findByWeekAndWeekday(@Param("week") Integer week, @Param("weekday") Integer weekday);

    @Modifying
    @Query(value = "DELETE FROM schedule WHERE JSON_CONTAINS(weeks, CAST(:week AS JSON))", nativeQuery = true)
    void deleteByWeek(@Param("week") Integer week);
}
