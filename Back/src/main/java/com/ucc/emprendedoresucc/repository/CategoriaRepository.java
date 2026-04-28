package com.ucc.emprendedoresucc.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Categoria;
import com.ucc.emprendedoresucc.model.Emprendimiento;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {


}