"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/misemprendimientos.module.css";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";
import { useRouter } from "next/navigation";

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId?: string;
  categoriaNombre?: string;
  usuarioId?: string;
  estado: string;
  telefono?: string;
  imagenes?: string[];
  productos?: Producto[];
  createdAt?: string;
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipoUsuario: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
}

const ESTADO_CONFIG: Record<string, {
  label: string;
  badgeCls: string;
  pillCls: string;
  mensaje: string;
}> = {
  activo:    { label: "Activo",    badgeCls: "badgeActivo",    pillCls: "pillActivo",    mensaje: "✅ Tu emprendimiento está activo y visible para toda la comunidad." },
  pendiente: { label: "Pendiente", badgeCls: "badgePendiente", pillCls: "pillPendiente", mensaje: "⏳ Tu emprendimiento está en revisión. Un administrador lo evaluará pronto." },
  rechazado: { label: "Rechazado", badgeCls: "badgeRechazado", pillCls: "pillRechazado", mensaje: "❌ Tu emprendimiento fue rechazado. Puedes crear uno nuevo." },
  suspendido: { label: "Suspendido", badgeCls: "badgeSuspendido", pillCls: "pillSuspendido", mensaje: "⚠️ Tu emprendimiento ha sido suspendido por incumplir las normas." },
};

