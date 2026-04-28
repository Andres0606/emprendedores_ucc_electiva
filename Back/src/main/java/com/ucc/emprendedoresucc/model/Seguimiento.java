package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "seguimientos")
public class Seguimiento {

    @Id
    private String id;
    private String usuarioId;
    private String emprendimientoId;
    private LocalDate fecha;

    // Constructor vacío
    public Seguimiento() {}

    // Constructor con parámetros
    public Seguimiento(String usuarioId, String emprendimientoId, LocalDate fecha) {
        this.usuarioId = usuarioId;
        this.emprendimientoId = emprendimientoId;
        this.fecha = fecha;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getEmprendimientoId() {
        return emprendimientoId;
    }

    public void setEmprendimientoId(String emprendimientoId) {
        this.emprendimientoId = emprendimientoId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}