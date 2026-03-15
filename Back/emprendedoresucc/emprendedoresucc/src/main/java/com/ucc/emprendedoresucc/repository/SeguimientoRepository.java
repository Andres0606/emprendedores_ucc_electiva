package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Seguimiento;

import java.util.List;

public interface SeguimientoRepository extends MongoRepository<Seguimiento, String> {

    List<Seguimiento> findByUsuarioId(String usuarioId);

}