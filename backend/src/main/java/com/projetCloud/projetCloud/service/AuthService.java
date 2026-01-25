package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.role.Role;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.repository.role.RoleRepository;
import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.projetCloud.projetCloud.model.session.Session;
import com.projetCloud.projetCloud.repository.session.SessionsRepository;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SessionsRepository sessionsRepository;
    // private final String jwtSecret = "yourSecretKey";
    private final SecretKey jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public AuthService(UtilisateurRepository utilisateurRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder, SessionsRepository sessionsRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionsRepository = sessionsRepository;
    }

    public Utilisateur registerLocal(String email, String motDePasse, String nom, String prenom) {
        // Check email unique
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(motDePasse);

        // Get UTILISATEUR role
        Role utilisateurRole = roleRepository.findByNom("UTILISATEUR")
            .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found"));

        // Create and save user
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(email);
        utilisateur.setMotDePasse(hashedPassword);
        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setRole(utilisateurRole);

        return utilisateurRepository.save(utilisateur);
    }

    public String loginLocal(String email, String motDePasse) {
        // Search user by email
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (utilisateur.getMotDePasse() == null) {
            throw new IllegalArgumentException("This account uses Firebase authentication; cannot login with password");
        }

        // Check if account is blocked
        if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
            throw new IllegalArgumentException("Account is blocked");
        }

        // Compare password
        if (!passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            throw new IllegalArgumentException("Invalid password");
        }

        // Generate JWT token
        String token = Jwts.builder()
            .setSubject(utilisateur.getEmail())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
            .signWith(jwtSecret)
            .compact();

        // Save session
        Session session = new Session();
        session.setIdUtilisateur(utilisateur.getId());
        session.setTokenJwt(token);
        session.setExpiration(new Date(System.currentTimeMillis() + 86400000));
        sessionsRepository.save(session);

        return token; // Return success (token)
    }

    public String loginFirebase(String idToken) {
        try {
            // Vérifier le token Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            
            String email = decodedToken.getEmail();
            String nomComplet = decodedToken.getName() != null ? decodedToken.getName() : decodedToken.getEmail();
            
            // Vérifier si l'utilisateur existe
            Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
            if (utilisateur == null) {
                // Créer l'utilisateur si inexistant (comme registerFirebase)
                Role utilisateurRole = roleRepository.findByNom("UTILISATEUR")
                    .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found"));
                utilisateur = new Utilisateur();
                utilisateur.setEmail(email);
                utilisateur.setNom(nomComplet);
                utilisateur.setPrenom(nomComplet);
                utilisateur.setMotDePasse(null);
                utilisateur.setRole(utilisateurRole);
                utilisateur = utilisateurRepository.save(utilisateur);
            }

            // Générer JWT (comme loginLocal)
            String token = Jwts.builder()
                .setSubject(utilisateur.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(jwtSecret)
                .compact();
            
            // Sauvegarder session
            Session session = new Session();
            session.setIdUtilisateur(utilisateur.getId());
            session.setTokenJwt(token);
            session.setExpiration(new Date(System.currentTimeMillis() + 86400000));
            sessionsRepository.save(session);
            
            return token; // Retourner le token JWT
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
        }
    }

    public Utilisateur registerFirebase(String idToken) {
        try {
            // Vérifier le token Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            
            String email = decodedToken.getEmail();
            String nomComplet = decodedToken.getName() != null ? decodedToken.getName() : decodedToken.getEmail();
            
            // Vérifier si l'utilisateur existe déjà
            if (utilisateurRepository.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("User already exists");
            }
            
            // Get UTILISATEUR role
            Role utilisateurRole = roleRepository.findByNom("UTILISATEUR")
                .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found"));
            
            // Créer l'utilisateur
            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setEmail(email);
            utilisateur.setNom(nomComplet);
            utilisateur.setPrenom(nomComplet);
            utilisateur.setRole(utilisateurRole);
            // Pas de mot de passe pour les utilisateurs Firebase
            
            return utilisateurRepository.save(utilisateur);
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
        }
    }
}