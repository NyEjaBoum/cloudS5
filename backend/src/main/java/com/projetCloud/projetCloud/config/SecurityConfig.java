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
                .requestMatchers("/api/auth/**").permitAll()  // Tous les endpoints d'auth sont publics
                .requestMatchers("/api/public/**").permitAll()
                // Débloquer le compte (nécessite authentification Manager)
                // Dans SecurityConfig.java, changer temporairement :
                .requestMatchers("/api/admin/**").permitAll()  // Au lieu de .hasRole("MANAGER")
                // .requestMatchers("/api/admin/**").hasRole("MANAGER")  // Protection admin
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