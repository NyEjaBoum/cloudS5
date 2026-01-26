package com.projetCloud.projetCloud.model.role;

import jakarta.persistence.*;

@Entity
@Table(name = "action_role")
public class ActionRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private String action;

    public ActionRole() {}

    // Getters et setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}