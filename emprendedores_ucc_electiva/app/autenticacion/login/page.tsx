"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../css/Autenticación/login.module.css";

export default function LoginPage() {

  const [showPass, setShowPass] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    if (!correo || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Correo o contraseña incorrectos");
        return;
      }

      // Guardar usuario en sesión
      sessionStorage.setItem("usuario", JSON.stringify(data));
      sessionStorage.setItem("usuarioId", data.id || data._id);
      sessionStorage.setItem("tipoUsuario", data.tipoUsuario);
      
      // Guardar también el nombre para mostrarlo en la interfaz
      sessionStorage.setItem("nombreUsuario", data.nombre || data.correo?.split('@')[0] || "Usuario");

      alert("Inicio de sesión correcto");
      
      // 👈 REDIRECCIÓN SEGÚN TIPO DE USUARIO
      const tipoUsuario = data.tipoUsuario?.toLowerCase();
      
      if (tipoUsuario === "admin") {
        router.push("/inicioadmin");
      } else if (tipoUsuario === "emprendedor") {
        router.push("/inicioemprendedor");
      } else if (tipoUsuario === "estudiante") {
        router.push("/inicioestudiante");
      } else if (tipoUsuario === "administrativo") {
        router.push("/inicioAdministrativo");
      } else {
        console.warn("Tipo de usuario no reconocido:", tipoUsuario);
        router.push("/");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
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
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="11" fill="rgba(255,255,255,0.12)"/>
            <rect x="6" y="6" width="11" height="20" rx="3" fill="#fff"/>
            <rect x="6" y="20" width="11" height="5" rx="2" fill="rgba(255,255,255,0.5)"/>
            <rect x="19" y="6" width="11" height="20" rx="3" fill="#8DC63F"/>
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

      {/* Lado derecho */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>

          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Bienvenido de nuevo</h1>
            <p className={styles.formSub}>Ingresa con tu correo</p>
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >

            {/* Correo */}
            <div className={styles.field}>
              <label className={styles.label}>Correo</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  placeholder="tu.nombre@ucc.edu.co"
                  className={styles.input}
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Contraseña</label>
                <Link href="/recuperar" className={styles.forgotLink}>
                  ¿Olvidaste tu contraseña?
                </Link>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className={styles.togglePass}
                  onClick={() => setShowPass(!showPass)}
                  disabled={isLoading}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

          </form>

          <p className={styles.switchText}>
            ¿No tienes cuenta?{" "}
            <Link href="/autenticacion/register" className={styles.switchLink}>
              Regístrate gratis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}