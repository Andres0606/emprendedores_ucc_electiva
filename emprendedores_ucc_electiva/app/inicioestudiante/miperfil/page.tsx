"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/miperfil.module.css";
import Link from "next/link";

const CATEGORIAS = [
  { id: 1, label: "Gastronomía" },
  { id: 2, label: "Moda y Diseño" },
  { id: 3, label: "Salud y Bienestar" },
  { id: 4, label: "Arte y Cultura" },
  { id: 5, label: "Servicios" },
  { id: 6, label: "Comida" },
  { id: 7, label: "Tecnología" },
];

export default function MiPerfilPage() {
  const [editing, setEditing] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [bio, setBio] = useState("");
  const [carrera, setCarrera] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCats, setSelectedCats] = useState<Set<number>>(new Set());
  const [editingCats, setEditingCats] = useState(false);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
        const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
        const usuarioGuardado = sessionStorage.getItem("usuario");

        setTipoUsuario(tipo.toLowerCase());
        setNombreUsuario(nombre);

        if (tipo.toLowerCase() === "estudiante") {
          setBio("Estudiante de la Universidad Cooperativa de Colombia. Apasionado/a por la innovación y el emprendimiento.");

          if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const carreraUsuario = usuario.carrera || usuario.facultad;
            if (carreraUsuario && carreraUsuario !== "Carrera no especificada") {
              setCarrera(carreraUsuario);
            } else {
              const usuarioId = sessionStorage.getItem("usuarioId");
              if (usuarioId) {
                try {
                  const res = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
                  if (res.ok) {
                    const data = await res.json();
                    const carreraBackend = data.carrera || data.facultad;
                    if (carreraBackend) {
                      setCarrera(carreraBackend);
                      usuario.carrera = carreraBackend;
                      sessionStorage.setItem("usuario", JSON.stringify(usuario));
                    } else {
                      setCarrera("Carrera no especificada");
                    }
                  } else {
                    setCarrera("Carrera no especificada");
                  }
                } catch (error) {
                  console.error("Error al obtener carrera del backend:", error);
                  setCarrera("Carrera no especificada");
                }
              } else {
                setCarrera("Carrera no especificada");
              }
            }
          } else {
            setCarrera("Carrera no especificada");
          }
        } else {
          setBio("Administrativo de la Universidad Cooperativa de Colombia. Apoyando y fomentando la cultura emprendedora en la comunidad UCC.");
        }

        // Cargar categorías guardadas
        const catsGuardadas = localStorage.getItem("categoriasInteres");
        if (catsGuardadas) {
          setSelectedCats(new Set(JSON.parse(catsGuardadas)));
        }

      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        setCarrera("Carrera no especificada");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatosUsuario();
  }, []);

  // Guardar categorías cada vez que cambian
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("categoriasInteres", JSON.stringify(Array.from(selectedCats)));
    }
  }, [selectedCats, isLoading]);

  const esEstudiante = tipoUsuario === "estudiante";

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div>Cargando perfil...</div>
          </div>
        </div>
      </main>
    );
  }

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
            {esEstudiante && carrera && carrera !== "Carrera no especificada" && (
              <p className={styles.profileCarrera}>{carrera}</p>
            )}
          </div>

          <button className={styles.editBtn} onClick={() => setEditing(!editing)}>
            {editing ? "✓ Guardar" : "Editar perfil"}
          </button>
        </div>

        {/* Grid */}
        <div className={styles.profileGrid}>

          {/* Sobre mí - EDITABLE */}
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

          {/* Datos académicos - NO EDITABLE */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              {esEstudiante ? "Datos académicos" : "Información"}
            </h2>
            <ul className={styles.dataList}>
              {esEstudiante ? (
                <>
                  <li>
                    <span className={styles.dataKey}>Carrera</span>
                    <span className={styles.dataVal}>
                      {carrera && carrera !== "Carrera no especificada" ? carrera : "No especificada"}
                    </span>
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

          {/* Categorías de interés */}
          <section className={`${styles.card} ${styles.cardFull}`}>
            <div className={styles.catHeader}>
              <h2 className={styles.cardTitle}>Categorías de interés</h2>
              <button
                className={`${styles.catEditBtn} ${editingCats ? styles.catEditBtnActive : ""}`}
                onClick={() => setEditingCats(!editingCats)}
              >
                {editingCats ? "✓ Listo" : "Editar"}
              </button>
            </div>

            {/* Chips seleccionados - SIEMPRE VISIBLES */}
            <div className={styles.selectedCats}>
              {selectedCats.size === 0 ? (
                <span className={styles.noSelected}>
                  {editingCats 
                    ? "Haz clic en las categorías de abajo para seleccionar tus intereses" 
                    : "No has seleccionado categorías de interés. Haz clic en 'Editar' para personalizar."}
                </span>
              ) : (
                Array.from(selectedCats).map((id) => {
                  const cat = CATEGORIAS.find((c) => c.id === id)!;
                  return (
                    <span key={id} className={styles.catChipSelected}>
                      {cat.label}
                      {editingCats && (
                        <span
                          className={styles.catChipX}
                          onClick={() => {
                            const next = new Set(selectedCats);
                            next.delete(id);
                            setSelectedCats(next);
                          }}
                        >✕</span>
                      )}
                    </span>
                  );
                })
              )}
            </div>

            {/* Separador */}
            <hr className={styles.catDivider} />
            
            {/* Todas las categorías - SIEMPRE VISIBLES */}
            <p className={styles.catAllLabel}>Todas las categorías</p>
            <div className={styles.allCats}>
              {CATEGORIAS.map((cat) => (
                <span
                  key={cat.id}
                  className={`${styles.catChipOpt} ${selectedCats.has(cat.id) ? styles.catChipOptDisabled : ""}`}
                  onClick={() => {
                    if (!selectedCats.has(cat.id)) {
                      setSelectedCats(new Set([...selectedCats, cat.id]));
                    }
                  }}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}