package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Seguimiento;
import com.ucc.emprendedoresucc.repository.SeguimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SeguimientoService {
    
    @Autowired
    private SeguimientoRepository seguimientoRepository;
    
    // Zona horaria de Colombia
    private static final ZoneId COLOMBIA_ZONE = ZoneId.of("America/Bogota");
    
    // Crear seguimiento
    public Seguimiento seguirEmprendimiento(String usuarioId, String emprendimientoId) {
        // Verificar si ya sigue
        Optional<Seguimiento> existente = seguimientoRepository
            .findByUsuarioIdAndEmprendimientoId(usuarioId, emprendimientoId);
        
        if (existente.isPresent()) {
            throw new RuntimeException("Ya sigues este emprendimiento");
        }
        
        Seguimiento seguimiento = new Seguimiento();
        seguimiento.setUsuarioId(usuarioId);
        seguimiento.setEmprendimientoId(emprendimientoId);
        // Usar fecha con zona horaria de Colombia
        seguimiento.setFecha(LocalDate.now(COLOMBIA_ZONE));
        
        return seguimientoRepository.save(seguimiento);
    }
    
    // Dejar de seguir
    public void dejarDeSeguir(String usuarioId, String emprendimientoId) {
        Optional<Seguimiento> seguimiento = seguimientoRepository
            .findByUsuarioIdAndEmprendimientoId(usuarioId, emprendimientoId);
        
        if (seguimiento.isEmpty()) {
            throw new RuntimeException("No sigues este emprendimiento");
        }
        
        seguimientoRepository.deleteByUsuarioIdAndEmprendimientoId(usuarioId, emprendimientoId);
    }
    
    // Verificar si sigue
    public boolean estaSiguiendo(String usuarioId, String emprendimientoId) {
        return seguimientoRepository
            .findByUsuarioIdAndEmprendimientoId(usuarioId, emprendimientoId)
            .isPresent();
    }
    
    // Obtener conteo de seguidores
    public long contarSeguidores(String emprendimientoId) {
        return seguimientoRepository.countByEmprendimientoId(emprendimientoId);
    }
    
    // Obtener emprendimientos que sigue un usuario
    public List<Seguimiento> obtenerSeguimientosPorUsuario(String usuarioId) {
        return seguimientoRepository.findByUsuarioId(usuarioId);
    }
    
    // Obtener seguidores de un emprendimiento
    public List<Seguimiento> obtenerSeguidoresPorEmprendimiento(String emprendimientoId) {
        return seguimientoRepository.findByEmprendimientoId(emprendimientoId);
    }
    
    // Obtener estadísticas para el frontend
    public Map<String, Object> obtenerEstadisticas(String emprendimientoId, String usuarioId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSeguidores", contarSeguidores(emprendimientoId));
        stats.put("estaSiguiendo", estaSiguiendo(usuarioId, emprendimientoId));
        return stats;
    }
}