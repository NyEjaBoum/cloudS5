package com.projetCloud.projetCloud.service;

import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.projetCloud.projetCloud.model.signalement.Signalement;
import org.springframework.stereotype.Service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.InputStream;
import com.projetCloud.projetCloud.dto.SignalementDto;

@Service
public class FirebaseSignalementService {

    public FirebaseSignalementService() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                InputStream serviceAccount =
                    getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
                FirebaseApp.initializeApp(options);
                System.out.println("FirebaseApp initialized in service!");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void syncSignalement(Signalement signalement) {
        Firestore db = FirestoreClient.getFirestore();
        SignalementDto dto = new SignalementDto(signalement);
        db.collection("signalements")
        .document(String.valueOf(signalement.getId()))
        .set(dto);
    }
}