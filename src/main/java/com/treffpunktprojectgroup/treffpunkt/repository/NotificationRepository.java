package com.treffpunktprojectgroup.treffpunkt.repository;

import com.treffpunktprojectgroup.treffpunkt.entity.Notification;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);
    List<Notification> findByUserAndReadFalse(User user);
    
    @Modifying
    @Query(value = "DELETE FROM Notification WHERE activity_id = :activityId", nativeQuery = true)
    void deleteByActivityId(@Param("activityId") Integer activityId);
}
