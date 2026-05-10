"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../css/Autenticación/register.module.css";
import { API_URL } from "@/src/config/api";

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
  { value: "estudiante", label: "Estudiante" },
  { value: "emprendedor", label: "Emprendedor" },
  { value: "administrativo", label: "Administrativo" },
];

export default function RegisterPage() {

  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correoPrefix, setCorreoPrefix] = useState("");
  const [carrera, setCarrera] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const getDominio = () => {
    if (tipoUsuario === "administrativo") return "@ucc.edu.co";
    return "@campusucc.edu.co";
  };

  const correoCompleto = correoPrefix ? `${correoPrefix}${getDominio()}` : "";

  const [correoError, setCorreoError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [verificandoTelefono, setVerificandoTelefono] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(false);

  const validarCorreoInstitucional = (correo: string) => {
    const dominio = getDominio();
    return correo.endsWith(dominio) && correo.split('@')[0].length > 0;
  };

  const validarPasswordSegura = (password: string) => {
    if (password.length < 8) return { valido: false, mensaje: "Mínimo 8 caracteres" };
    if (!/\d/.test(password)) return { valido: false, mensaje: "Falta un número" };
    if (!/[A-Z]/.test(password)) return { valido: false, mensaje: "Falta una mayúscula" };
    if (!/[a-z]/.test(password)) return { valido: false, mensaje: "Falta una minúscula" };
    return { valido: true, mensaje: "" };
  };

  const verificarTelefono = async (telefono: string) => {
    if (telefono.length === 10) {
      setVerificandoTelefono(true);
      try {
        const res = await fetch(`${API_URL}/api/usuarios/verificar-telefono/${telefono}`);
        const data = await res.json();
        if (data.existe) setTelefonoError("Teléfono ya registrado");
        else setTelefonoError("");
      } catch (error) { console.error(error); }
      finally { setVerificandoTelefono(false); }
    }
  };

  const verificarCorreo = async (correo: string) => {
    if (correo && validarCorreoInstitucional(correo)) {
      setVerificandoCorreo(true);
      try {
        const res = await fetch(`${API_URL}/api/usuarios/verificar-correo/${encodeURIComponent(correo)}`);
        const data = await res.json();
        if (data.existe) setCorreoError("Este correo ya está registrado");
        else setCorreoError("");
      } catch (error) { console.error(error); }
      finally { setVerificandoCorreo(false); }
    }
  };

  const manejarCambioCorreoPrefix = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoPrefix = e.target.value.replace(/[^a-zA-Z0-9._-]/g, "");
    setCorreoPrefix(nuevoPrefix);
    if (nuevoPrefix) verificarCorreo(`${nuevoPrefix}${getDominio()}`);
    else setCorreoError("");
  };

  const manejarCambioPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaPassword = e.target.value;
    setPassword(nuevaPassword);
    if (nuevaPassword) {
      const v = validarPasswordSegura(nuevaPassword);
      setPasswordError(v.valido ? "" : v.mensaje);
    }
  };

  const manejarCambioTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      setTelefono(valor);
      if (valor.length === 10) verificarTelefono(valor);
    }
  };

  const isFormInvalid = !!correoError || !!passwordError || !!telefonoError || !tipoUsuario || !nombre || !apellido || !correoPrefix || !password || (tipoUsuario !== "administrativo" && !carrera);

  const registrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { alert("Las contraseñas no coinciden"); return; }
    
    const usuario = {
      nombre,
      apellido,
      telefono,
      correo: correoCompleto,
      carrera: tipoUsuario === "administrativo" ? "administrativo" : carrera,
      tipoUsuario,
      password,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      if (res.ok) {
        alert("Usuario registrado correctamente");
        router.push("/autenticacion/login");
      } else {
        const data = await res.json();
        alert(data.message || "Error al registrar");
      }
    } catch (error) { alert("Error de conexión"); }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className={styles.wrapper}>

      <div className={styles.brand}>
        <div className={styles.brandBg} aria-hidden />

        <Link href="/" className={styles.brandLogo}>
          <span className={styles.brandName}>EmprendedoresUCC</span>
        </Link>

        <div className={styles.brandCenter}>
          <h2 className={styles.brandTitle}>
            Tu idea merece<br />
            <span className={styles.brandGreen}>ser vista.</span>
          </h2>
        </div>

        <p className={styles.brandFooter}>© 2025 EmprendedoresUCC · UCC Villavicencio</p>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formBox}>

          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Crea tu cuenta</h1>
            <p className={styles.formSub}>Únete a la comunidad emprendedora de la UCC</p>
          </div>

          <form className={styles.form} onSubmit={registrarUsuario}>

            {/* Tipo usuario */}
            <div className={styles.field}>
              <label className={styles.label}>Tipo de usuario *</label>
              <div className={styles.tipoGrid}>
                {tiposUsuario.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.tipoBtn} ${tipoUsuario === t.value ? styles.tipoBtnActive : ""}`}
                    onClick={() => {
                      setTipoUsuario(t.value);
                      if (t.value === "administrativo") {
                        setCarrera("");
                      }
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre y Apellido */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Apellido *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className={styles.field}>
              <label className={styles.label}>
                Teléfono * 
                <span className={styles.labelHint}>(10 dígitos)</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type="tel"
                  className={`${styles.input} ${telefonoError ? styles.inputError : ""}`}
                  style={{ paddingLeft: "0.9rem" }}
                  placeholder="Ej: 3102474495"
                  value={telefono}
                  onChange={manejarCambioTelefono}
                  required
                  maxLength={10}
                />
                {verificandoTelefono && (
                  <small className={styles.helperText}>Verificando...</small>
                )}
              </div>
              {telefono && telefono.length > 0 && (
                <small className={styles.helperText}>
                  {telefono.length} / 10 dígitos
                </small>
              )}
              {telefonoError && (
                <small className={styles.errorText}>{telefonoError}</small>
              )}
              {telefono && telefono.length === 10 && !telefonoError && !verificandoTelefono && (
                <small className={styles.successText}>✓ Teléfono disponible</small>
              )}
            </div>

            {/* Correo */}
            <div className={styles.field}>
              <label className={styles.label}>
                Correo institucional * 
                <span className={styles.labelHint}>({getDominio()})</span>
              </label>
              <div className={styles.inputWrap} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="text"
                  className={`${styles.input} ${correoError ? styles.inputError : ""}`}
                  style={{ flex: 1 }}
                  placeholder="ej: nombre.apellido"
                  value={correoPrefix}
                  onChange={manejarCambioCorreoPrefix}
                  required
                />
                <span style={{ 
                  backgroundColor: "#f3f4f6", 
                  padding: "0.6rem 0.8rem", 
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  fontWeight: "500"
                }}>
                  {getDominio()}
                </span>
              </div>
              {verificandoCorreo && (
                <small className={styles.helperText}>Verificando disponibilidad...</small>
              )}
              {correoError && (
                <small className={styles.errorText}>{correoError}</small>
              )}
              {correoPrefix && !correoError && !verificandoCorreo && (
                <small className={styles.successText}>✓ Usuario disponible</small>
              )}
            </div>

            {/* Campo de carrera */}
            {tipoUsuario !== "administrativo" && (
              <div className={styles.field}>
                <label className={styles.label}>Facultad / Programa *</label>
                <select
                  className={styles.input}
                  style={{ paddingLeft: "0.9rem" }}
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  required
                >
                  <option value="">Selecciona</option>
                  {facultades.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>
                Contraseña * 
                <span className={styles.labelHint}>(8+ caracteres, mayúscula, minúscula, número, carácter especial)</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  className={`${styles.input} ${passwordError ? styles.inputError : ""}`}
                  style={{ paddingLeft: "0.9rem", paddingRight: "2.8rem" }}
                  value={password}
                  onChange={manejarCambioPassword}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePass}
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordError && (
                <small className={styles.errorText}>{passwordError}</small>
              )}
              
              {/* Requisitos de contraseña */}
              <div className={styles.passwordReqs}>
                <small className={password.length >= 8 ? styles.reqMet : styles.reqUnmet}>
                  {password.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                </small>
                <small className={/[A-Z]/.test(password) ? styles.reqMet : styles.reqUnmet}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} Una mayúscula
                </small>
                <small className={/[a-z]/.test(password) ? styles.reqMet : styles.reqUnmet}>
                  {/[a-z]/.test(password) ? "✓" : "○"} Una minúscula
                </small>
                <small className={/\d/.test(password) ? styles.reqMet : styles.reqUnmet}>
                  {/\d/.test(password) ? "✓" : "○"} Un número
                </small>
                <small className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? styles.reqMet : styles.reqUnmet}>
                  {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"} Un carácter especial
                </small>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña *</label>
              <div className={styles.inputWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`${styles.input} ${confirmPassword && password !== confirmPassword ? styles.inputError : ""}`}
                  style={{ paddingLeft: "0.9rem", paddingRight: "2.8rem" }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePass}
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <small className={styles.errorText}>Las contraseñas no coinciden</small>
              )}
              {confirmPassword && password === confirmPassword && !passwordError && (
                <small className={styles.successText}>✓ Las contraseñas coinciden</small>
              )}
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isFormInvalid ? true : undefined}
            >
              Crear cuenta
            </button>

          </form>

          <p className={styles.switchText}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/autenticacion/login" className={styles.switchLink}>
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}