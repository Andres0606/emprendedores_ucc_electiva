package com.ucc.emprendedoresucc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // PERMITIR TODOS LOS ORÍGENES (temporal para pruebas)
        config.setAllowedOriginPatterns(List.of("*"));
        
        // PERMITIR TODOS LOS MÉTODOS
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        
        // PERMITIR TODOS LOS HEADERS
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // PERMITIR CREDENCIALES (cookies, auth headers)
        config.setAllowCredentials(true);
        
        // TIEMPO DE CACHE (1 hora)
        config.setMaxAge(3600L);
        
        // APLICAR A TODAS LAS RUTAS
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}