// EmprendimientoController.java (actualizado)
package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.service.EmprendimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            Emprendimiento nuevoEmprendimiento = emprendimientoService.crearEmprendimiento(emprendimiento);
            return new ResponseEntity<>(nuevoEmprendimiento, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear el emprendimiento", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener todos los emprendimientos
    @GetMapping
    public ResponseEntity<List<Emprendimiento>> obtenerTodos() {
        List<Emprendimiento> emprendimientos = emprendimientoService.obtenerTodos();
        return ResponseEntity.ok(emprendimientos);
    }

    // Obtener emprendimiento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Emprendimiento> obtenerPorId(@PathVariable String id) {
        return emprendimientoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtener emprendimientos por usuarioId
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPorUsuario(@PathVariable String usuarioId) {
        try {
            List<Emprendimiento> emprendimientos = emprendimientoService.obtenerPorUsuarioId(usuarioId);
            return ResponseEntity.ok(emprendimientos);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener emprendimientos por categoría
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Emprendimiento>> obtenerPorCategoria(@PathVariable String categoriaId) {
        List<Emprendimiento> emprendimientos = emprendimientoService.obtenerPorCategoriaId(categoriaId);
        return ResponseEntity.ok(emprendimientos);
    }

    // Actualizar emprendimiento completo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Emprendimiento emprendimiento) {
        try {
            Emprendimiento actualizado = emprendimientoService.actualizarEmprendimiento(id, emprendimiento);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar el emprendimiento", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar solo el estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("estado");
            Emprendimiento actualizado = emprendimientoService.actualizarEstado(id, nuevoEstado);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar emprendimiento
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            emprendimientoService.eliminarEmprendimiento(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Verificar propiedad
    @GetMapping("/{id}/propietario/{usuarioId}")
    public ResponseEntity<Boolean> esPropietario(@PathVariable String id, @PathVariable String usuarioId) {
        boolean esPropietario = emprendimientoService.esPropietario(id, usuarioId);
        return ResponseEntity.ok(esPropietario);
    }
}