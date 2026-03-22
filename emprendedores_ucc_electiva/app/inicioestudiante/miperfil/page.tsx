"use client";

import React, { useState } from "react";
import styles from "../../css/inicioestudiante/miperfil.module.css";
import Link from "next/link";


export default function MiPerfilPage() {
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState("Valentina Gómez");
  const [bio, setBio] = useState(
    "Estudiante de Ingeniería Industrial. Apasionada por la innovación sostenible y el emprendimiento cooperativo."
  );
  const [facultad, setFacultad] = useState("Ingeniería Industrial");

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>VG</div>
            <button className={styles.avatarEdit} title="Cambiar foto">📷</button>
          </div>

          <div className={styles.profileInfo}>
            {editing ? (
              <input
                className={styles.inputField}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            ) : (
              <h1 className={styles.profileName}>{nombre}</h1>
            )}
            <span className={styles.profileBadge}>Estudiante UCC</span>
            <p className={styles.profileFacultad}>{facultad}</p>
          </div>

          <button className={styles.editBtn} onClick={() => setEditing(!editing)}>
            {editing ? "✓ Guardar" : "✏️ Editar perfil"}
          </button>
        </div>

        {/* Grid */}
        <div className={styles.profileGrid}>

          {/* Sobre mí */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Sobre mí</h2>
            {editing ? (
              <textarea
                className={styles.textArea}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            ) : (
              <p className={styles.bioText}>{bio}</p>
            )}
          </section>

          {/* Datos académicos — sin sede ni código */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Datos académicos</h2>
            <ul className={styles.dataList}>
              <li>
                <span className={styles.dataKey}>Facultad</span>
                {editing ? (
                  <input
                    className={styles.inputField}
                    value={facultad}
                    onChange={(e) => setFacultad(e.target.value)}
                  />
                ) : (
                  <span className={styles.dataVal}>{facultad}</span>
                )}
              </li>
              <li>
                <span className={styles.dataKey}>Semestre</span>
                <span className={styles.dataVal}>6°</span>
              </li>
            </ul>
          </section>

          {/* Emprendimientos seguidos */}
          <section className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Emprendimientos que sigo</h2>
            <div className={styles.empGrid}>
              {[
                { name: "BioLab UCC",   cat: "Ciencias",        products: 4 },
                { name: "EcoModa UCC",  cat: "Moda sostenible", products: 3 },
              ].map((emp) => (
                <div key={emp.name} className={styles.empCard}>
                  <div className={styles.empDot} />
                  <div>
                    <p className={styles.empName}>{emp.name}</p>
                    <p className={styles.empCat}>{emp.cat} · {emp.products} productos</p>
                  </div>
                  <Link href="/emprendimientoInicio" className={styles.empLink}>Ver →</Link>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}