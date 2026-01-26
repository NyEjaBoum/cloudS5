package com.projetCloud.projetCloud.repository.role;

import com.projetCloud.projetCloud.model.role.ActionRole;
import com.projetCloud.projetCloud.model.role.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionRoleRepository extends JpaRepository<ActionRole, Integer> {
    boolean existsByRoleAndAction(Role role, String action);
}