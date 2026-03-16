package com.ucc.emprendedoresucc.model;

import lombok.Data;

@Data
public class Producto {

    private String id;
    private String nombre;
    private int precio;
    private int stock;
    private String imagen;
}