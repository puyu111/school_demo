package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseSettingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseSettingRepo extends JpaRepository<CourseSettingEntity, Long> {

    Page<CourseSettingEntity> findBySemester(String semester, Pageable pageable);

    Optional<CourseSettingEntity> findByCourseId(Long courseId);

    boolean existsByCourseId(Long courseId);
}
