"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/miperfil.module.css";
import Link from "next/link";

export default function MiPerfilPage() {
  const [editing, setEditing] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [bio, setBio] = useState("");
  const [facultad, setFacultad] = useState("");

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
    const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
    
    setTipoUsuario(tipo.toLowerCase());
    setNombreUsuario(nombre);
    
    if (tipo.toLowerCase() === "estudiante") {
      setBio("Estudiante de la Universidad Cooperativa de Colombia. Apasionado/a por la innovación y el emprendimiento.");
      setFacultad(usuario.facultad || "Facultad no especificada");
    } else {
      setBio("Administrativo de la Universidad Cooperativa de Colombia. Apoyando y fomentando la cultura emprendedora en la comunidad UCC.");
    }
  }, []);

  const esEstudiante = tipoUsuario === "estudiante";

  // Emprendimientos que sigue (ejemplo)
  const emprendimientosSeguidos = [
    { name: "BioLab UCC", cat: "Ciencias", products: 4 },
    { name: "EcoModa UCC", cat: "Moda sostenible", products: 3 },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioestudiante" className={styles.back}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {nombreUsuario.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <button className={styles.avatarEdit} title="Cambiar foto">📷</button>
          </div>

          <div className={styles.profileInfo}>
            {editing ? (
              <input
                className={styles.inputField}
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
              />
            ) : (
              <h1 className={styles.profileName}>{nombreUsuario}</h1>
            )}
            <span className={styles.profileBadge}>
              {esEstudiante ? "Estudiante UCC" : "Administrativo UCC"}
            </span>
            {esEstudiante && (
              <p className={styles.profileFacultad}>{facultad}</p>
            )}
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

          {/* Datos académicos / profesionales */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              {esEstudiante ? "Datos académicos" : "Información"}
            </h2>
            <ul className={styles.dataList}>
              {esEstudiante ? (
                <>
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
                </>
              ) : (
                <li>
                  <span className={styles.dataKey}>Rol</span>
                  <span className={styles.dataVal}>Administrativo UCC</span>
                </li>
              )}
            </ul>
          </section>

          {/* Emprendimientos seguidos */}
          <section className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Emprendimientos que sigo</h2>
            <div className={styles.empGrid}>
              {emprendimientosSeguidos.map((emp) => (
                <div key={emp.name} className={styles.empCard}>
                  <div className={styles.empDot} />
                  <div>
                    <p className={styles.empName}>{emp.name}</p>
                    <p className={styles.empCat}>{emp.cat} · {emp.products} productos</p>
                  </div>
                  <Link href={`/emprendimiento/${emp.name.toLowerCase().replace(/\s/g, '-')}`} className={styles.empLink}>
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/inicioestudiante/seguidos" className={styles.btnLink} style={{ marginTop: "16px", display: "inline-block" }}>
              Ver todos mis seguidos →
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}