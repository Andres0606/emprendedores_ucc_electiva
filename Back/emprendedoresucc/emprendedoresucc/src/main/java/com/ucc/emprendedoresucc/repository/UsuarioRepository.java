package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

}