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
    private String estadoPago;
    private String fecha;

}