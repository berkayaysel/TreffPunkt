package com.treffpunktprojectgroup.treffpunkt.controller;


import com.treffpunktprojectgroup.treffpunkt.dto.ActivityResponse;
import com.treffpunktprojectgroup.treffpunkt.dto.CreateActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.dto.JoinActivityRequest;
import com.treffpunktprojectgroup.treffpunkt.entity.Activity;
import com.treffpunktprojectgroup.treffpunkt.service.UserService;
import com.treffpunktprojectgroup.treffpunkt.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import com.treffpunktprojectgroup.treffpunkt.dto.UserProfileResponse;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.security.Principal; 

@Controller
@RequestMapping(path ="/user-dashboard")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(path = "/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        Integer id = Integer.parseInt(body.get("id"));
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        boolean success = userService.changePassword(id, oldPassword, newPassword);

        if(success) {
            return ResponseEntity.ok("Şifre başarıyla değiştirildi.");
        } else {
            return ResponseEntity.status(400).body("Mevcut şifre yanlış");
        }
    }

    @PostMapping(path = "/new-activity")
    public ResponseEntity<String> createActivity(@RequestBody CreateActivityRequest createActivityRequest) {
        userService.createActivity(createActivityRequest);
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

}
