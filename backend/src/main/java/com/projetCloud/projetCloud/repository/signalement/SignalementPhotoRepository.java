package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.SignalementPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SignalementPhotoRepository extends JpaRepository<SignalementPhoto, Integer> {
    List<SignalementPhoto> findBySignalementId(Integer idSignalement);
    void deleteBySignalementId(Integer idSignalement);
}