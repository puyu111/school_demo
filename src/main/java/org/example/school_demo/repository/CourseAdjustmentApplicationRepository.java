package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseAdjustmentApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CourseAdjustmentApplicationRepository extends JpaRepository<CourseAdjustmentApplication, String> {

    @Query("SELECT a FROM CourseAdjustmentApplication a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:urgency IS NULL OR a.urgency = :urgency) AND " +
           "(:department IS NULL OR a.department = :department) AND " +
           "(:keyword IS NULL OR a.teacherName LIKE %:keyword% OR a.originalCourse LIKE %:keyword%)")
    Page<CourseAdjustmentApplication> findByFilters(
            @Param("status") String status,
            @Param("urgency") String urgency,
            @Param("department") String department,
            @Param("keyword") String keyword,
            Pageable pageable);

    long countByStatus(String status);

    long countByUrgency(String urgency);

    long countByApplyTimeAfter(LocalDateTime since);

    long countByIdStartingWith(String prefix);

    @Query("SELECT a.department, COUNT(a), " +
           "SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) " +
           "FROM CourseAdjustmentApplication a GROUP BY a.department")
    List<Object[]> findDepartmentStats();
}
