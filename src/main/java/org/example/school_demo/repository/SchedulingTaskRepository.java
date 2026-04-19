package org.example.school_demo.repository;

import org.example.school_demo.entity.SchedulingTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 排课任务 Repository 接口
 */
@Repository
public interface SchedulingTaskRepository extends JpaRepository<SchedulingTaskEntity, String> {

    /**
     * 查找最近创建的任务
     */
    Optional<SchedulingTaskEntity> findFirstByOrderByCreatedTimeDesc();
}
