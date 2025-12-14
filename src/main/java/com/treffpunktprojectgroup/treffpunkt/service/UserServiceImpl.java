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
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public User register(RequestRegister requestRegister) {
        User user = new User();
        user.setName(requestRegister.getName());
        user.setSurname(requestRegister.getSurname());
        user.setAddress(requestRegister.getAddress());
        user.setBirthDate(requestRegister.getBirthDate());
        user.setEmail(requestRegister.getEmail());
        user.setGender(requestRegister.getGender());

        long userCount = userRepository.count();
        user.setRank((int) userCount + 1);

        String encodedPassword = passwordEncoder.encode(requestRegister.getPassword());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    @Override
    public boolean changePassword(String email, String oldPassword, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return true;
    }

    public void createActivity(CreateActivityRequest createActivityRequest, String email) {
        // Creator'ı principal'dan al
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + email));

        Activity activity = new Activity();
        activity.setCapacity(createActivityRequest.getCapacity());
        activity.setLocation(createActivityRequest.getLocation());
        activity.setName(createActivityRequest.getName());
        activity.setStartTime(createActivityRequest.getStartTime());
        activity.setStartDate(createActivityRequest.getStartDate());
        activity.setDescription(createActivityRequest.getDescription());
        // set category, default to "Diğer" when not provided
        String cat = createActivityRequest.getCategory();
        // Map incoming label to enum (default to DIGER)
        com.treffpunktprojectgroup.treffpunkt.enums.Category catEnum = com.treffpunktprojectgroup.treffpunkt.enums.Category.fromLabel(cat);
        activity.setCategory(catEnum == null ? com.treffpunktprojectgroup.treffpunkt.enums.Category.DIGER : catEnum);
        activity.setCreator(creator);
        activity.setNumberOfParticipant(0);
        
        activityRepository.save(activity);
    }

    @Override
    public List<ActivityResponse> getUserActivities(Integer userId) {
        List<Activity> activities = activityRepository.findByParticipants_UserId(userId);
        return activities.stream()
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
                .peek(ar -> ar.setCategory(activities.stream().filter(x -> x.getActivityId().equals(ar.getActivityId())).findFirst().map(Activity::getCategory).map(c -> c == null ? null : c.getLabel()).orElse(null)))
                .collect(Collectors.toList());
    }

    @Override
    public UserProfileResponse getUserProfileByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        UserReviewSummaryResponse summary = reviewService.getReviewsForUser(user.getUserId());

        return new UserProfileResponse(
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getAddress(),
                user.getProfileImage(),
                user.getBirthDate(),
                summary.getAverageRating(),
                summary.getReviewCount(),
                summary.getReviews()
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

        // 4) Birth date
        if (request.getBirthDate() != null && !request.getBirthDate().equals(user.getBirthDate())) {
            user.setBirthDate(request.getBirthDate());
        }

        // 5) Address
        if (request.getAddress() != null && !request.getAddress().equals(user.getAddress())) {
            user.setAddress(request.getAddress());
        }

        return userRepository.save(user);
    }

    @Override

    public String saveProfileImage(String email, MultipartFile file) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        try {
            // Save uploaded images into the project's static resources so they are served
            String folder = "src/main/resources/static/uploads/profile-images/";
            File directory = new File(folder);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = "user_" + user.getUserId() + ".png";
            Path path = Paths.get(folder + fileName);

            Files.write(path, file.getBytes());

            // Public URL path served from classpath:/static
            String publicPath = "/uploads/profile-images/" + fileName;
            user.setProfileImage(publicPath);
            userRepository.save(user);
            return publicPath;

        } catch (IOException e) {
            throw new RuntimeException("Profil resmi kaydedilirken hata oluştu", e);
        }
    }
}
