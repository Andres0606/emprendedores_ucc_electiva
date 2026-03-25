"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/inicioestudiante/inicioestudiante.module.css";
import Link from "next/link";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre?: string;
  usuarioId: string;
  estado: string;
  telefono?: string;
  imagenes?: string[];
  productos?: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
}

interface SeguimientoConFecha {
  id: string;
  emprendimientoId: string;
  fecha: string;
  emprendimiento?: Emprendimiento;
}

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
  const [ultimoEmprendimiento, setUltimoEmprendimiento] = useState<Emprendimiento | null>(null);
  const [loadingUltimo, setLoadingUltimo] = useState(true);
  const [totalSeguidos, setTotalSeguidos] = useState(0);

  // Obtener el último emprendimiento seguido
  const obtenerUltimoSeguido = async (usuarioId: string) => {
    try {
      // Primero obtenemos los seguimientos con fecha
      const res = await fetch(`http://localhost:8080/api/seguimientos/usuario/${usuarioId}`);
      
      if (!res.ok) {
        console.log("⚠️ Error al obtener seguimientos");
        return null;
      }
      
      const seguimientos: SeguimientoConFecha[] = await res.json();
      
      if (seguimientos.length === 0) {
        return null;
      }
      
      // Ordenar por fecha (más reciente primero)
      const seguimientosOrdenados = [...seguimientos].sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      const ultimoSeguimiento = seguimientosOrdenados[0];
      setTotalSeguidos(seguimientos.length);
      
      // Obtener los detalles del emprendimiento
      const resEmp = await fetch(`http://localhost:8080/api/emprendimientos/${ultimoSeguimiento.emprendimientoId}`);
      
      if (!resEmp.ok) {
        return null;
      }
      
      const emprendimiento = await resEmp.json();
      
      // Obtener categoría
      const resCat = await fetch(`http://localhost:8080/api/categorias/${emprendimiento.categoriaId}`);
      let categoriaNombre = "Sin categoría";
      if (resCat.ok) {
        const categoria = await resCat.json();
        categoriaNombre = categoria.nombre;
      }
      
      return {
        ...emprendimiento,
        categoriaNombre
      };
      
    } catch (error) {
      console.error("Error al obtener último seguido:", error);
      return null;
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      // Obtener datos del sessionStorage
      const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
      const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
      const usuarioId = sessionStorage.getItem("usuarioId");
      const usuarioGuardado = sessionStorage.getItem("usuario");
      
      console.log("📝 Datos de sesión:");
      console.log("  - Tipo usuario:", tipo);
      console.log("  - Nombre guardado:", nombre);
      console.log("  - Usuario ID:", usuarioId);
      
      // Si el nombre no está completo (solo nombre sin apellido), intentar obtener del objeto usuario
      let nombreCompleto = nombre;
      if (usuarioGuardado && (!nombre || nombre === "Usuario" || nombre.split(" ").length === 1)) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          if (usuario.nombre && usuario.apellido) {
            nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
            // Actualizar sessionStorage con el nombre completo
            sessionStorage.setItem("nombreUsuario", nombreCompleto);
            console.log("✅ Nombre completo obtenido del usuario:", nombreCompleto);
          } else if (usuario.nombre) {
            nombreCompleto = usuario.nombre;
          }
        } catch (e) {
          console.error("Error al parsear usuario:", e);
        }
      }
      
      setTipoUsuario(tipo.toLowerCase());
      setNombreUsuario(nombreCompleto);
      
      if (usuarioId && tipo.toLowerCase() === "estudiante") {
        const ultimo = await obtenerUltimoSeguido(usuarioId);
        setUltimoEmprendimiento(ultimo);
      }
      
      setLoadingUltimo(false);
    };
    
    cargarDatos();
  }, []);

  const esEstudiante = tipoUsuario === "estudiante";

  // Stats dinámicos
  const stats = esEstudiante
    ? [
        { value: totalSeguidos.toString(), label: "Emprendimientos seguidos" },
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
            <Link href="/" className={styles.btnSecondary}>
              ← Inicio
            </Link>
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
                  {esEstudiante ? "Último emprendimiento seguido" : "Programa destacado"}
                </p>
                {loadingUltimo ? (
                  <div className={styles.loadingText}>Cargando...</div>
                ) : ultimoEmprendimiento ? (
                  <>
                    <p className={styles.empName}>{ultimoEmprendimiento.nombre}</p>
                    <p className={styles.empDesc}>
                      {ultimoEmprendimiento.descripcion?.substring(0, 100) || "Sin descripción"}
                      {ultimoEmprendimiento.descripcion?.length > 100 ? "..." : ""}
                    </p>
                    {ultimoEmprendimiento.categoriaNombre && (
                      <p className={styles.empCat}>
                        <span className={styles.catBadge}>{ultimoEmprendimiento.categoriaNombre}</span>
                      </p>
                    )}
                    <Link href={`/emprendimientos/${ultimoEmprendimiento.id || ultimoEmprendimiento._id}`} className={styles.btnLink}>
                      Ver más →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className={styles.empName}>No sigues ningún emprendimiento</p>
                    <p className={styles.empDesc}>
                      Explora emprendimientos y dale click en "Seguir" para verlos aquí.
                    </p>
                    <Link href="/emprendimientos" className={styles.btnLink}>
                      Explorar emprendimientos →
                    </Link>
                  </>
                )}
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