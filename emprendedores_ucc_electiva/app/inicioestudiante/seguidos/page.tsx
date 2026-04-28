"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioestudiante/seguidos.module.css";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre?: string;
  usuarioId: string;
  estado: string;
  telefono?: string;
  imagenes?: string[];
  productos?: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function SeguidosPage() {
  const [seguidos, setSeguidos] = useState<Emprendimiento[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerCategorias = async (): Promise<Map<string, string>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categorias`);
      if (!res.ok) return new Map();
      
      const data: Categoria[] = await res.json();
      const map = new Map<string, string>();
      data.forEach(cat => {
        // 🔥 Usar cat.id (el backend devuelve "id")
        map.set(cat.id, cat.nombre);
        console.log(`✅ Categoría mapeada: ${cat.id} -> ${cat.nombre}`);
      });
      return map;
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return new Map();
    }
  };

  const obtenerSeguidos = async (usuarioId: string): Promise<Emprendimiento[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seguimientos/usuario/${usuarioId}/emprendimientos`);
      
      if (!res.ok) {
        console.log("⚠️ Error al obtener seguidos, status:", res.status);
        return [];
      }
      
      const data = await res.json();
      console.log("📦 Seguidos obtenidos:", data.length);
      return data;
    } catch (error) {
      console.error("Error al obtener seguidos:", error);
      return [];
    }
  };

  const handleDejarSeguir = async (emprendimientoId: string) => {
    try {
      const usuarioId = sessionStorage.getItem("usuarioId");
      if (!usuarioId) {
        alert("Debes iniciar sesión");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/seguimientos/dejar-de-seguir`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, emprendimientoId })
      });

      if (res.ok) {
        setSeguidos(prev => prev.filter(s => (s.id || s._id) !== emprendimientoId));
        alert("Dejaste de seguir este emprendimiento");
      } else {
        const data = await res.json();
        alert(data.message || data.error || "Error al dejar de seguir");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const usuarioId = sessionStorage.getItem("usuarioId");
        
        if (!usuarioId) {
          setError("No se encontró información de usuario");
          setLoading(false);
          return;
        }
        
        console.log("🔍 Cargando seguidos para usuario:", usuarioId);
        
        const [categorias, seguidosData] = await Promise.all([
          obtenerCategorias(),
          obtenerSeguidos(usuarioId)
        ]);
        
        console.log("📚 Mapa de categorías:", Array.from(categorias.entries()));
        
        const seguidosConCategoria = seguidosData.map(emp => {
          const catId = emp.categoriaId;
          const categoriaNombre = categorias.get(catId);
          console.log(`🔍 "${emp.nombre}" - categoriaId: ${catId} -> ${categoriaNombre || "NO ENCONTRADA"}`);
          return {
            ...emp,
            categoriaNombre: categoriaNombre || "Sin categoría"
          };
        });
        
        setSeguidos(seguidosConCategoria);
        console.log("✅ Seguidos cargados:", seguidosConCategoria.length);
        
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los emprendimientos seguidos");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  const filtered = seguidos.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "4rem" }}>Cargando emprendimientos seguidos...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>
          <div style={{ textAlign: "center", padding: "4rem", color: "#dc2626" }}>
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#009FE3", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>Reintentar</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/inicioestudiante" className={styles.back}>← Volver al inicio</Link>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Emprendimientos seguidos</h1>
            <p className={styles.subtitle}>Emprendimientos que estás siguiendo — {seguidos.length} en total</p>
          </div>
          <Link href="/emprendimientos" className={styles.btnExplore}>+ Explorar más</Link>
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
            {filtered.map((s) => {
              const emprendimientoId = s.id || s._id || "";
              return (
                <li key={emprendimientoId} className={styles.item}>
                  <div className={styles.itemAvatar}>{s.nombre.charAt(0)}</div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{s.nombre}</p>
                    <p className={styles.itemMeta}>
                      <span className={styles.catBadge}>{s.categoriaNombre || "Sin categoría"}</span>
                      <span className={styles.dot} />
                      {s.estado === "activo" && <span className={styles.activeBadge}>Activo</span>}
                    </p>
                  </div>
                  <div className={styles.itemActions}>
                    <Link href={`/emprendimientos/${emprendimientoId}`} className={styles.btnView}>Ver</Link>
                    <button className={styles.btnDejar} onClick={() => handleDejarSeguir(emprendimientoId)}>Dejar de seguir</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}