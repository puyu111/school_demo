package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 课程 Repository 接口
 */
@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, String> {

    /**
     * 按教师 ID 查询课程列表
     */
    List<CourseEntity> findByTeacherId(String teacherId);

    /**
     * 按班级 ID 查询课程列表
     */
    List<CourseEntity> findByClassId(String classId);

    /**
     * 查询指定学期的有效课程
     */
    @Query("SELECT c FROM CourseEntity c WHERE c.semester = :semester AND c.status = 'ACTIVE'")
    List<CourseEntity> findActiveCoursesBySemester(@Param("semester") String semester);

    /**
     * 统计某教师的课程数量
     */
    long countByTeacherId(String teacherId);
}
