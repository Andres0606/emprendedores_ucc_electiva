package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "seguimientos")
public class Seguimiento {

    @Id
    private String id;

    private String usuarioId;
    private String emprendimientoId;
    private String fecha;

}