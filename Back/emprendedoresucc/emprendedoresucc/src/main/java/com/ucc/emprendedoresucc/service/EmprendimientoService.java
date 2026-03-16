// EmprendimientoService.java
package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.repository.EmprendimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EmprendimientoService {

    @Autowired
    private EmprendimientoRepository emprendimientoRepository;

    // Crear un nuevo emprendimiento
    public Emprendimiento crearEmprendimiento(Emprendimiento emprendimiento) {
        // Aquí puedes agregar validaciones antes de guardar
        if (emprendimiento.getNombre() == null || emprendimiento.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del emprendimiento es obligatorio");
        }
        
        // Si no viene estado, asignar "activo" por defecto
        if (emprendimiento.getEstado() == null || emprendimiento.getEstado().trim().isEmpty()) {
            emprendimiento.setEstado("activo");
        }
        
        return emprendimientoRepository.save(emprendimiento);
    }

    // Obtener todos los emprendimientos
    public List<Emprendimiento> obtenerTodos() {
        return emprendimientoRepository.findAll();
    }

    // Obtener emprendimiento por ID
    public Optional<Emprendimiento> obtenerPorId(String id) {
        return emprendimientoRepository.findById(id);
    }

    // Obtener emprendimientos por usuarioId
    public List<Emprendimiento> obtenerPorUsuarioId(String usuarioId) {
        if (usuarioId == null || usuarioId.trim().isEmpty()) {
            throw new IllegalArgumentException("El ID de usuario no puede estar vacío");
        }
        return emprendimientoRepository.findByUsuarioId(usuarioId);
    }

    // Obtener emprendimientos por categoría
    public List<Emprendimiento> obtenerPorCategoriaId(String categoriaId) {
        return emprendimientoRepository.findByCategoriaId(categoriaId);
    }

    // Actualizar emprendimiento completo
    public Emprendimiento actualizarEmprendimiento(String id, Emprendimiento emprendimientoActualizado) {
        return emprendimientoRepository.findById(id)
                .map(emprendimiento -> {
                    emprendimiento.setNombre(emprendimientoActualizado.getNombre());
                    emprendimiento.setDescripcion(emprendimientoActualizado.getDescripcion());
                    emprendimiento.setCategoriaId(emprendimientoActualizado.getCategoriaId());
                    emprendimiento.setImagenes(emprendimientoActualizado.getImagenes());
                    emprendimiento.setProductos(emprendimientoActualizado.getProductos());
                    // No actualizamos usuarioId por seguridad
                    return emprendimientoRepository.save(emprendimiento);
                })
                .orElseThrow(() -> new RuntimeException("Emprendimiento no encontrado con id: " + id));
    }

    // Actualizar solo el estado
    public Emprendimiento actualizarEstado(String id, String nuevoEstado) {
        return emprendimientoRepository.findById(id)
                .map(emprendimiento -> {
                    // Validar que el estado sea válido
                    if (!nuevoEstado.equals("activo") && !nuevoEstado.equals("pausado")) {
                        throw new IllegalArgumentException("Estado no válido. Debe ser 'activo' o 'pausado'");
                    }
                    emprendimiento.setEstado(nuevoEstado);
                    return emprendimientoRepository.save(emprendimiento);
                })
                .orElseThrow(() -> new RuntimeException("Emprendimiento no encontrado con id: " + id));
    }

    // Eliminar emprendimiento
    public void eliminarEmprendimiento(String id) {
        if (!emprendimientoRepository.existsById(id)) {
            throw new RuntimeException("Emprendimiento no encontrado con id: " + id);
        }
        emprendimientoRepository.deleteById(id);
    }

    // Verificar si un usuario es dueño del emprendimiento
    public boolean esPropietario(String emprendimientoId, String usuarioId) {
        return emprendimientoRepository.findById(emprendimientoId)
                .map(emprendimiento -> emprendimiento.getUsuarioId().equals(usuarioId))
                .orElse(false);
    }
}