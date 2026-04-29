package org.example.school_demo.repository;

import org.example.school_demo.entity.CoursePrerequisiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoursePrerequisiteRepo extends JpaRepository<CoursePrerequisiteEntity, Long> {

    List<CoursePrerequisiteEntity> findByCourseId(Long courseId);

    void deleteByCourseId(Long courseId);
}
