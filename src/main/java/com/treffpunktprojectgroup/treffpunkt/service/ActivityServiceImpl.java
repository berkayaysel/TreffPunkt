package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.MyActivitiesResponse;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivityServiceImpl implements ActivityService{

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

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
                        a.getCreator() != null ? a.getCreator().getEmail() : null
                ))
                .toList();
    }

    @Override
    public MyActivitiesResponse getMyActivities(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // KULLANICININ OLUŞTURDUĞU AKTİVİTELER
        List<Activity> createdActivities = activityRepository.findByCreator(user);

        // KULLANICININ KATILDIĞI AKTİVİTELER
        List<Activity> joinedActivities = activityRepository.findByParticipantsContains(user);

        List<ActivityResponse> createdDTO =
                createdActivities.stream()
                        .map(a -> new ActivityResponse(a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(), a.getCreator() != null ? a.getCreator().getEmail() : null))
                        .toList();

        List<ActivityResponse> joinedDTO =
                joinedActivities.stream()
                        .map(a -> new ActivityResponse(a.getActivityId(), a.getName(), a.getLocation(), a.getStartDate(), a.getStartTime(), a.getDescription(), a.getNumberOfParticipant(), a.getCapacity(), a.getCreator() != null ? a.getCreator().getEmail() : null))
                        .toList();

        return new MyActivitiesResponse(createdDTO, joinedDTO);
    }

    @Override
    public boolean deleteActivity(String email, Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);

        if (activityOptional.isPresent()) {
            Activity activity = activityOptional.get();

            if (activity.getCreator() != null && activity.getCreator().getEmail().equals(email)) {
                // Delete activity
                activityRepository.deleteById(activityId);
                return true;
            }
        }

        return false;
    }
}
