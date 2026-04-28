"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/configuracion.module.css";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";
import { useRouter } from "next/navigation";

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipoUsuario: string;
  carrera?: string;
}

function iniciales(nombre: string, apellido: string) {
  return `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
}

export default function ConfiguracionPage() {
  const router = useRouter();

  const [usuario,   setUsuario]   = useState<Usuario | null>(null);
  const [loading,   setLoading]   = useState(true);

  // Perfil
  const [nombre,    setNombre]    = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [savedPerfil, setSavedPerfil] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  // Contraseña
  const [passActual,   setPassActual]   = useState("");
  const [passNueva,    setPassNueva]    = useState("");
  const [passConfirm,  setPassConfirm]  = useState("");
  const [savedPass,    setSavedPass]    = useState(false);
  const [guardandoPass,setGuardandoPass]= useState(false);
  const [errorPass,    setErrorPass]    = useState<string | null>(null);

  // Eliminar cuenta
  const [modalEliminar, setModalEliminar] = useState(false);
  const [confirmText,   setConfirmText]   = useState("");
  const [eliminando,    setEliminando]    = useState(false);

  useEffect(() => {
    const guardado = sessionStorage.getItem("usuario");
    if (!guardado) { router.push("/autenticacion/login"); return; }
    const u: Usuario = JSON.parse(guardado);
    setUsuario(u);
    setNombre(u.nombre || "");
    setTelefono(u.telefono || "");
    setLoading(false);
  }, []);

  // ── Guardar perfil ────────────────────────────
  async function guardarPerfil() {
    if (!nombre.trim()) { setErrorPerfil("El nombre no puede estar vacío."); return; }
    if (telefono && !/^\d{7,15}$/.test(telefono.replace(/\s/g, ""))) {
      setErrorPerfil("Ingresa un teléfono válido (solo dígitos, 7-15 caracteres)."); return;
    }
    setGuardandoPerfil(true);
    setErrorPerfil(null);
    try {
      const uid = usuario?.id || usuario?._id;
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), telefono: telefono.trim() }),
      });
      if (!res.ok) throw new Error("No se pudo guardar.");
      const actualizado: Usuario = await res.json();
      setUsuario(actualizado);
      sessionStorage.setItem("usuario", JSON.stringify(actualizado));
      setSavedPerfil(true);
      setTimeout(() => setSavedPerfil(false), 2500);
    } catch (e: any) {
      setErrorPerfil(e.message || "Error al guardar.");
    } finally {
      setGuardandoPerfil(false);
    }
  }

  // ── Cambiar contraseña ────────────────────────
  async function cambiarContrasena() {
    setErrorPass(null);
    if (!passActual)                     { setErrorPass("Ingresa tu contraseña actual."); return; }
    if (passNueva.length < 8)            { setErrorPass("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    if (!/[A-Z]/.test(passNueva))        { setErrorPass("Debe tener al menos una mayúscula."); return; }
    if (!/[a-z]/.test(passNueva))        { setErrorPass("Debe tener al menos una minúscula."); return; }
    if (!/[0-9]/.test(passNueva))        { setErrorPass("Debe tener al menos un número."); return; }
    if (passNueva !== passConfirm)        { setErrorPass("Las contraseñas no coinciden."); return; }

    setGuardandoPass(true);
    try {
      const uid = usuario?.id || usuario?._id;
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${uid}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasenaActual: passActual, contrasenaNueva: passNueva }),
      });
      if (!res.ok) throw new Error("Contraseña actual incorrecta.");
      setPassActual(""); setPassNueva(""); setPassConfirm("");
      setSavedPass(true);
      setTimeout(() => setSavedPass(false), 2500);
    } catch (e: any) {
      setErrorPass(e.message || "Error al cambiar contraseña.");
    } finally {
      setGuardandoPass(false);
    }
  }

  // ── Eliminar cuenta ───────────────────────────
  async function eliminarCuenta() {
    setEliminando(true);
    try {
      const uid = usuario?.id || usuario?._id;
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${uid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la cuenta.");
      sessionStorage.clear();
      router.push("/");
    } catch (e: any) {
      alert(e.message || "Error al eliminar la cuenta.");
    } finally {
      setEliminando(false);
    }
  }

  // ── Validador visual contraseña ───────────────
  const passReqs = [
    { ok: passNueva.length >= 8,        txt: "Mínimo 8 caracteres" },
    { ok: /[A-Z]/.test(passNueva),      txt: "Una mayúscula"       },
    { ok: /[a-z]/.test(passNueva),      txt: "Una minúscula"       },
    { ok: /[0-9]/.test(passNueva),      txt: "Un número"           },
    { ok: passNueva === passConfirm && passNueva !== "", txt: "Las contraseñas coinciden" },
  ];

  if (loading) return (
    <main className={styles.main}>
      <div className={styles.centered}><div className={styles.spinner} /></div>
    </main>
  );

  return (
    <main className={styles.main}>

      {/* ── Hero ── */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Configuración</span>
          <h1 className={styles.heroTitle}>
            Hola, <span className={styles.heroName}>{usuario?.nombre}</span>
          </h1>
          <p className={styles.heroSub}>Gestiona tu cuenta, contraseña y preferencias personales.</p>
          <div className={styles.heroActions}>
            <Link href="/inicioemprendedor" className={styles.btnSecondary}>← Panel principal</Link>
          </div>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </section>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Avatar + resumen */}
        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            {usuario ? iniciales(usuario.nombre, usuario.apellido) : "?"}
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileNombre}>{usuario?.nombre} {usuario?.apellido}</p>
            <span className={styles.profileBadge}>Emprendedor UCC</span>
            {usuario?.carrera && <p className={styles.profileCarrera}>{usuario.carrera}</p>}
          </div>
        </div>

        {/* ── Datos de la cuenta ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Datos de la cuenta</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre completo</label>
              <input
                className={styles.formInput}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Correo institucional</label>
              <input className={`${styles.formInput} ${styles.formInputDisabled}`} value={usuario?.correo || ""} disabled />
              <p className={styles.formHelper}>El correo no se puede modificar.</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Teléfono</label>
              <input
                className={styles.formInput}
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Ej: 3112219741"
                maxLength={15}
              />
              <p className={styles.formHelper}>10 dígitos, solo números.</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Carrera / Programa</label>
              <input className={`${styles.formInput} ${styles.formInputDisabled}`} value={usuario?.carrera || "—"} disabled />
              <p className={styles.formHelper}>La carrera no se puede modificar.</p>
            </div>
          </div>

          {errorPerfil && <div className={styles.errorBanner}>{errorPerfil}</div>}
          {savedPerfil && <div className={styles.successBanner}>Perfil actualizado correctamente.</div>}

          <div className={styles.cardFooter}>
            <button className={styles.btnPrimary} onClick={guardarPerfil} disabled={guardandoPerfil}>
              {guardandoPerfil ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </section>

        {/* ── Cambiar contraseña ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Cambiar contraseña</h2>

          <div className={styles.formCol}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña actual</label>
              <input
                className={styles.formInput}
                type="password"
                value={passActual}
                onChange={e => setPassActual(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nueva contraseña</label>
              <input
                className={styles.formInput}
                type="password"
                value={passNueva}
                onChange={e => setPassNueva(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirmar nueva contraseña</label>
              <input
                className={styles.formInput}
                type="password"
                value={passConfirm}
                onChange={e => setPassConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Requisitos visuales */}
          {passNueva && (
            <div className={styles.passReqs}>
              {passReqs.map((r, i) => (
                <span key={i} className={`${styles.passReq} ${r.ok ? styles.passReqOk : ""}`}>
                  {r.ok ? "✓" : "○"} {r.txt}
                </span>
              ))}
            </div>
          )}

          {errorPass  && <div className={styles.errorBanner}>{errorPass}</div>}
          {savedPass  && <div className={styles.successBanner}>Contraseña actualizada correctamente.</div>}

          <div className={styles.cardFooter}>
            <button className={styles.btnPrimary} onClick={cambiarContrasena} disabled={guardandoPass}>
              {guardandoPass ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </div>
        </section>

        {/* ── Zona de peligro ── */}
        <section className={styles.dangerCard}>
          <h2 className={styles.dangerTitle}>Zona de peligro</h2>
          <p className={styles.dangerDesc}>
            Eliminar tu cuenta es irreversible. Perderás todos tus datos y emprendimientos.
          </p>
          <button className={styles.btnDanger} onClick={() => setModalEliminar(true)}>
            Eliminar cuenta
          </button>
        </section>

      </div>

      {/* ── Modal eliminar ── */}
      {modalEliminar && (
        <div className={styles.overlay} onClick={() => setModalEliminar(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Eliminar cuenta</h2>
              <button className={styles.modalClose} onClick={() => setModalEliminar(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalTexto}>
                Esta acción eliminará permanentemente tu cuenta, todos tus emprendimientos y productos. <strong>No se puede deshacer.</strong>
              </p>
              <p className={styles.modalTexto}>
                Escribe <strong>ELIMINAR</strong> para confirmar:
              </p>
              <input
                className={styles.formInput}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => { setModalEliminar(false); setConfirmText(""); }}>
                Cancelar
              </button>
              <button
                className={styles.btnDangerConfirm}
                onClick={eliminarCuenta}
                disabled={confirmText !== "ELIMINAR" || eliminando}
              >
                {eliminando ? "Eliminando..." : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}