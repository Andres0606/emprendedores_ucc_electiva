"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/inicioestudiante/inicioestudiante.module.css";
import Link from "next/link";

const recentActivity = [
  { id: 1, title: "Emprendimiento seguido", desc: "BioLab UCC — hace 2 días", icon: "🔔" },
  { id: 2, title: "Producto visitado", desc: "EcoMochila Reciclada — hace 4 días", icon: "👁️" },
  { id: 3, title: "Perfil actualizado", desc: "Foto y descripción — hace 1 semana", icon: "✏️" },
];

const quickLinks = [
  { href: "/inicioestudiante/miperfil", label: "Mi Perfil", icon: "👤", bg: "#e8f0fe", color: "#1565c0" },
  { href: "/inicioestudiante/seguidos", label: "Seguidos", icon: "🔖", bg: "#e8f5e9", color: "#2e7d32" },
  { href: "/inicioestudiante/configuracion", label: "Configuración", icon: "⚙️", bg: "#fce4ec", color: "#c62828" },
];

export default function InicioEstudiantePage() {
  const [activeTab, setActiveTab] = useState("resumen");
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
    const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
    setTipoUsuario(tipo.toLowerCase());
    setNombreUsuario(nombre);
  }, []);

  const esEstudiante = tipoUsuario === "estudiante";

  // Stats según el tipo de usuario
  const stats = esEstudiante
    ? [
        { value: "4", label: "Emprendimientos seguidos" },
        { value: "18", label: "Productos explorados" },
        { value: "3", label: "Facultades descubiertas" },
      ]
    : [
        { value: "12", label: "Emprendimientos activos" },
        { value: "45", label: "Estudiantes registrados" },
        { value: "8", label: "Facultades participantes" },
      ];

  return (
    <main className={styles.main}>

      {/* Hero */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>👋 Bienvenido de nuevo</span>
          <h1 className={styles.heroTitle}>
            Hola, <span className={styles.heroName}>{nombreUsuario}</span>
          </h1>
          <p className={styles.heroSub}>
            {esEstudiante
              ? "Descubre emprendimientos, sigue los que te inspiran y gestiona tu perfil."
              : "Apoya y gestiona los emprendimientos estudiantiles, conecta con la comunidad UCC."}
          </p>
          <div className={styles.heroActions}>
            <Link href="/emprendimientos" className={styles.btnPrimary}>
              Explorar emprendimientos →
            </Link>
          </div>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsBar}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Body */}
      <div className={styles.body}>

        {/* Quick Nav */}
        <nav className={styles.quickNav}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.quickCard}>
              <span className={styles.quickIcon} style={{ background: link.bg, color: link.color }}>
                {link.icon}
              </span>
              <span className={styles.quickLabel}>{link.label}</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
          ))}
        </nav>

        {/* Tabs */}
        <div className={styles.tabs}>
          {["resumen", "actividad"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "resumen" && (
          <div className={styles.tabContent}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>
                  {esEstudiante ? "Emprendimiento destacado" : "Programa destacado"}
                </p>
                <p className={styles.empName}>BioLab UCC</p>
                <p className={styles.empDesc}>
                  {esEstudiante
                    ? "Laboratorio de biotecnología estudiantil — Facultad de Ciencias."
                    : "Iniciativa estudiantil de biotecnología con gran impacto en la comunidad."}
                </p>
                <Link href="/emprendimiento/biolab-ucc" className={styles.btnLink}>Ver más →</Link>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Completar mi perfil</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: "70%" }} />
                </div>
                <p className={styles.progressText}>70% completado</p>
                <Link href="/inicioestudiante/miperfil" className={styles.btnLink}>Completar →</Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "actividad" && (
          <div className={styles.tabContent}>
            <ul className={styles.activityList}>
              {recentActivity.map((a) => (
                <li key={a.id} className={styles.activityItem}>
                  <span className={styles.activityIcon}>{a.icon}</span>
                  <div>
                    <p className={styles.activityTitle}>{a.title}</p>
                    <p className={styles.activityDesc}>{a.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}