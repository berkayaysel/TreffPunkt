package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.ParticipantDTO;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class ActivityServiceImpl implements ActivityService{

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.treffpunktprojectgroup.treffpunkt.service.NotificationService notificationService;

    @Override
    public boolean joinActivity(String email, Integer activityId) {
        // Kullanıcıyı email ile buluyoruz
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Aktiviteyi getir
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            // Aktivite sahibi mi? Sahibi kendi aktivitesine katılamaz
            if (activity.getCreator() != null && activity.getCreator().equals(user)) {
                return false;
            }

            // Zaten katılmış mı?
            if (activity.getParticipants().contains(user)) {
                return false;
            }

            // Kapasite var mı?
            if (activity.getCapacity() > 0) {
                activity.getParticipants().add(user);
                activity.setCapacity(activity.getCapacity() - 1);
                activity.setNumberOfParticipant(activity.getNumberOfParticipant() + 1);

                activityRepository.save(activity);
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean leaveActivity(String email, Integer activityId) {

        // Kullanıcıyı email ile bul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Aktiviteyi bul
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            // Kullanıcı gerçekten aktivitede mi?
            if (activity.getParticipants().contains(user)) {

                // Aktiviteden çıkar
                activity.getParticipants().remove(user);

                activity.setCapacity(activity.getCapacity() + 1);
                activity.setNumberOfParticipant(activity.getNumberOfParticipant() - 1);

                activityRepository.save(activity);

                return true;
            }
        }

        return false;
    }

    @Override
    public List<ActivityResponse> getAllActivities() {
        purgePastActivities();
        return activityRepository.findAll()
                .stream()
                .map(a -> new ActivityResponse(
                    a.getActivityId(),
                    a.getName(),
                    a.getLocation(),
                    a.getStartDate(),
                    a.getStartTime(),
                    a.getDescription(),
                    a.getNumberOfParticipant(),
                    a.getCapacity(),
                    a.getCreator() != null ? a.getCreator().getEmail() : null,
                    a.getCreator() != null ? a.getCreator().getName() : null,
                    a.getCreator() != null ? a.getCreator().getSurname() : null
                ))
                .peek(ar -> ar.setCategory(activityRepository.findById(ar.getActivityId()).map(Activity::getCategory).map(c -> c == null ? null : c.getLabel()).orElse(null)))
                .toList();
    }

    @Override
    public List<ActivityResponse> getFilteredActivities(String categoryLabel, Boolean available, String dateOrder) {
        purgePastActivities();
        com.treffpunktprojectgroup.treffpunkt.enums.Category cat = com.treffpunktprojectgroup.treffpunkt.enums.Category.fromLabel(categoryLabel);

        List<Activity> base;
        if (cat != null) {
            base = activityRepository.findByCategory(cat);
        } else {
            base = activityRepository.findAll();
        }

        // available filter
        if (available != null && available) {
            base = base.stream().filter(a -> (a.getCapacity() != null && a.getCapacity() > 0)).toList();
        }

        // sort
        base = base.stream().sorted((x, y) -> {
            java.time.LocalDate dx = x.getStartDate();
            java.time.LocalDate dy = y.getStartDate();
            if (dx == null && dy == null) return 0;
            if (dx == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? 1 : -1;
            if (dy == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -1 : 1;
            int cmp = dx.compareTo(dy);
            if (cmp != 0) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -cmp : cmp;
            java.time.LocalTime tx = x.getStartTime();
            java.time.LocalTime ty = y.getStartTime();
            if (tx == null && ty == null) return 0;
            if (tx == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? 1 : -1;
            if (ty == null) return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -1 : 1;
            return dateOrder != null && dateOrder.equalsIgnoreCase("desc") ? -tx.compareTo(ty) : tx.compareTo(ty);
        }).toList();

        // map to DTO
        return base.stream().map(a -> {
            ActivityResponse ar = new ActivityResponse(a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(), a.getCreator() != null ? a.getCreator().getEmail() : null, a.getCreator() != null ? a.getCreator().getName() : null, a.getCreator() != null ? a.getCreator().getSurname() : null);
            ar.setCategory(a.getCategory() != null ? a.getCategory().getLabel() : null);
            return ar;
        }).toList();
    }

    @Override
    public MyActivitiesResponse getMyActivities(String email) {

        purgePastActivities();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // KULLANICININ OLUŞTURDUĞU AKTİVİTELER
        List<Activity> createdActivities = activityRepository.findByCreator(user);

        // KULLANICININ KATILDIĞI AKTİVİTELER
        List<Activity> joinedActivities = activityRepository.findByParticipantsContains(user);

        List<ActivityResponse> createdDTO =
            createdActivities.stream()
                .map(a -> new ActivityResponse(a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(), a.getCreator() != null ? a.getCreator().getEmail() : null, a.getCreator() != null ? a.getCreator().getName() : null, a.getCreator() != null ? a.getCreator().getSurname() : null))
                .peek(ar -> ar.setCategory(createdActivities.stream().filter(x -> x.getActivityId().equals(ar.getActivityId())).findFirst().map(Activity::getCategory).map(c -> c == null ? null : c.getLabel()).orElse(null)))
                .toList();

        List<ActivityResponse> joinedDTO =
            joinedActivities.stream()
                .map(a -> new ActivityResponse(a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(), a.getCreator() != null ? a.getCreator().getEmail() : null, a.getCreator() != null ? a.getCreator().getName() : null, a.getCreator() != null ? a.getCreator().getSurname() : null))
                .peek(ar -> ar.setCategory(joinedActivities.stream().filter(x -> x.getActivityId().equals(ar.getActivityId())).findFirst().map(Activity::getCategory).map(c -> c == null ? null : c.getLabel()).orElse(null)))
                .toList();

        return new MyActivitiesResponse(createdDTO, joinedDTO);
    }

    @Override
    public boolean deleteActivity(String email, Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            if (activity.getCreator() != null && activity.getCreator().getEmail().equals(email)) {
                // notify participants before deleting
                    try {
                        notificationService.sendActivityDeletedNotifications(activity, activity.getCreator());
                    } catch (Exception ex) {
                        // ignore notification errors
                    }

                // Delete activity
                activityRepository.deleteById(activityId);
                return true;
            }
        }

        return false;
    }

    @Override
    public List<ParticipantDTO> getActivityParticipants(Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        
        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();
            return activity.getParticipants().stream()
                    .map(user -> new ParticipantDTO(
                            user.getUserId(),
                            user.getName(),
                            user.getSurname(),
                            user.getEmail(),
                            user.getProfileImage()
                    ))
                    .toList();
        }
        
        return List.of();
    }

    @Override
    public boolean removeParticipantFromActivity(String creatorEmail, Integer activityId, Integer participantUserId) {
        // Aktiviteyi bul
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        
        if (activityOptional.isEmpty()) {
            return false;
        }
        
        Activity activity = activityOptional.get();
        
        // İsteği yapan kişinin creator olduğunu kontrol et
        if (activity.getCreator() == null || !activity.getCreator().getEmail().equals(creatorEmail)) {
            return false;
        }
        
        // Çıkarılacak kullanıcıyı bul
        Optional<User> participantOptional = userRepository.findById(participantUserId);
        
        if (participantOptional.isEmpty()) {
            return false;
        }
        
        User participant = participantOptional.get();
        
        // Kullanıcı gerçekten aktivitede mi?
        if (activity.getParticipants().contains(participant)) {
            // Aktiviteden çıkar
            activity.getParticipants().remove(participant);
            activity.setCapacity(activity.getCapacity() + 1);
            activity.setNumberOfParticipant(activity.getNumberOfParticipant() - 1);
            
            activityRepository.save(activity);
            
            // TODO: Burada çıkarılan kullanıcıya bildirim gönderilebilir
            try {
                notificationService.sendRemovedFromActivityNotification(participant, activity, activity.getCreator());
            } catch (Exception ex) {
                // ignore
            }
            
            return true;
        }
        
        return false;
    }

    @Transactional
    protected void purgePastActivities() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Activity> past = activityRepository.findByStartDateBefore(today);
        List<Activity> todayPast = activityRepository.findByStartDateAndStartTimeBefore(today, now);

        if (!past.isEmpty()) {
            activityRepository.deleteAll(past);
        }
        if (!todayPast.isEmpty()) {
            activityRepository.deleteAll(todayPast);
        }
    }
}
