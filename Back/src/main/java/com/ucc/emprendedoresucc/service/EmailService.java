package com.ucc.emprendedoresucc.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    public void enviarCorreo(String to, String subject, String body) throws Exception {
        URL url = new URL("https://api.resend.com/emails");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        // Escapar caracteres básicos para evitar que el JSON se rompa
        String safeTo = to.replace("\"", "\\\"");
        String safeSubject = subject.replace("\"", "\\\"");
        String safeBody = body.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");

        String jsonInputString = "{" +
            "\"from\": \"onboarding@resend.dev\"," +
            "\"to\": \"" + safeTo + "\"," +
            "\"subject\": \"" + safeSubject + "\"," +
            "\"text\": \"" + safeBody + "\"" +
            "}";

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        int code = conn.getResponseCode();
        if (code != 200 && code != 201) {
            throw new RuntimeException("Error al enviar correo vía Resend. Código: " + code);
        }
    }
}
