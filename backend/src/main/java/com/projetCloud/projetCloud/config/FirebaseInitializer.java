package com.projetCloud.projetCloud.config;

import com.projetCloud.projetCloud.util.FirebaseUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class FirebaseInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔥 Initialisation de Firebase au démarrage de l'application...");
        FirebaseUtil.ensureInitialized();
        System.out.println("✅ Firebase initialisé avec succès !");
    }
}