package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Pedido;

import java.util.List;

public interface PedidoRepository extends MongoRepository<Pedido, String> {

    List<Pedido> findByClienteId(String clienteId);

}