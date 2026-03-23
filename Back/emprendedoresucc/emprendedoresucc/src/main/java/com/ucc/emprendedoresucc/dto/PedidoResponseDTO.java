// DTO para la respuesta del pedido
package com.ucc.emprendedoresucc.dto;

import java.util.List;

public class PedidoResponseDTO {
    private String id;
    private int numeroPedido;
    private String clienteId;
    private String emprendimientoId;
    private List<ProductoPedidoDTO> productos;
    private double total;
    private String estado;
    private String fechaPedido;
    private String fechaExpiracion;

    // Constructor vacío
    public PedidoResponseDTO() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public int getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(int numeroPedido) { this.numeroPedido = numeroPedido; }
    
    public String getClienteId() { return clienteId; }
    public void setClienteId(String clienteId) { this.clienteId = clienteId; }
    
    public String getEmprendimientoId() { return emprendimientoId; }
    public void setEmprendimientoId(String emprendimientoId) { this.emprendimientoId = emprendimientoId; }
    
    public List<ProductoPedidoDTO> getProductos() { return productos; }
    public void setProductos(List<ProductoPedidoDTO> productos) { this.productos = productos; }
    
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(String fechaPedido) { this.fechaPedido = fechaPedido; }
    
    public String getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(String fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
}