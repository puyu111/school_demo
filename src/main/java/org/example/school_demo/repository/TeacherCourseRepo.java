package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherCourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherCourseRepo extends JpaRepository<TeacherCourseEntity, Long> {

    List<TeacherCourseEntity> findByTeacherId(Long teacherId);

    @Modifying
    @Query("DELETE FROM TeacherCourseEntity tc WHERE tc.teacherId = :teacherId")
    void deleteByTeacherId(@Param("teacherId") Long teacherId);
}
