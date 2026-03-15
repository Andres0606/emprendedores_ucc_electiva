"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../../css/Autenticación/register.module.css";

const facultades = [
  "Administración de Empresas",
  "Contaduría Pública",
  "Derecho",
  "Enfermería",
  "Ingeniería Civil",
  "Ingeniería de Sistemas",
  "Medicina Veterinaria",
  "Odontología",
  "Psicología",
  "Medicina",
  "Posgrado",
];

const tiposUsuario = [
  { value: "estudiante",  label: "Estudiante" },
  { value: "emprendedor", label: "Emprendedor" },
  { value: "comprador",   label: "Administrativo" },
];

export default function RegisterPage() {
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");

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
            Tu idea merece<br />
            <span className={styles.brandGreen}>ser vista.</span>
          </h2>
          <p className={styles.brandDesc}>
            Crea tu cuenta y empieza a publicar tus productos y
            servicios ante toda la comunidad UCC.
          </p>
          <div className={styles.brandSteps}>
            {[
              { n: "01", txt: "Crea tu cuenta" },
              { n: "02", txt: "Publica tu emprendimiento" },
              { n: "03", txt: "Conecta con tu comunidad" },
            ].map((s) => (
              <div key={s.n} className={styles.brandStep}>
                <span className={styles.brandStepNum}>{s.n}</span>
                <span className={styles.brandStepTxt}>{s.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <p className={styles.brandFooter}>© 2025 EmprendedoresUCC · UCC Villavicencio</p>
      </div>

      {/* ── Lado derecho — formulario ── */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>

          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Crea tu cuenta</h1>
            <p className={styles.formSub}>Únete a la comunidad emprendedora de la UCC</p>
          </div>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

            {/* Tipo de usuario */}
            <div className={styles.field}>
              <label className={styles.label}>Tipo de usuario</label>
              <div className={styles.tipoGrid}>
                {tiposUsuario.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.tipoBtn} ${tipoUsuario === t.value ? styles.tipoBtnActive : ""}`}
                    onClick={() => setTipoUsuario(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre + Apellido */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="10" cy="7" r="3.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round"/>
                  </svg>
                  <input type="text" placeholder="Juan" className={styles.input} autoComplete="given-name"/>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Apellido</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="10" cy="7" r="3.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round"/>
                  </svg>
                  <input type="text" placeholder="Pérez" className={styles.input} autoComplete="family-name"/>
                </div>
              </div>
            </div>

            {/* Teléfono solo */}
            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="5" y="2" width="10" height="16" rx="2"/>
                  <circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/>
                </svg>
                <input type="tel" placeholder="300 000 0000" className={styles.input} autoComplete="tel"/>
              </div>
            </div>

            {/* Correo */}
            <div className={styles.field}>
              <label className={styles.label}>Correo institucional</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
                </svg>
                <input type="email" placeholder="tu.nombre@campusucc.edu.co" className={styles.input} autoComplete="email"/>
              </div>
            </div>

            {/* Facultad */}
            <div className={styles.field}>
              <label className={styles.label}>Facultad / Programa</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M10 2L2 7l8 5 8-5-8-5z"/>
                  <path d="M2 12l8 5 8-5" strokeLinecap="round"/>
                </svg>
                <select className={`${styles.input} ${styles.select}`} defaultValue="">
                  <option value="" disabled>Selecciona tu programa</option>
                  {facultades.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2"/>
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className={styles.input}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)} aria-label="Ver contraseña">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                    <circle cx="10" cy="10" r="2.5"/>
                    {showPass && <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round"/>}
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2"/>
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round"/>
                  <path d="M7 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  className={styles.input}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowConfirm(!showConfirm)} aria-label="Ver contraseña">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                    <circle cx="10" cy="10" r="2.5"/>
                    {showConfirm && <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round"/>}
                  </svg>
                </button>
              </div>
            </div>

            {/* Términos */}
            <label className={styles.checkRow}>
              <input type="checkbox" className={styles.checkbox}/>
              <span className={styles.checkText}>
                Acepto los{" "}
                <Link href="/terminos" className={styles.checkLink}>términos y condiciones</Link>
                {" "}y la{" "}
                <Link href="/privacidad" className={styles.checkLink}>política de privacidad</Link>
              </span>
            </label>

            <button type="submit" className={styles.submitBtn}>
              Crear cuenta
            </button>

          </form>

          <p className={styles.switchText}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/autenticacion/login" className={styles.switchLink}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}