export default function MisEmprendimientosPage() {
  const router = useRouter();

  const [usuario,         setUsuario]         = useState<Usuario | null>(null);
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [categorias,      setCategorias]      = useState<Categoria[]>([]);
  const [seleccionado,    setSeleccionado]    = useState<string | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [imgIdx,          setImgIdx]          = useState(0);

  // Estados para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editandoEmp, setEditandoEmp] = useState<Emprendimiento | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    telefono: "",
    imagenes: [] as string[]
  });
  const [editandoLoading, setEditandoLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [nuevaImagen, setNuevaImagen] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const guardado = sessionStorage.getItem("usuario");
      if (!guardado) { router.push("/autenticacion/login"); return; }

      const u: Usuario = JSON.parse(guardado);
      setUsuario(u);
      const uid = u.id || u._id;
      if (!uid) { setLoading(false); return; }

      try {
        // Cargar categorías
        const resCat = await fetch(`${API_BASE_URL}/api/categorias`);
        if (resCat.ok) {
          const cats = await resCat.json();
          setCategorias(cats);
        }

        const res = await fetch(`${API_BASE_URL}/api/emprendimientos`);
        if (!res.ok) throw new Error("No se pudieron cargar los emprendimientos.");
        const data: Emprendimiento[] = await res.json();

        const mios = data.filter(e => String(e.usuarioId || "") === String(uid));

        // Mapa de categorías
        let categoriasMap: Record<string, string> = {};
        categorias.forEach((c: any) => {
          const cid = c.id || c._id;
          if (cid) categoriasMap[cid] = c.nombre;
        });

        const miosConCat = mios.map(e => ({
          ...e,
          categoriaNombre: e.categoriaId ? (categoriasMap[e.categoriaId] || "Sin categoría") : "Sin categoría",
        }));

        setEmprendimientos(miosConCat);
        if (miosConCat.length > 0) {
          setSeleccionado(miosConCat[0].id || miosConCat[0]._id || null);
        }
      } catch (e: any) {
        setError(e.message || "Error inesperado.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const emp = emprendimientos.find(e => (e.id || e._id) === seleccionado) || null;
  const cfg = ESTADO_CONFIG[emp?.estado || "pendiente"] || ESTADO_CONFIG.pendiente;

  // Determinar si puede crear un nuevo emprendimiento
  const puedeCrearNuevo = () => {
    if (emprendimientos.length === 0) return true;
    if (!emp) return true;
    return emp.estado === "activo" || emp.estado === "rechazado";
  };

  // Eliminar emprendimiento
  const eliminarEmprendimiento = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este emprendimiento? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/emprendimientos/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        const nuevosEmprendimientos = emprendimientos.filter(e => (e.id || e._id) !== id);
        setEmprendimientos(nuevosEmprendimientos);
        
        if (nuevosEmprendimientos.length === 0) {
          setSeleccionado(null);
        } else {
          setSeleccionado(nuevosEmprendimientos[0].id || nuevosEmprendimientos[0]._id || null);
        }
        
        alert("Emprendimiento eliminado correctamente");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error al eliminar el emprendimiento");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión al eliminar el emprendimiento");
    }
  };

  // Abrir modal de edición (solo si no está suspendido)
  const abrirEditModal = () => {
    if (!emp || emp.estado === "suspendido") {
      alert("No puedes editar un emprendimiento suspendido");
      return;
    }
    setEditandoEmp(emp);
    setEditForm({
      nombre: emp.nombre,
      descripcion: emp.descripcion || "",
      categoriaId: emp.categoriaId || "",
      telefono: emp.telefono || "",
      imagenes: emp.imagenes || []
    });
    setEditError(null);
    setNuevaImagen("");
    setEditModalOpen(true);
  };

  // Cerrar modal
  const cerrarEditModal = () => {
    setEditModalOpen(false);
    setEditandoEmp(null);
    setEditForm({
      nombre: "",
      descripcion: "",
      categoriaId: "",
      telefono: "",
      imagenes: []
    });
    setNuevaImagen("");
    setEditError(null);
  };

  // Agregar nueva imagen
  const agregarImagen = () => {
    if (nuevaImagen.trim() && !editForm.imagenes.includes(nuevaImagen.trim())) {
      setEditForm({
        ...editForm,
        imagenes: [...editForm.imagenes, nuevaImagen.trim()]
      });
      setNuevaImagen("");
    }
  };

  // Eliminar imagen
  const eliminarImagen = (index: number) => {
    const nuevasImagenes = editForm.imagenes.filter((_, i) => i !== index);
    setEditForm({ ...editForm, imagenes: nuevasImagenes });
  };

  // Guardar cambios
  const guardarEdicion = async () => {
    if (!editandoEmp) return;
    
    if (!editForm.nombre.trim()) {
      setEditError("El nombre es obligatorio");
      return;
    }
    
    setEditandoLoading(true);
    setEditError(null);
    
    try {
      const id = editandoEmp.id || editandoEmp._id;
      const response = await fetch(`${API_BASE_URL}/api/emprendimientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editForm.nombre,
          descripcion: editForm.descripcion,
          categoriaId: editForm.categoriaId,
          telefono: editForm.telefono,
          imagenes: editForm.imagenes,
          usuarioId: editandoEmp.usuarioId,
          estado: editandoEmp.estado,
          productos: editandoEmp.productos || []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar");
      }
      
      const actualizado = await response.json();
      
      // Actualizar la lista local
      setEmprendimientos(prev => prev.map(e => {
        if ((e.id || e._id) === id) {
          return {
            ...actualizado,
            categoriaNombre: categorias.find(c => (c.id || c._id) === actualizado.categoriaId)?.nombre || "Sin categoría"
          };
        }
        return e;
      }));
      
      cerrarEditModal();
      alert("Emprendimiento actualizado correctamente");
      
    } catch (err: any) {
      setEditError(err.message || "Error al guardar los cambios");
    } finally {
      setEditandoLoading(false);
    }
  };

  if (loading) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando tus emprendimientos...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.btnRetry} onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    </main>
  );

  return (
    <main className={styles.main}>

      {/* Hero */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Mis emprendimientos</span>
          <h1 className={styles.heroTitle}>
            Hola, <span className={styles.heroName}>{usuario?.nombre || "Emprendedor"}</span>
          </h1>
          <p className={styles.heroSub}>
            Administra, edita y controla el estado de tus emprendimientos registrados en la plataforma.
          </p>
          <div className={styles.heroActions}>
            <Link href="/inicioemprendedor" className={styles.btnSecondary}>← Panel principal</Link>
            {puedeCrearNuevo() && (
              <Link href="/inicioemprendedor/crearemprendimiento" className={styles.btnPrimary}>
                + Nuevo emprendimiento
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{emprendimientos.length}</span>
          <span className={styles.statLabel}>MIS EMPRENDIMIENTOS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{emp?.productos?.length ?? 0}</span>
          <span className={styles.statLabel}>PRODUCTOS TOTALES</span>
        </div>
        <div className={styles.statItem}>
          {emp ? (
            <span className={`${styles.estadoBadgeStat} ${styles[cfg.badgeCls]}`}>
              {cfg.label}
            </span>
          ) : (
            <span className={styles.statValueNA}>—</span>
          )}
          <span className={styles.statLabel}>ESTADO ACTUAL</span>
        </div>
      </section>

      {/* Body */}
      <div className={styles.body}>

        {emprendimientos.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Aún no tienes emprendimientos</h2>
            <p className={styles.emptyDesc}>
              Crea tu primer emprendimiento y empieza a vender en la plataforma UCC.
            </p>
            <Link href="/inicioemprendedor/crearemprendimiento" className={styles.btnPrimaryLg}>
              Crear mi primer emprendimiento
            </Link>
          </div>
        ) : (
          <>
            {/* Mensaje cuando el emprendimiento está PENDIENTE */}
            {emp?.estado === "pendiente" && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⏳</span>
                <p className={styles.warningText}>Tienes un emprendimiento en revisión. Espera a que sea evaluado antes de crear otro.</p>
              </div>
            )}

            {/* Mensaje cuando el emprendimiento está SUSPENDIDO */}
            {emp?.estado === "suspendido" && (
              <div className={`${styles.warningCard} ${styles.warningCardSuspendido}`}>
                <span className={styles.warningIcon}>🔒</span>
                <p className={styles.warningText}>Tu emprendimiento ha sido suspendido por el administrador. No puedes editarlo ni gestionar productos hasta que sea reactivado.</p>
                <Link href="/contacto" className={styles.btnLinkWarning}>
        
                </Link>
              </div>
            )}

            {/* Selector de emprendimientos */}
            {emprendimientos.length > 1 && (
              <div className={styles.selectorWrap}>
                <p className={styles.selectorLabel}>Mis emprendimientos ({emprendimientos.length})</p>
                <div className={styles.selectorRow}>
                  {emprendimientos.map(e => {
                    const eid = e.id || e._id;
                    const isActive = seleccionado === eid;
                    const eCfg = ESTADO_CONFIG[e.estado] || ESTADO_CONFIG.pendiente;
                    return (
                      <button
                        key={eid}
                        className={`${styles.selectorTab} ${isActive ? styles.selectorTabActive : ""}`}
                        onClick={() => { setSeleccionado(eid || null); setImgIdx(0); }}
                      >
                        <div className={styles.selectorTabLetter}>
                          {e.nombre[0]?.toUpperCase()}
                        </div>
                        <div className={styles.selectorTabBody}>
                          <span className={styles.selectorTabNombre}>{e.nombre}</span>
                          <span className={`${styles.selectorTabPill} ${styles[eCfg.pillCls]}`}>
                            {eCfg.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detalle del emprendimiento seleccionado */}
            {emp && (
              <div className={styles.detailGrid}>

                {/* Columna izquierda */}
                <div className={styles.colLeft}>

                  {/* Imagen */}
                  <div className={styles.imgCard}>
                    {(emp.imagenes?.length || 0) > 0 ? (
                      <>
                        <div className={styles.imgMainWrap}>
                          <img src={emp.imagenes![imgIdx]} alt={emp.nombre} className={styles.imgMainImg} />
                        </div>
                        {emp.imagenes!.length > 1 && (
                          <div className={styles.imgThumbs}>
                            {emp.imagenes!.map((img, i) => (
                              <button
                                key={i}
                                className={`${styles.imgThumb} ${imgIdx === i ? styles.imgThumbActive : ""}`}
                                onClick={() => setImgIdx(i)}
                              >
                                <img src={img} alt="" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.imgPlaceholder}>
                        <span className={styles.imgPlaceholderLetter}>
                          {emp.nombre[0]?.toUpperCase()}
                        </span>
                        <p>Sin imágenes</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones - DESHABILITADAS si está suspendido */}
                  <div className={styles.actionsCard}>
                    <p className={styles.actionsLabel}>ACCIONES RÁPIDAS</p>
                    <div className={styles.actionsList}>
                      <button
                        onClick={abrirEditModal}
                        className={`${styles.btnEditar} ${emp?.estado === "suspendido" ? styles.btnDisabled : ""}`}
                        disabled={emp?.estado === "suspendido"}
                        title={emp?.estado === "suspendido" ? "No puedes editar un emprendimiento suspendido" : ""}
                      >
                        Editar emprendimiento
                      </button>
                      <Link
                        href={emp?.estado === "suspendido" ? "#" : `/inicioemprendedor/misproductos?emprendimientoId=${emp.id || emp._id}`}
                        className={`${styles.btnProductos} ${emp?.estado === "suspendido" ? styles.btnDisabled : ""}`}
                        onClick={(e) => {
                          if (emp?.estado === "suspendido") {
                            e.preventDefault();
                            alert("No puedes gestionar productos de un emprendimiento suspendido");
                          }
                        }}
                        style={emp?.estado === "suspendido" ? { pointerEvents: "none", opacity: 0.6 } : {}}
                      >
                        Gestionar productos
                      </Link>
                      <button
                        className={styles.btnEliminar}
                        onClick={() => eliminarEmprendimiento(emp.id || emp._id || "")}
                      >
                        Eliminar emprendimiento
                      </button>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className={styles.colRight}>

                  {/* Info card */}
                  <div className={styles.infoCard}>
                    <div className={styles.infoHeader}>
                      <div className={styles.infoHeaderLeft}>
                        <h2 className={styles.infoNombre}>{emp.nombre}</h2>
                        <div className={styles.infoHeaderMeta}>
                          {emp.categoriaNombre && (
                            <span className={styles.catBadge}>{emp.categoriaNombre}</span>
                          )}
                          <span className={`${styles.estadoBadge} ${styles[cfg.badgeCls]}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className={styles.statusNote}>{cfg.mensaje}</p>

                    <div className={styles.infoSep} />

                    <div className={styles.infoFields}>
                      <div className={`${styles.infoField} ${styles.infoFieldFull}`}>
                        <span className={styles.infoFieldLabel}>DESCRIPCIÓN</span>
                        <p className={styles.infoFieldVal}>{emp.descripcion || "Sin descripción."}</p>
                      </div>
                      {emp.telefono && (
                        <div className={`${styles.infoField} ${styles.infoFieldFull}`}>
                          <span className={styles.infoFieldLabel}>TELÉFONO DE CONTACTO</span>
                          <p className={styles.infoFieldVal}>{emp.telefono}</p>
                        </div>
                      )}
                      <div className={styles.infoField}>
                        <span className={styles.infoFieldLabel}>CATEGORÍA</span>
                        <p className={styles.infoFieldVal}>{emp.categoriaNombre}</p>
                      </div>
                      <div className={styles.infoField}>
                        <span className={styles.infoFieldLabel}>TOTAL PRODUCTOS</span>
                        <p className={styles.infoFieldVal}>
                          {emp.productos?.length || 0} producto{emp.productos?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {emp.createdAt && (
                        <div className={styles.infoField}>
                          <span className={styles.infoFieldLabel}>REGISTRADO EL</span>
                          <p className={styles.infoFieldVal}>
                            {new Date(emp.createdAt).toLocaleDateString("es-CO", {
                              day: "numeric", month: "long", year: "numeric"
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL DE EDICIÓN ── */}
      {editModalOpen && editandoEmp && (
        <div className={styles.overlay} onClick={cerrarEditModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar emprendimiento</h2>
              <button className={styles.modalClose} onClick={cerrarEditModal}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              {editError && (
                <div className={styles.formErrorBanner}>
                  {editError}
                </div>
              )}
              
              {/* Nombre */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del emprendimiento *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  placeholder="Ej: Mi Emprendimiento"
                />
              </div>
              
              {/* Descripción */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  rows={4}
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  placeholder="Describe tu emprendimiento..."
                />
              </div>
              
              {/* Categoría */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Categoría</label>
                <select
                  className={styles.formSelect}
                  value={editForm.categoriaId}
                  onChange={(e) => setEditForm({ ...editForm, categoriaId: e.target.value })}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Teléfono */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Teléfono de contacto</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  placeholder="Ej: 3123456789"
                />
              </div>
              
              {/* Imágenes */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Imágenes del emprendimiento</label>
                
                {/* Lista de imágenes existentes */}
                {editForm.imagenes.length > 0 && (
                  <div className={styles.imagenesLista}>
                    {editForm.imagenes.map((img, idx) => (
                      <div key={idx} className={styles.imagenItem}>
                        <img src={img} alt={`Imagen ${idx + 1}`} className={styles.imagenPreview} />
                        <button
                          type="button"
                          className={styles.imagenEliminar}
                          onClick={() => eliminarImagen(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Input para agregar nueva imagen */}
                <div className={styles.agregarImagenRow}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="URL de la imagen"
                    value={nuevaImagen}
                    onChange={(e) => setNuevaImagen(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnAgregarImagen}
                    onClick={agregarImagen}
                  >
                    Agregar
                  </button>
                </div>
                <p className={styles.formHelper}>
                  Usa postimages.org para subir tus imágenes y pega la URL aquí.
                </p>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarEditModal}>
                Cancelar
              </button>
              <button
                className={styles.btnGuardar}
                onClick={guardarEdicion}
                disabled={editandoLoading}
              >
                {editandoLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}