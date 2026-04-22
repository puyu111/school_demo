package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 课程数据访问层接口
 */
@Repository
public interface CourseRepo extends JpaRepository<CourseEntity, Long> {

    /**
     * 根据课程名称模糊查询
     */
    Page<CourseEntity> findByCourseNameContaining(String courseName, Pageable pageable);

    /**
     * 根据课程类型查询
     */
    Page<CourseEntity> findByCourseType(String courseType, Pageable pageable);
}