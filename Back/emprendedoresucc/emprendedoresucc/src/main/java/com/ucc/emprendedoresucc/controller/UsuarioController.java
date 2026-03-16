package com.ucc.emprendedoresucc.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todos los usuarios
    @GetMapping
    public List<Usuario> obtenerUsuarios() {
        return usuarioRepository.findAll();
    }

    // Buscar usuario por correo
    @GetMapping("/correo/{correo}")
    public Usuario buscarPorCorreo(@PathVariable String correo) {

        return usuarioRepository.findAll()
                .stream()
                .filter(u -> u.getCorreo().equals(correo))
                .findFirst()
                .orElse(null);
    }

    // Crear usuario
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}