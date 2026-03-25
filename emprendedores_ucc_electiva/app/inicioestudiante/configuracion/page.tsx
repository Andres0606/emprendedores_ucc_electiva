"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/configuracion.module.css";
import Link from "next/link";

export default function ConfiguracionPage() {
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [carrera, setCarrera] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [usuarioId, setUsuarioId] = useState("");

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
    const nombre = sessionStorage.getItem("nombreUsuario") || "";
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    const id = sessionStorage.getItem("usuarioId") || "";

    setTipoUsuario(tipo.toLowerCase());
    setNombreUsuario(nombre);
    setEmail(usuario.correo || "");
    setUsuarioId(id);

    // Para estudiantes: mostrar carrera en lugar de facultad
    if (tipo.toLowerCase() === "estudiante") {
      const carreraUsuario = usuario.carrera || "";
      setCarrera(carreraUsuario);
    }
  }, []);

  const handleChangePassword = async () => {
    setError("");
    
    // Validaciones
    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual");
      return;
    }
    
    if (!newPassword) {
      setError("Debes ingresar una nueva contraseña");
      return;
    }
    
    if (newPassword.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Primero verificar que la contraseña actual es correcta
      const loginRes = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: email,
          password: currentPassword
        })
      });
      
      if (!loginRes.ok) {
        setError("La contraseña actual es incorrecta");
        setIsLoading(false);
        return;
      }
      
      // Actualizar la contraseña
      const updateRes = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}/cambiar-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nuevaPassword: newPassword
        })
      });
      
      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        setError(errorData.message || "Error al cambiar la contraseña");
        setIsLoading(false);
        return;
      }
      
      // Limpiar campos
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      alert("Contraseña actualizada correctamente");
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const esEstudiante = tipoUsuario === "estudiante";

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>
        <h1 className={styles.title}>Configuración</h1>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos de la cuenta</h2>

            {/* Nombre - Solo lectura */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre completo</label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                type="text"
                value={nombreUsuario}
                readOnly
                disabled
              />
              <small className={styles.helperText}>El nombre no se puede modificar</small>
            </div>

            {/* Correo - Solo lectura */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo institucional</label>
              <input
                className={`${styles.input} ${styles.readonly}`}
                type="email"
                value={email}
                readOnly
                disabled
              />
              <small className={styles.helperText}>El correo no se puede modificar</small>
            </div>

            {/* Carrera para estudiantes - Solo lectura */}
            {esEstudiante && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Carrera</label>
                <input
                  className={`${styles.input} ${styles.readonly}`}
                  type="text"
                  value={carrera || "No especificada"}
                  readOnly
                  disabled
                />
                <small className={styles.helperText}>La carrera no se puede modificar</small>
              </div>
            )}

            {/* Cambio de contraseña */}
            <div className={styles.passwordSection}>
              <h3 className={styles.passwordTitle}>Cambiar contraseña</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Contraseña actual</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <small className={styles.helperText}>Mínimo 4 caracteres</small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmar nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Zona de peligro - Eliminar cuenta */}
            <div className={styles.danger}>
              <h3 className={styles.dangerTitle}>Zona de peligro</h3>
              <p className={styles.dangerDesc}>
                Eliminar tu cuenta es irreversible. Perderás todos tus datos y emprendimientos.
              </p>
              <button 
                className={styles.btnDanger}
                onClick={() => {
                  if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
                    alert("Función en desarrollo");
                  }
                }}
              >
                Eliminar cuenta
              </button>
            </div>
          </section>

          <div className={styles.saveRow}>
            <button 
              className={styles.btnSave} 
              onClick={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : (saved ? "✓ Contraseña actualizada" : "Cambiar contraseña")}
            </button>
            {saved && <span className={styles.savedMsg}>Contraseña actualizada correctamente.</span>}
          </div>
        </div>

      </div>
    </main>
  );
}