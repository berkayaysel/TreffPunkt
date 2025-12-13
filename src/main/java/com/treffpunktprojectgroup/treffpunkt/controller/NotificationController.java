package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.NotificationDTO;
import com.treffpunktprojectgroup.treffpunkt.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/treffpunkt/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDTO> getNotifications(Principal principal) {
        return notificationService.getNotificationsForUser(principal.getName());
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Principal principal) {
        notificationService.markAsRead(id, principal.getName());
    }
}
