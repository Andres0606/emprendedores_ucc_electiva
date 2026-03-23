package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.dto.PedidoRequestDTO;
import com.ucc.emprendedoresucc.dto.PedidoResponseDTO;
import com.ucc.emprendedoresucc.dto.ProductoPedidoDTO;
import com.ucc.emprendedoresucc.model.Pedido;
import com.ucc.emprendedoresucc.model.ProductoPedido;
import com.ucc.emprendedoresucc.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    // Crear nuevo pedido
    public PedidoResponseDTO crearPedido(PedidoRequestDTO pedidoDTO) {
        // Generar número de pedido automático
        int numeroPedido = (int) (pedidoRepository.count() + 1);
        
        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(numeroPedido);
        pedido.setClienteId(pedidoDTO.getClienteId());
        pedido.setEmprendimientoId(pedidoDTO.getEmprendimientoId());
        
        // Convertir productos
        List<ProductoPedido> productos = pedidoDTO.getProductos().stream()
            .map(p -> new ProductoPedido(p.getProductoId(), p.getCantidad()))
            .collect(Collectors.toList());
        pedido.setProductos(productos);
        
        pedido.setTotal(pedidoDTO.getTotal());
        pedido.setEstado(pedidoDTO.getEstado() != null ? pedidoDTO.getEstado() : "pendiente");
        pedido.setFechaPedido(pedidoDTO.getFechaPedido());
        pedido.setFechaExpiracion(pedidoDTO.getFechaExpiracion());
        
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        
        return convertirAResponseDTO(pedidoGuardado);
    }

    // Obtener pedidos por cliente
    public List<PedidoResponseDTO> obtenerPedidosPorCliente(String clienteId) {
        List<Pedido> pedidos = pedidoRepository.findByClienteId(clienteId);
        return pedidos.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }

    // Obtener pedido por ID
    public Optional<PedidoResponseDTO> obtenerPedidoPorId(String id) {
        Optional<Pedido> pedido = pedidoRepository.findById(id);
        return pedido.map(this::convertirAResponseDTO);
    }

    // Actualizar estado del pedido
    public Optional<PedidoResponseDTO> actualizarEstadoPedido(String id, String nuevoEstado) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
        if (pedidoOpt.isPresent()) {
            Pedido pedido = pedidoOpt.get();
            pedido.setEstado(nuevoEstado);
            Pedido pedidoActualizado = pedidoRepository.save(pedido);
            return Optional.of(convertirAResponseDTO(pedidoActualizado));
        }
        return Optional.empty();
    }

    // Convertir Pedido a PedidoResponseDTO
    private PedidoResponseDTO convertirAResponseDTO(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setId(pedido.getId());
        dto.setNumeroPedido(pedido.getNumeroPedido());
        dto.setClienteId(pedido.getClienteId());
        dto.setEmprendimientoId(pedido.getEmprendimientoId());
        
        List<ProductoPedidoDTO> productosDTO = pedido.getProductos().stream()
            .map(p -> new ProductoPedidoDTO(p.getProductoId(), p.getCantidad()))
            .collect(Collectors.toList());
        dto.setProductos(productosDTO);
        
        dto.setTotal(pedido.getTotal());
        dto.setEstado(pedido.getEstado());
        dto.setFechaPedido(pedido.getFechaPedido());
        dto.setFechaExpiracion(pedido.getFechaExpiracion());
        
        return dto;
    }
}