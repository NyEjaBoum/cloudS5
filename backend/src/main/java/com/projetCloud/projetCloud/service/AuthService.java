package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.role.Role;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.repository.role.RoleRepository;
import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;
import com.projetCloud.projetCloud.model.session.Session;
import com.projetCloud.projetCloud.repository.session.SessionsRepository;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import com.projetCloud.projetCloud.repository.role.ActionRoleRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.Map;

import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuthException;
import java.util.HashMap;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final SessionsRepository sessionsRepository;
    private final ActionRoleRepository actionRoleRepository;
    private final HistoriqueBlocageService historiqueBlocageService;

    @Value("${auth.max.attempts:3}")
    private int maxAttempts;

    @Value("${jwt.expiration.hours:24}")
    private int jwtExpirationHours;

    @Value("${jwt.secret}")
    private String jwtSecretString;

    private SecretKey jwtSecret;

    private static final String AES_KEY = "1234567890123456";
    private static final String AES_ALGO = "AES";

    @PostConstruct
    public void init() {
        this.jwtSecret = Keys.hmacShaKeyFor(jwtSecretString.getBytes());
    }

    public AuthService(UtilisateurRepository utilisateurRepository,
                      RoleRepository roleRepository,
                      SessionsRepository sessionsRepository,
                      ActionRoleRepository actionRoleRepository,
                      HistoriqueBlocageService historiqueBlocageService) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.sessionsRepository = sessionsRepository;
        this.actionRoleRepository = actionRoleRepository;
        this.historiqueBlocageService = historiqueBlocageService;
    }

    // ========== CHIFFREMENT ==========
    public String encryptPassword(String password) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), AES_ALGO);
            Cipher cipher = Cipher.getInstance(AES_ALGO);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(password.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Erreur chiffrement mot de passe", e);
        }
    }

    public String decryptPassword(String encryptedPassword) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), AES_ALGO);
            Cipher cipher = Cipher.getInstance(AES_ALGO);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(encryptedPassword);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Erreur déchiffrement mot de passe", e);
        }
    }

    // ========== TOKENS & PERMISSIONS ==========
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
            var claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            String email = claims.getSubject();
            Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
            return user;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean hasPermission(Utilisateur utilisateur, String action) {
        Role role = utilisateur.getRole();
        return actionRoleRepository.existsByRoleAndAction(role, action);
    }

    // ========== INSCRIPTION ==========
    @Transactional
    public Utilisateur register(String email, String motDePasse, String nom, String prenom) {
        try {

            Utilisateur utilisateur = registerLocal(email, motDePasse, nom, prenom);
            return utilisateur;
        } catch (Exception e) {
            throw new IllegalArgumentException("Erreur lors de l'inscription local : " + e.getMessage());
        }
    }

    public Utilisateur registerLocal(String email, String motDePasse, String nom, String prenom) {
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        String encryptedPassword = encryptPassword(motDePasse);

        Role utilisateurRole = roleRepository.findByNom("UTILISATEUR")
            .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found"));

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(email);
        utilisateur.setMotDePasse(encryptedPassword);
        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setRole(utilisateurRole);
        utilisateur.setTentativesEchouees(0);
        utilisateur.setCompteBloque(false);
        utilisateur.setDateCreation(LocalDateTime.now());

        return utilisateurRepository.save(utilisateur);
    }

    // ========== CONNEXION ==========
    public String loginLocal(String email, String motDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
            if (utilisateur.getDateBlocage() != null &&
                utilisateur.getDateBlocage().plusHours(24).isBefore(LocalDateTime.now())) {
                utilisateur.setCompteBloque(false);
                utilisateur.setTentativesEchouees(0);
                utilisateur.setDateBlocage(null);
                utilisateurRepository.save(utilisateur);
                historiqueBlocageService.enregistrer(utilisateur, "DEBLOCAGE_AUTO", "Expiration du delai de 24h");
            } else {
                throw new IllegalArgumentException("Account is blocked. Please contact administrator.");
            }
        }

        String decryptedPassword = decryptPassword(utilisateur.getMotDePasse());
        if (!motDePasse.equals(decryptedPassword)) {
            int tentatives = utilisateur.getTentativesEchouees() != null ?
                           utilisateur.getTentativesEchouees() : 0;
            tentatives++;
            utilisateur.setTentativesEchouees(tentatives);

            if (tentatives >= maxAttempts) {
                utilisateur.setCompteBloque(true);
                utilisateur.setDateBlocage(LocalDateTime.now());
                utilisateurRepository.save(utilisateur);
                historiqueBlocageService.enregistrer(utilisateur, "BLOCAGE_AUTO", "Tentatives de connexion echouees (" + maxAttempts + " max)");
            } else {
                utilisateurRepository.save(utilisateur);
            }
            throw new IllegalArgumentException("Invalid password. Attempts left: " + (maxAttempts - tentatives));
        }

        utilisateur.setTentativesEchouees(0);
        utilisateurRepository.save(utilisateur);

        Integer expirationMillis = jwtExpirationHours * 60 * 60 * 1000;
        String token = Jwts.builder()
            .setSubject(utilisateur.getEmail())
            .claim("role", utilisateur.getRole().getId())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
            .signWith(jwtSecret)
            .compact();

        Session session = new Session();
        session.setIdUtilisateur(utilisateur.getId());
        session.setTokenJwt(token);
        session.setExpiration(new Date(System.currentTimeMillis() + expirationMillis));
        sessionsRepository.save(session);

        return token;
    }

    public String loginFirebase(String idToken) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

            String email = decodedToken.getEmail();

            Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
            if (utilisateur == null) {
                throw new IllegalArgumentException("Aucun compte local associé à cet email. Veuillez contacter un administrateur.");
            }

            if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
                throw new IllegalArgumentException("Account is blocked. Please contact administrator.");
            }

            Integer expirationMillis = jwtExpirationHours * 60 * 60 * 1000;
            String token = Jwts.builder()
                .setSubject(utilisateur.getEmail())
                .claim("role", utilisateur.getRole().getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(jwtSecret)
                .compact();

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

    public Map<String, Object> checkFirebaseUserStatus(String idToken) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            
            Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
            
            Map<String, Object> status = new HashMap<>();
            
            if (utilisateur == null) {
                status.put("exists", false);
                status.put("blocked", false);
                status.put("message", "Aucun compte local trouvé");
                return status;
            }
            
            status.put("exists", true);
            status.put("blocked", Boolean.TRUE.equals(utilisateur.getCompteBloque()));
            status.put("tentativesRestantes", maxAttempts - (utilisateur.getTentativesEchouees() != null ? utilisateur.getTentativesEchouees() : 0));
            
            if (Boolean.TRUE.equals(utilisateur.getCompteBloque())) {
                status.put("message", "Compte bloqué. Contactez un administrateur.");
                status.put("dateBlocage", utilisateur.getDateBlocage());
            }
            
            return status;
        } catch (Exception e) {
            throw new IllegalArgumentException("Token Firebase invalide: " + e.getMessage());
        }
    }

    public void incrementFailedAttempts(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        if (utilisateur == null) return;
        
        int tentatives = utilisateur.getTentativesEchouees() != null ? utilisateur.getTentativesEchouees() : 0;
        tentatives++;
        utilisateur.setTentativesEchouees(tentatives);
        
        if (tentatives >= maxAttempts) {
            utilisateur.setCompteBloque(true);
            utilisateur.setDateBlocage(LocalDateTime.now());
            historiqueBlocageService.enregistrer(utilisateur, "BLOCAGE_AUTO", "Tentatives de connexion échouées depuis mobile (" + maxAttempts + " max)");
        }
        
        utilisateurRepository.save(utilisateur);
    }

    public void resetFailedAttempts(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        if (utilisateur != null) {
            utilisateur.setTentativesEchouees(0);
            utilisateurRepository.save(utilisateur);
        }
    }
}