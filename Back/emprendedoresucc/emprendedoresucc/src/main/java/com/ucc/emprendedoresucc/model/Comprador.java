package com.ucc.emprendedoresucc.model;

public class Comprador {

    private String id;
    private String nombre;
    private String apellido;
    private String tipoUsuario;   // estudiante, administrativo
    private String telefono;
    private String correo;

    // Constructor vacío
    public Comprador() {}

    // Constructor con todos los campos
    public Comprador(String id, String nombre, String apellido, String tipoUsuario, String telefono, String correo) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoUsuario = tipoUsuario;
        this.telefono = telefono;
        this.correo = correo;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    
    // Método para obtener nombre completo
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}