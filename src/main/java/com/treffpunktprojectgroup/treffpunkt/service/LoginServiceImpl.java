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
        Optional<User> userOptional = userRepository.findByEmail(requestLogin.getEmail());

        if(userOptional.isEmpty()) {
            throw new RuntimeException("Kullanıcı bulunamadı!");
        }

        User userFromDb = userOptional.get();

        // BCrypt ile hashlenmiş şifreyi kontrol et
        if(passwordEncoder.matches(requestLogin.getPassword(), userFromDb.getPassword())) {
            return userFromDb;
        } 
        // Eğer BCrypt başarısız olursa, düz metin şifre kontrolü yap (eski kullanıcılar için)
        else if(requestLogin.getPassword().equals(userFromDb.getPassword())) {
            // Düz metin şifreyi BCrypt'e çevir ve güncelle
            userFromDb.setPassword(passwordEncoder.encode(requestLogin.getPassword()));
            userRepository.save(userFromDb);
            return userFromDb;
        } 
        else {
            throw new RuntimeException("Şifre yanlış!");
        }
    }

}
