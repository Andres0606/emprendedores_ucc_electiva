package com.ucc.emprendedoresucc.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ucc.emprendedoresucc.model.Seguimiento;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeguimientoRepository extends MongoRepository<Seguimiento, String> {

    // Buscar seguimientos por usuario
    List<Seguimiento> findByUsuarioId(String usuarioId);
    
    // Buscar seguimientos por emprendimiento
    List<Seguimiento> findByEmprendimientoId(String emprendimientoId);
    
    // Buscar seguimiento específico (para verificar si ya sigue)
    Optional<Seguimiento> findByUsuarioIdAndEmprendimientoId(String usuarioId, String emprendimientoId);
    
    // Contar seguidores de un emprendimiento
    long countByEmprendimientoId(String emprendimientoId);
    
    // Eliminar seguimiento específico
    void deleteByUsuarioIdAndEmprendimientoId(String usuarioId, String emprendimientoId);

    // Conteo flexible para evitar errores de ID
    long countByEmprendimientoIdIn(List<String> ids);
}