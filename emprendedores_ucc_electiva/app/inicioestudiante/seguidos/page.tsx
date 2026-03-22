"use client";

import React, { useState } from "react";
import styles from "../../css/inicioestudiante/seguidos.module.css";
import Link from "next/link";


const initialSeguidos = [
  { id: 1, name: "BioLab UCC",              cat: "Ciencias",         followers: 24, active: true  },
  { id: 2, name: "EcoModa UCC",             cat: "Moda sostenible",  followers: 18, active: true  },
  { id: 3, name: "TechStart Villavicencio", cat: "Tecnología",       followers: 41, active: false },
  { id: 4, name: "AgroInnova",              cat: "Agroindustria",    followers: 9,  active: true  },
];

export default function SeguidosPage() {
  const [seguidos, setSeguidos] = useState(initialSeguidos);
  const [search, setSearch]     = useState("");

  const filtered = seguidos.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDejar = (id: number) =>
    setSeguidos((prev) => prev.filter((s) => s.id !== id));

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Seguidos</h1>
            <p className={styles.subtitle}>
              Emprendimientos que estás siguiendo — {seguidos.length} en total
            </p>
          </div>
          <Link href="/emprendimientoInicio" className={styles.btnExplore}>
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
            <p>No se encontraron emprendimientos.</p>
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
                  <Link href="/emprendimientoInicio" className={styles.btnView}>Ver</Link>
                  <button className={styles.btnDejar} onClick={() => handleDejar(s.id)}>
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