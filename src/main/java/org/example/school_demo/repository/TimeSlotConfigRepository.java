package org.example.school_demo.repository;

import org.example.school_demo.entity.TimeSlotConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotConfigRepository extends JpaRepository<TimeSlotConfigEntity, String> {
}
