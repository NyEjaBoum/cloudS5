package com.projetCloud.projetCloud.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Requête d'inscription Firebase")
public class FirebaseRegisterRequest {
    @Schema(description = "Token ID Firebase", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...", required = true)
    private String idToken;
    
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}
