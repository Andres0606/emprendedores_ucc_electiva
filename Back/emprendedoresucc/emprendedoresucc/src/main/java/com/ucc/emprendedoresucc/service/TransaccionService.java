package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Transaccion;
import com.ucc.emprendedoresucc.repository.TransaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    private String getFechaActual() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    // Crear nueva transacción
    public Transaccion crearTransaccion(Transaccion transaccion) {
        // Auto-incrementar número de pedido
        long count = transaccionRepository.count();
        transaccion.setNumeroPedido((int) count + 1);
        transaccion.setFecha(getFechaActual());
        transaccion.setEstado("pendiente");
        
        if (transaccion.getMetodoPago() == null || transaccion.getMetodoPago().isEmpty()) {
            transaccion.setMetodoPago("pendiente");
        }
        
        return transaccionRepository.save(transaccion);
    }

    // Obtener todas las transacciones
    public List<Transaccion> obtenerTodas() {
        return transaccionRepository.findAll();
    }

    // Obtener por ID
    public Optional<Transaccion> obtenerPorId(String id) {
        return transaccionRepository.findById(id);
    }

    // Obtener por ID del comprador (estudiante)
    public List<Transaccion> obtenerPorCompradorId(String compradorId) {
        return transaccionRepository.findByCompradorId(compradorId);
    }

    // Obtener por ID del vendedor (emprendedor)
    public List<Transaccion> obtenerPorVendedorId(String vendedorId) {
        return transaccionRepository.findByVendedorId(vendedorId);
    }

    // Obtener por estado
    public List<Transaccion> obtenerPorEstado(String estado) {
        return transaccionRepository.findByEstado(estado);
    }

    // Actualizar estado de la transacción
    public Transaccion actualizarEstado(String id, String nuevoEstado) {
        String[] estadosValidos = {"pendiente", "confirmado", "pagado", "entregado", "cancelado"};
        boolean valido = false;
        for (String e : estadosValidos) {
            if (e.equals(nuevoEstado)) {
                valido = true;
                break;
            }
        }
        
        if (!valido) {
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }
        
        return transaccionRepository.findById(id)
                .map(transaccion -> {
                    transaccion.setEstado(nuevoEstado);
                    return transaccionRepository.save(transaccion);
                })
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada con id: " + id));
    }

    // Actualizar método de pago
    public Transaccion actualizarMetodoPago(String id, String metodoPago) {
        return transaccionRepository.findById(id)
                .map(transaccion -> {
                    transaccion.setMetodoPago(metodoPago);
                    return transaccionRepository.save(transaccion);
                })
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada con id: " + id));
    }

    // Eliminar transacción
    public void eliminarTransaccion(String id) {
        if (!transaccionRepository.existsById(id)) {
            throw new RuntimeException("Transacción no encontrada con id: " + id);
        }
        transaccionRepository.deleteById(id);
    }
}