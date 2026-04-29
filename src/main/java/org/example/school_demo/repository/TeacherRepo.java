package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepo extends JpaRepository<TeacherEntity, Long> {

    Page<TeacherEntity> findByNameContaining(String name, Pageable pageable);

    boolean existsByName(String name);

    boolean existsById(String id);

    @Query("SELECT t FROM TeacherEntity t WHERE t.id IN :ids")
    List<TeacherEntity> findByIdIn(@Param("ids") List<String> ids);

    @Query("SELECT COUNT(t) > 0 FROM TeacherEntity t WHERE t.id = :id")
    boolean existsByBusinessId(@Param("id") String id);

    Page<TeacherEntity> findByDegree(String degree, Pageable pageable);
}
