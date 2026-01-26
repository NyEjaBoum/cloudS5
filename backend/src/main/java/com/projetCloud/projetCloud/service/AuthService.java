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
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import com.projetCloud.projetCloud.repository.role.ActionRoleRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SessionsRepository sessionsRepository;
    private final ActionRoleRepository actionRoleRepository;

    @Value("${auth.max.attempts:3}")
    private int maxAttempts;

    @Value("${jwt.expiration.hours:24}")
    private int jwtExpirationHours;

    @Value("${jwt.secret}")
    private String jwtSecretString;

    private SecretKey jwtSecret;

    @PostConstruct
    public void init() {
        this.jwtSecret = Keys.hmacShaKeyFor(jwtSecretString.getBytes());
    }

    public AuthService(UtilisateurRepository utilisateurRepository,
                    RoleRepository roleRepository,
                    BCryptPasswordEncoder passwordEncoder,
                    SessionsRepository sessionsRepository,
                    ActionRoleRepository actionRoleRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionsRepository = sessionsRepository;
        this.actionRoleRepository = actionRoleRepository;
    }

    public String getRoleFromToken(String token) {
        try {
            var claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            return claims.get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Utilisateur getUserFromToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                System.out.println("[AuthService] Token manquant ou vide");
                return null;
            }
            System.out.println("[AuthService] Token reçu: " + token);
            var claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            String email = claims.getSubject();
            System.out.println("[AuthService] Email extrait du token: " + email);
            Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
            System.out.println("[AuthService] Utilisateur trouvé: " + user.getEmail() + " (id=" + user.getId() + ")");
            return user;
        } catch (Exception e) {
            System.out.println("[AuthService] Erreur lors de la récupération de l'utilisateur depuis le token : " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean hasPermission(Utilisateur utilisateur, String action) {
        Role role = utilisateur.getRole();
        return actionRoleRepository.existsByRoleAndAction(role, action);
    }

    public Utilisateur registerLocal(String email, String motDePasse, String nom, String prenom) {

        // if (!hasPermission(utilisateur, "CREER_UTILISATEUR")) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission refusée");
        // }
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
        utilisateur.setTentativesEchouees(0);
        utilisateur.setCompteBloque(false);
        utilisateur.setDateCreation(LocalDateTime.now());

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
            // Vérifier si le blocage a expiré (optionnel : déblocage automatique après 24h)
            if (utilisateur.getDateBlocage() != null && 
                utilisateur.getDateBlocage().plusHours(24).isBefore(LocalDateTime.now())) {
                // Auto-déblocage après 24h
                utilisateur.setCompteBloque(false);
                utilisateur.setTentativesEchouees(0);
                utilisateur.setDateBlocage(null);
                utilisateurRepository.save(utilisateur);
            } else {
                throw new IllegalArgumentException("Account is blocked. Please contact administrator.");
            }
        }

        // Compare password
        if (!passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            // Incrémenter les tentatives échouées
            int tentatives = utilisateur.getTentativesEchouees() != null ? 
                           utilisateur.getTentativesEchouees() : 0;
            tentatives++;
            utilisateur.setTentativesEchouees(tentatives);
            
            // Bloquer après maxAttempts tentatives
            if (tentatives >= maxAttempts) {
                utilisateur.setCompteBloque(true);
                utilisateur.setDateBlocage(LocalDateTime.now());
            }
            
            utilisateurRepository.save(utilisateur);
            throw new IllegalArgumentException("Invalid password. Attempts left: " + (maxAttempts - tentatives));
        }

        // Si connexion réussie, réinitialiser les tentatives
        utilisateur.setTentativesEchouees(0);
        utilisateurRepository.save(utilisateur);

        // Generate JWT token
        Integer expirationMillis = jwtExpirationHours * 60 * 60 * 1000;
        String token = Jwts.builder()
            .setSubject(utilisateur.getEmail())
            .claim("role", utilisateur.getRole().getId()
) // <-- ajoute cette ligne
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
            .signWith(jwtSecret)
            .compact();

        // Save session
        Session session = new Session();
        session.setIdUtilisateur(utilisateur.getId());
        session.setTokenJwt(token);
        session.setExpiration(new Date(System.currentTimeMillis() + expirationMillis));
        sessionsRepository.save(session);

        return token;
    }


    public String loginFirebase(String idToken) {
    try {
        // Vérifier le token Firebase
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

        String email = decodedToken.getEmail();

        // Vérifier si l'utilisateur existe DANS LA BASE
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        if (utilisateur == null) {
            throw new IllegalArgumentException("Aucun compte local associé à cet email. Veuillez contacter un administrateur.");
        }

        // Vérifier si le compte est bloqué
        if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
            throw new IllegalArgumentException("Account is blocked. Please contact administrator.");
        }

        // Générer JWT
        Integer expirationMillis = jwtExpirationHours * 60 * 60 * 1000;
        String token = Jwts.builder()
            .setSubject(utilisateur.getEmail())
            .claim("role", utilisateur.getRole().getId())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
            .signWith(jwtSecret)
            .compact();

        // Sauvegarder session
        Session session = new Session();
        session.setIdUtilisateur(utilisateur.getId());
        session.setTokenJwt(token);
        session.setExpiration(new Date(System.currentTimeMillis() + expirationMillis));
        sessionsRepository.save(session);

        return token;
    } catch (Exception e) {
        throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
    }
}

