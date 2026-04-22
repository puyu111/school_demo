package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEnt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 教师 Repository 接口
 */
@Repository
public interface TeacherRepository extends JpaRepository<TeacherEnt, String> {

    /**
     * 按姓名模糊查询
     */
    List<TeacherEnt> findByNameContainingIgnoreCase(String name);

    /**
     * 查询所有教师的 ID 列表
     */
    @Query("SELECT t.id FROM TeacherEnt t ORDER BY t.id")
    List<String> findAllTeacherIds();
}
