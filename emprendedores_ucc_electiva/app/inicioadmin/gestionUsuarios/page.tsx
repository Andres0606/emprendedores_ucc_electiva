"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../css/inicioAdmin/gestionUsuarios.module.css";
import { API_URL } from "@/src/config/api";

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  carrera?: string;
  tipoUsuario: "estudiante" | "emprendedor" | "administrativo";
  estado?: "activo" | "inactivo";
  createdAt?: string;
}

type TipoFiltro  = "todos" | "estudiante" | "emprendedor" | "administrativo";
type EstadoFiltro = "todos" | "activo" | "inactivo";

const TIPO_CONFIG: Record<string, { label: string; cls: string }> = {
  estudiante:    { label: "Estudiante",    cls: "tipoEstudiante"    },
  emprendedor:   { label: "Emprendedor",   cls: "tipoEmprendedor"   },
  administrativo:{ label: "Administrativo",cls: "tipoAdministrativo"},
};

const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  activo:     { label: "Activo",     cls: "estadoActivo"    },
  inactivo:   { label: "Inactivo",   cls: "estadoInactivo"  },
};

function iniciales(nombre: string, apellido: string) {
  return `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
}

export default function GestionUsuariosPage() {
  const router = useRouter();

  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [busqueda, setBusqueda]           = useState("");
  const [filtroTipo, setFiltroTipo]       = useState<TipoFiltro>("todos");
  const [filtroEstado, setFiltroEstado]   = useState<EstadoFiltro>("todos");

  const [detalleId, setDetalleId]         = useState<string | null>(null);
  const [editarId, setEditarId]           = useState<string | null>(null);
  const [formEditar, setFormEditar]       = useState<Partial<Usuario>>({});

  useEffect(() => {
    const usr = sessionStorage.getItem("usuario");
    if (!usr) { router.push("/autenticacion/login"); return; }
    const u = JSON.parse(usr);
    if (u.tipoUsuario !== "admin") { router.push("/"); return; }
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/usuarios`);
      if (!res.ok) throw new Error();
      const data: Usuario[] = await res.json();
      
      // Obtener el admin actual para no mostrarlo
      const usuarioActual = sessionStorage.getItem("usuario");
      let adminActualId = null;
      if (usuarioActual) {
        try {
          const admin = JSON.parse(usuarioActual);
          adminActualId = admin.id || admin._id;
        } catch (e) {
          console.error("Error al parsear admin actual:", e);
        }
      }
      
      // Filtrar: solo mostrar estudiantes, emprendedores y administrativos (no admins)
      const usuariosFiltrados = data.filter(u => {
        const userId = u.id || u._id;
        const tipo = u.tipoUsuario?.toLowerCase();
        return tipo !== "admin" && userId !== adminActualId;
      });
      
      setUsuarios(usuariosFiltrados.map(u => ({ ...u, estado: u.estado || "activo" })));
    } catch {
      setError("Error al cargar usuarios. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) cargarUsuarios();
      else alert("Error al actualizar el estado.");
    } catch { alert("Error de conexión."); }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, { method: "DELETE" });
      if (res.ok) cargarUsuarios();
      else alert("Error al eliminar.");
    } catch { alert("Error de conexión."); }
  }

  async function guardarEdicion() {
    if (!editarId) return;
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${editarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEditar),
      });
      if (res.ok) { cargarUsuarios(); setEditarId(null); }
      else alert("Error al guardar cambios.");
    } catch { alert("Error de conexión."); }
  }

  function abrirEditar(u: Usuario) {
    setEditarId(u.id || u._id || "");
    setFormEditar({ nombre: u.nombre, apellido: u.apellido, correo: u.correo, carrera: u.carrera, tipoUsuario: u.tipoUsuario });
  }

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      if (filtroTipo !== "todos" && u.tipoUsuario !== filtroTipo) return false;
      if (filtroEstado !== "todos" && (u.estado || "activo") !== filtroEstado) return false;
      const q = busqueda.toLowerCase();
      if (q && !`${u.nombre} ${u.apellido}`.toLowerCase().includes(q) && !u.correo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [usuarios, filtroTipo, filtroEstado, busqueda]);

  const contadores = useMemo(() => ({
    todos:         usuarios.length,
    estudiante:    usuarios.filter(u => u.tipoUsuario === "estudiante").length,
    emprendedor:   usuarios.filter(u => u.tipoUsuario === "emprendedor").length,
    administrativo:usuarios.filter(u => u.tipoUsuario === "administrativo").length,
    activo:        usuarios.filter(u => (u.estado || "activo") === "activo").length,
    inactivo:      usuarios.filter(u => u.estado === "inactivo").length,
  }), [usuarios]);

  const detalleUsr = usuarios.find(u => (u.id || u._id) === detalleId);

  if (loading) return <main className={styles.main}><div className={styles.centered}><div className={styles.spinner} /><p>Cargando usuarios...</p></div></main>;
  if (error)   return <main className={styles.main}><div className={styles.centered}><p className={styles.errorMsg}>{error}</p><button className={styles.btnPrimary} onClick={cargarUsuarios}>Reintentar</button></div></main>;

  return (
    <main className={styles.main}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/inicioadmin" className={styles.back}>← Panel de administración</Link>
          <h1 className={styles.pageTitle}>Gestión de usuarios</h1>
          <p className={styles.pageSubtitle}>{usuarios.length} usuarios registrados en la plataforma</p>
        </div>

      </div>

      {/* Pills tipo */}
      <div className={styles.estadoPills}>
        {(["todos","estudiante","emprendedor","administrativo"] as const).map(t => (
          <button
            key={t}
            className={`${styles.pill} ${filtroTipo === t ? styles.pillActive : ""} ${t !== "todos" ? styles[`pill_${t}`] : ""}`}
            onClick={() => setFiltroTipo(t)}
          >
            {t === "todos" ? "Todos" : TIPO_CONFIG[t].label}
            <span className={styles.pillCount}>{contadores[t]}</span>
          </button>
        ))}
      </div>

      {/* Pills estado */}
      <div className={styles.estadoPills} style={{ marginBottom: "20px" }}>
        {(["todos","activo","inactivo"] as const).map(e => (
          <button
            key={e}
            className={`${styles.pill} ${filtroEstado === e ? styles.pillActive : ""} ${e !== "todos" ? styles[`pill_${e}`] : ""}`}
            onClick={() => setFiltroEstado(e)}
          >
            {e === "todos" ? "Todos los estados" : ESTADO_CONFIG[e].label}
            <span className={styles.pillCount}>{contadores[e]}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {(busqueda || filtroTipo !== "todos" || filtroEstado !== "todos") && (
          <button className={styles.btnLimpiar} onClick={() => { setBusqueda(""); setFiltroTipo("todos"); setFiltroEstado("todos"); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className={styles.tableWrap}>
        {filtrados.length === 0 ? (
          <div className={styles.empty}>No hay usuarios que coincidan con los filtros aplicados.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Carrera</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => {
                const id = u.id || u._id || "";
                const estado = u.estado || "activo";
                return (
                  <tr key={id} className={styles.tableRow}>

                    <td className={styles.tdUsuario}>
                      <div className={styles.usrThumb}>
                        <div className={styles.avatar}>{iniciales(u.nombre, u.apellido)}</div>
                        <div>
                          <p className={styles.usrNombre}>{u.nombre} {u.apellido}</p>
                          <p className={styles.usrId}>ID: {id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>

                    <td className={styles.tdCorreo}>{u.correo}</td>

                    <td>
                      <span className={`${styles.tipoBadge} ${styles[TIPO_CONFIG[u.tipoUsuario]?.cls || "tipoEstudiante"]}`}>
                        {TIPO_CONFIG[u.tipoUsuario]?.label || u.tipoUsuario}
                      </span>
                    </td>

                    <td className={styles.tdCarrera}>{u.carrera || "—"}</td>

                    <td>
                      <span className={`${styles.estadoBadge} ${styles[ESTADO_CONFIG[estado]?.cls || "estadoActivo"]}`}>
                        {ESTADO_CONFIG[estado]?.label || estado}
                      </span>
                    </td>

                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnAccion} onClick={() => setDetalleId(id)}>Ver</button>
                        <button className={styles.btnAccion} onClick={() => abrirEditar(u)}>Editar</button>
                        {estado === "activo" && (
                          <button className={`${styles.btnAccion} ${styles.btnInactivar}`} onClick={() => cambiarEstado(id, "inactivo")}>
                            Inactivar
                          </button>
                        )}
                        {estado === "inactivo" && (
                          <button className={`${styles.btnAccion} ${styles.btnActivar}`} onClick={() => cambiarEstado(id, "activo")}>
                            Activar
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

      {/* Modal: Detalle */}
      {detalleUsr && (
        <div className={styles.overlay} onClick={() => setDetalleId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle del usuario</h2>
              <button className={styles.modalClose} onClick={() => setDetalleId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detalleAvatarRow}>
                <div className={styles.avatarLg}>{iniciales(detalleUsr.nombre, detalleUsr.apellido)}</div>
                <div>
                  <p className={styles.detalleNombreLg}>{detalleUsr.nombre} {detalleUsr.apellido}</p>
                  <span className={`${styles.tipoBadge} ${styles[TIPO_CONFIG[detalleUsr.tipoUsuario]?.cls]}`}>
                    {TIPO_CONFIG[detalleUsr.tipoUsuario]?.label}
                  </span>
                </div>
              </div>
              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Correo</span><span className={styles.detalleVal}>{detalleUsr.correo}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Estado</span><span className={`${styles.estadoBadge} ${styles[ESTADO_CONFIG[detalleUsr.estado || "activo"]?.cls]}`}>{ESTADO_CONFIG[detalleUsr.estado || "activo"]?.label}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>Carrera / Rol</span><span className={styles.detalleVal}>{detalleUsr.carrera || "—"}</span></div>
                <div className={styles.detalleItem}><span className={styles.detalleKey}>ID</span><span className={styles.detalleVal}>{(detalleUsr.id || detalleUsr._id || "").slice(-10).toUpperCase()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {editarId && (
        <div className={styles.overlay} onClick={() => setEditarId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar usuario</h2>
              <button className={styles.modalClose} onClick={() => setEditarId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre</label>
                  <input className={styles.formInput} value={formEditar.nombre || ""} onChange={e => setFormEditar(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Apellido</label>
                  <input className={styles.formInput} value={formEditar.apellido || ""} onChange={e => setFormEditar(p => ({ ...p, apellido: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Correo</label>
                  <input className={styles.formInput} type="email" value={formEditar.correo || ""} onChange={e => setFormEditar(p => ({ ...p, correo: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Carrera / Rol</label>
                  <input className={styles.formInput} value={formEditar.carrera || ""} onChange={e => setFormEditar(p => ({ ...p, carrera: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de usuario</label>
                  <select className={styles.formInput} value={formEditar.tipoUsuario || "estudiante"} onChange={e => setFormEditar(p => ({ ...p, tipoUsuario: e.target.value as any }))}>
                    <option value="estudiante">Estudiante</option>
                    <option value="emprendedor">Emprendedor</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setEditarId(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}