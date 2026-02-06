package com.projetCloud.projetCloud.service;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    public void sendStatusChangeNotification(
            String signalementId,
            String signalementTitre,
            Integer ancienStatut,
            Integer nouveauStatut,
            String userEmail
    ) {
        if (ancienStatut.equals(nouveauStatut)) {
            return;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();

            Map<String, Object> notification = new HashMap<>();
            notification.put("signalementId", signalementId);
            notification.put("signalementTitre", signalementTitre);
            notification.put("ancienStatut", ancienStatut);
            notification.put("nouveauStatut", nouveauStatut);
            notification.put("userEmail", userEmail);
            notification.put("dateCreation", LocalDateTime.now().toString().substring(0, 16));
            notification.put("lu", false);

            db.collection("notifications").add(notification).get();
            System.out.println("[NOTIF] Notification envoyée pour " + userEmail
                    + " (signalement " + signalementId + " : " + ancienStatut + " -> " + nouveauStatut + ")");
        } catch (Exception e) {
            System.err.println("[ERREUR] Notification : " + e.getMessage());
            e.printStackTrace();
        }
    }
}
