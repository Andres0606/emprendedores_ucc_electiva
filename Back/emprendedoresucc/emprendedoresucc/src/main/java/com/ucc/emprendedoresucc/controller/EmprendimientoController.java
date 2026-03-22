package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.service.EmprendimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emprendimientos")
@CrossOrigin("*")
public class EmprendimientoController {

    @Autowired
    private EmprendimientoService emprendimientoService;

    // Crear emprendimiento
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Emprendimiento emprendimiento) {
        try {
            Emprendimiento nuevo = emprendimientoService.crearEmprendimiento(emprendimiento);
            return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al crear emprendimiento", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🔥 ESTE ES EL IMPORTANTE (CORREGIDO)
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<Emprendimiento> lista = emprendimientoService.obtenerTodos();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace(); // 👈 VER ERROR REAL EN CONSOLA
            return ResponseEntity.status(500).body("Error interno en emprendimientos");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return emprendimientoService.obtenerPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al buscar emprendimiento");
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPorUsuario(@PathVariable String usuarioId) {
        try {
            return ResponseEntity.ok(emprendimientoService.obtenerPorUsuarioId(usuarioId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno");
        }
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<?> obtenerPorCategoria(@PathVariable String categoriaId) {
        try {
            return ResponseEntity.ok(emprendimientoService.obtenerPorCategoriaId(categoriaId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Emprendimiento emp) {
        try {
            return ResponseEntity.ok(emprendimientoService.actualizarEmprendimiento(id, emp));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar");
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable String id, @RequestBody Map<String, String> req) {
        try {
            return ResponseEntity.ok(
                    emprendimientoService.actualizarEstado(id, req.get("estado"))
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar estado");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            emprendimientoService.eliminarEmprendimiento(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al eliminar");
        }
    }
}