//     public String loginFirebase(String idToken) {
//         try {
//             // Vérifier le token Firebase
//             FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            
//             String email = decodedToken.getEmail();
//             String nomComplet = decodedToken.getName() != null ? decodedToken.getName() : decodedToken.getEmail();
            
//             // Vérifier si l'utilisateur existe
//             Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
//             if (utilisateur == null) {
//                 // Créer l'utilisateur si inexistant
//                 Role utilisateurRole = roleRepository.findByNom("UTILISATEUR")
//                     .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found"));
//                 utilisateur = new Utilisateur();
//                 utilisateur.setEmail(email);
//                 utilisateur.setNom(nomComplet);
//                 utilisateur.setPrenom(nomComplet);
//                 utilisateur.setMotDePasse(null);
//                 utilisateur.setRole(utilisateurRole);
//                 utilisateur.setTentativesEchouees(0);
//                 utilisateur.setCompteBloque(false);
//                 utilisateur.setDateCreation(LocalDateTime.now());
//                 utilisateur = utilisateurRepository.save(utilisateur);
//             }

//             // Vérifier si le compte est bloqué (pour Firebase aussi)
//             if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
//                 throw new IllegalArgumentException("Account is blocked. Please contact administrator.");
//             }

//             // Générer JWT
//             Integer expirationMillis = jwtExpirationHours * 60 * 60 * 1000;
//             String token = Jwts.builder()
//                 .setSubject(utilisateur.getEmail())
//                 .claim("role", utilisateur.getRole().getId()
// ) // <-- ajoute cette ligne
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
//                 .signWith(jwtSecret)
//                 .compact();
            
//             // Sauvegarder session
//             Session session = new Session();
//             session.setIdUtilisateur(utilisateur.getId());
//             session.setTokenJwt(token);
//             session.setExpiration(new Date(System.currentTimeMillis() + expirationMillis));
//             sessionsRepository.save(session);
            
//             return token;
//         } catch (Exception e) {
//             throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
//         }
//     }

    public Utilisateur registerFirebase(String idToken) {
        try {
            // Vérifier le token Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            
            String email = decodedToken.getEmail();
            String nomComplet = decodedToken.getName() != null ? decodedToken.getName() : decodedToken.getEmail();
            // if (!hasPermission(utilisateur, "CREER_UTILISATEUR")) {
            //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission refusée");
            // }
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
            utilisateur.setMotDePasse(null);
            utilisateur.setTentativesEchouees(0);
            utilisateur.setCompteBloque(false);
            utilisateur.setDateCreation(LocalDateTime.now());
            
            return utilisateurRepository.save(utilisateur);
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
        }
    }

    // Nouvelle méthode pour débloquer un utilisateur
    public void unblockUser(Integer userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        utilisateur.setCompteBloque(false);
        utilisateur.setTentativesEchouees(0);
        utilisateur.setDateBlocage(null);
        utilisateurRepository.save(utilisateur);
    }

    // Méthode pour obtenir les informations de blocage
    public BlockStatus getBlockStatus(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        return new BlockStatus(
            utilisateur.getEmail(),
            utilisateur.getTentativesEchouees(),
            utilisateur.getCompteBloque(),
            utilisateur.getDateBlocage()
        );
    }

    // Classe interne pour le statut de blocage
    public static class BlockStatus {
        private String email;
        private Integer tentativesEchouees;
        private Boolean compteBloque;
        private LocalDateTime dateBlocage;
        
        public BlockStatus(String email, Integer tentativesEchouees, Boolean compteBloque, LocalDateTime dateBlocage) {
            this.email = email;
            this.tentativesEchouees = tentativesEchouees;
            this.compteBloque = compteBloque;
            this.dateBlocage = dateBlocage;
        }
        
        // Getters
        public String getEmail() { return email; }
        public Integer getTentativesEchouees() { return tentativesEchouees; }
        public Boolean getCompteBloque() { return compteBloque; }
        public LocalDateTime getDateBlocage() { return dateBlocage; }
    }
}