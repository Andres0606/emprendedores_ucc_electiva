package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "transacciones")
public class Transaccion {

    @Id
    private String id;

    private int numeroPedido;

    private Comprador comprador;
    private Vendedor vendedor;
    private EmprendimientoInfo emprendimiento;

    private List<ProductoTransaccion> productos;

    private double total;
    private String metodoPago;
    private String fecha;
    private String estado; // pendiente, confirmado, pagado, entregado, cancelado

    private String telefonoEmprendimiento;


    // Constructores
    public Transaccion() {}

    public Transaccion(int numeroPedido, Comprador comprador, Vendedor vendedor, 
                       EmprendimientoInfo emprendimiento, List<ProductoTransaccion> productos, 
                       double total, String metodoPago, String fecha, String estado, String telefonoEmprendimiento) {
        this.numeroPedido = numeroPedido;
        this.comprador = comprador;
        this.vendedor = vendedor;
        this.emprendimiento = emprendimiento;
        this.productos = productos;
        this.total = total;
        this.metodoPago = metodoPago;
        this.fecha = fecha;
        this.estado = estado;
        this.telefonoEmprendimiento = telefonoEmprendimiento;

    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(int numeroPedido) { this.numeroPedido = numeroPedido; }

    public Comprador getComprador() { return comprador; }
    public void setComprador(Comprador comprador) { this.comprador = comprador; }

    public Vendedor getVendedor() { return vendedor; }
    public void setVendedor(Vendedor vendedor) { this.vendedor = vendedor; }

    public EmprendimientoInfo getEmprendimiento() { return emprendimiento; }
    public void setEmprendimiento(EmprendimientoInfo emprendimiento) { this.emprendimiento = emprendimiento; }

    public List<ProductoTransaccion> getProductos() { return productos; }
    public void setProductos(List<ProductoTransaccion> productos) { this.productos = productos; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    // 🔥 GETTER Y SETTER para telefonoEmprendimiento
    public String getTelefonoEmprendimiento() { return telefonoEmprendimiento; }
    public void setTelefonoEmprendimiento(String telefonoEmprendimiento) { this.telefonoEmprendimiento = telefonoEmprendimiento; }


}