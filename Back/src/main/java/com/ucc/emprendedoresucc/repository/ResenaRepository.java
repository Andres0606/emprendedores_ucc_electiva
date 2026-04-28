package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Resena;

import java.util.List;

public interface ResenaRepository extends MongoRepository<Resena, String> {

    List<Resena> findByEmprendimientoId(String emprendimientoId);

}