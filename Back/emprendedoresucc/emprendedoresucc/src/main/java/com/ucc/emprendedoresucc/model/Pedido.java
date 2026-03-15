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

}