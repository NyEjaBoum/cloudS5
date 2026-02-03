package com.projetCloud.projetCloud.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.InputStream;

public class FirebaseUtil {
    
    private static boolean initialized = false;
    
    public static synchronized void ensureInitialized() {
        if (initialized) {
            return; // Déjà initialisé
        }
        
        if (!FirebaseApp.getApps().isEmpty()) {
            System.out.println("✅ Firebase déjà initialisé");
            initialized = true;
            return;
        }
        
        try {
            InputStream serviceAccount =
                FirebaseUtil.class.getClassLoader().getResourceAsStream("serviceAccountKey.json");
            
            if (serviceAccount == null) {
                throw new RuntimeException("❌ serviceAccountKey.json not found in resources!");
            }
            
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
            
            FirebaseApp.initializeApp(options);
            initialized = true;
            System.out.println("✅ Firebase initialisé par FirebaseUtil");
        } catch (Exception e) {
            throw new RuntimeException("❌ Erreur initialisation Firebase: " + e.getMessage(), e);
        }
    }
}