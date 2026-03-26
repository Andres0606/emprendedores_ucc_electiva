package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.dto.PedidoRequestDTO;
import com.ucc.emprendedoresucc.dto.PedidoResponseDTO;
import com.ucc.emprendedoresucc.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:3000") // Ajusta según tu frontend
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Crear nuevo pedido
    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody PedidoRequestDTO pedidoDTO) {
        try {
            PedidoResponseDTO pedidoCreado = pedidoService.crearPedido(pedidoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear el pedido: " + e.getMessage());
        }
    }

    // Obtener pedidos por cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<?> obtenerPedidosPorCliente(@PathVariable String clienteId) {
        try {
            List<PedidoResponseDTO> pedidos = pedidoService.obtenerPedidosPorCliente(clienteId);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener los pedidos: " + e.getMessage());
        }
    }

    // Obtener pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPedidoPorId(@PathVariable String id) {
        try {
            Optional<PedidoResponseDTO> pedido = pedidoService.obtenerPedidoPorId(id);
            if (pedido.isPresent()) {
                return ResponseEntity.ok(pedido.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Pedido no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener el pedido: " + e.getMessage());
        }
    }

    // Actualizar estado del pedido
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstadoPedido(
            @PathVariable String id,
            @RequestParam String estado) {
        try {
            Optional<PedidoResponseDTO> pedidoActualizado = 
                pedidoService.actualizarEstadoPedido(id, estado);
            if (pedidoActualizado.isPresent()) {
                return ResponseEntity.ok(pedidoActualizado.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Pedido no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el estado del pedido: " + e.getMessage());
        }
    }
    @GetMapping("/ultimo-numero")
public ResponseEntity<?> obtenerUltimoNumeroPedido() {
    try {
        Integer ultimoNumero = pedidoService.obtenerUltimoNumeroPedido();
        Map<String, Integer> response = new HashMap<>();
        response.put("ultimoNumero", ultimoNumero);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error al obtener último número");
    }
}
    
}