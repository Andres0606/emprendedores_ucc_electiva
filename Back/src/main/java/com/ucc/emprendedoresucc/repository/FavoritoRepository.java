package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Favorito;

import java.util.List;

public interface FavoritoRepository extends MongoRepository<Favorito, String> {

    List<Favorito> findByUsuarioId(String usuarioId);

}