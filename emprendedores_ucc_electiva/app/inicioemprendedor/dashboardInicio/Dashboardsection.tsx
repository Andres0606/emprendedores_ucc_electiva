"use client";
import styles from "../../css/inicioemprendedor/DashboardSection.module.css";

interface Stat {
  icon: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  estado: "activo" | "pausado";
}

interface DashboardSectionProps {
  estadoEmp: "activo" | "pausado";
  setEstadoEmp: (estado: "activo" | "pausado") => void;
  setSeccion: (id: string) => void;
}

const emprendimiento = {
  nombre: "EcoTech Soluciones",
  categoria: "Tecnología",
  descripcion: "Apps móviles y soluciones digitales para pequeños negocios locales.",
  emoji: "💻",
  fechaCreacion: "12 Mar 2025",
};

const stats: Stat[] = [
  { icon: "👁️", label: "Visitas este mes",   value: "1.240", change: "+18%", up: true },
  { icon: "📦", label: "Productos activos",   value: "4",     change: "+1",   up: true },
  { icon: "⭐", label: "Valoración",          value: "4.8",   change: "de 5", up: true },
  { icon: "🛒", label: "Consultas recibidas", value: "32",    change: "+5%",  up: true },
];

const productos: Producto[] = [
  { id: 1, nombre: "Mouse Gamer",         precio: 80000,  stock: 15, imagen: "🖱️", estado: "activo"  },
  { id: 2, nombre: "Teclado Mecánico",    precio: 150000, stock: 10, imagen: "⌨️", estado: "activo"  },
  { id: 3, nombre: "Audífonos Bluetooth", precio: 120000, stock: 5,  imagen: "🎧", estado: "pausado" },
  { id: 4, nombre: "Webcam HD",           precio: 95000,  stock: 8,  imagen: "📷", estado: "activo"  },
];

export default function DashboardSection({ estadoEmp, setEstadoEmp, setSeccion }: DashboardSectionProps) {
  return (
    <div className={styles.content}>
      {/* Bienvenida */}
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
  );
}