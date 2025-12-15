package com.treffpunktprojectgroup.treffpunkt.controller;


import com.treffpunktprojectgroup.treffpunkt.dto.*;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.service.UserService;
import com.treffpunktprojectgroup.treffpunkt.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.security.Principal; 

@Controller
@RequestMapping(path ="/user-dashboard")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private com.treffpunktprojectgroup.treffpunkt.service.ActivityService activityService;

    @PostMapping(path = "/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        String email = principal.getName(); // Login olan kullanıcı
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        boolean success = userService.changePassword(email, oldPassword, newPassword);

        if (success) {
            return ResponseEntity.ok("Şifre başarıyla değiştirildi.");
        } else {
            return ResponseEntity.status(400).body("Mevcut şifre yanlış!");
        }
    }

    @PostMapping(path = "/new-activity")
    public ResponseEntity<String> createActivity(@RequestBody CreateActivityRequest createActivityRequest, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Yetkisiz erişim. Lütfen giriş yapın.");
        }
        String email = principal.getName();
        userService.createActivity(createActivityRequest, email);
        return ResponseEntity.ok("Aktivite başarıyla oluşturuldu.");
    }

    @GetMapping("/{userId}/activities")
    public ResponseEntity<List<ActivityResponse>> getUserActivities(@PathVariable Integer userId) {
        List<ActivityResponse> activities = userService.getUserActivities(userId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/profile-info")
    public ResponseEntity<UserProfileResponse>  getProfileInfo(Principal principal){

        if (principal == null){
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        UserProfileResponse response = userService.getUserProfileByEmail(email);

        return ResponseEntity.ok(response);
    }

    // Public read-only profile by email (no authentication required)
    @GetMapping("/public-profile")
    public ResponseEntity<?> getPublicProfile(@RequestParam("email") String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        try {
            UserProfileResponse response = userService.getPublicUserProfile(email);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("Yetkisiz işlem");
        }

        String email = principal.getName(); // Şu an giriş yapmış kullanıcının emaili
        User updatedUser = userService.updateUserProfile(email, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<?> deleteActivity(@PathVariable Integer activityId, Principal principal) {
        if (principal == null) {
            System.out.println("[DELETE] Principal null - 401");
            return ResponseEntity.status(401).body("Yetkisiz işlem");
        }

        String email = principal.getName();
        System.out.println("[DELETE] User: " + email + ", Activity ID: " + activityId);

        boolean deleted = activityService.deleteActivity(email, activityId);

        System.out.println("[DELETE] Delete result: " + deleted);
        if (deleted) {
            return ResponseEntity.ok("Aktivite başarıyla silindi.");
        } else {
            return ResponseEntity.status(403).body("Sadece aktivite sahibi silebilir veya aktivite bulunamadı.");
        }
    }

    @PostMapping("/upload-profile")
    public ResponseEntity<?> uploadProfileImage(Principal principal,
                                                @RequestParam("file") MultipartFile file) {

        if (principal == null) {
            return ResponseEntity.status(401).body("Yetkisiz. Lütfen giriş yapın.");
        }

        String email = principal.getName();

        try {
            String publicUrl = userService.saveProfileImage(email, file);
            return ResponseEntity.ok(publicUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Resim yüklenirken hata oluştu.");
        }
    }

}
