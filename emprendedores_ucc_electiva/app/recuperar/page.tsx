"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../css/Autenticación/recuperar.module.css";
import { API_URL } from "@/src/config/api";

export default function RecuperarPage() {
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) return;

    setIsLoading(true);
    
    try {
      // Por ahora simulamos el envío, ya que requiere servicio de correo en el backend
      // En una fase siguiente implementaremos el servicio de JavaMail
      console.log("Solicitando recuperación para:", correo);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSent(true);
    } catch (error) {
      alert("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Lado izquierdo */}
      <div className={styles.brand}>
        <div className={styles.brandBg} aria-hidden />
        <Link href="/" className={styles.brandLogo}>
          <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
            <rect x="2" y="2" width="11" height="22" rx="3" fill="#009FE3"/>
            <rect x="2" y="18" width="11" height="6" rx="2" fill="#009FE3"/>
            <rect x="16" y="2" width="11" height="22" rx="3" fill="#8DC63F"/>
            <circle cx="30" cy="10" r="6" fill="none" stroke="#009FE3" strokeWidth="2.5"/>
            <circle cx="30" cy="10" r="2.5" fill="#8DC63F"/>
          </svg>
          <span>EmprendedoresUCC</span>
        </Link>

        <div className={styles.brandCenter}>
          <h2 className={styles.brandTitle}>
            No te preocupes,<br />
            <span className={styles.brandGreen}>te ayudamos.</span>
          </h2>
          <p className={styles.brandDesc}>
            Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu acceso.
          </p>
        </div>

        <p className={styles.brandFooter}>© 2025 EmprendedoresUCC · UCC Villavicencio</p>
      </div>

      {/* Lado derecho */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>
          {!isSent ? (
            <>
              <div className={styles.formHead}>
                <h1 className={styles.formTitle}>Recuperar acceso</h1>
                <p className={styles.formSub}>Escribe el correo asociado a tu cuenta</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label className={styles.label}>Correo Institucional</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="2" y="4" width="16" height="13" rx="2"/>
                      <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="email"
                      placeholder="estudiante@campusucc.edu.co"
                      className={styles.input}
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✉️</div>
              <h1 className={styles.formTitle}>¡Correo enviado!</h1>
              <p className={styles.formSub} style={{ marginBottom: "2rem" }}>
                Hemos enviado las instrucciones a <strong>{correo}</strong>. 
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              <button 
                className={styles.submitBtn} 
                style={{ width: "100%" }}
                onClick={() => setIsSent(false)}
              >
                Intentar con otro correo
              </button>
            </div>
          )}

          <Link href="/autenticacion/login" className={styles.backLink}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
