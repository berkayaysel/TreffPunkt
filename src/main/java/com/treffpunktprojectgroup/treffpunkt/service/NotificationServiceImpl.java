package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.NotificationDTO;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.Notification;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.NotificationRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendActivityDeletedNotifications(Activity activity, User initiator) {
        if (activity.getParticipants() == null) return;
        String initiatorName = initiator != null ? (initiator.getName() != null ? initiator.getName() : initiator.getEmail()) : null;
        for (User u : activity.getParticipants()) {
            String msg = initiatorName + " etkinlik '" + (activity.getName() != null ? activity.getName() : "etkinlik") + "' i sildi.";
            Notification n = new Notification(u, "ACTIVITY_DELETED", activity, msg);
            notificationRepository.save(n);
            try {
                messagingTemplate.convertAndSendToUser(u.getEmail(), "/queue/notifications", new NotificationDTO(n.getId(), n.getMessage(), activity.getActivityId(), activity.getName(), activity.getLocation(), initiatorName, n.getTimestamp(), n.getRead()));
            } catch (Exception ex) {
                // ignore: user might be offline
            }
        }
    }

    @Override
    public void sendRemovedFromActivityNotification(User user, Activity activity, User initiator, String reason) {
        String initiatorName = initiator != null ? (initiator.getName() != null ? initiator.getName() : initiator.getEmail()) : null;
        String msg = initiatorName + " sizi '" + (activity.getName() != null ? activity.getName() : "etkinlik") + "' (" + (activity.getLocation() != null ? activity.getLocation() : "bilinmeyen konum") + ") etkinliğinden çıkardı.";
        Notification n = new Notification(user, "REMOVED_FROM_ACTIVITY", activity, msg, reason);
        notificationRepository.save(n);
        try {
            messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", new NotificationDTO(n.getId(), n.getMessage(), activity.getActivityId(), activity.getName(), activity.getLocation(), initiatorName, n.getTimestamp(), n.getRead(), reason));
        } catch (Exception ex) {
            // offline
        }
    }

        @Override
        public List<NotificationDTO> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return List.of();
        return notificationRepository.findByUserOrderByTimestampDesc(user)
            .stream()
            .map(n -> new NotificationDTO(
                n.getId(),
                n.getMessage(),
                n.getActivity() != null ? n.getActivity().getActivityId() : null,
                n.getActivity() != null ? n.getActivity().getName() : null,
                n.getActivity() != null ? n.getActivity().getLocation() : null,
                n.getUser() != null ? (n.getUser().getName() != null ? n.getUser().getName() : n.getUser().getEmail()) : null,
                n.getTimestamp(),
                n.getRead(),
                n.getRemovalReason()))
            .collect(Collectors.toList());
        }

    @Override
    public void markAsRead(Long notificationId, String email) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser() != null && n.getUser().getEmail() != null && n.getUser().getEmail().equals(email)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
