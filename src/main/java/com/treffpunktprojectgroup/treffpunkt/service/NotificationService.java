package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.NotificationDTO;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;

import java.util.List;

public interface NotificationService {
    void sendActivityDeletedNotifications(Activity activity, User initiator);
    void sendRemovedFromActivityNotification(User user, Activity activity, User initiator);
    List<NotificationDTO> getNotificationsForUser(String email);
    void markAsRead(Long notificationId, String email);
}
