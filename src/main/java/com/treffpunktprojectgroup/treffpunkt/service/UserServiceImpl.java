package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.*;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.ActivityRepository;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    public boolean changePassword(Integer userId, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

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
        activity.setDescription(createActivityRequest.getDescription());
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

    @Override
    @Transactional
    public User updateUserProfile(String loggedInEmail, ProfileUpdateRequest request) {

        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1) Name
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            user.setName(request.getName());
        }

        // 2) Surname
        if (request.getSurname() != null && !request.getSurname().equals(user.getSurname())) {
            user.setSurname(request.getSurname());
        }

        // 3) Email (değişebilir)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {

            // email başka kullanıcıda var mı kontrol et
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Bu email zaten kullanılıyor");
            }

            user.setEmail(request.getEmail());
        }

        // 4) Age
        if (request.getAge() != null && !request.getAge().equals(user.getAge())) {
            user.setAge(request.getAge());
        }

        // 5) Address
        if (request.getAddress() != null && !request.getAddress().equals(user.getAddress())) {
            user.setAddress(request.getAddress());
        }

        return userRepository.save(user);
    }

    @Override
    public void saveProfileImage(String email, MultipartFile file) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        try {
            String folder = "uploads/profile-images/";
            File directory = new File(folder);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = "user_" + user.getUserId() + ".png";
            Path path = Paths.get(folder + fileName);

            Files.write(path, file.getBytes());

            user.setProfileImage("/" + folder + fileName);
            userRepository.save(user);

        } catch (IOException e) {
            throw new RuntimeException("Profil resmi kaydedilirken hata oluştu", e);
        }
    }
}
