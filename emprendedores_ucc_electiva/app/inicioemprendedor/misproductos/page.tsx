"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/misproductos.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Producto {
  id?: string;
  _id?: string;
  nombre: string;
  precio: number;
  stock: number;
  imagen?: string;
  emprendimientoId?: string;
  emprendimientoNombre?: string;
}

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  estado: string;
  usuarioId?: string;
  productos?: Producto[];
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  tipoUsuario: string;
}

type Vista = "grid" | "lista";
type ModalTipo = "crear" | "editar" | "eliminar" | null;

const FORM_VACIO = { nombre: "", precio: "", stock: "", imagen: "", emprendimientoId: "" };

export default function ProductosPage() {
  const router = useRouter();

  const [usuario,          setUsuario]          = useState<Usuario | null>(null);
  const [emprendimientos,  setEmprendimientos]  = useState<Emprendimiento[]>([]);
  const [productos,        setProductos]        = useState<Producto[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [emprendimientoActivo, setEmprendimientoActivo] = useState<Emprendimiento | null>(null);

  const [vista,    setVista]    = useState<Vista>("grid");
  const [busqueda, setBusqueda] = useState("");

  const [modal,          setModal]          = useState<ModalTipo>(null);
  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [form,           setForm]           = useState(FORM_VACIO);
  const [guardando,      setGuardando]      = useState(false);
  const [formError,      setFormError]      = useState<string | null>(null);

  // Función para recargar datos
  const recargarDatos = async () => {
    const uid = usuario?.id || usuario?._id;
    if (!uid) return;

    try {
      const resEmps = await fetch("http://localhost:8080/api/emprendimientos");
      if (resEmps.ok) {
        const emps: Emprendimiento[] = await resEmps.json();
        const misEmprendimientos = emps.filter(e => String(e.usuarioId) === String(uid));
        setEmprendimientos(misEmprendimientos);
        
        const activo = misEmprendimientos.find(e => e.estado === "activo");
        setEmprendimientoActivo(activo || null);
        
        let todosProductos: Producto[] = [];
        for (const emp of misEmprendimientos) {
          const eid = emp.id || emp._id;
          const productosEmp = (emp.productos || []).map((p: Producto, index: number) => ({
            ...p,
            emprendimientoNombre: emp.nombre,
            emprendimientoId: eid,
            _id: p._id || p.id || `${eid}_${p.nombre}_${Date.now()}_${index}`
          }));
          todosProductos = [...todosProductos, ...productosEmp];
        }
        setProductos(todosProductos);
      }
    } catch (e) {
      console.error("Error al recargar:", e);
    }
  };

  // ── Carga inicial ──────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      const guardado = sessionStorage.getItem("usuario");
      if (!guardado) { router.push("/autenticacion/login"); return; }
      const u: Usuario = JSON.parse(guardado);
      setUsuario(u);
      const uid = u.id || u._id;
      if (!uid) { setLoading(false); return; }

      try {
        const resEmps = await fetch("http://localhost:8080/api/emprendimientos");
        if (!resEmps.ok) throw new Error("No se pudo cargar los emprendimientos.");
        const emps: Emprendimiento[] = await resEmps.json();
        
        const misEmprendimientos = emps.filter(e => String(e.usuarioId) === String(uid));
        setEmprendimientos(misEmprendimientos);
        
        const activo = misEmprendimientos.find(e => e.estado === "activo");
        setEmprendimientoActivo(activo || null);
        
        let todosProductos: Producto[] = [];
        
        for (const emp of misEmprendimientos) {
          const eid = emp.id || emp._id;
          const productosEmp = (emp.productos || []).map((p: Producto, index: number) => ({
            ...p,
            emprendimientoNombre: emp.nombre,
            emprendimientoId: eid,
            _id: p._id || p.id || `${eid}_${p.nombre}_${Date.now()}_${index}`
          }));
          todosProductos = [...todosProductos, ...productosEmp];
        }
        
        setProductos(todosProductos);
        
      } catch (e: any) {
        console.error("Error:", e);
        setError(e.message || "Error inesperado.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const productosFiltrados = productos.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const puedeGestionarProductos = () => {
    return emprendimientoActivo !== null;
  };

  const mensajeNoPuedeGestionar = () => {
    if (emprendimientos.length === 0) {
      return "No tienes emprendimientos registrados. Crea uno para empezar a vender.";
    }
    const tienePendiente = emprendimientos.some(e => e.estado === "pendiente");
    const tieneRechazado = emprendimientos.some(e => e.estado === "rechazado");
    
    if (tienePendiente && !emprendimientoActivo) {
      return "Tienes emprendimientos en revisión. Espera a que sean aprobados para gestionar productos.";
    }
    if (tieneRechazado && !emprendimientoActivo) {
      return "Tus emprendimientos fueron rechazados. Crea uno nuevo para gestionar productos.";
    }
    return "Necesitas tener al menos un emprendimiento activo para gestionar productos.";
  };

  function abrirCrear() {
    if (!puedeGestionarProductos()) {
      alert(mensajeNoPuedeGestionar());
      return;
    }
    setForm({
      nombre: "",
      precio: "",
      stock: "",
      imagen: "",
      emprendimientoId: emprendimientoActivo?.id || emprendimientoActivo?._id || ""
    });
    setFormError(null);
    setProductoActivo(null);
    setModal("crear");
  }

  function abrirEditar(p: Producto) {
    if (!puedeGestionarProductos()) {
      alert(mensajeNoPuedeGestionar());
      return;
    }
    setForm({
      nombre: p.nombre,
      precio: String(p.precio),
      stock: String(p.stock),
      imagen: p.imagen || "",
      emprendimientoId: p.emprendimientoId || ""
    });
    setFormError(null);
    setProductoActivo(p);
    setModal("editar");
  }

  function abrirEliminar(p: Producto) {
    if (!puedeGestionarProductos()) {
      alert(mensajeNoPuedeGestionar());
      return;
    }
    setProductoActivo(p);
    setModal("eliminar");
  }

  function cerrarModal() {
    setModal(null);
    setProductoActivo(null);
    setForm(FORM_VACIO);
    setFormError(null);
  }

  function validar(): boolean {
    if (!form.nombre.trim())         { setFormError("El nombre es obligatorio.");          return false; }
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) < 0)
                                     { setFormError("Ingresa un precio válido.");           return false; }
    if (!form.stock  || isNaN(Number(form.stock))  || Number(form.stock)  < 0)
                                     { setFormError("Ingresa un stock válido.");            return false; }
    if (!form.emprendimientoId)      { setFormError("Selecciona un emprendimiento.");       return false; }
    return true;
  }

  // ── Crear producto (guardar en el emprendimiento) ──
  async function crearProducto() {
    if (!validar()) return;
    setGuardando(true);
    setFormError(null);
    
    try {
      // Buscar el emprendimiento al que pertenece el producto
      const emprendimiento = emprendimientos.find(e => (e.id || e._id) === form.emprendimientoId);
      if (!emprendimiento) {
        throw new Error("No se encontró el emprendimiento");
      }
      
      // Crear el nuevo producto
      const nuevoProducto: Producto = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
        imagen: form.imagen.trim(),
      };
      
      // Obtener los productos actuales del emprendimiento
      const productosActuales = emprendimiento.productos || [];
      const productosActualizados = [...productosActuales, nuevoProducto];
      
      // Actualizar el emprendimiento con el nuevo producto
      const res = await fetch(`http://localhost:8080/api/emprendimientos/${form.emprendimientoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emprendimiento,
          productos: productosActualizados
        }),
      });
      
      if (!res.ok) throw new Error("No se pudo guardar el producto");
      
      // Recargar datos
      await recargarDatos();
      router.push("/inicioemprendedor?refresh=true");

      
      // 🔥 DISPARAR EVENTO PARA ACTUALIZAR LA PÁGINA PRINCIPAL
      localStorage.setItem("productosActualizados", Date.now().toString());

      
      cerrarModal();
      
    } catch (e: any) {
      setFormError(e.message || "Error al crear el producto.");
    } finally {
      setGuardando(false);
    }
  }

  // ── Editar producto ──
  async function editarProducto() {
    if (!validar() || !productoActivo) return;
    setGuardando(true);
    setFormError(null);
    
    try {
      const emprendimiento = emprendimientos.find(e => (e.id || e._id) === form.emprendimientoId);
      if (!emprendimiento) {
        throw new Error("No se encontró el emprendimiento");
      }
      
      const productosActuales = emprendimiento.productos || [];
      const productosActualizados = productosActuales.map(p => {
        if (p.nombre === productoActivo.nombre && p.precio === productoActivo.precio) {
          return {
            nombre: form.nombre.trim(),
            precio: Number(form.precio),
            stock: Number(form.stock),
            imagen: form.imagen.trim(),
          };
        }
        return p;
      });
      
      const res = await fetch(`http://localhost:8080/api/emprendimientos/${form.emprendimientoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emprendimiento,
          productos: productosActualizados
        }),
      });
      
      if (!res.ok) throw new Error("No se pudo actualizar el producto");
      
      // Recargar datos
      await recargarDatos();
      
      // 🔥 DISPARAR EVENTO PARA ACTUALIZAR LA PÁGINA PRINCIPAL
      localStorage.setItem("productosActualizados", Date.now().toString());
      
      cerrarModal();
      
    } catch (e: any) {
      setFormError(e.message || "Error al editar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  // ── Eliminar producto ──
  async function eliminarProducto() {
    if (!productoActivo) return;
    setGuardando(true);
    
    try {
      const emprendimiento = emprendimientos.find(e => (e.id || e._id) === productoActivo.emprendimientoId);
      if (!emprendimiento) {
        throw new Error("No se encontró el emprendimiento");
      }
      
      const productosActuales = emprendimiento.productos || [];
      const productosActualizados = productosActuales.filter(p => 
        !(p.nombre === productoActivo.nombre && p.precio === productoActivo.precio)
      );
      
      const res = await fetch(`http://localhost:8080/api/emprendimientos/${productoActivo.emprendimientoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emprendimiento,
          productos: productosActualizados
        }),
      });
      
      if (!res.ok) throw new Error("No se pudo eliminar el producto");
      
      // Recargar datos
      await recargarDatos();
      
      // 🔥 DISPARAR EVENTO PARA ACTUALIZAR LA PÁGINA PRINCIPAL
      localStorage.setItem("productosActualizados", Date.now().toString());
      
      cerrarModal();
      
    } catch (e: any) {
      setFormError(e.message || "Error al eliminar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  if (loading) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando productos...</p>
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

      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Mis productos</span>
          <h1 className={styles.heroTitle}>
            Catálogo de <span className={styles.heroName}>productos</span>
          </h1>
          <p className={styles.heroSub}>
            Gestiona todos los productos de tus emprendimientos en un solo lugar.
          </p>
          <div className={styles.heroActions}>
            <Link href="/inicioemprendedor" className={styles.btnSecondary}>← Panel principal</Link>
            {puedeGestionarProductos() && (
              <button className={styles.btnPrimaryHero} onClick={abrirCrear}>+ Nuevo producto</button>
            )}
          </div>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{productos.length}</span>
          <span className={styles.statLabel}>TOTAL PRODUCTOS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {productos.reduce((acc, p) => acc + p.stock, 0)}
          </span>
          <span className={styles.statLabel}>UNIDADES EN STOCK</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {productos.filter(p => p.stock === 0).length}
          </span>
          <span className={styles.statLabel}>SIN STOCK</span>
        </div>
      </section>

      <div className={styles.body}>

        {puedeGestionarProductos() && (
          <div className={styles.actionBar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <div className={styles.vistaToggle}>
              <button
                className={`${styles.vistaBtn} ${vista === "grid" ? styles.vistaBtnActive : ""}`}
                onClick={() => setVista("grid")}
                title="Vista grid"
              >
                ⊞
              </button>
              <button
                className={`${styles.vistaBtn} ${vista === "lista" ? styles.vistaBtnActive : ""}`}
                onClick={() => setVista("lista")}
                title="Vista lista"
              >
                ☰
              </button>
            </div>
            <button className={styles.btnPrimarySmall} onClick={abrirCrear}>
              + Nuevo producto
            </button>
          </div>
        )}

        {!puedeGestionarProductos() && (
          <div className={styles.warningCard}>
            <span className={styles.warningIcon}>⚠️</span>
            <p className={styles.warningText}>{mensajeNoPuedeGestionar()}</p>
            {emprendimientos.length === 0 && (
              <Link href="/inicioemprendedor/misemprendimientos" className={styles.btnLinkWarning}>
                Crear emprendimiento
              </Link>
            )}
          </div>
        )}

        {puedeGestionarProductos() && productosFiltrados.length === 0 && (
          <div className={styles.emptyCard}>
            {busqueda ? (
              <>
                <p className={styles.emptyTitle}>Sin resultados para "{busqueda}"</p>
                <p className={styles.emptyDesc}>Intenta con otro término de búsqueda.</p>
                <button className={styles.btnPrimarySmall} onClick={() => setBusqueda("")}>Limpiar búsqueda</button>
              </>
            ) : (
              <>
                <p className={styles.emptyTitle}>Aún no tienes productos</p>
                <p className={styles.emptyDesc}>Agrega tu primer producto y empieza a vender en la plataforma.</p>
                <button className={styles.btnPrimarySmall} onClick={abrirCrear}>+ Agregar primer producto</button>
              </>
            )}
          </div>
        )}

        {puedeGestionarProductos() && productosFiltrados.length > 0 && vista === "grid" && (
          <div className={styles.productosGrid}>
            {productosFiltrados.map((p, idx) => {
              const pid = p.id || p._id || `temp_${p.nombre}_${idx}`;
              return (
                <div key={pid} className={styles.productoCard}>
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} className={styles.productoCardImg} />
                    : <div className={styles.productoCardPlaceholder}>{p.nombre[0]?.toUpperCase()}</div>
                  }
                  <div className={styles.productoCardBody}>
                    <p className={styles.productoCardNombre}>{p.nombre}</p>
                    {p.emprendimientoNombre && (
                      <p className={styles.productoCardEmprendimiento}>{p.emprendimientoNombre}</p>
                    )}
                    <div className={styles.productoCardBottom}>
                      <span className={styles.productoCardPrecio}>${p.precio.toLocaleString("es-CO")}</span>
                      <span className={`${styles.productoCardStock} ${p.stock === 0 ? styles.stockAgotado : p.stock <= 3 ? styles.stockBajo : ""}`}>
                        {p.stock === 0 ? "Agotado" : `Stock: ${p.stock}`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.productoCardAcciones}>
                    <button className={styles.btnEditar} onClick={() => abrirEditar(p)}>Editar</button>
                    <button className={styles.btnEliminar} onClick={() => abrirEliminar(p)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {puedeGestionarProductos() && productosFiltrados.length > 0 && vista === "lista" && (
          <div className={styles.productosLista}>
            {productosFiltrados.map((p, idx) => {
              const pid = p.id || p._id || `temp_${p.nombre}_${idx}`;
              return (
                <div key={pid} className={styles.productoListaRow}>
                  <div className={styles.productoListaImg}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} />
                      : <span>{p.nombre[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div className={styles.productoListaInfo}>
                    <p className={styles.productoListaNombre}>{p.nombre}</p>
                    {p.emprendimientoNombre && (
                      <p className={styles.productoListaEmprendimiento}>{p.emprendimientoNombre}</p>
                    )}
                  </div>
                  <span className={styles.productoListaPrecio}>${p.precio.toLocaleString("es-CO")}</span>
                  <span className={`${styles.productoListaStock} ${p.stock === 0 ? styles.stockAgotado : p.stock <= 3 ? styles.stockBajo : ""}`}>
                    {p.stock === 0 ? "Agotado" : `${p.stock} en stock`}
                  </span>
                  <div className={styles.productoListaAcciones}>
                    <button className={styles.btnEditar} onClick={() => abrirEditar(p)}>Editar</button>
                    <button className={styles.btnEliminar} onClick={() => abrirEliminar(p)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {(modal === "crear" || modal === "editar") && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modal === "crear" ? "Nuevo producto" : "Editar producto"}
              </h2>
              <button className={styles.modalClose} onClick={cerrarModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className={styles.formErrorBanner}>{formError}</div>}

              {modal === "crear" && emprendimientos.length > 1 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Emprendimiento</label>
                  <select
                    className={styles.formInput}
                    value={form.emprendimientoId}
                    onChange={e => setForm(p => ({ ...p, emprendimientoId: e.target.value }))}
                  >
                    <option value="">Selecciona un emprendimiento</option>
                    {emprendimientos.filter(e => e.estado === "activo").map(emp => (
                      <option key={emp.id || emp._id} value={emp.id || emp._id}>
                        {emp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del producto</label>
                <input
                  className={styles.formInput}
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Torta de chocolate"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio (COP)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock disponible</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL de la imagen</label>
                <input
                  className={styles.formInput}
                  value={form.imagen}
                  onChange={e => setForm(p => ({ ...p, imagen: e.target.value }))}
                  placeholder="https://i.postimg.cc/xxxx/imagen.jpg"
                />
                <p className={styles.formHelper}>
                  Usa <a href="https://postimages.org" target="_blank" rel="noopener noreferrer">postimages.org</a> para subir tu imagen y obtener la URL.
                </p>
              </div>

              {form.imagen && (
                <div className={styles.imgPreviewWrap}>
                  <img src={form.imagen} alt="Preview" className={styles.imgPreview} onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarModal}>Cancelar</button>
              <button
                className={styles.btnPrimarySmall}
                onClick={modal === "crear" ? crearProducto : editarProducto}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : modal === "crear" ? "Crear producto" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "eliminar" && productoActivo && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Eliminar producto</h2>
              <button className={styles.modalClose} onClick={cerrarModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className={styles.formErrorBanner}>{formError}</div>}
              <p className={styles.eliminarTexto}>
                ¿Estás seguro de que deseas eliminar <strong>"{productoActivo.nombre}"</strong>?
              </p>
              <p className={styles.eliminarSubTexto}>Esta acción no se puede deshacer.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarModal}>Cancelar</button>
              <button className={styles.btnEliminarConfirmar} onClick={eliminarProducto} disabled={guardando}>
                {guardando ? "Eliminando..." : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}