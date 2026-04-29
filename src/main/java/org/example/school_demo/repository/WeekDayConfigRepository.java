package org.example.school_demo.repository;

import org.example.school_demo.entity.WeekDayConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeekDayConfigRepository extends JpaRepository<WeekDayConfigEntity, Integer> {
}
