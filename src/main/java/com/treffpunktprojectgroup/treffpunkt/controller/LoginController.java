package com.treffpunktprojectgroup.treffpunkt.controller;

import com.treffpunktprojectgroup.treffpunkt.dto.RequestLogin;
import com.treffpunktprojectgroup.treffpunkt.dto.RequestRegister;
import com.treffpunktprojectgroup.treffpunkt.entity.User;
import com.treffpunktprojectgroup.treffpunkt.service.LoginService;
import com.treffpunktprojectgroup.treffpunkt.service.LoginServiceImpl;
import com.treffpunktprojectgroup.treffpunkt.service.UserService;
import com.treffpunktprojectgroup.treffpunkt.service.UserServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody RequestLogin requestLogin, HttpServletRequest request) { // <-- HttpServletRequest eklendi

        // 1. Senin servisin kullanıcıyı ve şifreyi kontrol ediyor
        User user = loginService.login(requestLogin);

        if (user != null) {
            // 2. KULLANICI BULUNDU, ŞİMDİ SPRING SECURITY'YE HABER VERELİM

            // Basit bir kimlik doğrulama nesnesi oluşturuyoruz (Email'i kimlik olarak kullanıyoruz)
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getEmail(), // Principal (Kullanıcı adı/email)
                    null,            // Credentials (Şifre - güvenlik için null geçebiliriz veya user.getPassword())
                    new ArrayList<>() // Yetkiler (Authorities - şimdilik boş)
            );

            // Güvenlik Bağlamını (Context) oluştur
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // 3. BU BİLGİYİ SESSION'A (OTURUMA) KAYDET
            // Bu adım çok önemli, yoksa bir sonraki sayfada yine unutur.
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Hatalı email veya şifre");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RequestRegister requestRegister) {
        User savedUser = userService.register(requestRegister);
        return ResponseEntity.ok(savedUser);
    }
}
