package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.model.signalement.SignalementPhoto;
import com.projetCloud.projetCloud.repository.signalement.SignalementPhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SignalementPhotoService {

    @Autowired
    private SignalementPhotoRepository signalementPhotoRepository;

    public List<SignalementPhoto> getPhotosBySignalementId(Integer signalementId) {
        return signalementPhotoRepository.findBySignalementId(signalementId);
    }

    @Transactional
    public void savePhotos(Signalement signalement, List<String> photoUrls) {
        if (photoUrls == null || photoUrls.isEmpty()) return;

        for (String url : photoUrls) {
            SignalementPhoto photo = new SignalementPhoto();
            photo.setSignalement(signalement);
            photo.setUrl(url);
            signalementPhotoRepository.save(photo);
        }
    }

    @Transactional
    public void deletePhotosBySignalementId(Integer signalementId) {
        signalementPhotoRepository.deleteBySignalementId(signalementId);
    }

    @Transactional
    public void updatePhotos(Signalement signalement, List<String> photoUrls) {
        // Supprimer les anciennes photos
        deletePhotosBySignalementId(signalement.getId());
        // Ajouter les nouvelles
        savePhotos(signalement, photoUrls);
    }
}