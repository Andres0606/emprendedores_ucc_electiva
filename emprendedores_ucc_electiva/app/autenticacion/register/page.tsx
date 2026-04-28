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
  const [correo, setCorreo] = useState("");
  const [carrera, setCarrera] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados para errores
  const [correoError, setCorreoError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [verificandoTelefono, setVerificandoTelefono] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(false);

  // Validar correo institucional
  const validarCorreoInstitucional = (correo: string) => {
    const regexCorreo = /^[a-zA-Z0-9._-]+@campusucc\.edu\.co$/;
    return regexCorreo.test(correo);
  };

  // Validar contraseña segura
  const validarPasswordSegura = (password: string) => {
    if (password.length < 8) {
      return { valido: false, mensaje: "La contraseña debe tener al menos 8 caracteres" };
    }
    if (!/\d/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos un número" };
    }
    if (!/[A-Z]/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos una letra mayúscula" };
    }
    if (!/[a-z]/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos una letra minúscula" };
    }
    const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>]/;
    if (!caracteresEspeciales.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)" };
    }
    return { valido: true, mensaje: "" };
  };

  // Verificar teléfono en backend
  const verificarTelefono = async (telefono: string) => {
    if (telefono.length === 10) {
      setVerificandoTelefono(true);
      try {
        const res = await fetch(`${API_URL}/api/usuarios/verificar-telefono/${telefono}`);
        const data = await res.json();
        if (data.existe) {
          setTelefonoError("Este número de teléfono ya está registrado. Por favor usa otro");
        } else {
          setTelefonoError("");
        }
      } catch (error) {
        console.error("Error verificando teléfono:", error);
        setTelefonoError("Error al verificar teléfono");
      } finally {
        setVerificandoTelefono(false);
      }
    } else {
      setTelefonoError("");
    }
  };

  // Verificar correo en backend
  const verificarCorreo = async (correo: string) => {
    if (correo && validarCorreoInstitucional(correo)) {
      setVerificandoCorreo(true);
      try {
        const res = await fetch(`${API_URL}/api/usuarios/verificar-correo/${encodeURIComponent(correo)}`);
        const data = await res.json();
        if (data.existe) {
          setCorreoError("Este correo ya está registrado");
        } else {
          setCorreoError("");
        }
      } catch (error) {
        console.error("Error verificando correo:", error);
      } finally {
        setVerificandoCorreo(false);
      }
    }
  };

  // Manejar cambio de correo
  const manejarCambioCorreo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoCorreo = e.target.value;
    setCorreo(nuevoCorreo);
    
    if (nuevoCorreo && !validarCorreoInstitucional(nuevoCorreo)) {
      setCorreoError("El correo debe ser institucional (@campusucc.edu.co)");
    } else {
      verificarCorreo(nuevoCorreo);
    }
  };

  // Manejar cambio de contraseña
  const manejarCambioPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaPassword = e.target.value;
    setPassword(nuevaPassword);
    
    if (nuevaPassword) {
      const validacion = validarPasswordSegura(nuevaPassword);
      if (!validacion.valido) {
        setPasswordError(validacion.mensaje);
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  // Manejar cambio de teléfono
  const manejarCambioTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 10) {
      setTelefono(valor);
      if (valor.length === 10) {
        verificarTelefono(valor);
      } else {
        setTelefonoError("");
      }
    }
  };

  // Calcular si el formulario es válido
  const isFormInvalid = !!correoError || !!passwordError || !!telefonoError || (confirmPassword && password !== confirmPassword) || !tipoUsuario || !nombre || !apellido || !correo || !password || !confirmPassword || (tipoUsuario !== "administrativo" && !carrera);

  const registrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!validarCorreoInstitucional(correo)) {
      alert("El correo debe ser institucional (@campusucc.edu.co). Ejemplo: estudiante@campusucc.edu.co");
      return;
    }

    const validacionPassword = validarPasswordSegura(password);
    if (!validacionPassword.valido) {
      alert(validacionPassword.mensaje);
      return;
    }

    if (!telefono) {
      alert("Por favor ingresa tu número de teléfono");
      return;
    }

    if (telefono.length !== 10) {
      alert("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    if (telefonoError) {
      alert(telefonoError);
      return;
    }

    const carreraEnviar = tipoUsuario === "administrativo" ? "administrativo" : carrera;

    if (tipoUsuario !== "administrativo" && !carrera) {
      alert("Por favor selecciona tu facultad/programa");
      return;
    }

    if (!tipoUsuario) {
      alert("Por favor selecciona tu tipo de usuario");
      return;
    }

    const usuario = {
      nombre,
      apellido,
      telefono,
      correo,
      carrera: carreraEnviar,
      tipoUsuario,
      password,
    };

    try {
      const res = await fetch(`${API_URL}/api/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (res.ok) {
        alert("✅ Usuario registrado correctamente");
        router.push("/autenticacion/login");
      } else {
        const errorMessage = typeof data === 'string' ? data : data.message || "Error al registrar usuario";
        alert(errorMessage);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
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
                <span className={styles.labelHint}>(@campusucc.edu.co)</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  className={`${styles.input} ${correoError ? styles.inputError : ""}`}
                  style={{ paddingLeft: "0.9rem" }}
                  placeholder="estudiante@campusucc.edu.co"
                  value={correo}
                  onChange={manejarCambioCorreo}
                  required
                />
                {verificandoCorreo && (
                  <small className={styles.helperText}>Verificando...</small>
                )}
              </div>
              {correoError && (
                <small className={styles.errorText}>{correoError}</small>
              )}
              {correo && !correoError && validarCorreoInstitucional(correo) && !verificandoCorreo && (
                <small className={styles.successText}>✓ Correo válido</small>
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