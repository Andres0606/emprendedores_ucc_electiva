package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.model.Seguimiento;
import com.ucc.emprendedoresucc.service.EmprendimientoService;
import com.ucc.emprendedoresucc.service.SeguimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seguimientos")
// @CrossOrigin ELIMINADO - La configuración CORS está en CorsConfig.java
public class SeguimientoController {
    
    @Autowired
    private SeguimientoService seguimientoService;

    @Autowired
    private EmprendimientoService emprendimientoService;
    
    // Seguir un emprendimiento
    @PostMapping("/seguir")
    public ResponseEntity<?> seguirEmprendimiento(@RequestBody Map<String, String> request) {
        try {
            String usuarioId = request.get("usuarioId");
            String emprendimientoId = request.get("emprendimientoId");
            
            if (usuarioId == null || emprendimientoId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Faltan parámetros");
                error.put("message", "Se requiere usuarioId y emprendimientoId");
                return ResponseEntity.badRequest().body(error);
            }
            
            Seguimiento seguimiento = seguimientoService.seguirEmprendimiento(usuarioId, emprendimientoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ahora sigues este emprendimiento");
            response.put("seguimiento", seguimiento);
            response.put("totalSeguidores", seguimientoService.contarSeguidores(emprendimientoId));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al seguir emprendimiento");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    
    // Dejar de seguir
    @DeleteMapping("/dejar-de-seguir")
    public ResponseEntity<?> dejarDeSeguir(@RequestBody Map<String, String> request) {
        try {
            String usuarioId = request.get("usuarioId");
            String emprendimientoId = request.get("emprendimientoId");
            
            if (usuarioId == null || emprendimientoId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Faltan parámetros");
                error.put("message", "Se requiere usuarioId y emprendimientoId");
                return ResponseEntity.badRequest().body(error);
            }
            
            seguimientoService.dejarDeSeguir(usuarioId, emprendimientoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Has dejado de seguir este emprendimiento");
            response.put("totalSeguidores", seguimientoService.contarSeguidores(emprendimientoId));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al dejar de seguir");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    // Obtener todos los emprendimientos que sigue un usuario
    @GetMapping("/usuario/{usuarioId}/emprendimientos")
    public ResponseEntity<?> obtenerEmprendimientosSeguidos(@PathVariable String usuarioId) {
        try {
            System.out.println("🔍 Buscando seguimientos para usuario: " + usuarioId);
            
            List<Seguimiento> seguimientos = seguimientoService.obtenerSeguimientosPorUsuario(usuarioId);
            System.out.println("📊 Seguimientos encontrados: " + seguimientos.size());
            
            List<Emprendimiento> emprendimientos = new ArrayList<>();
            for (Seguimiento seg : seguimientos) {
                Optional<Emprendimiento> empOpt = emprendimientoService.obtenerPorId(seg.getEmprendimientoId());
                if (empOpt.isPresent()) {
                    emprendimientos.add(empOpt.get());
                }
            }
            
            System.out.println("🎯 Emprendimientos a devolver: " + emprendimientos.size());
            return ResponseEntity.ok(emprendimientos);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener emprendimientos seguidos");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/verificar")
    public ResponseEntity<?> verificarSeguimiento(
            @RequestParam String usuarioId, 
            @RequestParam String emprendimientoId) {
        try {
            boolean sigue = seguimientoService.estaSiguiendo(usuarioId, emprendimientoId);
            long totalSeguidores = seguimientoService.contarSeguidores(emprendimientoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("estaSiguiendo", sigue);
            response.put("totalSeguidores", totalSeguidores);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al verificar seguimiento");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Nuevo endpoint público para obtener el total de seguidores
    @GetMapping("/total/{emprendimientoId}")
    public ResponseEntity<?> obtenerTotalSeguidores(@PathVariable String emprendimientoId) {
        try {
            System.out.println("🔍 Consultando total seguidores para ID: " + emprendimientoId);
            long total = seguimientoService.contarSeguidores(emprendimientoId);
            System.out.println("📊 Total encontrado: " + total);
            Map<String, Object> response = new HashMap<>();
            response.put("totalSeguidores", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener total de seguidores");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Obtener todos los seguimientos de un usuario (con fecha)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerSeguimientosPorUsuario(@PathVariable String usuarioId) {
        try {
            List<Seguimiento> seguimientos = seguimientoService.obtenerSeguimientosPorUsuario(usuarioId);
            System.out.println("📊 Seguimientos encontrados para usuario " + usuarioId + ": " + seguimientos.size());
            
            for (Seguimiento seg : seguimientos) {
                System.out.println("  - Emprendimiento: " + seg.getEmprendimientoId() + ", Fecha: " + seg.getFecha());
            }
            
            return ResponseEntity.ok(seguimientos);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener seguimientos");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Obtener estadísticas de seguimiento
    @GetMapping("/estadisticas/{emprendimientoId}")
    public ResponseEntity<?> obtenerEstadisticas(
            @PathVariable String emprendimientoId,
            @RequestParam String usuarioId) {
        try {
            Map<String, Object> stats = seguimientoService.obtenerEstadisticas(emprendimientoId, usuarioId);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener estadísticas");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Obtener todos los seguimientos (opcional, para debugging)
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            return ResponseEntity.ok(seguimientoService.obtenerSeguimientosPorUsuario(null));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener seguimientos");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}