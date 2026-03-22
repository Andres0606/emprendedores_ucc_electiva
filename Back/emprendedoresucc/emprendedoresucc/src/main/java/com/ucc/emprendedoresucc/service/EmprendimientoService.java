package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Emprendimiento;
import com.ucc.emprendedoresucc.repository.EmprendimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EmprendimientoService {

    @Autowired
    private EmprendimientoRepository emprendimientoRepository;

    // Crear un nuevo emprendimiento
    // En EmprendimientoService.java - actualizar crearEmprendimiento()
    public Emprendimiento crearEmprendimiento(Emprendimiento emprendimiento) {

        if (emprendimiento.getNombre() == null || emprendimiento.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del emprendimiento es obligatorio");
        }

        // 👈 VALIDAR TELÉFONO
        if (emprendimiento.getTelefono() == null || emprendimiento.getTelefono().trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono de contacto es obligatorio");
        }

        if (emprendimiento.getEstado() == null || emprendimiento.getEstado().trim().isEmpty()) {
            emprendimiento.setEstado("activo");
        }

        // 🔥 PROTECCIÓN IMPORTANTE
        if (emprendimiento.getProductos() == null) {
            emprendimiento.setProductos(new ArrayList<>());
        }

        if (emprendimiento.getImagenes() == null) {
            emprendimiento.setImagenes(new ArrayList<>());
        }

        return emprendimientoRepository.save(emprendimiento);
    }

    // 🔥 ESTE ES EL MÁS IMPORTANTE (ARREGLA EL ERROR 500)
    public List<Emprendimiento> obtenerTodos() {

        try {
            List<Emprendimiento> lista = emprendimientoRepository.findAll();

            if (lista == null) {
                return new ArrayList<>();
            }

            for (Emprendimiento emp : lista) {

                if (emp.getProductos() == null) {
                    emp.setProductos(new ArrayList<>());
                }

                if (emp.getImagenes() == null) {
                    emp.setImagenes(new ArrayList<>());
                }

                if (emp.getEstado() == null) {
                    emp.setEstado("activo");
                }
            }

            return lista;

        } catch (Exception e) {
            e.printStackTrace(); // 👈 AQUÍ VERÁS EL ERROR REAL
            return new ArrayList<>(); // 👈 NUNCA ROMPE EL FRONT
        }
    }

    // Obtener emprendimiento por ID
    public Optional<Emprendimiento> obtenerPorId(String id) {

        Optional<Emprendimiento> empOpt = emprendimientoRepository.findById(id);

        empOpt.ifPresent(emp -> {
            if (emp.getProductos() == null) {
                emp.setProductos(new ArrayList<>());
            }
            if (emp.getImagenes() == null) {
                emp.setImagenes(new ArrayList<>());
            }
        });

        return empOpt;
    }

    // Obtener emprendimientos por usuarioId
    public List<Emprendimiento> obtenerPorUsuarioId(String usuarioId) {

        if (usuarioId == null || usuarioId.trim().isEmpty()) {
            throw new IllegalArgumentException("El ID de usuario no puede estar vacío");
        }

        List<Emprendimiento> lista = emprendimientoRepository.findByUsuarioId(usuarioId);

        for (Emprendimiento emp : lista) {
            if (emp.getProductos() == null) {
                emp.setProductos(new ArrayList<>());
            }
            if (emp.getImagenes() == null) {
                emp.setImagenes(new ArrayList<>());
            }
        }

        return lista;
    }

    // Obtener emprendimientos por categoría
    public List<Emprendimiento> obtenerPorCategoriaId(String categoriaId) {

        List<Emprendimiento> lista = emprendimientoRepository.findByCategoriaId(categoriaId);

        for (Emprendimiento emp : lista) {
            if (emp.getProductos() == null) {
                emp.setProductos(new ArrayList<>());
            }
            if (emp.getImagenes() == null) {
                emp.setImagenes(new ArrayList<>());
            }
        }

        return lista;
    }

    // Actualizar emprendimiento completo
    public Emprendimiento actualizarEmprendimiento(String id, Emprendimiento actualizado) {

        return emprendimientoRepository.findById(id)
                .map(emp -> {

                    emp.setNombre(actualizado.getNombre());
                    emp.setDescripcion(actualizado.getDescripcion());
                    emp.setCategoriaId(actualizado.getCategoriaId());

                    // 🔥 PROTEGER NULL
                    emp.setImagenes(
                            actualizado.getImagenes() != null ? actualizado.getImagenes() : new ArrayList<>()
                    );

                    emp.setProductos(
                            actualizado.getProductos() != null ? actualizado.getProductos() : new ArrayList<>()
                    );

                    return emprendimientoRepository.save(emp);
                })
                .orElseThrow(() -> new RuntimeException("Emprendimiento no encontrado con id: " + id));
    }

    // Actualizar estado
    public Emprendimiento actualizarEstado(String id, String nuevoEstado) {

        return emprendimientoRepository.findById(id)
                .map(emp -> {

                    if (!"activo".equals(nuevoEstado) && !"pausado".equals(nuevoEstado)) {
                        throw new IllegalArgumentException("Estado no válido");
                    }

                    emp.setEstado(nuevoEstado);
                    return emprendimientoRepository.save(emp);
                })
                .orElseThrow(() -> new RuntimeException("Emprendimiento no encontrado con id: " + id));
    }

    // Eliminar
    public void eliminarEmprendimiento(String id) {

        if (!emprendimientoRepository.existsById(id)) {
            throw new RuntimeException("Emprendimiento no encontrado con id: " + id);
        }

        emprendimientoRepository.deleteById(id);
    }

    // Verificar propietario
    public boolean esPropietario(String emprendimientoId, String usuarioId) {

        return emprendimientoRepository.findById(emprendimientoId)
                .map(emp -> usuarioId.equals(emp.getUsuarioId()))
                .orElse(false);
    }

    
}