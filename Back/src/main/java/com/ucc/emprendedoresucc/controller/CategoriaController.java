package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Categoria;
import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.repository.EmprendimientoRepository;
import com.ucc.emprendedoresucc.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "https://emprendedores-ucc-electiva-l1ak.vercel.app") // 👈 CAMBIA ESTA LÍNEA
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;
    
    @Autowired
    private EmprendimientoRepository emprendimientoRepository; // 🔥 NUEVO

    // Crear una nueva categoría
    @PostMapping
    public ResponseEntity<?> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria nueva = categoriaService.crearCategoria(categoria);
            return new ResponseEntity<>(nueva, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al crear la categoría", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener todas las categorías
    @GetMapping
    public ResponseEntity<?> obtenerTodas() {
        try {
            List<Categoria> categorias = categoriaService.obtenerTodas();
            if (categorias.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al obtener las categorías");
        }
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return categoriaService.obtenerPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al buscar la categoría", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener categoría por nombre
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> obtenerPorNombre(@PathVariable String nombre) {
        try {
            return categoriaService.obtenerPorNombre(nombre)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al buscar la categoría", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar categoría
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCategoria(@PathVariable String id, @RequestBody Categoria categoria) {
        try {
            Categoria actualizada = categoriaService.actualizarCategoria(id, categoria);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al actualizar la categoría", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🔥 ELIMINAR CATEGORÍA - Con verificación de emprendimientos activos
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable String id) {
        try {
            // Verificar si hay emprendimientos ACTIVOS con esta categoría
            List<Emprendimiento> emprendimientos = emprendimientoRepository.findByCategoriaIdAndEstado(id, "activo");
            
            if (!emprendimientos.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "No se puede eliminar la categoría");
                error.put("message", "La categoría tiene " + emprendimientos.size() + " emprendimiento(s) activo(s) asociado(s)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.noContent().build();
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al eliminar la categoría", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}