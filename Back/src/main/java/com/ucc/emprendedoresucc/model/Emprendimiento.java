package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "emprendimientos")
public class Emprendimiento {

    @Id
    private String id;

    private String nombre;
    private String descripcion;
    private String categoriaId;
    private String usuarioId;
    private String estado;
    private String telefono;

    // NUNCA NULL
    private List<String> imagenes = new ArrayList<>();
    private List<Producto> productos = new ArrayList<>();
    private int totalVentas = 0;

    public Emprendimiento() {}

    // GETTERS Y SETTERS
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCategoriaId() { return categoriaId; }
    public void setCategoriaId(String categoriaId) { this.categoriaId = categoriaId; }

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public List<String> getImagenes() { return imagenes; }
    public void setImagenes(List<String> imagenes) {
        this.imagenes = (imagenes != null) ? imagenes : new ArrayList<>();
    }

    public List<Producto> getProductos() { return productos; }
    public void setProductos(List<Producto> productos) {
        this.productos = (productos != null) ? productos : new ArrayList<>();
    }

    public int getTotalVentas() { return totalVentas; }
    public void setTotalVentas(int totalVentas) { this.totalVentas = totalVentas; }
}