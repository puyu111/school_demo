package org.example.school_demo.repository;

import org.example.school_demo.entity.ScheduleHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleHistoryRepository extends JpaRepository<ScheduleHistoryEntity, Long> {

    List<ScheduleHistoryEntity> findAllByOrderByTimestampDesc();

    Page<ScheduleHistoryEntity> findAllByOrderByTimestampDesc(Pageable pageable);
}
