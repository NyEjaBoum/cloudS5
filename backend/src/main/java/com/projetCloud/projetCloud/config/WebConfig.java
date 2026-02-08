package com.projetCloud.projetCloud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                            "http://localhost:5173",      // Frontend web dev
                            "http://localhost:8100",      // Ionic dev server
                            "http://localhost:8101",      // Ionic alternate
                            "http://127.0.0.1:5173",
                            "http://127.0.0.1:8100",
                            "capacitor://localhost",      // Capacitor iOS
                            "http://localhost"            // Capacitor Android
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}