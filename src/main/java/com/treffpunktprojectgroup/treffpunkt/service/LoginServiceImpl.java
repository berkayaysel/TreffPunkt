package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.RequestLogin;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginServiceImpl implements LoginService{

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User login(RequestLogin requestLogin) {
        Optional<User> userOptional = userRepository.findById(requestLogin.getId());

        if(userOptional.isEmpty()) {
            return null;
        }

        User userFromDb = userOptional.get();

        if(passwordEncoder.matches(requestLogin.getPassword(), userFromDb.getPassword())) {
            return userFromDb;
        } else {
            return null;
        }
    }

}
