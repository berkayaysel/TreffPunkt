package com.treffpunktprojectgroup.treffpunkt.controller;


import com.treffpunktprojectgroup.treffpunkt.dto.CreateActivityRequestDto;
import com.treffpunktprojectgroup.treffpunkt.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping(path ="/user-dashboard")
public class UserController {

    @Autowired
    UserServiceImpl userService;

    @GetMapping
    public String getUserService() {
        return "/userService";
    }

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
    public ResponseEntity<String> createActivity(@RequestBody CreateActivityRequestDto createActivityRequestDto) {
        userService.createActivity(createActivityRequestDto);
        return ResponseEntity.ok("Aktivite başarıyla oluşturuldu.");
    }
}
