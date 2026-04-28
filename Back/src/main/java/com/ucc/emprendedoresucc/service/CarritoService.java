package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.dto.CarritoRequestDTO;
import com.ucc.emprendedoresucc.dto.ProductoCarritoDTO;
import com.ucc.emprendedoresucc.model.Carrito;
import com.ucc.emprendedoresucc.model.ProductoCarrito;
import com.ucc.emprendedoresucc.repository.CarritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    // Obtener carrito por usuario
    public Optional<Carrito> obtenerCarritoPorUsuario(String usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId);
    }

    // Guardar o actualizar carrito
    public Carrito guardarCarrito(CarritoRequestDTO carritoDTO) {
        Optional<Carrito> carritoExistente = carritoRepository.findByUsuarioId(carritoDTO.getUsuarioId());
        
        Carrito carrito;
        if (carritoExistente.isPresent()) {
            carrito = carritoExistente.get();
            // Actualizar productos
            List<ProductoCarrito> productos = carritoDTO.getProductos().stream()
                .map(p -> new ProductoCarrito(
                    p.getEmprendimientoId(),
                    p.getNombreProducto(),
                    p.getPrecio(),
                    p.getCantidad()
                ))
                .collect(Collectors.toList());
            carrito.setProductos(productos);
            carrito.setTotal(carritoDTO.getTotal());
        } else {
            carrito = new Carrito();
            carrito.setUsuarioId(carritoDTO.getUsuarioId());
            List<ProductoCarrito> productos = carritoDTO.getProductos().stream()
                .map(p -> new ProductoCarrito(
                    p.getEmprendimientoId(),
                    p.getNombreProducto(),
                    p.getPrecio(),
                    p.getCantidad()
                ))
                .collect(Collectors.toList());
            carrito.setProductos(productos);
            carrito.setTotal(carritoDTO.getTotal());
        }
        
        return carritoRepository.save(carrito);
    }

    // Vaciar carrito
    public void vaciarCarrito(String usuarioId) {
        Optional<Carrito> carrito = carritoRepository.findByUsuarioId(usuarioId);
        carrito.ifPresent(c -> {
            c.getProductos().clear();
            c.setTotal(0);
            carritoRepository.save(c);
        });
    }

    // Eliminar carrito
    public void eliminarCarrito(String usuarioId) {
        Optional<Carrito> carrito = carritoRepository.findByUsuarioId(usuarioId);
        carrito.ifPresent(c -> carritoRepository.delete(c));
    }
}