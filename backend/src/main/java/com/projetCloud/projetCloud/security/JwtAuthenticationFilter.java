package com.projetCloud.projetCloud.security;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1️⃣ Récupérer le header Authorization
        String header = request.getHeader("Authorization");

        // 2️⃣ S'il n'y a PAS de token → laisser passer
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3️⃣ Extraire le token
            String token = header.substring(7);

            // 4️⃣ Décoder le JWT et récupérer l'utilisateur
            Utilisateur user = authService.getUserFromToken(token);

            if (user != null) {
                // 5️⃣ Construire le rôle Spring Security
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().getNom());

                // 6️⃣ Créer l'Authentication Spring
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getEmail(), // principal
                                null,             // credentials
                                List.of(authority)
                        );

                // 7️⃣ Injecter dans le contexte Spring Security
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (Exception e) {
            // 🔥 Token invalide → 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 8️⃣ Continuer la chaîne
        filterChain.doFilter(request, response);
    }
}
