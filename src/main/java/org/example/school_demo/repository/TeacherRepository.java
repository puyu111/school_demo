package org.example.school_demo.repository;

import org.example.school_demo.entity.TeacherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 教师 Repository 接口
 */
@Repository
public interface TeacherRepository extends JpaRepository<TeacherEntity, String> {

    /**
     * 按姓名模糊查询
     */
    List<TeacherEntity> findByNameContainingIgnoreCase(String name);

    /**
     * 查询所有教师的 ID 列表
     */
    @Query("SELECT t.id FROM TeacherEntity t ORDER BY t.id")
    List<String> findAllTeacherIds();
}
