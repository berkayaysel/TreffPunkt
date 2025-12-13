package com.treffpunktprojectgroup.treffpunkt.repository;

import com.treffpunktprojectgroup.treffpunkt.entity.Notification;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);
    List<Notification> findByUserAndReadFalse(User user);
}
