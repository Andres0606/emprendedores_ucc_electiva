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
        if (usuarioId == null || usuarioId.isEmpty()) {
            return false; // Usuario no autenticado, no puede seguir
        }
        return seguimientoRepository
                .findByUsuarioIdAndEmprendimientoId(usuarioId, emprendimientoId)
                .isPresent();
    }

    // Obtener conteo de seguidores
    public long contarSeguidores(String emprendimientoId) {
        if (emprendimientoId == null || emprendimientoId.isEmpty()) {
            return 0;
        }
        return seguimientoRepository.countByEmprendimientoId(emprendimientoId);
    }

    // Contar seguidores para múltiples IDs (búsqueda flexible)
    public long contarSeguidoresFlex(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return seguimientoRepository.countByEmprendimientoIdIn(ids);
    }

    // Verificar si sigue con múltiples IDs (búsqueda flexible)
    public boolean estaSiguiendoFlex(String usuarioId, List<String> ids) {
        if (usuarioId == null || usuarioId.isEmpty() || ids == null || ids.isEmpty()) {
            return false;
        }
        for (String id : ids) {
            if (seguimientoRepository.findByUsuarioIdAndEmprendimientoId(usuarioId, id).isPresent()) {
                return true;
            }
        }
        return false;
    }

    // Obtener emprendimientos que sigue un usuario
    public List<Seguimiento> obtenerSeguimientosPorUsuario(String usuarioId) {
        if (usuarioId == null || usuarioId.isEmpty()) {
            return List.of();
        }
        return seguimientoRepository.findByUsuarioId(usuarioId);
    }

    // Obtener seguidores de un emprendimiento
    public List<Seguimiento> obtenerSeguidoresPorEmprendimiento(String emprendimientoId) {
        if (emprendimientoId == null || emprendimientoId.isEmpty()) {
            return List.of();
        }
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