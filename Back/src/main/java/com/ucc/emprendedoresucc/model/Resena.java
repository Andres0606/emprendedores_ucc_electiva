package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reseñas")
public class Resena {

    @Id
    private String id;

    private String usuarioId;
    private String emprendimientoId;

    private int calificacion;
    private String comentario;
    private String fecha;

}