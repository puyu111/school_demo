package org.example.school_demo.repository;

import org.example.school_demo.entity.MajorCourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MajorCourseRepo extends JpaRepository<MajorCourseEntity, Long> {

    List<MajorCourseEntity> findByMajorId(Long majorId);

    @Modifying
    @Query("DELETE FROM MajorCourseEntity mc WHERE mc.majorId = :majorId")
    void deleteByMajorId(@Param("majorId") Long majorId);
}
