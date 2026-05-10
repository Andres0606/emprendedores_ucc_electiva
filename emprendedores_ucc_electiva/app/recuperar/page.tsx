"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../css/Autenticación/recuperar.module.css";
import { API_URL } from "@/src/config/api";

export default function RecuperarPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: PIN & Password
  const [correo, setCorreo] = useState("");
  const [pin, setPin] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Solicitar el PIN
  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        alert(data.message || "Error al solicitar el código");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Restablecer contraseña con el PIN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword.length < 8) {
      alert("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, pin, nuevaPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert(data.message || "Código inválido o expirado");
      }
    } catch (error) {
      alert("Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <div className={styles.brandBg} aria-hidden />
        <Link href="/" className={styles.brandLogo}>
          <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
            <rect x="2" y="2" width="11" height="22" rx="3" fill="#009FE3"/>
            <rect x="16" y="2" width="11" height="22" rx="3" fill="#8DC63F"/>
            <circle cx="30" cy="10" r="6" fill="none" stroke="#009FE3" strokeWidth="2.5"/>
          </svg>
          <span>EmprendedoresUCC</span>
        </Link>
        <div className={styles.brandCenter}>
          <h2 className={styles.brandTitle}>
            {isSuccess ? "¡Todo listo!" : "Recupera tu cuenta"}
          </h2>
          <p className={styles.brandDesc}>
            {isSuccess 
              ? "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión."
              : "Sigue los pasos para volver a ingresar al ecosistema de emprendedores."}
          </p>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formBox}>
          {isSuccess ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ 
                  width: "64px", 
                  height: "64px", 
                  borderRadius: "50%", 
                  backgroundColor: "#8DC63F15", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#8DC63F"
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h1 className={styles.formTitle}>Contraseña cambiada</h1>
              <p className={styles.formSub} style={{ marginBottom: "2rem" }}>
                Tu acceso ha sido restaurado con éxito.
              </p>
              <Link href="/autenticacion/login" className={styles.submitBtn} style={{ display: "block", textDecoration: "none" }}>
                Ir al Login
              </Link>
            </div>
          ) : step === 1 ? (
            <>
              <div className={styles.formHead}>
                <h1 className={styles.formTitle}>Olvidé mi contraseña</h1>
                <p className={styles.formSub}>Te enviaremos un código de seguridad</p>
              </div>
              <form className={styles.form} onSubmit={handleRequestPin}>
                <div className={styles.field}>
                  <label className={styles.label}>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    className={styles.input}
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Código"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className={styles.formHead}>
                <h1 className={styles.formTitle}>Verificar código</h1>
                <p className={styles.formSub}>Ingresa el PIN de 6 dígitos enviado a su correo</p>
              </div>
              <form className={styles.form} onSubmit={handleResetPassword}>
                <div className={styles.field}>
                  <label className={styles.label}>Código PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className={styles.input}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className={styles.input}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
                <button 
                  type="button" 
                  className={styles.backLink} 
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", cursor: "pointer", width: "100%", marginTop: "1rem" }}
                >
                  ← Volver a intentar
                </button>
              </form>
            </>
          )}
          
          {step === 1 && (
            <Link href="/autenticacion/login" className={styles.backLink}>
              ← Volver al login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
