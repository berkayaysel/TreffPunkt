package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.CreateActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService{

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public User register(RequestRegister requestRegister) {
        User user = new User();
        user.setName(requestRegister.getName());
        user.setSurname(requestRegister.getSurname());
        user.setAddress(requestRegister.getAddress());
        user.setAge(requestRegister.getAge());
        user.setEmail(requestRegister.getEmail());
        user.setGender(requestRegister.getGender());

        long userCount = userRepository.count();
        user.setRank((int) userCount + 1);

        String encodedPassword = passwordEncoder.encode(requestRegister.getPassword());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public boolean changePassword(Integer id, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public void createActivity(CreateActivityRequest createActivityRequest) {
        Activity activity = new Activity();
        activity.setCapacity(createActivityRequest.getCapacity());
        activity.setLocation(createActivityRequest.getLocation());
        activity.setName(createActivityRequest.getName());
        activity.setStartTime(createActivityRequest.getStartTime());
        activity.setStartDate(createActivityRequest.getStartDate());

        activityRepository.save(activity);
    }

    @Override
    public List<ActivityResponse> getUserActivities(Integer userId) {
        List<Activity> activities = activityRepository.findByParticipants_UserId(userId);
        return activities.stream()
                .map(a -> new ActivityResponse(
                        a.getName(),
                        a.getLocation(),
                        a.getStartDate(),
                        a.getStartTime()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public UserProfileResponse getUserProfileByEmail(String email) {
        // Find the user or throw an error
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Convert User Entity to UserProfileResponse DTO
        return new UserProfileResponse(
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getAge(),
                user.getAddress()
        );
    }

}
