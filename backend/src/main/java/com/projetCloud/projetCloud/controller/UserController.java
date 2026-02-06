package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.model.utilisateur.HistoriqueBlocage;
import com.projetCloud.projetCloud.service.UserService;
import com.projetCloud.projetCloud.service.AuthService;
import com.projetCloud.projetCloud.service.HistoriqueBlocageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @Autowired
    private HistoriqueBlocageService historiqueBlocageService;

    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ApiResponse<Utilisateur> getUtilisateurById(@PathVariable Integer id) {
        try {
            Utilisateur user = userService.getUserById(id);
            return new ApiResponse<>("success", user, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Utilisateur> updateUtilisateur(
        @PathVariable Integer id,
        @RequestBody Utilisateur updated,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        // Seul l'utilisateur lui-même ou un manager peut modifier
        if (currentUser == null || (!currentUser.getId().equals(id) && !"MANAGER".equalsIgnoreCase(currentUser.getRole().getNom()))) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        try {
            Utilisateur user = userService.updateUser(id, updated);
            return new ApiResponse<>("success", user, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PostMapping("/unblock/{userId}")
    public ApiResponse<String> unblockUser(@PathVariable Integer userId) {
        try {
            userService.unblockUser(userId);
            return new ApiResponse<>("success", "Compte utilisateur " + userId + " débloqué", null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/historique-blocage")
    public ApiResponse<List<HistoriqueBlocage>> getAllHistoriqueBlocage() {
        try {
            List<HistoriqueBlocage> historique = historiqueBlocageService.getAll();
            return new ApiResponse<>("success", historique, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/{id}/historique-blocage")
    public ApiResponse<List<HistoriqueBlocage>> getHistoriqueBlocage(@PathVariable Integer id) {
        try {
            List<HistoriqueBlocage> historique = historiqueBlocageService.getByUtilisateurId(id);
            return new ApiResponse<>("success", historique, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PostMapping("/firebase/import")
    public ApiResponse<Map<String, Integer>> importUsersFromFirebase(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        try {
            Map<String, Integer> result = userService.importUsersFromFirebase();
            return new ApiResponse<>("success", result, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PostMapping("/firebase/export")
    public ApiResponse<Map<String, Integer>> exportUsersToFirebase(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        try {
            Map<String, Integer> result = userService.exportUsersToFirebase();
            return new ApiResponse<>("success", result, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PostMapping("/firebase/sync")
    public ApiResponse<Map<String, Integer>> synchronizeUsers(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        try {
            Map<String, Integer> result = userService.synchronizeUsers();
            return new ApiResponse<>("success", result, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }
}