package com.ucc.emprendedoresucc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // REGISTRO
    public Usuario registrarUsuario(Usuario usuario) {

        Usuario existente = usuarioRepository.findByCorreo(usuario.getCorreo());

        if (existente != null) {
            throw new RuntimeException("El correo ya está registrado");
        }

        return usuarioRepository.save(usuario);
    }

    // LOGIN
    public Usuario login(String correo, String password) {

        Usuario usuario = usuarioRepository.findByCorreo(correo);

        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado");
        }

        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }

}