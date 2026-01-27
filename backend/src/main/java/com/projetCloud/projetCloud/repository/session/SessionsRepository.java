package com.projetCloud.projetCloud.repository.session;

import com.projetCloud.projetCloud.model.session.Session;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionsRepository extends JpaRepository<Session, Integer> {
    // Add custom methods if needed, e.g., findByTokenJwt(String token)
}