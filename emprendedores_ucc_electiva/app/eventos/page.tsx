"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/eventos/page.module.css";
import Link from "next/link";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { API_URL } from "@/src/config/api";

type Evento = {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: "Presencial" | "Virtual" | "Híbrido";
  descripcion: string;
  tipo: string;
  imagen: string;
};

const TIPOS = ["Todos", "Feria", "Workshop", "Charla", "Bootcamp", "Networking", "Demo Day"];
const MODALIDADES = ["Todos", "Presencial", "Virtual", "Híbrido"];

const MODALIDAD_COLOR: Record<string, string> = {
  Presencial: styles.badgePresencial,
  Virtual: styles.badgeVirtual,
  Híbrido: styles.badgeHibrido,
};

function formatFecha(fechaStr: string) {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function getDiaMes(fechaStr: string) {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return {
    dia: fecha.toLocaleDateString("es-CO", { day: "2-digit" }),
    mes: fecha.toLocaleDateString("es-CO", { month: "short" }).toUpperCase(),
  };
}

export default function EventosPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [filtroModalidad, setFiltroModalidad] = useState("Todos");
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/eventos`);
        if (res.ok) {
          const data = await res.json();
          setEventos(data);
        }
      } catch (e) {
        console.error("Error al cargar eventos:", e);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarEventos();
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/eventos`);
        if (res.ok) {
          const data = await res.json();
          setEventos(data);
        }
      } catch (e) {
        console.error("Error al recargar eventos:", e);
      }
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filtrar eventos por búsqueda, categoría y modalidad
  const eventosFiltrados = eventos.filter(evento => {
    const matchBusqueda = busqueda === "" ||
      evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.lugar.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchTipo = filtro === "Todos" || evento.tipo === filtro;
    const matchModalidad = filtroModalidad === "Todos" || evento.modalidad === filtroModalidad;
    
    return matchBusqueda && matchTipo && matchModalidad;
  });

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div>Cargando eventos...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              {eventos.length} eventos disponibles · UCC Villavicencio
            </span>
            <h1 className={styles.heroTitle}>Explora los eventos</h1>
            <p className={styles.heroDesc}>
              Ferias, charlas y workshops del ecosistema emprendedor de la Universidad Cooperativa de Colombia.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.searchBar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="6" />
                <path d="M15 15l3 3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o lugar..."
                className={styles.searchInput}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && <button className={styles.searchClear} onClick={() => setBusqueda("")}>✕</button>}
            </div>
            <span className={styles.resultCount}>
              {eventosFiltrados.length} resultado{eventosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Categoría</span>
              <div className={styles.filterPills}>
                {TIPOS.map((tipo) => (
                  <button
                    key={tipo}
                    className={`${styles.filterPill} ${filtro === tipo ? styles.filterPillActive : ""}`}
                    onClick={() => setFiltro(tipo)}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Modalidad</span>
              <div className={styles.filterPills}>
                {MODALIDADES.map((modalidad) => (
                  <button
                    key={modalidad}
                    className={`${styles.filterPill} ${filtroModalidad === modalidad ? styles.filterPillActive : ""}`}
                    onClick={() => setFiltroModalidad(modalidad)}
                  >
                    {modalidad}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de eventos */}
          {eventosFiltrados.length > 0 ? (
            <div className={styles.grid}>
              {eventosFiltrados.map((evento) => {
                const { dia, mes } = getDiaMes(evento.fecha);
                return (
                  <div key={evento.id} className={styles.card}>

                    {/* Imagen */}
                    <div className={styles.cardImg}>
                      {evento.imagen ? (
                        <img src={evento.imagen} alt={evento.nombre} className={styles.img} />
                      ) : (
                        <div className={styles.imgPlaceholder}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                      )}
                      {/* Fecha flotante */}
                      <div className={styles.fechaFloat}>
                        <span className={styles.fechaDia}>{dia}</span>
                        <span className={styles.fechaMes}>{mes}</span>
                      </div>
                      {/* Badge tipo */}
                      <span className={styles.tipoBadge}>{evento.tipo}</span>
                    </div>

                    {/* Info */}
                    <div className={styles.cardBody}>
                      <span className={`${styles.modalBadge} ${MODALIDAD_COLOR[evento.modalidad]}`}>
                        {evento.modalidad}
                      </span>
                      <h3 className={styles.cardNombre}>{evento.nombre}</h3>
                      <p className={styles.cardDesc}>{evento.descripcion}</p>

                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {evento.hora}
                        </span>
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {evento.lugar}
                        </span>
                      </div>

                      <button
                        className={styles.btnMasInfo}
                        onClick={() => setEventoActivo(evento)}
                      >
                        Más info →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyEmoji}>🔍</span>
              <h3 className={styles.emptyTitle}>Sin resultados</h3>
              <p className={styles.emptyDesc}>No hay eventos que coincidan con tu búsqueda o filtros.</p>
              <button className={styles.emptyBtn}
                onClick={() => { setBusqueda(""); setFiltro("Todos"); setFiltroModalidad("Todos"); }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Modal de evento */}
      {eventoActivo && (
        <div className={styles.modalOverlay} onClick={() => setEventoActivo(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setEventoActivo(null)}>✕</button>

            <div className={styles.modalImg}>
              {eventoActivo.imagen ? (
                <img src={eventoActivo.imagen} alt={eventoActivo.nombre} className={styles.modalImgContent} />
              ) : (
                <div className={styles.imgPlaceholderModal}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalTopRow}>
                <span className={`${styles.modalBadge} ${MODALIDAD_COLOR[eventoActivo.modalidad]}`}>
                  {eventoActivo.modalidad}
                </span>
                <span className={styles.tipoBadgeModal}>{eventoActivo.tipo}</span>
              </div>

              <h2 className={styles.modalNombre}>{eventoActivo.nombre}</h2>
              <p className={styles.modalDescLarga}>{eventoActivo.descripcion}</p>

              <div className={styles.modalMeta}>
                <div className={styles.modalMetaItem}>
                  <span className={styles.modalMetaIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.modalMetaLabel}>Fecha</p>
                    <p className={styles.modalMetaVal}>{formatFecha(eventoActivo.fecha)}</p>
                  </div>
                </div>
                <div className={styles.modalMetaItem}>
                  <span className={styles.modalMetaIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.modalMetaLabel}>Hora</p>
                    <p className={styles.modalMetaVal}>{eventoActivo.hora}</p>
                  </div>
                </div>
                <div className={styles.modalMetaItem}>
                  <span className={styles.modalMetaIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.modalMetaLabel}>Lugar</p>
                    <p className={styles.modalMetaVal}>{eventoActivo.lugar}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}