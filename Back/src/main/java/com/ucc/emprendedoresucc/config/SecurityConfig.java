package com.ucc.emprendedoresucc.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF ya que usamos JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Sin estado
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Rutas públicas de autenticación
                .requestMatchers("/api/usuarios/verificar-telefono/**").permitAll() // Verificación de teléfono
                .requestMatchers("/api/usuarios/verificar-correo/**").permitAll() // Verificación de correo
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/usuarios/**").permitAll() // Permitir ver info de usuarios públicamente
                .requestMatchers("/api/categorias/**").permitAll() // Categorías públicas
                .requestMatchers("/api/emprendimientos/**").permitAll() // Emprendimientos públicos
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/eventos/**").permitAll() // Eventos públicos (ver)
                .anyRequest().authenticated() // Todo lo demás requiere token (POST, PUT, DELETE)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
