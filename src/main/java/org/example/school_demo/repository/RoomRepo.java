package org.example.school_demo.repository;

import org.example.school_demo.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 教室数据访问层接口
 */
@Repository
public interface RoomRepo extends JpaRepository<RoomEntity, Long> {

    /**
     * 根据教室名称模糊查询
     */
    List<RoomEntity> findByRoomNameContaining(String roomName);

    /**
     * 根据类型查询
     */
    List<RoomEntity> findByType(String type);

    /**
     * 根据楼宇查询
     */
    List<RoomEntity> findByBuilding(String building);

    /**
     * 查询容量足够的教室
     */
    List<RoomEntity> findByCapacityGreaterThanEqual(int capacity);

    /**
     * 根据类型和容量查询
     */
    List<RoomEntity> findByTypeAndCapacityGreaterThanEqual(String type, int capacity);
}