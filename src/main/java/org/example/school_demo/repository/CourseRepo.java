package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    /**
     * 按业务 ID 查重
     */
    @Query("SELECT COUNT(c) > 0 FROM CourseEntity c WHERE c.id = :id")
    boolean existsByBusinessId(@Param("id") String id);

    @Query("SELECT c FROM CourseEntity c WHERE c.courseId IN :ids")
    List<CourseEntity> findByIdIn(@Param("ids") List<Long> ids);

}