package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import com.projetCloud.projetCloud.service.FirebaseSignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private FirebaseSignalementService firebaseSignalementService;

    // GET /api/signalements : liste tous les signalements
    @GetMapping
    public List<Signalement> getAllSignalements() {
        return signalementRepository.findAll();
    }

    // POST /api/signalements/sync/{id} : synchronise un signalement vers Firebase
    @PostMapping("/sync/{id}")
    public String syncSignalement(@PathVariable Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        firebaseSignalementService.syncSignalement(signalement);
        return "Signalement synchronisé avec Firebase";
    }

    // POST /api/signalements/syncAll : synchronise tous les signalements vers Firebase
    @PostMapping("/syncAll")
    public String syncAllSignalements() {
        List<Signalement> signalements = signalementRepository.findAll();
        signalements.forEach(firebaseSignalementService::syncSignalement);
        return "Tous les signalements ont été synchronisés avec Firebase";
    }
}