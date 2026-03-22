package com.ucc.emprendedoresucc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // REGISTRO - Mejorado con más validaciones
    public Usuario registrarUsuario(Usuario usuario) {
        // Validar campos requeridos
        if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
            throw new RuntimeException("El correo es obligatorio");
        }
        
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }
        
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        
        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new RuntimeException("El apellido es obligatorio");
        }
        
        // Validar formato de correo
        if (!usuario.getCorreo().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("El formato del correo no es válido");
        }
        
        // Verificar si el correo ya existe
        Usuario existente = usuarioRepository.findByCorreo(usuario.getCorreo());
        if (existente != null) {
            throw new RuntimeException("El correo ya está registrado");
        }
        
        // Validar longitud de contraseña
        if (usuario.getPassword().length() < 4) {
            throw new RuntimeException("La contraseña debe tener al menos 4 caracteres");
        }
        
        // Aquí deberías encriptar la contraseña antes de guardar
        // usuario.setPassword(encriptarPassword(usuario.getPassword()));
        
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

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerPorId(String id) {
        return usuarioRepository.findById(id);
    }

    // Obtener usuario por correo
    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(String id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNombre(usuarioActualizado.getNombre());
                    usuario.setApellido(usuarioActualizado.getApellido());
                    usuario.setTelefono(usuarioActualizado.getTelefono());
                    usuario.setTipoUsuario(usuarioActualizado.getTipoUsuario());
                    usuario.setCarrera(usuarioActualizado.getCarrera());
                    // No actualizamos password ni correo por seguridad
                    return usuarioRepository.save(usuario);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // Eliminar usuario
    public void eliminarUsuario(String id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}