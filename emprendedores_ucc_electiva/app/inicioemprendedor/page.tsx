"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "../css/inicioemprendedor/page.module.css";

const emprendimiento = {
  nombre: "EcoTech Soluciones",
  categoria: "Tecnología",
  descripcion: "Apps móviles y soluciones digitales para pequeños negocios locales.",
  estado: "activo",
  emoji: "💻",
  fechaCreacion: "12 Mar 2025",
};

const stats = [
  { icon: "👁️", label: "Visitas este mes", value: "1.240", change: "+18%", up: true },
  { icon: "📦", label: "Productos activos", value: "4",     change: "+1",   up: true },
  { icon: "⭐", label: "Valoración",         value: "4.8",  change: "de 5", up: true },
  { icon: "🛒", label: "Consultas recibidas",value: "32",   change: "+5%",  up: true },
];

const productos = [
  { id: 1, nombre: "Mouse Gamer", precio: 80000, stock: 15, imagen: "🖱️", estado: "activo" },
  { id: 2, nombre: "Teclado Mecánico", precio: 150000, stock: 10, imagen: "⌨️", estado: "activo" },
  { id: 3, nombre: "Audífonos Bluetooth", precio: 120000, stock: 5, imagen: "🎧", estado: "pausado" },
  { id: 4, nombre: "Webcam HD", precio: 95000, stock: 8, imagen: "📷", estado: "activo" },
];

const navItems = [
  { icon: "🏠", label: "Dashboard",      id: "dashboard" },
  { icon: "📊", label: "Mi emprendimiento", id: "emprendimiento" },
  { icon: "📦", label: "Productos",      id: "productos" },
  { icon: "⚙️", label: "Configuración", id: "config" },
];

