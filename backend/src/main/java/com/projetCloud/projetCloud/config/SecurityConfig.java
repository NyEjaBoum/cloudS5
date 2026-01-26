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
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Permettre l'accès à Swagger UI et API docs
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()
                
                // Endpoints publics d'authentification
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                
                // Endpoints signalements publics
                .requestMatchers(
                    "/api/signalements/**"
                ).permitAll()
                
                // Endpoints admin protégés
                .requestMatchers("/api/admin/**").permitAll()
                // .requestMatchers("/api/admin/**").hasRole("MANAGER")
                
                // Tout le reste nécessite authentification
                .anyRequest().authenticated()
            )
            .addFilterBefore(new FirebaseTokenFilter(), UsernamePasswordAuthenticationFilter.class)
            .httpBasic(httpBasic -> httpBasic.disable());
        
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}