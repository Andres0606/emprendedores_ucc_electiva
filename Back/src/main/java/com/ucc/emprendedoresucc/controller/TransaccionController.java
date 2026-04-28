package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Transaccion;
import com.ucc.emprendedoresucc.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transacciones")
@CrossOrigin(origins = "http://localhost:3000")
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

    // Crear nueva transacción (cuando el estudiante confirma el pedido)
    @PostMapping
    public ResponseEntity<?> crearTransaccion(@RequestBody Transaccion transaccion) {
        try {
            Transaccion nueva = transaccionService.crearTransaccion(transaccion);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pedido creado exitosamente");
            response.put("transaccion", nueva);
            response.put("numeroPedido", nueva.getNumeroPedido());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener todas las transacciones (admin)
    @GetMapping
    public ResponseEntity<List<Transaccion>> obtenerTodas() {
        return ResponseEntity.ok(transaccionService.obtenerTodas());
    }

    // Obtener transacción por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        Optional<Transaccion> transaccion = transaccionService.obtenerPorId(id);
        if (transaccion.isPresent()) {
            return ResponseEntity.ok(transaccion.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Obtener transacciones por comprador (estudiante)
    @GetMapping("/comprador/{compradorId}")
    public ResponseEntity<List<Transaccion>> obtenerPorComprador(@PathVariable String compradorId) {
        return ResponseEntity.ok(transaccionService.obtenerPorCompradorId(compradorId));
    }

    // Obtener transacciones por vendedor (emprendedor)
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Transaccion>> obtenerPorVendedor(@PathVariable String vendedorId) {
        return ResponseEntity.ok(transaccionService.obtenerPorVendedorId(vendedorId));
    }

    // Obtener transacciones por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Transaccion>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(transaccionService.obtenerPorEstado(estado));
    }

    // Actualizar estado de la transacción
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("estado");
            if (nuevoEstado == null || nuevoEstado.isEmpty()) {
                throw new RuntimeException("El estado es requerido");
            }
            
            Transaccion actualizada = transaccionService.actualizarEstado(id, nuevoEstado);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estado actualizado a: " + nuevoEstado);
            response.put("transaccion", actualizada);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Actualizar método de pago
    @PatchMapping("/{id}/metodo-pago")
    public ResponseEntity<?> actualizarMetodoPago(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String metodoPago = request.get("metodoPago");
            Transaccion actualizada = transaccionService.actualizarMetodoPago(id, metodoPago);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Método de pago actualizado a: " + metodoPago);
            response.put("transaccion", actualizada);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Eliminar transacción
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTransaccion(@PathVariable String id) {
        try {
            transaccionService.eliminarTransaccion(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}