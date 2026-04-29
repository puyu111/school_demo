package org.example.school_demo.repository;

import org.example.school_demo.entity.CourseSetting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseSettingRepository extends JpaRepository<CourseSetting, Long> {

    Page<CourseSetting> findBySemester(String semester, Pageable pageable);

    Optional<CourseSetting> findByCourseName(String courseName);

    boolean existsByCourseName(String courseName);

    List<CourseSetting> findByCourseNameIn(List<String> courseNames);
}
