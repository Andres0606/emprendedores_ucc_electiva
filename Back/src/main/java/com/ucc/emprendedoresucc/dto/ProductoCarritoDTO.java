// DTO para los productos del carrito
package com.ucc.emprendedoresucc.dto;

public class ProductoCarritoDTO {
    private String emprendimientoId;
    private String nombreProducto;
    private double precio;
    private int cantidad;
    private String imagen; // Podrías agregar esto si quieres

    // Constructor vacío
    public ProductoCarritoDTO() {}

    // Constructor con parámetros
    public ProductoCarritoDTO(String emprendimientoId, String nombreProducto, double precio, int cantidad, String imagen) {
        this.emprendimientoId = emprendimientoId;
        this.nombreProducto = nombreProducto;
        this.precio = precio;
        this.cantidad = cantidad;
        this.imagen = imagen;
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
    
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}