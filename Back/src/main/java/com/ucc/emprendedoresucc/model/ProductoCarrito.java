package com.ucc.emprendedoresucc.model;

public class ProductoCarrito {
    private String emprendimientoId;
    private String nombreProducto;
    private double precio;
    private int cantidad;

    public ProductoCarrito() {}

    public ProductoCarrito(String emprendimientoId, String nombreProducto, double precio, int cantidad) {
        this.emprendimientoId = emprendimientoId;
        this.nombreProducto = nombreProducto;
        this.precio = precio;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public String getEmprendimientoId() { return emprendimientoId; }
    public void setEmprendimientoId(String emprendimientoId) { this.emprendimientoId = emprendimientoId; }
    
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
}