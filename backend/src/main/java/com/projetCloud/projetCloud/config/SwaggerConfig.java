package com.projetCloud.projetCloud.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .info(new Info()
                .title("API Authentification - Projet Cloud")
                .version("1.0.0")
                .description("""
                    Documentation complète des APIs d'authentification.
                    
                    ## Fonctionnalités :
                    - Authentification locale (email/mot de passe)
                    - Authentification Firebase
                    - Gestion des utilisateurs
                    - Blocage après tentatives échouées
                    - Gestion des rôles
                    
                    ## Accès :
                    - **Visiteur** : Accès public aux endpoints d'authentification
                    - **Manager** : Accès complet avec token JWT
                    """)
                .termsOfService("https://projetcloud.com/terms")
                .contact(new Contact()
                    .name("Support Projet Cloud")
                    .email("support@projetcloud.com")
                    .url("https://projetcloud.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://www.apache.org/licenses/LICENSE-2.0.html")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080")
                    .description("Serveur de développement"),
                new Server()
                    .url("https://api.projetcloud.com")
                    .description("Serveur de production")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Entrez votre token JWT. Obtenez-le via /api/auth/login")));
    }
}