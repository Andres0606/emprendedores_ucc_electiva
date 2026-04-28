package com.ucc.emprendedoresucc.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "favoritos")
public class Favorito {

    @Id
    private String id;

    private String usuarioId;
    private String emprendimientoId;

}