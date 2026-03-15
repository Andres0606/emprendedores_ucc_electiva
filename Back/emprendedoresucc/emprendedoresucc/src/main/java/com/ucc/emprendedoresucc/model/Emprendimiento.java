package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "emprendimientos")
public class Emprendimiento {

    @Id
    private String id;

    private String nombre;
    private String descripcion;
    private String categoriaId;
    private String usuarioId;
    private String estado;

    private List<String> imagenes;

    private List<Producto> productos;
}