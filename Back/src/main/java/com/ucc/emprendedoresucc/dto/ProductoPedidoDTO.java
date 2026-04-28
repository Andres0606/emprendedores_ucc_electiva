// DTO para productos del pedido
package com.ucc.emprendedoresucc.dto;

public class ProductoPedidoDTO {
    private String productoId;
    private int cantidad;

    public ProductoPedidoDTO() {}

    public ProductoPedidoDTO(String productoId, int cantidad) {
        this.productoId = productoId;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public String getProductoId() { return productoId; }
    public void setProductoId(String productoId) { this.productoId = productoId; }
    
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
}