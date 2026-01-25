package com.projetCloud.projetCloud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.projetCloud.projetCloud.security.FirebaseTokenFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Désactiver CSRF pour les API REST
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Autoriser l'accès public aux endpoints d'authentification
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()  // Toutes les autres requêtes nécessitent une authentification
            )
            .addFilterBefore(new FirebaseTokenFilter(), UsernamePasswordAuthenticationFilter.class)
            .httpBasic(httpBasic -> httpBasic.disable());  // Désactiver l'authentification basic qui cause le 401
        
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}