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
            // En un sistema real, aquí generaríamos un token temporal.
            // Por ahora, enviamos un correo de confirmación de que el sistema funciona.
            String subject = "Recuperación de Contraseña - EmprendedoresUCC";
            String body = "Hola " + usuario.getNombre() + ",\n\n" +
                          "Hemos recibido una solicitud para restablecer tu contraseña en EmprendedoresUCC.\n" +
                          "Este es un correo de prueba para confirmar que el servicio de mensajería está activo.\n\n" +
                          "Si no solicitaste esto, puedes ignorar este correo.\n\n" +
                          "Atentamente,\nEquipo de EmprendedoresUCC";
            
            emailService.enviarCorreo(correo, subject, body);
            
            return ResponseEntity.ok(Map.of("message", "Correo de recuperación enviado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al enviar el correo: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            // Validar credenciales
            Usuario usuario = usuarioService.login(authRequest.getCorreo(), authRequest.getPassword());
            
            // Generar Token
            String token = jwtUtils.generateToken(usuario.getCorreo(), usuario.getTipoUsuario());
            
            // Retornar respuesta con token y datos básicos
            return ResponseEntity.ok(new AuthResponse(
                    token, 
                    usuario.getNombre() + " " + usuario.getApellido(), 
                    usuario.getTipoUsuario()
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
