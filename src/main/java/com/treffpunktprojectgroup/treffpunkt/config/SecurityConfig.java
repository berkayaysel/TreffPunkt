package com.treffpunktprojectgroup.treffpunkt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF korumasını devre dışı bırak (Postman ile test için)
                .csrf(csrf -> csrf.disable())

                // hangi endpoint’lerin serbest olduğunu tanımla
                .authorizeHttpRequests(auth -> auth
                        
                        .requestMatchers("/**").permitAll()
                )

                .httpBasic(Customizer.withDefaults());

                // default login formu (şu an engel olmaması için aktif kalabilir)
                // .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
