package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.dto.CarritoRequestDTO;
import com.ucc.emprendedoresucc.model.Carrito;
import com.ucc.emprendedoresucc.service.CarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "http://localhost:3000") // Ajusta según tu frontend
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    // Obtener carrito por usuario
    @GetMapping("/{usuarioId}")
    public ResponseEntity<?> obtenerCarrito(@PathVariable String usuarioId) {
        try {
            Optional<Carrito> carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
            if (carrito.isPresent()) {
                return ResponseEntity.ok(carrito.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Carrito no encontrado para el usuario: " + usuarioId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener el carrito: " + e.getMessage());
        }
    }

    // Guardar o actualizar carrito
    @PostMapping
    public ResponseEntity<?> guardarCarrito(@RequestBody CarritoRequestDTO carritoDTO) {
        try {
            Carrito carritoGuardado = carritoService.guardarCarrito(carritoDTO);
            return ResponseEntity.ok(carritoGuardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al guardar el carrito: " + e.getMessage());
        }
    }

    // Vaciar carrito
    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<?> vaciarCarrito(@PathVariable String usuarioId) {
        try {
            carritoService.vaciarCarrito(usuarioId);
            return ResponseEntity.ok("Carrito vaciado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al vaciar el carrito: " + e.getMessage());
        }
    }

    // Eliminar carrito completo
    @DeleteMapping("/{usuarioId}")
    public ResponseEntity<?> eliminarCarrito(@PathVariable String usuarioId) {
        try {
            carritoService.eliminarCarrito(usuarioId);
            return ResponseEntity.ok("Carrito eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al eliminar el carrito: " + e.getMessage());
        }
    }
}