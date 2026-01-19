package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    public RecapSignalementDto getRecapitulatif() {
        Object[] row = signalementRepository.getRecapitulatifRaw().get(0);
        return new RecapSignalementDto(
            ((Number) row[0]).longValue(),
            ((Number) row[1]).doubleValue(),
            ((Number) row[2]).doubleValue(),
            ((Number) row[3]).doubleValue()
        );
    }
}