package com.ucc.emprendedoresucc.repository;

import com.ucc.emprendedoresucc.model.Transaccion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface TransaccionRepository extends MongoRepository<Transaccion, String> {
    
    // Buscar por ID del comprador (estudiante)
    @Query("{ 'comprador.id' : ?0 }")
    List<Transaccion> findByCompradorId(String compradorId);
    
    // Buscar por ID del vendedor (emprendedor)
    @Query("{ 'vendedor.id' : ?0 }")
    List<Transaccion> findByVendedorId(String vendedorId);
    
    // Buscar por estado
    List<Transaccion> findByEstado(String estado);
}