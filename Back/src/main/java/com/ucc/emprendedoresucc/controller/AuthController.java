// MODIFICADO POR ANTIGRAVITY - ESTE COMENTARIO CONFIRMA LA MODIFICACIÓN
package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.config.JwtUtils;
import com.ucc.emprendedoresucc.dto.AuthRequest;
import com.ucc.emprendedoresucc.dto.AuthResponse;
import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.service.EmailService;
import com.ucc.emprendedoresucc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");
        Usuario usuario = usuarioService.obtenerPorCorreo(correo);
        
        if (usuario == null) {
            return ResponseEntity.status(404).body(Map.of("message", "El correo no está registrado"));
        }

        try {
            // Generar PIN real
            String pin = usuarioService.generarTokenRecuperacion(correo);
            
            String subject = "Código de Recuperación: " + pin;
            String body = "Hola " + usuario.getNombre() + ",\n\n" +
                          "Tu código de seguridad para restablecer tu contraseña es:\n\n" +
                          "👉 " + pin + " 👈\n\n" +
                          "Este código expirará en 15 minutos.\n" +
                          "Si no solicitaste esto, puedes ignorar este correo.\n\n" +
                          "Atentamente,\nEquipo de EmprendedoresUCC";
            
            emailService.enviarCorreo(correo, subject, body);
            
            return ResponseEntity.ok(Map.of("message", "Código enviado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al enviar el correo: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");
        String pin = request.get("pin");
        String nuevaPassword = request.get("nuevaPassword");

        boolean exito = usuarioService.restablecerPassword(correo, pin, nuevaPassword);
        
        if (exito) {
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } else {
            return ResponseEntity.status(400).body(Map.of("message", "Código inválido o expirado"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            Usuario usuario = usuarioService.login(authRequest.getCorreo(), authRequest.getPassword());
            String token = jwtUtils.generateToken(usuario.getCorreo(), usuario.getTipoUsuario());
            
            return ResponseEntity.ok(new AuthResponse(
                    token, 
                    usuario.getNombre() + " " + usuario.getApellido(), 
                    usuario.getTipoUsuario(),
                    usuario.getId(),
                    usuario.getCorreo(),
                    usuario.getTelefono(),
                    usuario.getCarrera()
            ));
        } catch (Exception e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
