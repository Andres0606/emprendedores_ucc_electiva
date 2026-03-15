"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../../css/Autenticación/login.module.css";


export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  


  return (
    <div className={styles.wrapper}>

      {/* ── Lado izquierdo — marca ── */}
      <div className={styles.brand}>
        <div className={styles.brandBg} aria-hidden />

        <Link href="/" className={styles.brandLogo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="11" fill="rgba(255,255,255,0.12)"/>
            <rect x="6"  y="6"  width="11" height="20" rx="3" fill="#fff"/>
            <rect x="6"  y="20" width="11" height="5"  rx="2" fill="rgba(255,255,255,0.5)"/>
            <rect x="19" y="6"  width="11" height="20" rx="3" fill="#8DC63F"/>
            <circle cx="34" cy="10" r="4.5" fill="none" stroke="#8DC63F" strokeWidth="2"/>
            <circle cx="34" cy="10" r="1.8" fill="#fff"/>
          </svg>
          <span className={styles.brandName}>EmprendedoresUCC</span>
        </Link>

        <div className={styles.brandCenter}>
          <h2 className={styles.brandTitle}>
            El emprendimiento<br />
            <span className={styles.brandGreen}>empieza aquí.</span>
          </h2>
          <p className={styles.brandDesc}>
            Conecta con la comunidad estudiantil de la Universidad
            Cooperativa de Colombia y dale vida a tus ideas.
          </p>
        
        </div>

        <p className={styles.brandFooter}>© 2025 EmprendedoresUCC · UCC Villavicencio</p>
      </div>

      {/* ── Lado derecho — formulario ── */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>

          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Bienvenido de nuevo</h1>
            <p className={styles.formSub}>Ingresa con tu correo institucional UCC</p>
          </div>

          
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

            {/* Correo */}
            <div className={styles.field}>
              <label className={styles.label}>Correo institucional</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  placeholder="tu.nombre@campusucc.edu.co"
                  className={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Contraseña</label>
                <Link href="/recuperar" className={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
              </div>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2"/>
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)} aria-label="Ver contraseña">
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                      <circle cx="10" cy="10" r="2.5"/>
                      <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                      <circle cx="10" cy="10" r="2.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Link href="/inicioemprendedor" className={styles.submitBtn}>
              Iniciar sesión
            </Link>

   

          </form>

          <p className={styles.switchText}>
            ¿No tienes cuenta?{" "}
            <Link href="/autenticacion/register" className={styles.switchLink}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}