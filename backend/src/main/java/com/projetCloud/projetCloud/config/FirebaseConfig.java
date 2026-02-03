package com.projetCloud.projetCloud.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration("firebaseConfig")
public class FirebaseConfig {

    @PostConstruct
    public void init() throws IOException {
        System.out.println(">>> [FirebaseConfig] Initialisation FirebaseConfig...");
        // Vérifie si Firebase est déjà initialisé
        if (!FirebaseApp.getApps().isEmpty()) {
            System.out.println(">>> [FirebaseConfig] Firebase déjà initialisé");
            return;
        }

        InputStream serviceAccount =
            getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");

        if (serviceAccount == null) {
            throw new IOException("❌ serviceAccountKey.json not found in resources!");
        }

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();

        FirebaseApp.initializeApp(options);
        System.out.println(">>> [FirebaseConfig] Firebase initialisé avec succès");
    }
}