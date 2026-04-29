package org.example.school_demo.repository;

import org.example.school_demo.entity.MajorEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MajorRepo extends JpaRepository<MajorEntity, Long> {

    Page<MajorEntity> findByNameContaining(String name, Pageable pageable);

    boolean existsByName(String name);

    boolean existsById(String id);

    @Query("SELECT m FROM MajorEntity m WHERE m.id IN :ids")
    List<MajorEntity> findByIdIn(@Param("ids") List<String> ids);

    @Query("SELECT COUNT(m) > 0 FROM MajorEntity m WHERE m.id = :id")
    boolean existsByBusinessId(@Param("id") String id);
}
