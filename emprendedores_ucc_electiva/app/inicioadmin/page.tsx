"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../css/inicioAdmin/page.module.css";
import { API_URL } from "@/src/config/api";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  telefono?: string;
  imagenes: string[];
  productos: Array<{ nombre: string; precio: number; stock: number; imagen: string; }>;
  totalVentas?: number;
  createdAt?: string;
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
  descripcion: string;
}

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: "Presencial" | "Virtual" | "Híbrido";
  descripcion: string;
  tipo: string;
  imagen: string;
}

type Tab = "pendientes" | "activos" | "eventos" | "ranking";

export default function InicioAdminPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({ totalEmprendimientos: 0, pendientesAprobacion: 0, activos: 0, totalUsuarios: 0, emprendedores: 0, estudiantes: 0 });
  const [emprendimientosPendientes, setEmprendimientosPendientes] = useState<Emprendimiento[]>([]);
  const [emprendimientosActivos, setEmprendimientosActivos] = useState<Emprendimiento[]>([]);
  const [categorias, setCategorias] = useState<Map<string, string>>(new Map());
  const [usuariosMap, setUsuariosMap] = useState<Map<string, Usuario>>(new Map());
  const [activeTab, setActiveTab] = useState<Tab>("pendientes");
  const [searchTerm, setSearchTerm] = useState("");

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [modalEventoAbierto, setModalEventoAbierto] = useState(false);
  const [modalAyudaAbierto, setModalAyudaAbierto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [formEvento, setFormEvento] = useState<Omit<Evento, "id">>({ 
    nombre: "", 
    fecha: "", 
    hora: "", 
    lugar: "", 
    modalidad: "Presencial", 
    descripcion: "", 
    tipo: "",
    imagen: ""
  });

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (!usuarioGuardado) { router.push("/autenticacion/login"); return; }
    const user = JSON.parse(usuarioGuardado);
    
    // 🔥 CORREGIDO: Soporta tanto tipoUsuario como role (del backend)
    const rol = user.tipoUsuario || user.role;
    if (rol !== "admin") { router.push("/"); return; }
    
    setUsuario(user);
    cargarDatos();
  }, [router]);

  const obtenerCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categorias`);
      if (!res.ok) return;
      const data: Categoria[] = await res.json();
      const map = new Map<string, string>();
      data.forEach(cat => { const id = cat.id || cat._id; if (id) map.set(id, cat.nombre); });
      setCategorias(map);
    } catch (e) { console.error(e); }
  };

  const obtenerTodosUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { return []; }
  };

  const obtenerEventos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/eventos`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (e) { console.error(e); }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await obtenerCategorias();
      const res = await fetch(`${API_URL}/api/emprendimientos`);
      if (!res.ok) throw new Error();
      const emprendimientos: Emprendimiento[] = await res.json();
      const usuarios = await obtenerTodosUsuarios();
      const map = new Map<string, Usuario>();
      usuarios.forEach((u: Usuario) => { const id = u.id || u._id; if (id) map.set(id, u); });
      setUsuariosMap(map);
      const pendientes = emprendimientos.filter(e => e.estado === "pendiente");
      const activos = emprendimientos.filter(e => e.estado === "activo");
      setStats({ totalEmprendimientos: emprendimientos.length, pendientesAprobacion: pendientes.length, activos: activos.length, totalUsuarios: usuarios.length, emprendedores: usuarios.filter((u: Usuario) => u.tipoUsuario === "emprendedor").length, estudiantes: usuarios.filter((u: Usuario) => u.tipoUsuario === "estudiante" || u.tipoUsuario === "administrativo").length });
      setEmprendimientosPendientes(pendientes);
      setEmprendimientosActivos(activos);
      await obtenerEventos();
    } catch (e) { setError("Error al cargar los datos"); }
    finally { setLoading(false); }
  };

  const aprobarEmprendimiento = async (id: string) => {
    if (!confirm("¿Aprobar este emprendimiento?")) return;
    try { const res = await fetch(`${API_URL}/api/emprendimientos/${id}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: "activo" }) }); if (res.ok) cargarDatos(); } catch (e) { alert("Error de conexión"); }
  };

  const rechazarEmprendimiento = async (id: string) => {
    const motivo = prompt("Motivo del rechazo:"); if (!motivo) return;
    try { const res = await fetch(`${API_URL}/api/emprendimientos/${id}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: "rechazado" }) }); if (res.ok) cargarDatos(); } catch (e) { alert("Error de conexión"); }
  };

  const eliminarEmprendimiento = async (id: string) => {
    if (!confirm("¿Eliminar este emprendimiento? No se puede deshacer.")) return;
    try { const res = await fetch(`${API_URL}/api/emprendimientos/${id}`, { method: "DELETE" }); if (res.ok) cargarDatos(); } catch (e) { alert("Error de conexión"); }
  };

  const filtrar = (list: Emprendimiento[]) => !searchTerm ? list : list.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
  const getNombreCategoria = (id: string) => categorias.get(id) || "Sin categoría";
  const getNombreEmprendedor = (id: string) => { const u = usuariosMap.get(id); return u ? `${u.nombre} ${u.apellido}` : "—"; };

  const abrirNuevo = () => { 
    setEventoEditando(null); 
    setFormEvento({ 
      nombre: "", 
      fecha: "", 
      hora: "", 
      lugar: "", 
      modalidad: "Presencial", 
      descripcion: "", 
      tipo: "",
      imagen: "" 
    }); 
    setModalEventoAbierto(true); 
  };
  
  const abrirEditar = (ev: Evento) => { 
    setEventoEditando(ev); 
    setFormEvento({ 
      nombre: ev.nombre, 
      fecha: ev.fecha, 
      hora: ev.hora, 
      lugar: ev.lugar, 
      modalidad: ev.modalidad, 
      descripcion: ev.descripcion, 
      tipo: ev.tipo,
      imagen: ev.imagen || "" 
    }); 
    setModalEventoAbierto(true); 
  };
  
  const guardarEvento = async () => {
    if (!formEvento.nombre || !formEvento.fecha) return;
    
    try {
      const token = sessionStorage.getItem("token");
      const url = eventoEditando ? `${API_URL}/api/eventos/${eventoEditando.id}` : `${API_URL}/api/eventos`;
      const method = eventoEditando ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formEvento)
      });
      
      if (res.ok) {
        await obtenerEventos();
        setModalEventoAbierto(false);
      } else {
        alert("Error al guardar el evento");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };
  
  const eliminarEvento = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/eventos/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        await obtenerEventos();
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const handleCerrarSesion = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      sessionStorage.clear();
      localStorage.removeItem("categoriasInteres");
      localStorage.removeItem("carrito");
      localStorage.removeItem("eventos_ucc");
      router.push("/");
    }
  };

  if (loading) return <main className={styles.main}><div className={styles.loadingContainer}><div className={styles.spinner} /><p>Cargando panel...</p></div></main>;
  if (error) return <main className={styles.main}><div className={styles.errorContainer}><p>{error}</p><button onClick={() => window.location.reload()} className={styles.btnPrimary}>Reintentar</button></div></main>;

  const STATS_DATA = [
    { value: stats.totalEmprendimientos, label: "Total emprendimientos", mod: "" },
    { value: stats.pendientesAprobacion, label: "Pendientes de aprobación", mod: styles.statWarn },
    { value: stats.activos, label: "Emprendimientos activos", mod: styles.statGreen },
    { value: stats.totalUsuarios, label: "Usuarios registrados", mod: "" },
    { value: stats.emprendedores, label: "Emprendedores", mod: "" },
    { value: stats.estudiantes, label: "Estudiantes", mod: "" },
  ];

  return (
    <main className={styles.main}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeftButton}>
          <Link href="/" className={styles.btnVolverInicio}>
            ← Volver al inicio
          </Link>
        </div>
        
        <div className={styles.heroRightButton}>
          <button onClick={handleCerrarSesion} className={styles.btnLogout}>
            Cerrar sesión
          </button>
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Panel de <span className={styles.heroAccent}>Administración</span></h1>
          <p className={styles.heroSub}>Bienvenido, {usuario?.nombre} {usuario?.apellido}</p>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </div>

      <div className={styles.body}>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {STATS_DATA.map((s, i) => (
            <div key={i} className={`${styles.statCard} ${s.mod}`}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Panel principal */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${activeTab === "pendientes" ? styles.tabActive : ""}`} onClick={() => setActiveTab("pendientes")}>
                Pendientes <span className={styles.tabCount}>{emprendimientosPendientes.length}</span>
              </button>
              <button className={`${styles.tab} ${activeTab === "activos" ? styles.tabActive : ""}`} onClick={() => setActiveTab("activos")}>
                Activos <span className={styles.tabCount}>{emprendimientosActivos.length}</span>
              </button>
              <button className={`${styles.tab} ${activeTab === "eventos" ? styles.tabActive : ""}`} onClick={() => setActiveTab("eventos")}>
                Eventos <span className={styles.tabCount}>{eventos.length}</span>
              </button>
              <button className={`${styles.tab} ${activeTab === "ranking" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ranking")}>
                Ranking
              </button>
            </div>

            {activeTab !== "eventos" && (
              <input type="text" placeholder="Buscar emprendimiento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
            )}
            {activeTab === "eventos" && (
              <button className={styles.btnPrimary} onClick={abrirNuevo}>+ Nuevo evento</button>
            )}
          </div>

          {/* Tab: Pendientes */}
          {activeTab === "pendientes" && (
            <div className={styles.list}>
              {filtrar(emprendimientosPendientes).length === 0
                ? <div className={styles.empty}><p>No hay emprendimientos pendientes de aprobación</p></div>
                : filtrar(emprendimientosPendientes).map(emp => (
                  <div key={emp.id || emp._id} className={styles.empCard}>
                    <div className={styles.empImgWrap}>
                      {emp.imagenes?.[0] ? <img src={emp.imagenes[0]} alt={emp.nombre} className={styles.empImg} /> : <div className={styles.empImgPlaceholder} />}
                    </div>
                    <div className={styles.empInfo}>
                      <h3 className={styles.empNombre}>{emp.nombre}</h3>
                      <p className={styles.empDesc}>{emp.descripcion}</p>
                      <div className={styles.empMeta}>
                        <span className={styles.metaTag}>{getNombreCategoria(emp.categoriaId)}</span>
                        <span className={styles.metaTag}>{getNombreEmprendedor(emp.usuarioId)}</span>
                        <span className={styles.metaTag}>{emp.productos?.length || 0} productos</span>
                      </div>
                    </div>
                    <div className={styles.empActions}>
                      <button className={styles.btnAprobar} onClick={() => aprobarEmprendimiento(emp.id || emp._id || "")}>Aprobar</button>
                      <button className={styles.btnRechazar} onClick={() => rechazarEmprendimiento(emp.id || emp._id || "")}>Rechazar</button>
                      <button className={styles.btnEliminar} onClick={() => eliminarEmprendimiento(emp.id || emp._id || "")}>Eliminar</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Tab: Activos */}
          {activeTab === "activos" && (
            <div className={styles.list}>
              {filtrar(emprendimientosActivos).length === 0
                ? <div className={styles.empty}><p>No hay emprendimientos activos</p></div>
                : filtrar(emprendimientosActivos).map(emp => (
                  <div key={emp.id || emp._id} className={styles.empCard}>
                    <div className={styles.empImgWrap}>
                      {emp.imagenes?.[0] ? <img src={emp.imagenes[0]} alt={emp.nombre} className={styles.empImg} /> : <div className={styles.empImgPlaceholder} />}
                    </div>
                    <div className={styles.empInfo}>
                      <h3 className={styles.empNombre}>{emp.nombre}</h3>
                      <p className={styles.empDesc}>{emp.descripcion}</p>
                      <div className={styles.empMeta}>
                        <span className={styles.metaTag}>{getNombreCategoria(emp.categoriaId)}</span>
                        <span className={styles.metaTag}>{getNombreEmprendedor(emp.usuarioId)}</span>
                        <span className={styles.metaTag}>{emp.productos?.length || 0} productos</span>
                        <span className={`${styles.metaTag} ${styles.metaActivo}`}>Activo</span>
                        <span className={`${styles.metaTag} ${styles.metaVentas}`}>{emp.totalVentas || 0} ventas</span>
                      </div>
                    </div>
                    <div className={styles.empActions}>
                      <Link href={`/emprendimientos/${emp.id || emp._id}`} className={styles.btnVer}>Ver</Link>
                      <button className={styles.btnEliminar} onClick={() => eliminarEmprendimiento(emp.id || emp._id || "")}>Eliminar</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Tab: Eventos */}
          {activeTab === "eventos" && (
            <div className={styles.list}>
              {eventos.length === 0
                ? <div className={styles.empty}><p>No hay eventos creados. Crea el primero.</p></div>
                : eventos.map(ev => (
                  <div key={ev.id} className={styles.eventoCard}>
                    <div className={styles.eventoImgWrap}>
                      {ev.imagen ? (
                        <img src={ev.imagen} alt={ev.nombre} className={styles.eventoImg} />
                      ) : (
                        <div className={styles.eventoImgPlaceholder}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={styles.eventoInfo}>
                      <div className={styles.eventoTopRow}>
                        <h3 className={styles.eventoNombre}>{ev.nombre}</h3>
                        <span className={styles.eventoTipo}>{ev.tipo}</span>
                        <span className={`${styles.eventoModal} ${ev.modalidad === "Virtual" ? styles.modalVirtual : ev.modalidad === "Híbrido" ? styles.modalHibrido : styles.modalPresencial}`}>{ev.modalidad}</span>
                      </div>
                      <p className={styles.eventoDesc}>{ev.descripcion}</p>
                      <div className={styles.eventoMeta}>
                        <span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {ev.hora}
                        </span>
                        <span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {ev.lugar}
                        </span>
                        <span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {ev.fecha}
                        </span>
                      </div>
                    </div>
                    <div className={styles.empActions}>
                      <button className={styles.btnVer} onClick={() => abrirEditar(ev)}>Editar</button>
                      <button className={styles.btnEliminar} onClick={() => eliminarEvento(ev.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Tab: Ranking */}
          {activeTab === "ranking" && (
            <div className={styles.list}>
              <div className={styles.rankingHeader}>
                <h2 className={styles.rankingTitle}>Emprendimientos más populares</h2>
                <p className={styles.rankingSub}>Basado en el número total de ventas registradas</p>
              </div>
              {[...emprendimientosActivos]
                .sort((a, b) => (b.totalVentas || 0) - (a.totalVentas || 0))
                .slice(0, 10)
                .map((emp, index) => (
                  <div key={emp.id || emp._id} className={`${styles.empCard} ${styles.rankingCard}`}>
                    <div className={styles.rankingBadge}>#{index + 1}</div>
                    <div className={styles.empImgWrap}>
                      {emp.imagenes?.[0] ? <img src={emp.imagenes[0]} alt={emp.nombre} className={styles.empImg} /> : <div className={styles.empImgPlaceholder} />}
                    </div>
                    <div className={styles.empInfo}>
                      <h3 className={styles.empNombre}>{emp.nombre}</h3>
                      <div className={styles.empMeta}>
                        <span className={styles.metaTag}>{getNombreCategoria(emp.categoriaId)}</span>
                        <span className={`${styles.metaTag} ${styles.metaVentas}`}>
                          {emp.totalVentas || 0} ventas totales
                        </span>
                      </div>
                    </div>
                    <div className={styles.empActions}>
                      <Link href={`/emprendimientos/${emp.id || emp._id}`} className={styles.btnVer}>Ver</Link>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className={styles.quickSection}>
          <h3 className={styles.quickTitle}>Acciones rápidas</h3>
          <div className={styles.quickGrid}>
            <Link href="/inicioadmin/gestionUsuarios" className={styles.quickCard}>
              <span className={styles.quickLabel}>Gestionar usuarios</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
            <Link href="/inicioadmin/gestionEmprendimientos" className={styles.quickCard}>
              <span className={styles.quickLabel}>Gestionar emprendimientos</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
            <Link href="/inicioadmin/gestionCategorias" className={styles.quickCard}>
              <span className={styles.quickLabel}>Gestionar categorias </span>
              <span className={styles.quickArrow}>→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Modal evento */}
      {modalEventoAbierto && (
        <div className={styles.overlay} onClick={() => setModalEventoAbierto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{eventoEditando ? "Editar evento" : "Nuevo evento"}</h2>
              <button className={styles.modalClose} onClick={() => setModalEventoAbierto(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del evento</label>
                <input className={styles.formInput} value={formEvento.nombre} onChange={e => setFormEvento(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Feria de Emprendimiento" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha</label>
                  <input className={styles.formInput} type="date" value={formEvento.fecha} onChange={e => setFormEvento(p => ({ ...p, fecha: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora</label>
                  <input className={styles.formInput} value={formEvento.hora} onChange={e => setFormEvento(p => ({ ...p, hora: e.target.value }))} placeholder="Ej: 9:00 AM" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Lugar</label>
                <input className={styles.formInput} value={formEvento.lugar} onChange={e => setFormEvento(p => ({ ...p, lugar: e.target.value }))} placeholder="Ej: Bloque A – Campus" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo</label>
                  <select className={styles.formInput} value={formEvento.tipo} onChange={e => setFormEvento(p => ({ ...p, tipo: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    {["Feria","Workshop","Charla","Bootcamp","Networking","Demo Day"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Modalidad</label>
                  <select className={styles.formInput} value={formEvento.modalidad} onChange={e => setFormEvento(p => ({ ...p, modalidad: e.target.value as any }))}>
                    <option>Presencial</option>
                    <option>Virtual</option>
                    <option>Híbrido</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.labelWithHelp}>
                  <label className={styles.formLabel}>URL de la imagen</label>
                  <button 
                    type="button" 
                    className={styles.helpBtn}
                    onClick={() => setModalAyudaAbierto(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    ¿Cómo obtener la URL?
                  </button>
                </div>
                <input className={styles.formInput} value={formEvento.imagen} onChange={e => setFormEvento(p => ({ ...p, imagen: e.target.value }))} placeholder="https://i.postimg.cc/xxxx/imagen.jpg" />
                <small className={styles.formHelper}>Usa PostImages.org para subir imágenes (tamaño recomendado: 320x240)</small>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea className={styles.formTextarea} rows={3} value={formEvento.descripcion} onChange={e => setFormEvento(p => ({ ...p, descripcion: e.target.value }))} placeholder="Describe el evento..." />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setModalEventoAbierto(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={guardarEvento}>{eventoEditando ? "Guardar cambios" : "Crear evento"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ayuda para imágenes */}
      {modalAyudaAbierto && (
        <div className={styles.overlay} onClick={() => setModalAyudaAbierto(false)}>
          <div className={`${styles.modal} ${styles.modalAyuda}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', verticalAlign: 'middle' }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                ¿Cómo obtener la URL de mi imagen?
              </h2>
              <button className={styles.modalClose} onClick={() => setModalAyudaAbierto(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.guiaContainer}>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>1</span>
                  <div>
                    <strong>Ve a PostImages.org</strong>
                    <p><a href="https://www.postimages.org/" target="_blank" rel="noopener noreferrer">https://www.postimages.org/</a></p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>2</span>
                  <div>
                    <strong>Inicia sesión o crea una cuenta gratuita</strong>
                    <p>Es rápido y gratuito</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>3</span>
                  <div>
                    <strong>Verás "Mi galería (1)" — déjalo así</strong>
                    <p>No es necesario cambiar esta opción</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>4</span>
                  <div>
                    <strong>Cambia el tamaño a "320x240 — tamaño para web"</strong>
                    <p>Este tamaño es perfecto para las tarjetas de eventos</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>5</span>
                  <div>
                    <strong>Deja "Sin caducidad" seleccionado</strong>
                    <p>Para que la imagen no expire</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>6</span>
                  <div>
                    <strong>Selecciona tu imagen y haz clic en "Subir"</strong>
                    <p>Espera a que termine la carga</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>7</span>
                  <div>
                    <strong>Busca la opción "Miniatura para sitios web"</strong>
                    <p>Aparecerá después de subir la imagen</p>
                  </div>
                </div>
                <div className={styles.guiaPaso}>
                  <span className={styles.guiaNumero}>8</span>
                  <div>
                    <strong>Copia SOLO la URL dentro de `src='...'`</strong>
                    <div className={styles.guiaEjemplo}>
                      <p>Ejemplo:</p>
                      <code>{`<img src='https://i.postimg.cc/xxxx/imagen.jpg' />`}</code>
                      <p>Copias solo: <strong>https://i.postimg.cc/xxxx/imagen.jpg</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.guiaNota}>
                <p><strong>Consejo:</strong> Puedes previsualizar la imagen pegando la URL en el campo y viendo si aparece correctamente en la tarjeta del evento.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={() => setModalAyudaAbierto(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}