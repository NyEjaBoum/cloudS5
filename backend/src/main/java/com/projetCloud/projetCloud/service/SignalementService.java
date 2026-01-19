package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projetCloud.projetCloud.dto.InfosSignalementDto;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<InfosSignalementDto> getInfosSignalement() {
        List<Object[]> rows = signalementRepository.getInfosSignalementRaw();
        List<InfosSignalementDto> result = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            InfosSignalementDto dto = new InfosSignalementDto(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                (Integer) row[3],
                row[4] != null ? ((Number) row[4]).doubleValue() : null,
                row[5] != null ? ((Number) row[5]).doubleValue() : null,
                (String) row[6],
                row[7] != null ? row[7].toString() : null
            );
            result.add(dto);
        }
        return result;
    }
}