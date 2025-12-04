package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
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
    public boolean joinActivity(Integer userId, Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        Optional<User> userOptional = userRepository.findById(userId);

        if(activityOptional.isPresent() && userOptional.isPresent()) {
            Activity activity = activityOptional.get();
            User user = userOptional.get();

            if(activity.getCapacity() > 0 && !activity.getParticipants().contains(user)) {
                activity.getParticipants().add(user);
                activity.setCapacity(activity.getCapacity() - 1);
                activityRepository.save(activity);
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean leaveActivity(Integer userId, Integer activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        Optional<User> userOptional = userRepository.findById(userId);

        if(activityOptional.isPresent() && userOptional.isPresent()) {
            Activity activity = activityOptional.get();
            User user = userOptional.get();

            if(activity.getParticipants().contains(user)) {
                activity.getParticipants().remove(user);
                activity.setCapacity(activity.getCapacity() + 1);
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
                        a.getName(),
                        a.getLocation(),
                        a.getStartDate(),
                        a.getStartTime()
                ))
                .toList();
    }
}
