package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Categoria;
import com.ucc.emprendedoresucc.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Crear una nueva categoría
    public Categoria crearCategoria(Categoria categoria) {
        // Validar que el nombre no esté vacío
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        
        // Validar que no exista una categoría con el mismo nombre
        List<Categoria> existentes = categoriaRepository.findAll();
        boolean existe = existentes.stream()
                .anyMatch(c -> c.getNombre().equalsIgnoreCase(categoria.getNombre()));
        
        if (existe) {
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + categoria.getNombre());
        }
        
        return categoriaRepository.save(categoria);
    }

    // Obtener todas las categorías
    public List<Categoria> obtenerTodas() {
        try {
            List<Categoria> categorias = categoriaRepository.findAll();
            if (categorias == null) {
                return new ArrayList<>();
            }
            return categorias;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Obtener categoría por ID
    public Optional<Categoria> obtenerPorId(String id) {
        return categoriaRepository.findById(id);
    }

    // Obtener categoría por nombre
    public Optional<Categoria> obtenerPorNombre(String nombre) {
        List<Categoria> categorias = categoriaRepository.findAll();
        return categorias.stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombre))
                .findFirst();
    }

    // Actualizar categoría
    public Categoria actualizarCategoria(String id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    if (categoriaActualizada.getNombre() != null && !categoriaActualizada.getNombre().trim().isEmpty()) {
                        categoria.setNombre(categoriaActualizada.getNombre());
                    }
                    if (categoriaActualizada.getDescripcion() != null) {
                        categoria.setDescripcion(categoriaActualizada.getDescripcion());
                    }
                    return categoriaRepository.save(categoria);
                })
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + id));
    }

    // Eliminar categoría
    public void eliminarCategoria(String id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada con id: " + id);
        }
        categoriaRepository.deleteById(id);
    }
}