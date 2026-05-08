package com.ucc.emprendedoresucc.controller;

import com.ucc.emprendedoresucc.config.JwtUtils;
import com.ucc.emprendedoresucc.dto.AuthRequest;
import com.ucc.emprendedoresucc.dto.AuthResponse;
import com.ucc.emprendedoresucc.model.Usuario;
import com.ucc.emprendedoresucc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtils jwtUtils;

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
