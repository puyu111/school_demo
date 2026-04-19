package org.example.school_demo.repository;

import org.example.school_demo.entity.ClassroomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 教室 Repository 接口
 */
@Repository
public interface ClassroomRepository extends JpaRepository<ClassroomEntity, String> {

    /**
     * 按类型查询教室
     */
    List<ClassroomEntity> findByType(ClassroomEntity.ClassroomType type);

    /**
     * 查询容量大于等于指定值的所有教室
     */
    List<ClassroomEntity> findByCapacityGreaterThanEqual(int capacity);

    /**
     * 查询满足容量和类型要求的教室
     */
    @Query("SELECT c FROM ClassroomEntity c WHERE c.capacity >= :capacity AND c.type = :type")
    List<ClassroomEntity> findByCapacityAndType(@Param("capacity") int capacity,
                                                 @Param("type") ClassroomEntity.ClassroomType type);
}
