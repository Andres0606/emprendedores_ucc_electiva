package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Evento;

public interface EventoRepository extends MongoRepository<Evento, String> {
}
