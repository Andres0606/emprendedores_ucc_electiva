"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

  // 👈 Función para validar teléfono (solo números y máximo 10 dígitos)
  const validarTelefono = (telefono: string) => {
    // Eliminar cualquier caracter que no sea número
    const soloNumeros = telefono.replace(/\D/g, '');
    
    // Verificar que tenga máximo 10 dígitos
    if (soloNumeros.length > 10) {
      return false;
    }
    
    return true;
  };

  // 👈 Función para formatear teléfono (solo números)
  const manejarCambioTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    // Eliminar cualquier caracter que no sea número
    valor = valor.replace(/\D/g, '');
    // Limitar a máximo 10 dígitos
    if (valor.length <= 10) {
      setTelefono(valor);
    }
  };

  const registrarUsuario = async (e: any) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // 👈 Validar teléfono
    if (!telefono) {
      alert("Por favor ingresa tu número de teléfono");
      return;
    }

    if (telefono.length < 7) {
      alert("El teléfono debe tener al menos 7 dígitos");
      return;
    }

    if (telefono.length > 10) {
      alert("El teléfono no puede tener más de 10 dígitos");
      return;
    }

    // Si es administrativo, enviar "administrativo" como carrera
    const carreraEnviar = tipoUsuario === "administrativo" ? "administrativo" : carrera;

    // Validar que si NO es administrativo, haya seleccionado una carrera
    if (tipoUsuario !== "administrativo" && !carrera) {
      alert("Por favor selecciona tu facultad/programa");
      return;
    }

    const usuario = {
      nombre,
      apellido,
      telefono,  // Ya viene solo con números
      correo,
      carrera: carreraEnviar,
      tipoUsuario,
      password,
      saldo: 0,
    };

    try {
      const res = await fetch("http://localhost:8080/api/usuarios/registro", {
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
        alert("Usuario registrado correctamente");
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
              <label className={styles.label}>Tipo de usuario</label>
              <div className={styles.tipoGrid}>
                {tiposUsuario.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.tipoBtn} ${tipoUsuario === t.value ? styles.tipoBtnActive : ""}`}
                    onClick={() => {
                      setTipoUsuario(t.value);
                      // Si selecciona administrativo, limpiar carrera
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
                <label className={styles.label}>Nombre</label>
                <input
                  type="text"
                  className={styles.input}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Apellido</label>
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
                Teléfono 
                <span className={styles.labelHint}>(Máximo 10 dígitos)</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="Ej: 3102474495"
                  value={telefono}
                  onChange={manejarCambioTelefono}
                  required
                  maxLength={10}
                />
              </div>
              {telefono && telefono.length > 0 && (
                <small className={styles.helperText}>
                  {telefono.length} / 10 dígitos
                </small>
              )}
            </div>

            {/* Correo */}
            <div className={styles.field}>
              <label className={styles.label}>Correo</label>
              <input
                type="email"
                className={styles.input}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            {/* Campo de carrera: solo visible si NO es administrativo */}
            {tipoUsuario !== "administrativo" && (
              <div className={styles.field}>
                <label className={styles.label}>Facultad / Programa</label>
                <select
                  className={styles.input}
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  required={tipoUsuario !== "administrativo"}
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
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  className={styles.input}
                  style={{ paddingLeft: "0.9rem", paddingRight: "2.8rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Confirmar contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <div className={styles.inputWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  className={styles.input}
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
            </div>

            <button type="submit" className={styles.submitBtn}>
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