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

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Método para validar contraseña segura
    private boolean validarPasswordSegura(String password) {
        if (password.length() < 8) return false;
        if (!password.matches(".*[A-Z].*")) return false; // Al menos una mayúscula
        if (!password.matches(".*[a-z].*")) return false; // Al menos una minúscula
        if (!password.matches(".*\\d.*")) return false; // Al menos un número
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) return false; // Al menos un carácter especial
        return true;
    }

    // REGISTRO - Con todas las validaciones
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
        
        // Validar correo institucional
        if (!usuario.getCorreo().matches("^[A-Za-z0-9._-]+@campusucc\\.edu\\.co$")) {
            throw new RuntimeException("El correo debe ser institucional (@campusucc.edu.co)");
        }
        
        // Verificar si el correo ya existe
        Usuario existentePorCorreo = usuarioRepository.findByCorreo(usuario.getCorreo());
        if (existentePorCorreo != null) {
            throw new RuntimeException("El correo ya está registrado");
        }
        
        // Validar contraseña segura
        if (!validarPasswordSegura(usuario.getPassword())) {
            throw new RuntimeException("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial");
        }
        
        // Validar teléfono (exactamente 10 dígitos)
        if (usuario.getTelefono() != null && !usuario.getTelefono().trim().isEmpty()) {
            String telefonoLimpio = usuario.getTelefono().replaceAll("\\D", "");
            if (telefonoLimpio.length() != 10) {
                throw new RuntimeException("El teléfono debe tener exactamente 10 dígitos");
            }
            usuario.setTelefono(telefonoLimpio);
            
            // VERIFICAR SI EL TELÉFONO YA ESTÁ REGISTRADO
            Usuario existentePorTelefono = usuarioRepository.findByTelefono(telefonoLimpio);
            if (existentePorTelefono != null) {
                throw new RuntimeException("El número de teléfono ya está registrado. Por favor usa otro número");
            }
        } else {
            throw new RuntimeException("El teléfono es obligatorio");
        }
        
        // Validar tipo de usuario
        if (usuario.getTipoUsuario() == null || usuario.getTipoUsuario().trim().isEmpty()) {
            throw new RuntimeException("El tipo de usuario es obligatorio");
        }
        
        // Validar carrera si no es administrativo
        if (!"administrativo".equals(usuario.getTipoUsuario())) {
            if (usuario.getCarrera() == null || usuario.getCarrera().trim().isEmpty()) {
                throw new RuntimeException("La carrera es obligatoria para estudiantes y emprendedores");
            }
        }
        
        // Encriptar la contraseña antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        
        return usuarioRepository.save(usuario);
    }

    // LOGIN - Verifica que el usuario esté activo
    public Usuario login(String correo, String password) {
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        // 🔥 VERIFICAR QUE EL USUARIO ESTÉ ACTIVO
        if (!"activo".equals(usuario.getEstado())) {
            throw new RuntimeException("Tu cuenta está inactiva. Contacta al administrador.");
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
    
    // Obtener usuario por teléfono
    public Usuario obtenerPorTelefono(String telefono) {
        return usuarioRepository.findByTelefono(telefono);
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(String id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNombre(usuarioActualizado.getNombre());
                    usuario.setApellido(usuarioActualizado.getApellido());
                    
                    // Validar teléfono duplicado en actualización
                    if (usuarioActualizado.getTelefono() != null && !usuarioActualizado.getTelefono().equals(usuario.getTelefono())) {
                        String telefonoLimpio = usuarioActualizado.getTelefono().replaceAll("\\D", "");
                        Usuario existentePorTelefono = usuarioRepository.findByTelefono(telefonoLimpio);
                        if (existentePorTelefono != null && !existentePorTelefono.getId().equals(id)) {
                            throw new RuntimeException("El número de teléfono ya está registrado por otro usuario");
                        }
                        usuario.setTelefono(telefonoLimpio);
                    }
                    
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

    // Cambiar contraseña
    public Usuario cambiarPassword(String id, String nuevaPassword) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    // Validar contraseña segura
                    if (nuevaPassword.length() < 8) {
                        throw new RuntimeException("La contraseña debe tener al menos 8 caracteres");
                    }
                    if (!validarPasswordSegura(nuevaPassword)) {
                        throw new RuntimeException("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial");
                    }
                    usuario.setPassword(nuevaPassword);
                    return usuarioRepository.save(usuario);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }


    // Cambiar estado del usuario (activo/inactivo)
    public Usuario cambiarEstado(String id, String nuevoEstado) {
        if (!"activo".equals(nuevoEstado) && !"inactivo".equals(nuevoEstado)) {
            throw new RuntimeException("Estado inválido. Debe ser 'activo' o 'inactivo'");
        }
        
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setEstado(nuevoEstado);
                    return usuarioRepository.save(usuario);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }
    public String generarTokenRecuperacion(String correo) {
        if (!correo.endsWith("@campusucc.edu.co") && !correo.endsWith("@ucc.edu.co")) {
            throw new RuntimeException("Solo se permiten correos institucionales (@campusucc.edu.co o @ucc.edu.co)");
        }
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario != null) {
            // Generar PIN de 6 dígitos
            String pin = String.format("%06d", new java.util.Random().nextInt(999999));
            usuario.setRecoveryToken(pin);
            // Expira en 15 minutos
            usuario.setTokenExpiry(new java.util.Date(System.currentTimeMillis() + 15 * 60 * 1000));
            usuarioRepository.save(usuario);
            return pin;
        }
        return null;
    }

    public boolean restablecerPassword(String correo, String token, String nuevaPassword) {
        Usuario usuario = obtenerPorCorreo(correo);
        if (usuario != null && 
            token.equals(usuario.getRecoveryToken()) && 
            usuario.getTokenExpiry() != null && 
            usuario.getTokenExpiry().after(new java.util.Date())) {
            
            usuario.setPassword(passwordEncoder.encode(nuevaPassword));
            usuario.setRecoveryToken(null);
            usuario.setTokenExpiry(null);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }
}