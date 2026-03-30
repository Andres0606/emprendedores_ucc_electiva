"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/inicioestudiante/inicioestudiante.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: string;
  descripcion: string;
  tipo: string;
  imagen: string;
}

interface Actividad {
  id: string;
  tipo: "seguimiento" | "carrito" | "categoria";
  titulo: string;
  descripcion: string;
  fecha: string;
  icono: string;
}

const quickLinks = [
  { href: "/inicioestudiante/miperfil", label: "Mi Perfil", icon: "👤", bg: "#e8f0fe", color: "#1565c0" },
  { href: "/inicioestudiante/seguidos", label: "Seguidos", icon: "🔖", bg: "#e8f5e9", color: "#2e7d32" },
  { href: "/inicioestudiante/configuracion", label: "Configuración", icon: "⚙️", bg: "#fce4ec", color: "#c62828" },
];

export default function InicioEstudiantePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resumen");
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [ultimoEmprendimiento, setUltimoEmprendimiento] = useState<Emprendimiento | null>(null);
  const [loadingUltimo, setLoadingUltimo] = useState(true);
  const [totalSeguidos, setTotalSeguidos] = useState(0);
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(true);

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      sessionStorage.clear();
      localStorage.removeItem("categoriasInteres");
      localStorage.removeItem("carrito");
      router.push("/");
    }
  };

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Formatear fecha relativa (hace X días)
  const formatearFechaRelativa = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return "hoy";
    if (diffDias === 1) return "ayer";
    if (diffDias <= 7) return `hace ${diffDias} días`;
    return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  // Obtener próximos eventos
  const obtenerProximosEventos = () => {
    const guardados = localStorage.getItem("eventos_ucc");
    if (guardados) {
      try {
        const eventos: Evento[] = JSON.parse(guardados);
        const fechaHoy = getFechaHoy();
        
        const futuros = eventos
          .filter(evento => evento.fecha >= fechaHoy)
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .slice(0, 3);
        
        setProximosEventos(futuros);
      } catch (e) {
        console.error("Error al cargar eventos:", e);
        setProximosEventos([]);
      }
    } else {
      setProximosEventos([]);
    }
  };

  // Obtener actividad del usuario
  const obtenerActividad = async (usuarioId: string) => {
    try {
      const actividadesTemp: Actividad[] = [];
      
      // 1. Obtener seguimientos recientes
      const resSeguimientos = await fetch(`http://localhost:8080/api/seguimientos/usuario/${usuarioId}`);
      if (resSeguimientos.ok) {
        const seguimientos: SeguimientoConFecha[] = await resSeguimientos.json();
        const seguimientosRecientes = seguimientos
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 2);
        
        for (const seg of seguimientosRecientes) {
          const resEmp = await fetch(`http://localhost:8080/api/emprendimientos/${seg.emprendimientoId}`);
          if (resEmp.ok) {
            const emp = await resEmp.json();
            actividadesTemp.push({
              id: `seg-${seg.id}`,
              tipo: "seguimiento",
              titulo: "Emprendimiento seguido",
              descripcion: `Comenzaste a seguir "${emp.nombre}"`,
              fecha: seg.fecha,
              icono: "🔔"
            });
          }
        }
      }
      
      // 2. Obtener productos en el carrito (últimos agregados)
      const carritoGuardado = localStorage.getItem("carrito");
      if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        if (carrito.length > 0) {
          const ultimoProducto = carrito[carrito.length - 1];
          actividadesTemp.push({
            id: `carrito-${Date.now()}`,
            tipo: "carrito",
            titulo: "Producto agregado al carrito",
            descripcion: `Agregaste "${ultimoProducto.nombre}" a tu carrito`,
            fecha: new Date().toISOString(),
            icono: "🛒"
          });
        }
      }
      
      // 3. Obtener categorías de interés
      const categoriasGuardadas = localStorage.getItem("categoriasInteres");
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        if (categorias.length > 0) {
          const categoriaNombres = {
            1: "Gastronomía",
            2: "Moda y Diseño",
            3: "Salud y Bienestar",
            4: "Arte y Cultura",
            5: "Servicios",
            6: "Comida",
            7: "Tecnología"
          };
          const ultimaCategoria = categorias[categorias.length - 1];
          const nombreCategoria = categoriaNombres[ultimaCategoria as keyof typeof categoriaNombres] || "Categoría";
          
          actividadesTemp.push({
            id: `categoria-${Date.now()}`,
            tipo: "categoria",
            titulo: "Categoría de interés agregada",
            descripcion: `Seleccionaste "${nombreCategoria}" como categoría de interés`,
            fecha: new Date().toISOString(),
            icono: "🏷️"
          });
        }
      }
      
      // Ordenar por fecha (más reciente primero)
      actividadesTemp.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setActividades(actividadesTemp.slice(0, 5));
      
    } catch (error) {
      console.error("Error al obtener actividad:", error);
    } finally {
      setLoadingActividades(false);
    }
  };

  // Obtener el último emprendimiento seguido (el más reciente)
  const obtenerUltimoSeguido = async (usuarioId: string) => {
    try {
      console.log("🔍 Buscando seguimientos para usuario:", usuarioId);
      
      // USAR EL MISMO ENDPOINT QUE FUNCIONA EN LA PÁGINA DE SEGUIDOS
      const res = await fetch(`http://localhost:8080/api/seguimientos/usuario/${usuarioId}/emprendimientos`);
      
      if (!res.ok) {
        console.log("⚠️ Error al obtener seguimientos, status:", res.status);
        return null;
      }
      
      const emprendimientos: Emprendimiento[] = await res.json();
      
      console.log("📋 Todos los emprendimientos seguidos:", emprendimientos.map((e, i) => `${i+1}. ${e.nombre}`));
      
      if (emprendimientos.length === 0) {
        console.log("❌ No hay seguimientos");
        setTotalSeguidos(0);
        return null;
      }
      
      setTotalSeguidos(emprendimientos.length);
      
      // TOMAR EL ÚLTIMO EMPRENDIMIENTO (EL MÁS RECIENTE)
      const ultimoEmprendimiento = emprendimientos[emprendimientos.length - 1];
      
      console.log("✅ Último emprendimiento seguido (más reciente):", ultimoEmprendimiento.nombre);
      console.log("📌 Primer emprendimiento seguido (más antiguo) sería:", emprendimientos[0]?.nombre);
      
      // Obtener nombre de categoría
      try {
        const resCat = await fetch(`http://localhost:8080/api/categorias/${ultimoEmprendimiento.categoriaId}`);
        let categoriaNombre = "Sin categoría";
        if (resCat.ok) {
          const categoria = await resCat.json();
          categoriaNombre = categoria.nombre;
        }
        ultimoEmprendimiento.categoriaNombre = categoriaNombre;
      } catch (e) {
        ultimoEmprendimiento.categoriaNombre = "Sin categoría";
      }
      
      return ultimoEmprendimiento;
      
    } catch (error) {
      console.error("Error al obtener seguidos:", error);
      return null;
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
      const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
      const usuarioId = sessionStorage.getItem("usuarioId");
      const usuarioGuardado = sessionStorage.getItem("usuario");
      
      let nombreCompleto = nombre;
      if (usuarioGuardado && (!nombre || nombre === "Usuario" || nombre.split(" ").length === 1)) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          if (usuario.nombre && usuario.apellido) {
            nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
            sessionStorage.setItem("nombreUsuario", nombreCompleto);
          } else if (usuario.nombre) {
            nombreCompleto = usuario.nombre;
          }
        } catch (e) {
          console.error("Error al parsear usuario:", e);
        }
      }
      
      setTipoUsuario(tipo.toLowerCase());
      setNombreUsuario(nombreCompleto);
      
      // Obtener próximos eventos
      obtenerProximosEventos();
      
      if (usuarioId && tipo.toLowerCase() === "estudiante") {
        const ultimo = await obtenerUltimoSeguido(usuarioId);
        setUltimoEmprendimiento(ultimo);
        await obtenerActividad(usuarioId);
      } else {
        setLoadingActividades(false);
      }
      
      setLoadingUltimo(false);
    };
    
    cargarDatos();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      obtenerProximosEventos();
      const usuarioId = sessionStorage.getItem("usuarioId");
      if (usuarioId) {
        obtenerActividad(usuarioId);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const esEstudiante = tipoUsuario === "estudiante";

  // Stats dinámicos - SOLO 1 ITEM (emprendimientos seguidos)
  const stats = esEstudiante
    ? [
        { value: totalSeguidos.toString(), label: "Emprendimientos seguidos", icon: "🔖" },
      ]
    : [
        { value: "12", label: "Emprendimientos activos", icon: "🚀" },
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
            {/* Botón de cerrar sesión */}
            <button onClick={handleCerrarSesion} className={styles.btnLogout}>
              Cerrar sesión
            </button>
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
            <span className={styles.statValue}>
              <span className={styles.statIcon}>{s.icon}</span>
              {s.value}
            </span>
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
              {/* Tarjeta del último emprendimiento seguido */}
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

              {/* Tarjeta de Próximos eventos */}
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Próximos eventos o ferias UCC</p>
                
                {proximosEventos.length === 0 ? (
                  <>
                    <p className={styles.empName}>No hay eventos próximos</p>
                    <p className={styles.empDesc}>
                      Pronto se anunciarán nuevas fechas. ¡Mantente atento!
                    </p>
                    <Link href="/eventos" className={styles.btnLink}>
                      Ver todos los eventos →
                    </Link>
                  </>
                ) : (
                  <div className={styles.eventosLista}>
                    {proximosEventos.map((evento, idx) => (
                      <div key={evento.id} className={styles.eventoItem}>
                        <div className={styles.eventoFecha}>
                          <span className={styles.eventoFechaDia}>
                            {evento.fecha.split("-")[2]}
                          </span>
                          <span className={styles.eventoFechaMes}>
                            {new Date(evento.fecha).toLocaleDateString("es-CO", { month: "short" }).toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.eventoInfo}>
                          <p className={styles.eventoNombre}>{evento.nombre}</p>
                          <p className={styles.eventoDetalle}>
                            <span className={styles.eventoHora}>🕐 {evento.hora}</span>
                            <span className={styles.eventoLugar}>📍 {evento.lugar}</span>
                          </p>
                        </div>
                        {idx < proximosEventos.length - 1 && <div className={styles.eventoDivider} />}
                      </div>
                    ))}
                    <Link href="/eventos" className={styles.btnLink} style={{ marginTop: "12px" }}>
                      Ver todos los eventos →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "actividad" && (
          <div className={styles.tabContent}>
            {loadingActividades ? (
              <div className={styles.loadingText}>Cargando actividad...</div>
            ) : actividades.length === 0 ? (
              <div className={styles.activityPlaceholder}>
                <span className={styles.placeholderIcon}>✨</span>
                <h3 className={styles.placeholderTitle}>Aún no hay actividad</h3>
                <p className={styles.placeholderDesc}>
                  Comienza a seguir emprendimientos o agrega productos al carrito para ver tu actividad.
                </p>
                <Link href="/emprendimientos" className={styles.btnLink} style={{ marginTop: "12px" }}>
                  Explorar emprendimientos →
                </Link>
              </div>
            ) : (
              <ul className={styles.activityList}>
                {actividades.map((act) => (
                  <li key={act.id} className={styles.activityItem}>
                    <span className={styles.activityIcon}>{act.icono}</span>
                    <div>
                      <p className={styles.activityTitle}>{act.titulo}</p>
                      <p className={styles.activityDesc}>{act.descripcion}</p>
                      <p className={styles.activityFecha}>{formatearFechaRelativa(act.fecha)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </main>
  );
}