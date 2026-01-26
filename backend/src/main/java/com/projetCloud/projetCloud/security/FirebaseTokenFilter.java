package com.projetCloud.projetCloud.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 🔥 1. Laisser passer les requêtes OPTIONS (CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // 🔥 2. AUCUN token → on laisse passer (endpoints publics)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String idToken = authHeader.substring(7);

        try {
            // 🔐 3. Vérification Firebase
            FirebaseToken decodedToken = FirebaseAuth
                    .getInstance()
                    .verifyIdToken(idToken);

            // 🔐 4. Rôle (par défaut USER si absent)
            Integer role = decodedToken.getClaims().get("role") != null
                    ? Integer.parseInt(decodedToken.getClaims().get("role").toString())
                    : 0;

            SimpleGrantedAuthority authority =
                    role == 1
                            ? new SimpleGrantedAuthority("ROLE_MANAGER")
                            : new SimpleGrantedAuthority("ROLE_USER");

            // 🔐 5. Création Authentication Spring Security
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            decodedToken.getEmail(),
                            null,
                            List.of(authority)
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // 🔥 Token invalide → 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
