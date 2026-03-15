package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "carrito")
public class Carrito {

    @Id
    private String id;

    private String usuarioId;

    private List<ProductoCarrito> productos;

    private double total;

}