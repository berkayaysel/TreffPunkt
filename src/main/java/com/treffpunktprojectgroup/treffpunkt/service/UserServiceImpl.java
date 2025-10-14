package com.treffpunktprojectgroup.treffpunkt.service;

import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepository;

    public User register(RequestRegister requestRegister) {
        User user = new User();
        user.setName(requestRegister.getName());
        user.setSurname(requestRegister.getSurname());
        user.setAddress(requestRegister.getAddress());
        user.setAge(requestRegister.getAge());
        user.setEmail(requestRegister.getEmail());
        user.setGender(requestRegister.getGender());

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


}
