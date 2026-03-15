package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Carrito;

import java.util.Optional;

public interface CarritoRepository extends MongoRepository<Carrito, String> {

    Optional<Carrito> findByUsuarioId(String usuarioId);

}