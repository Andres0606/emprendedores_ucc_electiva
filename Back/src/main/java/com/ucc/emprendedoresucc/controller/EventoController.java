package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Evento;
import com.ucc.emprendedoresucc.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @PostMapping
    public ResponseEntity<Evento> crearEvento(@RequestBody Evento evento) {
        return new ResponseEntity<>(eventoService.crearEvento(evento), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Evento>> obtenerTodos() {
        return ResponseEntity.ok(eventoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> obtenerPorId(@PathVariable String id) {
        return eventoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> actualizarEvento(@PathVariable String id, @RequestBody Evento evento) {
        try {
            return ResponseEntity.ok(eventoService.actualizarEvento(id, evento));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvento(@PathVariable String id) {
        eventoService.eliminarEvento(id);
        return ResponseEntity.noContent().build();
    }
}
