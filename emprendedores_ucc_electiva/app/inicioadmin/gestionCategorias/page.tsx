"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../css/inicioAdmin/gestionCategorias.module.css";
import { API_URL } from "@/src/config/api";

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  totalEmprendimientos?: number;
}

export default function GestionCategoriasPage() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [emprendimientos, setEmprendimientos] = useState<any[]>([]);

  const [busqueda, setBusqueda]     = useState("");

  const [modalNueva, setModalNueva]         = useState(false);
  const [editarId, setEditarId]             = useState<string | null>(null);
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<{ id: string; nombre: string } | null>(null);

  const [form, setForm] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    const usr = sessionStorage.getItem("usuario");
    if (!usr) { router.push("/autenticacion/login"); return; }
    const u = JSON.parse(usr);
    
    // 🔥 CORREGIDO: Soporta tanto tipoUsuario como role (del backend)
    const rol = u.tipoUsuario || u.role;
    if (rol !== "admin") { router.push("/"); return; }
    
    cargarCategorias();
    cargarEmprendimientos();
  }, []);

  async function cargarEmprendimientos() {
    try {
  const res = await fetch(`${API_URL}/api/emprendimientos`);
  if (res.ok) {
    const data = await res.json();
    // Solo emprendimientos ACTIVOS
    const activos = data.filter((emp: any) => emp.estado === "activo");
    setEmprendimientos(activos);
  }
} catch (error) {
      console.error("Error al cargar emprendimientos:", error);
    }
  }

  async function cargarCategorias() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categorias`);
      if (!res.ok) throw new Error();
      const data: Categoria[] = await res.json();
      
      // Calcular total de emprendimientos ACTIVOS por categoría
      const categoriasConConteo = data.map(cat => {
        const id = cat.id || cat._id;
        const total = emprendimientos.filter(emp => emp.categoriaId === id && emp.estado === "activo").length;
        return {
          ...cat,
          totalEmprendimientos: total
        };
      });
      
      setCategorias(categoriasConConteo);
    } catch {
      setError("Error al cargar categorías. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  // Actualizar conteos cuando cambien los emprendimientos
  useEffect(() => {
    if (categorias.length > 0) {
      const categoriasActualizadas = categorias.map(cat => {
        const id = cat.id || cat._id;
        const total = emprendimientos.filter(emp => emp.categoriaId === id && emp.estado === "activo").length;
        return { ...cat, totalEmprendimientos: total };
      });
      setCategorias(categoriasActualizadas);
    }
  }, [emprendimientos]);

  async function crearCategoria() {
    if (!form.nombre.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() }),
      });
      if (res.ok) { 
        await cargarCategorias(); 
        setModalNueva(false); 
        setForm({ nombre: "", descripcion: "" }); 
      }
      else alert("Error al crear la categoría.");
    } catch { alert("Error de conexión."); }
  }

  async function editarCategoria() {
  if (!editarId || !form.nombre.trim()) return;
  try {
    const res = await fetch(`${API_URL}/api/categorias/${editarId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() }),
    });
    if (res.ok) { 
      await cargarCategorias(); 
      setEditarId(null); 
      setForm({ nombre: "", descripcion: "" }); 
    }
    else alert("Error al guardar cambios.");
  } catch { alert("Error de conexión."); }
}

  async function eliminarCategoria(id: string) {
    try {
    const res = await fetch(`${API_URL}/api/categorias/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await cargarCategorias();
      setConfirmarEliminarId(null);
      setCategoriaAEliminar(null);
      alert("✅ Categoría eliminada correctamente");
    } else {
      const error = await res.json();
      alert(error.message || "Error al eliminar la categoría");
    }
    } catch {
      alert("Error de conexión.");
    }
  }

  function confirmarEliminar(id: string, nombre: string) {
    setCategoriaAEliminar({ id, nombre });
    setConfirmarEliminarId(id);
  }

  function abrirEditar(cat: Categoria) {
    setEditarId(cat.id || cat._id || "");
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion || "" });
  }

  function abrirNueva() {
    setForm({ nombre: "", descripcion: "" });
    setModalNueva(true);
  }

  const filtradas = useMemo(() => {
    return categorias.filter(c => {
      const q = busqueda.toLowerCase();
      if (q && !c.nombre.toLowerCase().includes(q) && !(c.descripcion || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [categorias, busqueda]);

  if (loading) return <main className={styles.main}><div className={styles.centered}><div className={styles.spinner} /><p>Cargando categorías...</p></div></main>;
  if (error)   return <main className={styles.main}><div className={styles.centered}><p className={styles.errorMsg}>{error}</p><button className={styles.btnPrimary} onClick={cargarCategorias}>Reintentar</button></div></main>;

  return (
    <main className={styles.main}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/inicioadmin" className={styles.back}>← Panel de administración</Link>
          <h1 className={styles.pageTitle}>Gestión de categorías</h1>
          <p className={styles.pageSubtitle}>{categorias.length} categorías registradas en la plataforma</p>
        </div>
        <button className={styles.btnPrimary} onClick={abrirNueva}>+ Nueva categoría</button>
      </div>

      {/* Filtro búsqueda */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.btnLimpiar} onClick={() => setBusqueda("")}>Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div className={styles.tableWrap}>
        {filtradas.length === 0 ? (
          <div className={styles.empty}>No hay categorías que coincidan con los filtros aplicados.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Emprendimientos activos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(cat => {
                const id = cat.id || cat._id || "";
                const tieneEmprendimientos = (cat.totalEmprendimientos ?? 0) > 0;
                return (
                  <tr key={id} className={styles.tableRow}>
                    <td className={styles.tdNombre}>
                      <div className={styles.catThumb}>
                        <div className={styles.catIcon}>{cat.nombre[0]?.toUpperCase()}</div>
                        <p className={styles.catNombreText}>{cat.nombre}</p>
                      </div>
                    </td>
                    <td className={styles.tdDesc}>
                      {cat.descripcion ? (
                        <span>{cat.descripcion.substring(0, 80)}{cat.descripcion.length > 80 ? "…" : ""}</span>
                      ) : (
                        <span className={styles.sinDesc}>Sin descripción</span>
                      )}
                    </td>
                    <td className={styles.tdCount}>
                      <span className={`${styles.countBadge} ${tieneEmprendimientos ? styles.countBadgeWith : styles.countBadgeEmpty}`}>
                        {cat.totalEmprendimientos ?? 0}
                      </span>
                    </td>
                    <td className={styles.tdAcciones}>
                      <div className={styles.acciones}>
                        <button className={styles.btnAccion} onClick={() => abrirEditar(cat)}>Editar</button>
                        {tieneEmprendimientos ? (
                          <button 
                            className={`${styles.btnAccion} ${styles.btnEliminarDisabled}`} 
                            disabled
                            title={`No se puede eliminar porque tiene ${cat.totalEmprendimientos} emprendimiento(s) activo(s) asociado(s)`}
                          >
                             Eliminar
                          </button>
                        ) : (
                          <button 
                            className={`${styles.btnAccion} ${styles.btnEliminar}`} 
                            onClick={() => confirmarEliminar(id, cat.nombre)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Nueva categoría */}
      {modalNueva && (
        <div className={styles.overlay} onClick={() => setModalNueva(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nueva categoría</h2>
              <button className={styles.modalClose} onClick={() => setModalNueva(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre de la categoría</label>
                <input className={styles.formInput} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Gastronomía" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea className={styles.formTextarea} rows={3} value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Describe brevemente esta categoría..." />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setModalNueva(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={crearCategoria} disabled={!form.nombre.trim()}>Crear categoría</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {editarId && (
        <div className={styles.overlay} onClick={() => setEditarId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar categoría</h2>
              <button className={styles.modalClose} onClick={() => setEditarId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre de la categoría</label>
                <input className={styles.formInput} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea className={styles.formTextarea} rows={3} value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setEditarId(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={editarCategoria} disabled={!form.nombre.trim()}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminar */}
      {confirmarEliminarId && categoriaAEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmarEliminarId(null)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Eliminar categoría</h2>
              <button className={styles.modalClose} onClick={() => setConfirmarEliminarId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.alertaTexto}>
                ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoriaAEliminar.nombre}"</strong>?
              </p>
              <p className={styles.alertaSubTexto}>
                Esta acción <strong>no se puede deshacer</strong>. La categoría se eliminará permanentemente.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setConfirmarEliminarId(null)}>Cancelar</button>
              <button className={styles.btnEliminar} onClick={() => eliminarCategoria(confirmarEliminarId)}>
                Sí, eliminar categoría
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}