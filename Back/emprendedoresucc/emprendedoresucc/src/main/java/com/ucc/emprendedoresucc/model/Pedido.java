package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "Pedidos")
public class Pedido {

    @Id
    private String id;
    private int numeroPedido;
    private String clienteId;
    private String emprendimientoId;
    private List<ProductoPedido> productos;
    private double total;
    private String estado;
    private String fechaPedido;
    private String fechaExpiracion;

    // Constructor vacío (necesario para MongoDB)
    public Pedido() {
    }

    // Constructor con parámetros
    public Pedido(String id, int numeroPedido, String clienteId, String emprendimientoId, 
                  List<ProductoPedido> productos, double total, String estado, 
                  String fechaPedido, String fechaExpiracion) {
        this.id = id;
        this.numeroPedido = numeroPedido;
        this.clienteId = clienteId;
        this.emprendimientoId = emprendimientoId;
        this.productos = productos;
        this.total = total;
        this.estado = estado;
        this.fechaPedido = fechaPedido;
        this.fechaExpiracion = fechaExpiracion;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getNumeroPedido() {
        return numeroPedido;
    }

    public void setNumeroPedido(int numeroPedido) {
        this.numeroPedido = numeroPedido;
    }

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public String getEmprendimientoId() {
        return emprendimientoId;
    }

    public void setEmprendimientoId(String emprendimientoId) {
        this.emprendimientoId = emprendimientoId;
    }

    public List<ProductoPedido> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoPedido> productos) {
        this.productos = productos;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(String fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(String fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    // Método toString para debugging
    @Override
    public String toString() {
        return "Pedido{" +
                "id='" + id + '\'' +
                ", numeroPedido=" + numeroPedido +
                ", clienteId='" + clienteId + '\'' +
                ", emprendimientoId='" + emprendimientoId + '\'' +
                ", productos=" + productos +
                ", total=" + total +
                ", estado='" + estado + '\'' +
                ", fechaPedido='" + fechaPedido + '\'' +
                ", fechaExpiracion='" + fechaExpiracion + '\'' +
                '}';
    }
}