"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioAdministrativo/miperfil.module.css";
import Link from "next/link";
import { API_URL } from "@/src/config/api";

// Categorías
const CATEGORIAS = [
  { id: 1, label: "Gastronomía" },
  { id: 2, label: "Moda y Diseño" },
  { id: 3, label: "Salud y Bienestar" },
  { id: 4, label: "Arte y Cultura" },
  { id: 5, label: "Servicios" },
  { id: 6, label: "Comida" },
  { id: 7, label: "Tecnología" },
];

export default function MiPerfilAdministrativoPage() {
  const [tipoUsuario, setTipoUsuario] = useState("administrativo");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargo, setCargo] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [compras, setCompras] = useState<any[]>([]);
  const [selectedCats, setSelectedCats] = useState<Set<number>>(new Set());
  const [editingCats, setEditingCats] = useState(false);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const tipo = sessionStorage.getItem("tipoUsuario") || "administrativo";
        const usuarioId = sessionStorage.getItem("usuarioId");
        const usuarioGuardado = sessionStorage.getItem("usuario");

        // Cargar nombre desde sessionStorage
        let nombreCompleto = "Usuario";
        let emailData = "";
        let telefonoData = "";

        if (usuarioGuardado) {
          try {
            const usuario = JSON.parse(usuarioGuardado);
            if (usuario.nombre && usuario.apellido) {
              nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
            } else if (usuario.nombre) {
              nombreCompleto = usuario.nombre;
            }
            emailData = usuario.correo || "";
            telefonoData = usuario.telefono || "";
          } catch (e) {
            console.error("Error al parsear usuario:", e);
          }
        }

        // 🔥 Cargar cargo y dependencia DIRECTAMENTE desde localStorage
        const cargoLocal = localStorage.getItem(`cargo_${usuarioId}`);
        const dependenciaLocal = localStorage.getItem(`dependencia_${usuarioId}`);
        
        const cargoData = cargoLocal || "Cargo no especificado";
        const dependenciaData = dependenciaLocal || "Dependencia no especificada";

        console.log("📌 Cargo desde localStorage:", cargoData);
        console.log("📌 Dependencia desde localStorage:", dependenciaData);

        setTipoUsuario(tipo.toLowerCase());
        setNombreUsuario(nombreCompleto);
        setCargo(cargoData);
        setDependencia(dependenciaData);
        setEmail(emailData);
        setTelefono(telefonoData);

        // Cargar categorías guardadas
        const catsGuardadas = localStorage.getItem("categoriasInteres_admin");
        if (catsGuardadas && catsGuardadas !== "[]") {
          setSelectedCats(new Set(JSON.parse(catsGuardadas)));
        } else {
          setSelectedCats(new Set());
        }

        await cargarCompras(usuarioId);

      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const cargarCompras = async (usuarioId: string | null) => {
      if (!usuarioId) return;
      try {
        // 🔥 Cargar transacciones del usuario
        const res = await fetch(`${API_URL}/api/transacciones?compradorId=${usuarioId}`);
        if (res.ok) {
          const data = await res.json();
          setCompras(data);
        } else {
          setCompras([]);
        }
      } catch (error) {
        console.error("Error al cargar compras:", error);
        setCompras([]);
      }
    };

    cargarDatosUsuario();
  }, []);

  // Guardar categorías
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("categoriasInteres_admin", JSON.stringify(Array.from(selectedCats)));
    }
  }, [selectedCats, isLoading]);

  const esAdministrativo = tipoUsuario === "administrativo";

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "4rem" }}>Cargando perfil...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/inicioAdministrativo" className={styles.back}>
          ← Volver al inicio
        </Link>

        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {nombreUsuario.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{nombreUsuario}</h1>
            <span className={styles.profileBadge}>
              {esAdministrativo ? "Administrativo UCC" : "Usuario"}
            </span>
            {esAdministrativo && cargo && cargo !== "Cargo no especificado" && (
              <p className={styles.profileCargo}>{cargo}</p>
            )}
            {esAdministrativo && dependencia && dependencia !== "Dependencia no especificada" && (
              <p className={styles.profileDependencia}>{dependencia}</p>
            )}
          </div>

          <Link href="/inicioAdministrativo/configuracion" className={styles.configBtn}>
            Configuración
          </Link>
        </div>

        <div className={styles.profileGrid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Información laboral</h2>
            <ul className={styles.dataList}>
              <li>
                <span className={styles.dataKey}>Cargo</span>
                <span className={styles.dataVal}>{cargo}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Dependencia</span>
                <span className={styles.dataVal}>{dependencia}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Correo institucional</span>
                <span className={styles.dataVal}>{email || "No registrado"}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Teléfono</span>
                <span className={styles.dataVal}>{telefono || "No registrado"}</span>
              </li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Mis compras</h2>
            {compras && compras.length > 0 ? (
              <div className={styles.comprasList}>
                {compras.map((compra, index) => (
                  <div key={index} className={styles.compraItem}>
                    <div className={styles.compraInfo}>
                      <p className={styles.compraNombre}>{compra.productoNombre || compra.nombre || "Producto"}</p>
                      <p className={styles.compraDetalle}>
                        {compra.emprendimientoNombre || compra.vendedor?.nombre || "Emprendimiento"} • {compra.cantidad || 1} unidades
                      </p>
                      <p className={styles.compraFecha}>
                        {compra.fecha ? new Date(compra.fecha).toLocaleDateString('es-CO') : "Fecha no disponible"}
                      </p>
                    </div>
                    <div className={styles.compraTotal}>
                      ${(compra.total || compra.monto || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noDataText}>Aún no has realizado compras</p>
            )}
          </section>

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

            <hr className={styles.catDivider} />
            
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