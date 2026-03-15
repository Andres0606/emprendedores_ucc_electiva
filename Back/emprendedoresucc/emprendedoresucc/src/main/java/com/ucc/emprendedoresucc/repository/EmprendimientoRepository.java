package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Emprendimiento;

import java.util.List;

public interface EmprendimientoRepository extends MongoRepository<Emprendimiento, String> {

    List<Emprendimiento> findByCategoriaId(String categoriaId);

    List<Emprendimiento> findByUsuarioId(String usuarioId);

}