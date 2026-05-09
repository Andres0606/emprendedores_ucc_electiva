package com.ucc.emprendedoresucc.service;

import com.ucc.emprendedoresucc.model.Evento;
import com.ucc.emprendedoresucc.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    public Evento crearEvento(Evento evento) {
        return eventoRepository.save(evento);
    }

    public List<Evento> obtenerTodos() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> obtenerPorId(String id) {
        return eventoRepository.findById(id);
    }

    public Evento actualizarEvento(String id, Evento eventoActualizado) {
        return eventoRepository.findById(id)
                .map(evento -> {
                    evento.setNombre(eventoActualizado.getNombre());
                    evento.setFecha(eventoActualizado.getFecha());
                    evento.setHora(eventoActualizado.getHora());
                    evento.setLugar(eventoActualizado.getLugar());
                    evento.setModalidad(eventoActualizado.getModalidad());
                    evento.setDescripcion(eventoActualizado.getDescripcion());
                    evento.setTipo(eventoActualizado.getTipo());
                    evento.setImagen(eventoActualizado.getImagen());
                    return eventoRepository.save(evento);
                })
                .orElseThrow(() -> new RuntimeException("Evento no encontrado con id: " + id));
    }

    public void eliminarEvento(String id) {
        eventoRepository.deleteById(id);
    }
}
