package com.ucc.emprendedoresucc.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String userId;
    private String correo;
    private String telefono;
    private String carrera;

    public AuthResponse(String token, String username, String role, String userId, String correo, String telefono, String carrera) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.correo = correo;
        this.telefono = telefono;
        this.carrera = carrera;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }
}