export default function DashboardPage() {
  const [seccion, setSeccion]       = useState("dashboard");
  const [estadoEmp, setEstadoEmp]   = useState(emprendimiento.estado);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.wrapper}>

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBg} aria-hidden />

        <Link href="/" className={styles.sidebarLogo}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill="rgba(255,255,255,0.12)"/>
            <rect x="4" y="4" width="9" height="17" rx="2.5" fill="#fff"/>
            <rect x="4" y="15" width="9" height="5" rx="2" fill="rgba(255,255,255,0.5)"/>
            <rect x="15" y="4" width="9" height="17" rx="2.5" fill="#8DC63F"/>
            <circle cx="28" cy="8" r="4" fill="none" stroke="#8DC63F" strokeWidth="1.8"/>
            <circle cx="28" cy="8" r="1.5" fill="#fff"/>
          </svg>
          <span className={styles.sidebarLogoText}>EmprendedoresUCC</span>
        </Link>

        {/* Perfil */}
        <div className={styles.sidebarProfile}>
          <div className={styles.sidebarAvatar}>C</div>
          <div className={styles.sidebarProfileInfo}>
            <span className={styles.sidebarProfileName}>Carlos Muñoz</span>
            <span className={styles.sidebarProfileRole}>Emprendedor · Sem. 7°</span>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${seccion === item.id ? styles.navItemActive : ""}`}
              onClick={() => { setSeccion(item.id); setSidebarOpen(false); }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <Link href="/" className={styles.sidebarLogout}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M13 15l4-5-4-5M17 10H7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" strokeLinecap="round"/>
          </svg>
          Cerrar sesión
        </Link>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className={styles.main}>

        {/* Topbar */}
        <div className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <div className={styles.topbarTitle}>
            {navItems.find((n) => n.id === seccion)?.label}
          </div>
          <Link href="/miemprendimiento" className={styles.topbarCta}>
            + Nuevo emprendimiento
          </Link>
        </div>

        {/* ══ DASHBOARD ══ */}
        {seccion === "dashboard" && (
          <div className={styles.content}>
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>¡Hola, Carlos! 👋</h1>
                <p className={styles.welcomeDesc}>Aquí tienes el resumen de tu emprendimiento.</p>
              </div>
              <span className={`${styles.estadoBadge} ${estadoEmp === "activo" ? styles.estadoActivo : styles.estadoPausado}`}>
                ● {estadoEmp}
              </span>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
              {stats.map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statIcon}>{s.icon}</span>
                    <span className={`${styles.statChange} ${s.up ? styles.statUp : styles.statDown}`}>
                      {s.change}
                    </span>
                  </div>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Resumen emprendimiento */}
            <div className={styles.empCard}>
              <div className={styles.empCardLeft}>
                <div className={styles.empEmoji}>{emprendimiento.emoji}</div>
                <div>
                  <h2 className={styles.empNombre}>{emprendimiento.nombre}</h2>
                  <p className={styles.empDesc}>{emprendimiento.descripcion}</p>
                  <div className={styles.empMeta}>
                    <span className={styles.empCat}>{emprendimiento.categoria}</span>
                    <span className={styles.empFecha}>Desde {emprendimiento.fechaCreacion}</span>
                  </div>
                </div>
              </div>
              <div className={styles.empActions}>
                <button className={styles.btnEditar} onClick={() => setSeccion("emprendimiento")}>
                  ✏️ Editar
                </button>
                <button
                  className={`${styles.btnEstado} ${estadoEmp === "activo" ? styles.btnPausar : styles.btnActivar}`}
                  onClick={() => setEstadoEmp(estadoEmp === "activo" ? "pausado" : "activo")}
                >
                  {estadoEmp === "activo" ? "⏸ Pausar" : "▶ Activar"}
                </button>
              </div>
            </div>

            {/* Productos recientes */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Productos recientes</h3>
                <button className={styles.sectionLink} onClick={() => setSeccion("productos")}>
                  Ver todos →
                </button>
              </div>
              <div className={styles.prodGrid}>
                {productos.slice(0, 3).map((p) => (
                  <div key={p.id} className={styles.prodCard}>
                    <span className={styles.prodEmoji}>{p.imagen}</span>
                    <div className={styles.prodInfo}>
                      <span className={styles.prodNombre}>{p.nombre}</span>
                      <span className={styles.prodPrecio}>${p.precio.toLocaleString("es-CO")}</span>
                    </div>
                    <span className={`${styles.prodEstado} ${p.estado === "activo" ? styles.prodActivo : styles.prodPausado}`}>
                      {p.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ EMPRENDIMIENTO ══ */}
        {seccion === "emprendimiento" && (
          <div className={styles.content}>
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>Mi emprendimiento</h1>
                <p className={styles.welcomeDesc}>Gestiona la información de tu proyecto.</p>
              </div>
            </div>
            <div className={styles.editCard}>
              <div className={styles.editEmoji}>{emprendimiento.emoji}</div>
              <div className={styles.editFields}>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Nombre</label>
                  <div className={styles.editValue}>{emprendimiento.nombre}</div>
                </div>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Categoría</label>
                  <div className={styles.editValue}>{emprendimiento.categoria}</div>
                </div>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Estado</label>
                  <div className={styles.editValue}>
                    <span className={`${styles.estadoBadge} ${estadoEmp === "activo" ? styles.estadoActivo : styles.estadoPausado}`}>
                      ● {estadoEmp}
                    </span>
                  </div>
                </div>
                <div className={styles.editField} style={{gridColumn: "1 / -1"}}>
                  <label className={styles.editLabel}>Descripción</label>
                  <div className={styles.editValue}>{emprendimiento.descripcion}</div>
                </div>
              </div>
              <div className={styles.editActions}>
                <Link href="/miemprendimiento" className={styles.btnEditar}>
                  ✏️ Editar emprendimiento
                </Link>
                <button
                  className={`${styles.btnEstado} ${estadoEmp === "activo" ? styles.btnPausar : styles.btnActivar}`}
                  onClick={() => setEstadoEmp(estadoEmp === "activo" ? "pausado" : "activo")}
                >
                  {estadoEmp === "activo" ? "⏸ Pausar emprendimiento" : "▶ Activar emprendimiento"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ PRODUCTOS ══ */}
        {seccion === "productos" && (
          <div className={styles.content}>
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>Mis productos</h1>
                <p className={styles.welcomeDesc}>{productos.length} productos en tu catálogo.</p>
              </div>
              <Link href="/miemprendimiento" className={styles.topbarCta}>
                + Agregar producto
              </Link>
            </div>

            <div className={styles.prodTable}>
              <div className={styles.prodTableHead}>
                <span>Producto</span>
                <span>Precio</span>
                <span>Stock</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {productos.map((p) => (
                <div key={p.id} className={styles.prodTableRow}>
                  <div className={styles.prodTableName}>
                    <span className={styles.prodTableEmoji}>{p.imagen}</span>
                    <span>{p.nombre}</span>
                  </div>
                  <span className={styles.prodTablePrecio}>
                    ${p.precio.toLocaleString("es-CO")}
                  </span>
                  <span className={styles.prodTableStock}>{p.stock} uds.</span>
                  <span className={`${styles.prodEstado} ${p.estado === "activo" ? styles.prodActivo : styles.prodPausado}`}>
                    {p.estado}
                  </span>
                  <div className={styles.prodTableActions}>
                    <button className={styles.prodBtnEdit}>✏️</button>
                    <button className={styles.prodBtnDel}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CONFIGURACIÓN ══ */}
        {seccion === "config" && (
          <div className={styles.content}>
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>Configuración</h1>
                <p className={styles.welcomeDesc}>Gestiona tu cuenta y preferencias.</p>
              </div>
            </div>
            <div className={styles.configCard}>
              <div className={styles.configAvatar}>C</div>
              <div className={styles.configFields}>
                {[
                  { label: "Nombre", value: "Carlos Muñoz" },
                  { label: "Apellido", value: "Muñoz García" },
                  { label: "Correo", value: "carlos.munoz@campusucc.edu.co" },
                  { label: "Teléfono", value: "300 000 0000" },
                  { label: "Facultad", value: "Ingeniería de Sistemas" },
                  { label: "Semestre", value: "7°" },
                ].map((f) => (
                  <div key={f.label} className={styles.configField}>
                    <label className={styles.editLabel}>{f.label}</label>
                    <div className={styles.editValue}>{f.value}</div>
                  </div>
                ))}
              </div>
              <button className={styles.btnEditar} style={{alignSelf: "flex-start"}}>
                ✏️ Editar perfil
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}