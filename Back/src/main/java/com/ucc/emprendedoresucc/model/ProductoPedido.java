package com.ucc.emprendedoresucc.model;

public class ProductoPedido {
    private String productoId;
    private int cantidad;

    // Constructor vacío (necesario para MongoDB)
    public ProductoPedido() {
    }

    // Constructor con parámetros
    public ProductoPedido(String productoId, int cantidad) {
        this.productoId = productoId;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public String getProductoId() {
        return productoId;
    }

    public void setProductoId(String productoId) {
        this.productoId = productoId;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    // Método toString para debugging
    @Override
    public String toString() {
        return "ProductoPedido{" +
                "productoId='" + productoId + '\'' +
                ", cantidad=" + cantidad +
                '}';
    }
}