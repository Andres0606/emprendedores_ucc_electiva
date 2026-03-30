"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/configuracion.module.css";
import Link from "next/link";

export default function ConfiguracionPage() {
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [carrera, setCarrera] = useState("");
  const [telefono, setTelefono] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
    const nombre = sessionStorage.getItem("nombreUsuario") || "";
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    const id = sessionStorage.getItem("usuarioId") || "";

    setTipoUsuario(tipo.toLowerCase());
    setNombreUsuario(nombre);
    setEditNombre(nombre);
    setEmail(usuario.correo || "");
    setUsuarioId(id);
    setTelefono(usuario.telefono || "");
    setEditTelefono(usuario.telefono || "");

    if (tipo.toLowerCase() === "estudiante") {
      const carreraUsuario = usuario.carrera || "";
      setCarrera(carreraUsuario);
    }
  }, []);

  const handleActualizarPerfil = async () => {
    setError("");
    setSuccess("");
    
    // Validaciones
    if (!editNombre.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }
    
    if (editTelefono && editTelefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Obtener datos actuales del usuario
      const resGet = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!resGet.ok) {
        throw new Error("Error al obtener datos del usuario");
      }
      const usuarioActual = await resGet.json();
      
      // Actualizar datos
      const usuarioActualizado = {
        ...usuarioActual,
        nombre: editNombre,
        apellido: usuarioActual.apellido,
        telefono: editTelefono,
        tipoUsuario: usuarioActual.tipoUsuario,
        carrera: usuarioActual.carrera
      };
      
      const resUpdate = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(usuarioActualizado)
      });
      
      if (!resUpdate.ok) {
        const errorData = await resUpdate.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }
      
      const usuarioGuardado = await resUpdate.json();
      
      // Actualizar sessionStorage
      sessionStorage.setItem("nombreUsuario", editNombre);
      const usuarioStorage = JSON.parse(sessionStorage.getItem("usuario") || "{}");
      usuarioStorage.nombre = editNombre;
      usuarioStorage.telefono = editTelefono;
      sessionStorage.setItem("usuario", JSON.stringify(usuarioStorage));
      
      setNombreUsuario(editNombre);
      setTelefono(editTelefono);
      setSuccess("Perfil actualizado correctamente");
      setEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      setError(error.message || "Error al actualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  // Validar contraseña segura
  const validarPasswordSegura = (password: string): { valido: boolean; mensaje: string } => {
    if (password.length < 8) {
      return { valido: false, mensaje: "La contraseña debe tener al menos 8 caracteres" };
    }
    if (!/[A-Z]/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos una letra mayúscula" };
    }
    if (!/[a-z]/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos una letra minúscula" };
    }
    if (!/\d/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos un número" };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valido: false, mensaje: "La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)" };
    }
    return { valido: true, mensaje: "" };
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    
    // Validaciones
    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual");
      return;
    }
    
    if (!newPassword) {
      setError("Debes ingresar una nueva contraseña");
      return;
    }
    
    // Validar contraseña segura
    const validacion = validarPasswordSegura(newPassword);
    if (!validacion.valido) {
      setError(validacion.mensaje);
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
      setSuccess("Contraseña actualizada correctamente");
      setTimeout(() => setSuccess(""), 3000);
      
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

            {/* Nombre - Editable */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre completo</label>
              {editMode ? (
                <input
                  className={styles.input}
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
              ) : (
                <input
                  className={`${styles.input} ${styles.readonly}`}
                  type="text"
                  value={nombreUsuario}
                  readOnly
                  disabled
                />
              )}
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

            {/* Teléfono - Editable */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              {editMode ? (
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="3101234567"
                  value={editTelefono}
                  onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 10) {
                      setEditTelefono(valor);
                    }
                  }}
                  maxLength={10}
                />
              ) : (
                <input
                  className={`${styles.input} ${styles.readonly}`}
                  type="tel"
                  value={telefono || "No especificado"}
                  readOnly
                  disabled
                />
              )}
              <small className={styles.helperText}>10 dígitos, solo números</small>
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

            {/* Botones de edición */}
            <div className={styles.editActions}>
              {editMode ? (
                <>
                  <button 
                    className={styles.btnSave} 
                    onClick={handleActualizarPerfil}
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button 
                    className={styles.btnCancel} 
                    onClick={() => {
                      setEditMode(false);
                      setEditNombre(nombreUsuario);
                      setEditTelefono(telefono);
                      setError("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  className={styles.btnEdit} 
                  onClick={() => setEditMode(true)}
                >
                  Editar perfil
                </button>
              )}
            </div>

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
                <small className={styles.helperText}>
                  Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
                </small>
              </div>

              {/* Requisitos de contraseña en tiempo real */}
              {newPassword && (
                <div className={styles.passwordReqs}>
                  <small className={newPassword.length >= 8 ? styles.reqMet : styles.reqUnmet}>
                    {newPassword.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                  </small>
                  <small className={/[A-Z]/.test(newPassword) ? styles.reqMet : styles.reqUnmet}>
                    {/[A-Z]/.test(newPassword) ? "✓" : "○"} Una mayúscula
                  </small>
                  <small className={/[a-z]/.test(newPassword) ? styles.reqMet : styles.reqUnmet}>
                    {/[a-z]/.test(newPassword) ? "✓" : "○"} Una minúscula
                  </small>
                  <small className={/\d/.test(newPassword) ? styles.reqMet : styles.reqUnmet}>
                    {/\d/.test(newPassword) ? "✓" : "○"} Un número
                  </small>
                  <small className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? styles.reqMet : styles.reqUnmet}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "✓" : "○"} Un carácter especial
                  </small>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmar nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <small className={styles.errorText}>Las contraseñas no coinciden</small>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword && (
                  <small className={styles.successText}>✓ Las contraseñas coinciden</small>
                )}
              </div>

              <button 
                className={styles.btnChangePassword} 
                onClick={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✓</span>
                <span>{success}</span>
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
        </div>

      </div>
    </main>
  );
}