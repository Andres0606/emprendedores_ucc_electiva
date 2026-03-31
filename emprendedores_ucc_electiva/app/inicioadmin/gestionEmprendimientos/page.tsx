"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../css/inicioAdmin/gestionEmprendimientos.module.css";

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface HistorialEntry {
  fecha: string;
  accion: string;
  admin: string;
}

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre?: string;
  usuarioId: string;
  emprendedorNombre?: string;
  emprendedorCorreo?: string;
  estado: "pendiente" | "activo" | "rechazado";
  telefono?: string;
  imagenes: string[];
  productos: Producto[];
  createdAt?: string;
  historial?: HistorialEntry[];
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  carrera: string;
  tipoUsuario: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
}

type EstadoFiltro = "todos" | "pendiente" | "activo" | "rechazado";

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente",  cls: "estadoPendiente" },
  activo:    { label: "Activo",     cls: "estadoActivo"    },
  rechazado: { label: "Rechazado",  cls: "estadoRechazado" },
};

function formatFecha(str?: string) {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function GestionEmprendimientosPage() {
  const router = useRouter();

  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [categorias, setCategorias]           = useState<Map<string, string>>(new Map());
  const [usuariosMap, setUsuariosMap]         = useState<Map<string, Usuario>>(new Map());
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  // Detalle / historial
  const [detalleId, setDetalleId]     = useState<string | null>(null);
  const [historialId, setHistorialId] = useState<string | null>(null);
  const [rechazarModal, setRechazarModal] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const usr = sessionStorage.getItem("usuario");
    if (!usr) { router.push("/autenticacion/login"); return; }
    const u = JSON.parse(usr);
    if (u.tipoUsuario !== "admin") { router.push("/"); return; }
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setLoading(true);
      const [resCats, resUsrs, resEmps] = await Promise.all([
        fetch("http://localhost:8080/api/categorias"),
        fetch("http://localhost:8080/api/usuarios"),
        fetch("http://localhost:8080/api/emprendimientos"),
      ]);

      const cats: Categoria[] = resCats.ok ? await resCats.json() : [];
      const mapCats = new Map<string, string>();
      cats.forEach(c => { const id = c.id || c._id; if (id) mapCats.set(id, c.nombre); });
      setCategorias(mapCats);

      const usrs: Usuario[] = resUsrs.ok ? await resUsrs.json() : [];
      const mapUsrs = new Map<string, Usuario>();
      usrs.forEach(u => { const id = u.id || u._id; if (id) mapUsrs.set(id, u); });
      setUsuariosMap(mapUsrs);

      const emps: Emprendimiento[] = resEmps.ok ? await resEmps.json() : [];
      const enriquecidos = emps.map(e => {
        const u = mapUsrs.get(e.usuarioId);
        return {
          ...e,
          categoriaNombre: mapCats.get(e.categoriaId) || "Sin categoría",
          emprendedorNombre: u ? `${u.nombre} ${u.apellido}` : "—",
          emprendedorCorreo: u?.correo || "—",
        };
      });
      setEmprendimientos(enriquecidos);
    } catch {
      setError("Error al cargar datos. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  // Filtrado
  const filtrados = useMemo(() => {
    return emprendimientos.filter(e => {
      if (filtroEstado !== "todos" && e.estado !== filtroEstado) return false;
      if (filtroCategoria !== "todos" && e.categoriaId !== filtroCategoria) return false;
      const q = busqueda.toLowerCase();
      if (q && !e.nombre.toLowerCase().includes(q) && !(e.emprendedorNombre || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [emprendimientos, filtroEstado, filtroCategoria, busqueda]);

  // Acciones
  async function cambiarEstado(id: string, estado: string) {
    try {
      const res = await fetch(`http://localhost:8080/api/emprendimientos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) cargarTodo();
      else alert("Error al actualizar el estado.");
    } catch { alert("Error de conexión."); }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este emprendimiento? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/emprendimientos/${id}`, { method: "DELETE" });
      if (res.ok) cargarTodo();
      else alert("Error al eliminar.");
    } catch { alert("Error de conexión."); }
  }

  function handleRechazar(id: string) {
    setRechazarModal({ id });
  }

  function confirmarRechazo() {
    if (!rechazarModal) return;
    cambiarEstado(rechazarModal.id, "rechazado");
    setRechazarModal(null);
  }

  const detalleEmp  = emprendimientos.find(e => (e.id || e._id) === detalleId);
  const historialEmp = emprendimientos.find(e => (e.id || e._id) === historialId);

  const catsFiltro = Array.from(categorias.entries());

  // Contadores por estado
  const contadores = useMemo(() => ({
    todos:     emprendimientos.length,
    pendiente: emprendimientos.filter(e => e.estado === "pendiente").length,
    activo:    emprendimientos.filter(e => e.estado === "activo").length,
    rechazado: emprendimientos.filter(e => e.estado === "rechazado").length,
  }), [emprendimientos]);

  if (loading) return (
    <main className={styles.main}>
      <div className={styles.centered}><div className={styles.spinner} /><p>Cargando emprendimientos...</p></div>
    </main>
  );

  if (error) return (
    <main className={styles.main}>
      <div className={styles.centered}><p className={styles.errorMsg}>{error}</p><button className={styles.btnPrimary} onClick={cargarTodo}>Reintentar</button></div>
    </main>
  );

  return (
    <main className={styles.main}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/inicioadmin" className={styles.back}>← Panel de administración</Link>
          <h1 className={styles.pageTitle}>Gestión de emprendimientos</h1>
          <p className={styles.pageSubtitle}>{emprendimientos.length} emprendimientos registrados en la plataforma</p>
        </div>
        <div className={styles.pageHeaderRight}>
          <button className={styles.btnExport} onClick={() => alert("Exportar a Excel/PDF — conectar con backend")}>
            Exportar lista
          </button>
        </div>
      </div>

      {/* Pills de estado */}
      <div className={styles.estadoPills}>
        {(["todos", "pendiente", "activo", "rechazado"] as const).map(est => (
          <button
            key={est}
            className={`${styles.pill} ${filtroEstado === est ? styles.pillActive : ""} ${est !== "todos" ? styles[`pill_${est}`] : ""}`}
            onClick={() => setFiltroEstado(est)}
          >
            {est === "todos" ? "Todos" : ESTADO_CONFIG[est].label}
            <span className={styles.pillCount}>{contadores[est]}</span>
          </button>
        ))}
      </div>

      {/* Barra de filtros */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre o emprendedor..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className={styles.filterSelect} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {catsFiltro.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
        </select>
        {(busqueda || filtroCategoria !== "todos") && (
          <button className={styles.btnLimpiar} onClick={() => { setBusqueda(""); setFiltroCategoria("todos"); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className={styles.tableWrap}>
        {filtrados.length === 0 ? (
          <div className={styles.empty}>No hay emprendimientos que coincidan con los filtros aplicados.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Emprendimiento</th>
                <th>Emprendedor</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(emp => {
                const id = emp.id || emp._id || "";
                return (
                  <tr key={id} className={styles.tableRow}>
                    {/* Nombre */}
                    <td className={styles.tdNombre}>
                      <div className={styles.empThumb}>
                        {emp.imagenes?.[0]
                          ? <img src={emp.imagenes[0]} alt="" className={styles.thumbImg} />
                          : <div className={styles.thumbPlaceholder}>{emp.nombre[0]?.toUpperCase()}</div>
                        }
                        <div>
                          <p className={styles.empNombreText}>{emp.nombre}</p>
                          <p className={styles.empDescText}>{emp.descripcion?.substring(0, 60)}{emp.descripcion?.length > 60 ? "…" : ""}</p>
                        </div>
                      </div>
                    </td>

                    {/* Emprendedor */}
                    <td className={styles.tdEmprendedor}>
                      <p className={styles.emprendedorNombre}>{emp.emprendedorNombre}</p>
                      <p className={styles.emprendedorCorreo}>{emp.emprendedorCorreo}</p>
                    </td>

                    {/* Categoría */}
                    <td><span className={styles.catTag}>{emp.categoriaNombre}</span></td>

                    {/* Estado */}
                    <td>
                      <span className={`${styles.estadoBadge} ${styles[ESTADO_CONFIG[emp.estado]?.cls || "estadoPendiente"]}`}>
                        {ESTADO_CONFIG[emp.estado]?.label || emp.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnAccion} title="Ver detalles" onClick={() => setDetalleId(id)}>Detalles</button>
                        <button className={styles.btnAccion} title="Ver historial" onClick={() => setHistorialId(id)}>Historial</button>

                        {emp.estado === "pendiente" && <>
                          <button className={`${styles.btnAccion} ${styles.btnAprobar}`} onClick={() => cambiarEstado(id, "activo")}>Aprobar</button>
                          <button className={`${styles.btnAccion} ${styles.btnRechazar}`} onClick={() => handleRechazar(id)}>Rechazar</button>
                        </>}

                        {emp.estado === "activo" && <>
                          <button className={`${styles.btnAccion} ${styles.btnEliminar}`} onClick={() => eliminar(id)}>Eliminar</button>
                        </>}

                        {emp.estado === "rechazado" && <>
                          <button className={`${styles.btnAccion} ${styles.btnAprobar}`} onClick={() => cambiarEstado(id, "pendiente")}>Reabrir</button>
                          <button className={`${styles.btnAccion} ${styles.btnEliminar}`} onClick={() => eliminar(id)}>Eliminar</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal: Detalle ── */}
      {detalleEmp && (
        <div className={styles.overlay} onClick={() => setDetalleId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalles del emprendimiento</h2>
              <button className={styles.modalClose} onClick={() => setDetalleId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {detalleEmp.imagenes?.[0] && (
                <img src={detalleEmp.imagenes[0]} alt="" className={styles.detalleImg} />
              )}
              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Nombre</span><span className={styles.detalleVal}>{detalleEmp.nombre}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Estado</span><span className={`${styles.estadoBadge} ${styles[ESTADO_CONFIG[detalleEmp.estado]?.cls]}`}>{ESTADO_CONFIG[detalleEmp.estado]?.label}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Categoría</span><span className={styles.detalleVal}>{detalleEmp.categoriaNombre}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Emprendedor</span><span className={styles.detalleVal}>{detalleEmp.emprendedorNombre}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Correo</span><span className={styles.detalleVal}>{detalleEmp.emprendedorCorreo}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Teléfono</span><span className={styles.detalleVal}>{detalleEmp.telefono || "—"}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Productos</span><span className={styles.detalleVal}>{detalleEmp.productos?.length || 0} productos</span></div>
              </div>
              <div className={styles.detalleDesc}>
                <span className={styles.detalleKey}>Descripción</span>
                <p className={styles.detalleVal}>{detalleEmp.descripcion || "Sin descripción."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Historial ── */}
      {historialEmp && (
        <div className={styles.overlay} onClick={() => setHistorialId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Historial — {historialEmp.nombre}</h2>
              <button className={styles.modalClose} onClick={() => setHistorialId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {historialEmp.historial && historialEmp.historial.length > 0 ? (
                <ul className={styles.timeline}>
                  {historialEmp.historial.map((h, i) => (
                    <li key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineAccion}>{h.accion}</p>
                        <p className={styles.timelineMeta}>{formatFecha(h.fecha)} · {h.admin}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyModal}>Este emprendimiento aún no tiene historial de cambios registrado.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Rechazar (sin motivo) ── */}
      {rechazarModal && (
        <div className={styles.overlay} onClick={() => setRechazarModal(null)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Rechazar emprendimiento</h2>
              <button className={styles.modalClose} onClick={() => setRechazarModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmMsg}>¿Estás seguro de que deseas rechazar este emprendimiento?</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setRechazarModal(null)}>Cancelar</button>
              <button className={`${styles.btnAccion} ${styles.btnRechazar}`} style={{ padding: "9px 20px" }} onClick={confirmarRechazo}>
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}