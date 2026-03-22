"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/seguidos.module.css";
import Link from "next/link";

// Datos de ejemplo de emprendimientos
const todosEmprendimientos = [
  { id: 1, name: "BioLab UCC", cat: "Ciencias", followers: 24, active: true },
  { id: 2, name: "EcoModa UCC", cat: "Moda sostenible", followers: 18, active: true },
  { id: 3, name: "TechStart Villavicencio", cat: "Tecnología", followers: 41, active: false },
  { id: 4, name: "AgroInnova", cat: "Agroindustria", followers: 9, active: true },
  { id: 5, name: "Arte y Cultura UCC", cat: "Arte", followers: 32, active: true },
  { id: 6, name: "Deporte UCC", cat: "Deportes", followers: 56, active: true },
];

export default function SeguidosPage() {
  const [seguidos, setSeguidos] = useState(todosEmprendimientos.slice(0, 4));
  const [search, setSearch] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
    const nombre = sessionStorage.getItem("nombreUsuario") || "";
    setTipoUsuario(tipo.toLowerCase());
    setNombreUsuario(nombre);
    
    // Aquí podrías cargar los seguidos reales desde el backend
    // Por ahora usamos datos de ejemplo
  }, []);

  const filtered = seguidos.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDejar = (id: number) => {
    setSeguidos((prev) => prev.filter((s) => s.id !== id));
  };

  const esEstudiante = tipoUsuario === "estudiante";

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Emprendimientos seguidos</h1>
            <p className={styles.subtitle}>
              {esEstudiante ? "Emprendimientos que estás siguiendo" : "Emprendimientos que estás apoyando"} — {seguidos.length} en total
            </p>
          </div>
          <Link href="/emprendimientos" className={styles.btnExplore}>
            + Explorar más
          </Link>
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No sigues ningún emprendimiento aún.</p>
            <Link href="/emprendimientos" className={styles.btnExplore} style={{ marginTop: "16px", display: "inline-block" }}>
              Explorar emprendimientos
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((s) => (
              <li key={s.id} className={styles.item}>
                <div className={styles.itemAvatar}>{s.name.charAt(0)}</div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{s.name}</p>
                  <p className={styles.itemMeta}>
                    <span className={styles.catBadge}>{s.cat}</span>
                    <span className={styles.dot} />
                    {s.followers} seguidores
                    {s.active && <span className={styles.activeBadge}>Activo</span>}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <Link href={`/emprendimiento/${s.id}`} className={styles.btnView}>
                    Ver
                  </Link>
                  <button
                    className={styles.btnDejar}
                    onClick={() => handleDejar(s.id)}
                  >
                    Dejar de seguir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </main>
  );
}