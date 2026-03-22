package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.service.EmprendimientoService;
import com.ucc.emprendedoresucc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emprendimientos")
@CrossOrigin("*")
public class EmprendimientoController {

    @Autowired
    private EmprendimientoService emprendimientoService;
    
    @Autowired
    private UsuarioService usuarioService;  // 👈 INYECTAR USUARIO SERVICE

    // Crear emprendimiento - CON VERIFICACIÓN DE TIPO
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Emprendimiento emprendimiento) {
        try {
            // 👈 VERIFICAR QUE EL USUARIO EXISTA Y SEA EMPRENDEDOR
            if (emprendimiento.getUsuarioId() == null || emprendimiento.getUsuarioId().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no especificado");
                errorResponse.put("message", "Debes especificar el ID del usuario");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            // Buscar el usuario
            Usuario usuario = usuarioService.obtenerPorId(emprendimiento.getUsuarioId())
                    .orElse(null);
            
            if (usuario == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no encontrado");
                errorResponse.put("message", "El usuario especificado no existe");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            // 👈 VERIFICAR TIPO DE USUARIO
            if (!"emprendedor".equalsIgnoreCase(usuario.getTipoUsuario())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Permiso denegado");
                errorResponse.put("message", "Solo los usuarios tipo EMPRENDEDOR pueden crear emprendimientos. Tu tipo es: " + usuario.getTipoUsuario());
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
            }
            
            // Validar teléfono (opcional)
            if (emprendimiento.getTelefono() == null || emprendimiento.getTelefono().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Teléfono requerido");
                errorResponse.put("message", "El teléfono de contacto es obligatorio");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            Emprendimiento nuevo = emprendimientoService.crearEmprendimiento(emprendimiento);
            return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear emprendimiento");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener todos los emprendimientos
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<Emprendimiento> lista = emprendimientoService.obtenerTodos();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
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