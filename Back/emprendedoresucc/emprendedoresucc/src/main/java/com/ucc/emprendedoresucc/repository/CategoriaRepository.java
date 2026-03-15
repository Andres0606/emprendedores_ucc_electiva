package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Categoria;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {

}