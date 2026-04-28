// DTO para la solicitud del carrito
package com.ucc.emprendedoresucc.dto;

import java.util.List;

public class CarritoRequestDTO {
    private String usuarioId;
    private List<ProductoCarritoDTO> productos;
    private double total;

    // Constructor vacío
    public CarritoRequestDTO() {}

    // Getters y Setters
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    
    public List<ProductoCarritoDTO> getProductos() { return productos; }
    public void setProductos(List<ProductoCarritoDTO> productos) { this.productos = productos; }
    
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}