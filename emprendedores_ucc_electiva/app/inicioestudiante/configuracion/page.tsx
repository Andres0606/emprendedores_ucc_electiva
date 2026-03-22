"use client";

import React, { useState } from "react";
import styles from "../../css/inicioestudiante/configuracion.module.css";
import Link from "next/link";


type Section = "cuenta" | "notificaciones" | "privacidad";

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState<Section>("cuenta");
  const [email, setEmail]               = useState("valentina.gomez@ucc.edu.co");
  const [notifNuevos, setNotifNuevos]   = useState(true);
  const [notifSeguidos, setNotifSeguidos] = useState(false);
  const [notifMensajes, setNotifMensajes] = useState(true);
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [saved, setSaved]               = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "cuenta",         label: "Cuenta",         icon: "👤" },
    { key: "notificaciones", label: "Notificaciones", icon: "🔔" },
    { key: "privacidad",     label: "Privacidad",     icon: "🔒" },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>
        <h1 className={styles.title}>Configuración</h1>

        <div className={styles.layout}>

          {/* Sidebar */}
          <nav className={styles.sidebar}>
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`${styles.navItem} ${activeSection === item.key ? styles.navActive : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className={styles.content}>

            {activeSection === "cuenta" && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Datos de la cuenta</h2>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre completo</label>
                  <input className={styles.input} type="text" defaultValue="Valentina Gómez" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Correo institucional</label>
                  <input className={styles.input} type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Facultad</label>
                  <select className={styles.input}>
                    <option>Ingeniería Industrial</option>
                    <option>Derecho</option>
                    <option>Psicología</option>
                    <option>Contaduría Pública</option>
                    <option>Medicina Veterinaria</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nueva contraseña</label>
                  <input className={styles.input} type="password" placeholder="••••••••" />
                </div>
                <div className={styles.danger}>
                  <h3 className={styles.dangerTitle}>Zona de peligro</h3>
                  <p className={styles.dangerDesc}>
                    Eliminar tu cuenta es irreversible. Perderás todos tus datos.
                  </p>
                  <button className={styles.btnDanger}>Eliminar cuenta</button>
                </div>
              </section>
            )}

            {activeSection === "notificaciones" && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Preferencias de notificación</h2>
                {[
                  { label: "Nuevos emprendimientos publicados",      val: notifNuevos,   set: setNotifNuevos   },
                  { label: "Actividad de emprendimientos seguidos",  val: notifSeguidos, set: setNotifSeguidos },
                  { label: "Mensajes y comentarios",                 val: notifMensajes, set: setNotifMensajes },
                ].map(({ label, val, set }) => (
                  <div key={label} className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>{label}</span>
                    <button
                      className={`${styles.toggle} ${val ? styles.toggleOn : ""}`}
                      onClick={() => set(!val)}
                      aria-pressed={val}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                ))}
              </section>
            )}

            {activeSection === "privacidad" && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Privacidad</h2>
                <div className={styles.toggleRow}>
                  <div>
                    <p className={styles.toggleLabel}>Perfil público</p>
                    <p className={styles.toggleSub}>
                      Otros estudiantes podrán ver tu perfil.
                    </p>
                  </div>
                  <button
                    className={`${styles.toggle} ${perfilPublico ? styles.toggleOn : ""}`}
                    onClick={() => setPerfilPublico(!perfilPublico)}
                    aria-pressed={perfilPublico}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
                <div className={styles.infoBox}>
                  <p>🔒 Tu información académica nunca se comparte fuera de EmprendedoresUCC.</p>
                </div>
              </section>
            )}

            <div className={styles.saveRow}>
              <button className={styles.btnSave} onClick={handleSave}>
                {saved ? "✓ Guardado" : "Guardar cambios"}
              </button>
              {saved && <span className={styles.savedMsg}>Cambios aplicados correctamente.</span>}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}