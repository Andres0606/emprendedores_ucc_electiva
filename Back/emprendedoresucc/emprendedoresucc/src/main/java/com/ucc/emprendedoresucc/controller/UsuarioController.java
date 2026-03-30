package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Registrar usuario
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al registrar usuario");
            errorResponse.put("message", "Error interno del servidor");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Verificar si teléfono existe
    @GetMapping("/verificar-telefono/{telefono}")
    public ResponseEntity<?> verificarTelefono(@PathVariable String telefono) {
        try {
            // Limpiar teléfono (solo números)
            String telefonoLimpio = telefono.replaceAll("\\D", "");
            Usuario usuario = usuarioService.obtenerPorTelefono(telefonoLimpio);
            Map<String, Object> response = new HashMap<>();
            response.put("existe", usuario != null);
            response.put("message", usuario != null ? "El teléfono ya está registrado" : "Teléfono disponible");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Verificar si correo existe
    @GetMapping("/verificar-correo/{correo}")
    public ResponseEntity<?> verificarCorreo(@PathVariable String correo) {
        try {
            Usuario usuario = usuarioService.obtenerPorCorreo(correo);
            Map<String, Object> response = new HashMap<>();
            response.put("existe", usuario != null);
            response.put("message", usuario != null ? "El correo ya está registrado" : "Correo disponible");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String correo = credenciales.get("correo");
            String password = credenciales.get("password");
            Usuario usuario = usuarioService.login(correo, password);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
    }

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioService.obtenerPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtener usuario por correo
    @GetMapping("/correo/{correo}")
    public ResponseEntity<Usuario> obtenerPorCorreo(@PathVariable String correo) {
        Usuario usuario = usuarioService.obtenerPorCorreo(correo);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Obtener usuario por teléfono
    @GetMapping("/telefono/{telefono}")
    public ResponseEntity<Usuario> obtenerPorTelefono(@PathVariable String telefono) {
        String telefonoLimpio = telefono.replaceAll("\\D", "");
        Usuario usuario = usuarioService.obtenerPorTelefono(telefonoLimpio);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Usuario usuarioActualizado) {
        try {
            Usuario usuario = usuarioService.actualizarUsuario(id, usuarioActualizado);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            usuarioService.eliminarUsuario(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }
    }

    // Cambiar contraseña
    @PatchMapping("/{id}/cambiar-password")
    public ResponseEntity<?> cambiarPassword(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String nuevaPassword = request.get("nuevaPassword");
            
            if (nuevaPassword == null || nuevaPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La nueva contraseña es requerida");
                error.put("message", "La nueva contraseña es requerida");
                return ResponseEntity.badRequest().body(error);
            }
            
            Usuario usuarioActualizado = usuarioService.cambiarPassword(id, nuevaPassword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contraseña actualizada correctamente");
            response.put("usuario", usuarioActualizado);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al cambiar contraseña");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}