"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/emprendimientos/page.module.css";

const categorias = [
  "Todas", "Tecnología", "Gastronomía", "Moda y Diseño",
  "Salud y Bienestar", "Arte y Cultura", "Servicios",
];

const emprendimientos = [
  {
    id: 1,
    name: "EcoTech Soluciones",
    category: "Tecnología",
    description: "Apps móviles y soluciones digitales para pequeños negocios locales.",
    emoji: "💻",
    author: "Carlos Muñoz",
    semester: "7°",
    estado: "activo",
    precio: 150000,
    precioLabel: "Desde $150.000",
    productos: 4,
  },
  {
    id: 2,
    name: "Sabor Costeño",
    category: "Gastronomía",
    description: "Comida tradicional costeña con entrega a domicilio en Villavicencio.",
    emoji: "🍽️",
    author: "Daniela Herrera",
    semester: "5°",
    estado: "activo",
    precio: 12000,
    precioLabel: "Desde $12.000",
    productos: 8,
  },
  {
    id: 3,
    name: "Studio Hilo",
    category: "Moda y Diseño",
    description: "Ropa sostenible y accesorios hechos a mano con telas recicladas.",
    emoji: "🧵",
    author: "Valentina Ríos",
    semester: "8°",
    estado: "activo",
    precio: 45000,
    precioLabel: "Desde $45.000",
    productos: 12,
  },
  {
    id: 4,
    name: "MindBalance",
    category: "Salud y Bienestar",
    description: "Sesiones de meditación guiada y coaching de bienestar personal.",
    emoji: "🧘",
    author: "Andrés Palacio",
    semester: "6°",
    estado: "activo",
    precio: 30000,
    precioLabel: "Desde $30.000",
    productos: 3,
  },
  {
    id: 5,
    name: "ArteLlano",
    category: "Arte y Cultura",
    description: "Ilustraciones y obras digitales inspiradas en la cultura llanera.",
    emoji: "🎨",
    author: "Juliana Castro",
    semester: "4°",
    estado: "activo",
    precio: 80000,
    precioLabel: "Desde $80.000",
    productos: 6,
  },
  {
    id: 6,
    name: "ServiRápido",
    category: "Servicios",
    description: "Mensajería, diligencias y servicios de asistencia en la ciudad.",
    emoji: "🛠️",
    author: "Miguel Torres",
    semester: "3°",
    estado: "pausado",
    precio: 20000,
    precioLabel: "Desde $20.000",
    productos: 2,
  },
];

const precioRangos = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $20.000", min: 0, max: 20000 },
  { label: "$20.000 – $50.000", min: 20000, max: 50000 },
  { label: "$50.000 – $150.000", min: 50000, max: 150000 },
  { label: "Más de $150.000", min: 150000, max: Infinity },
];

export default function EmprendimientosPage() {
  const [busqueda, setBusqueda]     = useState("");
  const [categoria, setCategoria]   = useState("Todas");
  const [precioIdx, setPrecioIdx]   = useState(0);

  const rango = precioRangos[precioIdx];

  const filtrados = emprendimientos.filter((e) => {
    const matchBusqueda = e.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.description.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.author.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat   = categoria === "Todas" || e.category === categoria;
    const matchPrecio = e.precio >= rango.min && e.precio <= rango.max;
    return matchBusqueda && matchCat && matchPrecio;
  });

  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ── Hero compacto ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              {emprendimientos.length} emprendimientos activos · UCC Villavicencio
            </span>
            <h1 className={styles.heroTitle}>Explora los emprendimientos</h1>
            <p className={styles.heroDesc}>
              Descubre proyectos creados por estudiantes de la Universidad Cooperativa de Colombia.
            </p>
          </div>
        </section>

        {/* ── Filtros + Grid ── */}
        <section className={styles.content}>

          {/* Barra de búsqueda */}
          <div className={styles.searchBar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="6"/>
                <path d="M15 15l3 3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o autor..."
                className={styles.searchInput}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button className={styles.searchClear} onClick={() => setBusqueda("")}>✕</button>
              )}
            </div>
            <span className={styles.resultCount}>
              {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filtros */}
          <div className={styles.filters}>
            {/* Categorías */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Categoría</span>
              <div className={styles.filterPills}>
                {categorias.map((c) => (
                  <button
                    key={c}
                    className={`${styles.filterPill} ${categoria === c ? styles.filterPillActive : ""}`}
                    onClick={() => setCategoria(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Precio</span>
              <div className={styles.filterPills}>
                {precioRangos.map((r, i) => (
                  <button
                    key={r.label}
                    className={`${styles.filterPill} ${precioIdx === i ? styles.filterPillActive : ""}`}
                    onClick={() => setPrecioIdx(i)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          {filtrados.length > 0 ? (
            <div className={styles.grid}>
              {filtrados.map((v) => (
                <div key={v.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardEmoji}>{v.emoji}</div>
                    <div className={styles.cardBadges}>
                      <span className={styles.cardCat}>{v.category}</span>
                      <span className={`${styles.cardEstado} ${v.estado === "activo" ? styles.cardEstadoActivo : styles.cardEstadoPausado}`}>
                        {v.estado}
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.cardName}>{v.name}</h3>
                  <p className={styles.cardDesc}>{v.description}</p>

                  <div className={styles.cardMeta}>
                    <span className={styles.cardMetaItem}>
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="4" width="16" height="13" rx="2"/>
                        <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
                      </svg>
                      {v.productos} productos
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardAuthor}>
                      <span className={styles.cardAvatar}>{v.author.charAt(0)}</span>
                      <div>
                        <p className={styles.cardAuthorName}>{v.author}</p>
                        <p className={styles.cardAuthorSem}>Sem. {v.semester}</p>
                      </div>
                    </div>
                    <span className={styles.cardPrice}>{v.precioLabel}</span>
                  </div>

                  <Link href={`/emprendimientos/${v.id}`} className={styles.cardBtn}>
                    Ver emprendimiento →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyEmoji}>🔍</span>
              <h3 className={styles.emptyTitle}>Sin resultados</h3>
              <p className={styles.emptyDesc}>Intenta con otros filtros o términos de búsqueda.</p>
              <button className={styles.emptyBtn} onClick={() => { setBusqueda(""); setCategoria("Todas"); setPrecioIdx(0); }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}