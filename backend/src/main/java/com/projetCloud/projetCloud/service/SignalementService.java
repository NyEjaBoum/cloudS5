package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projetCloud.projetCloud.dto.InfosSignalementDto;
import java.util.List;
import java.util.stream.Collectors;
import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.model.signalement.SignalementHistorique;
import com.projetCloud.projetCloud.service.SignalementHistoriqueService;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import com.projetCloud.projetCloud.dto.SignalementDto;
import com.projetCloud.projetCloud.dto.SignalementCpl;

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementHistoriqueService signalementHistoriqueService;

    public RecapSignalementDto getRecapitulatif() {
        Object[] row = signalementRepository.getRecapitulatifRaw().get(0);
        return new RecapSignalementDto(
            ((Number) row[0]).intValue(),
            row[1] != null ? new BigDecimal(row[1].toString()) : null,
            row[2] != null ? new BigDecimal(row[2].toString()) : null,
            row[3] != null ? new BigDecimal(row[3].toString()) : null
        );
    }

    @Transactional
    public Signalement save(Signalement signalement){
        Signalement saved = signalementRepository.save(signalement);

        SignalementHistorique historique = new SignalementHistorique();
        historique.setSignalement(saved);
        historique.setAncienStatut(saved.getStatut());
        historique.setNouveauStatut(saved.getStatut());
        historique.setDateChangement(saved.getDateCreation());
        historique.setUtilisateur(saved.getUtilisateur());
        signalementHistoriqueService.save(historique);

        return saved;
    }

    @Transactional
    public Signalement update(Integer id, Signalement updated) {
        Signalement signalement = getById(id);
        signalement.setTitre(updated.getTitre());
        signalement.setDescription(updated.getDescription());
        signalement.setStatut(updated.getStatut());
        signalement.setLatitude(updated.getLatitude());
        signalement.setLongitude(updated.getLongitude());
        signalement.setSurfaceM2(updated.getSurfaceM2());
        signalement.setBudget(updated.getBudget());
        signalement.setEntreprise(updated.getEntreprise());
        // Ajoute d'autres champs si besoin

        Signalement saved = signalementRepository.save(signalement);

        // Historique
        SignalementHistorique historique = new SignalementHistorique();
        historique.setSignalement(saved);
        historique.setAncienStatut(signalement.getStatut());
        historique.setNouveauStatut(updated.getStatut());
        historique.setDateChangement(java.time.LocalDateTime.now());
        historique.setUtilisateur(signalement.getUtilisateur());
        signalementHistoriqueService.save(historique);

        return saved;
    }

    @Transactional
    public Signalement annuler(Integer id) {
        Signalement signalement = getById(id);
        Integer ancienStatut = signalement.getStatut();
        signalement.setStatut(21); // 21 = annulé/effacé
        Signalement saved = signalementRepository.save(signalement);

        // Historique
        SignalementHistorique historique = new SignalementHistorique();
        historique.setSignalement(saved);
        historique.setAncienStatut(ancienStatut);
        historique.setNouveauStatut(21);
        historique.setDateChangement(java.time.LocalDateTime.now());
        historique.setUtilisateur(signalement.getUtilisateur());
        signalementHistoriqueService.save(historique);

        return saved;
    }

    public List<InfosSignalementDto> getInfosSignalement() {
        List<Object[]> rows = signalementRepository.getInfosSignalementRaw();
        List<InfosSignalementDto> result = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            InfosSignalementDto dto = new InfosSignalementDto(
                ((Number) row[0]).intValue(),
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

    public Signalement getById(Integer id) {
        return signalementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
    }

    public SignalementCpl getSignalementCplById(Integer id) {
        List<Object[]> rows = signalementRepository.getSignalementCplByIdRaw(id);
        if (rows.isEmpty()) {
            throw new RuntimeException("Signalement non trouvé");
        }
        Object[] row = rows.get(0);
        return new SignalementCpl(
            ((Number) row[0]).intValue(),
            (String) row[1],
            (String) row[2],
            (Integer) row[3],
            row[4] != null ? new java.math.BigDecimal(row[4].toString()) : null,
            row[5] != null ? new java.math.BigDecimal(row[5].toString()) : null,
            row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null,
            row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null,
            row[8] != null ? ((Number) row[8]).intValue() : null,
            (String) row[9],
            (String) row[10],
            (String) row[11],
            row[12] != null ? ((Number) row[12]).intValue() : null,
            (String) row[13],
            (String) row[14],
            (String) row[15],
            row[16] != null ? row[16].toString() : null
        );
    }

    public List<SignalementCpl> getAllSignalementCpl() {
        List<Object[]> rows = signalementRepository.getSignalementCplRaw();
        List<SignalementCpl> result = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            SignalementCpl dto = new SignalementCpl(
                ((Number) row[0]).intValue(),
                (String) row[1],
                (String) row[2],
                (Integer) row[3],
                row[4] != null ? new java.math.BigDecimal(row[4].toString()) : null,
                row[5] != null ? new java.math.BigDecimal(row[5].toString()) : null,
                row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null,
                row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null,
                row[8] != null ? ((Number) row[8]).intValue() : null,
                (String) row[9],
                (String) row[10],
                (String) row[11],
                row[12] != null ? ((Number) row[12]).intValue() : null,
                (String) row[13],
                (String) row[14],
                (String) row[15],
                row[16] != null ? row[16].toString() : null
            );
            result.add(dto);
        }
        return result;
    }
}