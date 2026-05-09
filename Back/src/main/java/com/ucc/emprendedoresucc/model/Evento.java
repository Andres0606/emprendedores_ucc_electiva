package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "eventos")
public class Evento {

    @Id
    private String id;
    private String nombre;
    private String fecha;
    private String hora;
    private String lugar;
    private String modalidad;
    private String descripcion;
    private String tipo;
    private String imagen;

    public Evento() {
    }

    public Evento(String nombre, String fecha, String hora, String lugar, String modalidad, String descripcion, String tipo, String imagen) {
        this.nombre = nombre;
        this.fecha = fecha;
        this.hora = hora;
        this.lugar = lugar;
        this.modalidad = modalidad;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.imagen = imagen;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getModalidad() {
        return modalidad;
    }

    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }
}
