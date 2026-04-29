package org.example.school_demo.repository;

import org.example.school_demo.entity.DisabledDateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisabledDateRepo extends JpaRepository<DisabledDateEntity, Long> {

    List<DisabledDateEntity> findByCalendarId(Long calendarId);

    void deleteByCalendarId(Long calendarId);
}
