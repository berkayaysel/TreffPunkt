package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.RequestLogin;
import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.service.LoginService;
import com.treffpunktprojectgroup.treffpunkt.service.LoginServiceImpl;
import com.treffpunktprojectgroup.treffpunkt.service.UserService;
import com.treffpunktprojectgroup.treffpunkt.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<User> login (@RequestBody RequestLogin requestLogin) {
        User user = loginService.login((requestLogin));
        if(user != null ) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RequestRegister requestRegister) {
        User savedUser = userService.register(requestRegister);
        return ResponseEntity.ok(savedUser);
    }
}
