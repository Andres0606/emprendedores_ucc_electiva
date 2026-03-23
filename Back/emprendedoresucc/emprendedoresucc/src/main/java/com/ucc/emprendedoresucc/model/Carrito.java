package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "carrito")
public class Carrito {

    @Id
    private String id;
    private String usuarioId;
    private List<ProductoCarrito> productos;
    private double total;

    // Constructor vacío
    public Carrito() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    
    public List<ProductoCarrito> getProductos() { return productos; }
    public void setProductos(List<ProductoCarrito> productos) { this.productos = productos; }
    
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}