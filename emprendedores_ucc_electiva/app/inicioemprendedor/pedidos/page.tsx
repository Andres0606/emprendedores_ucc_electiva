"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/pedidos.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/config/api";

/* ── Tipos ── */
interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Persona {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  tipoUsuario?: string;
}

interface Emprendimiento {
  id: string;
  nombre: string;
}

interface Transaccion {
  id: string;
  numeroPedido: number;
  comprador: Persona;
  vendedor: Persona;
  emprendimiento: Emprendimiento;
  productos: Producto[];
  total: number;
  metodoPago: string;
  fecha: string;
  estado: string;
  telefonoEmprendimiento?: string;
}

/* ── Config estados ── */
const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: "Pendiente",  cls: "estadoPendiente"  },
  confirmado: { label: "Confirmado", cls: "estadoConfirmado" },
  pagado:     { label: "Pagado",     cls: "estadoPagado"     },
  entregado:  { label: "Entregado",  cls: "estadoEntregado"  },
  cancelado:  { label: "Cancelado",  cls: "estadoCancelado"  },
};

const ESTADOS_ORDEN = ["pendiente", "confirmado", "pagado", "entregado", "cancelado"];
const METODOS_PAGO  = ["pendiente", "transferencia", "efectivo", "nequi", "daviplata"];
const FILTROS       = ["todos", "pendiente", "confirmado", "pagado", "entregado", "cancelado"];

/* ── Helpers ── */
const fmt = (n: number) => {
  if (n === undefined || n === null || isNaN(n)) return "$0";
  return "$" + n.toLocaleString("es-CO");
};

const fmtFecha = (f: string) => {
  const [y, m, d] = f.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio",
                 "julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
};

const fmtFechaCorta = (f: string) => {
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
};

const numPedido = (n: number) => `#UCC-${String(n).padStart(6, "0")}`;

/* ══════════════════════════════════════════════
   COMPONENTE
══════════════════════════════════════════════ */
export default function PedidosEmprendedorPage() {
  const router = useRouter();

  const [pedidos,       setPedidos]       = useState<Transaccion[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [filtro,        setFiltro]        = useState("todos");
  const [detalle,       setDetalle]       = useState<Transaccion | null>(null);
  const [guardando,     setGuardando]     = useState(false);

  // Campos editables del modal
  const [estadoEdit,  setEstadoEdit]  = useState("");
  const [metodoEdit,  setMetodoEdit]  = useState("");

  /* ── Carga ── */
  useEffect(() => {
    const cargar = async () => {
      const guardado = sessionStorage.getItem("usuario");
      if (!guardado) { router.push("/autenticacion/login"); return; }

      const u = JSON.parse(guardado);
      const uid = u.userId || u.id || u._id;
      
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/transacciones/vendedor/${uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos.");
        const data: Transaccion[] = await res.json();
        
        let ordenados = data
          .filter(t => {
              const vendedorId = t.vendedor?.id || t.vendedor?._id;
              return vendedorId === uid || String(vendedorId) === String(uid);
          })
          .sort((a, b) => b.numeroPedido - a.numeroPedido);

        // 🔥 ENRIQUECIMIENTO: Si faltan nombres, intentar recuperarlos de /api/usuarios
        const idsSinNombre = Array.from(new Set(
          ordenados
            .filter(t => !t.comprador?.nombre || t.comprador.nombre.trim() === "")
            .map(t => t.comprador?.id || t.comprador?._id)
            .filter(Boolean)
        ));

        if (idsSinNombre.length > 0) {
          try {
            const resUsr = await fetch(`${API_URL}/api/usuarios`);
            if (resUsr.ok) {
              const resJson = await resUsr.json();
              // 🔥 Seguridad: Asegurar que sea un array
              const usuarios: Persona[] = Array.isArray(resJson) ? resJson : (resJson.data || []);
              
              if (Array.isArray(usuarios)) {
                const mapUsr = new Map();
                usuarios.forEach(user => {
                  const id = user.id || user._id;
                  if (id) mapUsr.set(String(id), user);
                });

                ordenados = ordenados.map(t => {
                  const cid = String(t.comprador?.id || t.comprador?._id || "");
                  const userFull = mapUsr.get(cid);
                  if (userFull && (!t.comprador?.nombre || t.comprador.nombre.trim() === "")) {
                    return {
                      ...t,
                      comprador: {
                        ...t.comprador,
                        nombre: userFull.nombre,
                        apellido: userFull.apellido,
                        telefono: t.comprador.telefono || userFull.telefono,
                        correo: t.comprador.correo || userFull.correo
                      }
                    };
                  }
                  return t;
                });
              }
            }
          } catch (err) {
            console.warn("No se pudo enriquecer la data de usuarios:", err);
          }
        }

        setPedidos(ordenados);
      } catch (e: any) {
        console.error("Error:", e);
        setError(e.message || "Error inesperado.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  /* ── Abrir modal ── */
  const abrirDetalle = (p: Transaccion) => {
    setDetalle(p);
    setEstadoEdit(p.estado);
    setMetodoEdit(p.metodoPago || "pendiente");
  };

  /* ── Cambiar estado rápido ── */
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/transacciones/${id}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      setPedidos(prev =>
        prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
      );
      if (detalle?.id === id) setDetalle(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
    } catch {
      alert("No se pudo actualizar el estado. Intenta de nuevo.");
    }
  };

  /* ── Guardar cambios del modal ── */
  const guardarCambios = async () => {
    if (!detalle) return;
    setGuardando(true);
    try {
      // Actualizar estado
      if (estadoEdit !== detalle.estado) {
        const token = sessionStorage.getItem("token");
        const r1 = await fetch(`${API_URL}/api/transacciones/${detalle.id}/estado`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ estado: estadoEdit }),
        });
        if (!r1.ok) throw new Error("Error al actualizar estado.");
      }

      // Actualizar método de pago
      if (metodoEdit !== detalle.metodoPago) {
        const token = sessionStorage.getItem("token");
        const r2 = await fetch(`${API_URL}/api/transacciones/${detalle.id}/metodo-pago`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ metodoPago: metodoEdit }),
        });
        if (!r2.ok) throw new Error("Error al actualizar método de pago.");
      }

      setPedidos(prev =>
        prev.map(p =>
          p.id === detalle.id
            ? { ...p, estado: estadoEdit, metodoPago: metodoEdit }
            : p
        )
      );
      setDetalle(prev => prev ? { ...prev, estado: estadoEdit, metodoPago: metodoEdit } : prev);
      alert("Cambios guardados correctamente.");
    } catch (e: any) {
      alert(e.message || "Error al guardar cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const contactarWhatsApp = (pedido: Transaccion) => {
  let telefono = pedido.comprador?.telefono?.replace(/\D/g, "") || "";
  
  if (!telefono) {
    alert(`No hay número de teléfono disponible para ${pedido.comprador.nombre}`);
    return;
  }
  
  const msg = encodeURIComponent(
    `Hola ${pedido.comprador.nombre}, soy el emprendedor de "${pedido.emprendimiento.nombre}". Me comunico por tu pedido ${numPedido(pedido.numeroPedido)} para coordinar el pago y la entrega.`
  );
  
  window.open(`https://wa.me/${telefono}?text=${msg}`, "_blank");
};

  /* ── Filtrado ── */
  const pedidosFiltrados = filtro === "todos"
    ? pedidos
    : pedidos.filter(p => p.estado === filtro);

  /* ── Loading / Error ── */
  if (loading) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando pedidos...</p>
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

  /* ══ Render ══ */
  return (
    <>
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Pedidos recibidos</span>
            <h1 className={styles.heroTitle}>Gestión de pedidos</h1>
            <p className={styles.heroSub}>
              Gestiona los pedidos que los estudiantes han realizado a tus emprendimientos.
            </p>
            <div className={styles.heroActions}>
              <Link href="/inicioemprendedor" className={styles.btnSecondary}>← Panel principal</Link>
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
            <span className={styles.statValue}>{pedidos.length}</span>
            <span className={styles.statLabel}>PEDIDOS TOTALES</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pedidos.filter(p => p.estado === "pendiente").length}</span>
            <span className={styles.statLabel}>PENDIENTES</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pedidos.filter(p => p.estado === "entregado").length}</span>
            <span className={styles.statLabel}>ENTREGADOS</span>
          </div>
        </section>

        {/* Body */}
        <div className={styles.body}>

          {/* Filtros */}
          <div className={styles.filtrosWrap}>
            {FILTROS.map(f => (
              <button
                key={f}
                className={`${styles.filtroBtn} ${filtro === f ? styles.filtroBtnActive : ""}`}
                onClick={() => setFiltro(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== "todos" && (
                  <span className={styles.filtroBadge}>
                    {pedidos.filter(p => p.estado === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Lista */}
          {pedidosFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>
                {filtro === "todos" ? "Aún no tienes pedidos" : `No hay pedidos ${filtro}s`}
              </h3>
              <p className={styles.emptyDesc}>
                {filtro === "todos"
                  ? "Cuando un estudiante realice una compra en tu emprendimiento, aparecerá aquí."
                  : "Prueba con otro filtro para ver tus pedidos."}
              </p>
            </div>
          ) : (
            <div className={styles.pedidosList}>
              {pedidosFiltrados.map(pedido => {
                const cfg = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.pendiente;
                return (
                  <div key={pedido.id} className={styles.pedidoCard}>

                    {/* Cabecera */}
                    <div className={styles.pedidoCardHeader}>
                      <div className={styles.pedidoCardHeaderLeft}>
                        <span className={styles.pedidoNum}>{numPedido(pedido.numeroPedido)}</span>
                        <span className={`${styles.estadoBadge} ${styles[cfg.cls]}`}>{cfg.label}</span>
                      </div>
                      <span className={styles.pedidoFecha}>{fmtFechaCorta(pedido.fecha)}</span>
                    </div>

                    <div className={styles.pedidoCardSep} />

                    {/* Cliente */}
                    <div className={styles.pedidoClienteRow}>
                      <div className={styles.pedidoClienteAvatar}>
                        {pedido.comprador.nombre ? pedido.comprador.nombre[0]?.toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className={styles.pedidoClienteNombre}>
                          { (pedido.comprador.nombre || pedido.comprador.apellido) 
                            ? `${pedido.comprador.nombre || ""} ${pedido.comprador.apellido || ""}`.trim() 
                            : "Estudiante UCC" }
                        </p>
                        {pedido.comprador.telefono && (
                          <p className={styles.pedidoClienteMeta}>{pedido.comprador.telefono}</p>
                        )}
                      </div>
                    </div>

                    {/* Productos */}
                    <div className={styles.pedidoProductos}>
                      {pedido.productos.slice(0, 3).map((p, i) => (
                        <div key={i} className={styles.pedidoProductoRow}>
                          <span className={styles.pedidoProductoNombre}>
                            {p.nombre} <span className={styles.pedidoProductoCant}>x{p.cantidad}</span>
                          </span>
                          <span className={styles.pedidoProductoSubtotal}>{fmt(p.precio * p.cantidad)}</span>
                        </div>
                      ))}
                      {pedido.productos.length > 3 && (
                        <p className={styles.pedidoMasProductos}>
                          +{pedido.productos.length - 3} producto{pedido.productos.length - 3 !== 1 ? "s" : ""} más
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className={styles.pedidoCardFooter}>
                      <span className={styles.pedidoTotal}>Total: {fmt(pedido.total)}</span>
                      <div className={styles.pedidoCardFooterButtons}>

                        {pedido.estado === "pendiente" && (<>
                          <button
                            className={styles.btnConfirmar}
                            onClick={() => cambiarEstado(pedido.id, "confirmado")}
                          >Confirmar</button>
                          <button
                            className={styles.btnRechazar}
                            onClick={() => cambiarEstado(pedido.id, "cancelado")}
                          >Cancelar</button>
                        </>)}

                        {pedido.estado === "confirmado" && (
                          <button
                            className={styles.btnPagado}
                            onClick={() => cambiarEstado(pedido.id, "pagado")}
                          >Marcar pagado</button>
                        )}

                        {pedido.estado === "pagado" && (
                          <button
                            className={styles.btnEntregado}
                            onClick={() => cambiarEstado(pedido.id, "entregado")}
                          >Marcar entregado</button>
                        )}

                        <button className={styles.btnDetalle} onClick={() => abrirDetalle(pedido)}>
                          Ver detalles →
                        </button>

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal detalle */}
      {detalle && (
        <div className={styles.overlay} onClick={() => setDetalle(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Detalle del pedido</h2>
                <p className={styles.modalNum}>{numPedido(detalle.numeroPedido)} · {fmtFecha(detalle.fecha)}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setDetalle(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>

              {/* Cliente */}
              <div className={styles.modalSeccion}>
                <p className={styles.modalSecLabel}>CLIENTE</p>
                <div className={styles.modalClienteCard}>
                  <div className={styles.modalClienteAvatar}>
                    {detalle.comprador.nombre ? detalle.comprador.nombre[0]?.toUpperCase() : "U"}
                  </div>
                  <div className={styles.modalClienteInfo}>
                    <p className={styles.modalClienteNombre}>
                      { (detalle.comprador.nombre || detalle.comprador.apellido) 
                        ? `${detalle.comprador.nombre || ""} ${detalle.comprador.apellido || ""}`.trim() 
                        : "Estudiante UCC" }
                    </p>
                    {detalle.comprador.telefono && (
                      <p className={styles.modalClienteMeta}>{detalle.comprador.telefono}</p>
                    )}
                    {detalle.comprador.correo && (
                      <p className={styles.modalClienteMeta}>{detalle.comprador.correo}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalSep} />

              {/* Productos */}
              <div className={styles.modalSeccion}>
                <p className={styles.modalSecLabel}>PRODUCTOS</p>
                <div className={styles.modalTabla}>
                  <div className={styles.modalTablaHead}>
                    <span>Producto</span>
                    <span className={styles.tCenter}>Cant.</span>
                    <span className={styles.tRight}>Precio u.</span>
                    <span className={styles.tRight}>Subtotal</span>
                  </div>
                  {detalle.productos.map((p, i) => (
                    <div key={i} className={styles.modalTablaRow}>
                      <span className={styles.modalProdNombre}>{p.nombre}</span>
                      <span className={`${styles.modalProdCant} ${styles.tCenter}`}>x{p.cantidad}</span>
                      <span className={`${styles.modalProdPrecio} ${styles.tRight}`}>{fmt(p.precio)}</span>
                      <span className={`${styles.modalProdSubtotal} ${styles.tRight}`}>{fmt(p.precio * p.cantidad)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className={styles.modalTotal}>
                <span>Total a pagar</span>
                <span className={styles.modalTotalMonto}>{fmt(detalle.total)}</span>
              </div>

              <div className={styles.modalSep} />

              {/* Mensaje si está cancelado o entregado */}
              {(detalle.estado === "cancelado" || detalle.estado === "entregado") && (
                <div className={styles.pedidoCanceladoMsg}>
                    {detalle.estado === "cancelado" 
                    ? "Este pedido ha sido cancelado. No se pueden realizar cambios."
                    : "Este pedido ya ha sido entregado. No se pueden realizar cambios."}
                </div>
                )}

              {/* Mostrar solo si NO está cancelado ni entregado */}
              {detalle.estado !== "cancelado" &&  detalle.estado !== "entregado" && (
                <>
                  {/* Cambiar estado */}
                  <div className={styles.modalSeccion}>
                    <p className={styles.modalSecLabel}>ESTADO DEL PEDIDO</p>
                    <div className={styles.modalEditCard}>
                      <div className={styles.modalEditRow}>
                        <span className={styles.modalEditLabel}>Estado actual</span>
                        <span className={`${styles.estadoBadge} ${styles[(ESTADO_CONFIG[detalle.estado] || ESTADO_CONFIG.pendiente).cls]}`}>
                          {(ESTADO_CONFIG[detalle.estado] || ESTADO_CONFIG.pendiente).label}
                        </span>
                      </div>
                      <div className={styles.modalEditRow}>
                        <label className={styles.modalEditLabel}>Cambiar a</label>
                        <select
                          className={styles.modalSelect}
                          value={estadoEdit}
                          onChange={e => setEstadoEdit(e.target.value)}
                        >
                          {ESTADOS_ORDEN.filter(s => s !== "cancelado").map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cambiar método */}
                  <div className={styles.modalSeccion}>
                    <p className={styles.modalSecLabel}>MÉTODO DE PAGO</p>
                    <div className={styles.modalEditCard}>
                      <div className={styles.modalEditRow}>
                        <span className={styles.modalEditLabel}>Método actual</span>
                        <span className={styles.modalMetodoVal}>
                          {detalle.metodoPago.charAt(0).toUpperCase() + detalle.metodoPago.slice(1)}
                        </span>
                      </div>
                      <div className={styles.modalEditRow}>
                        <label className={styles.modalEditLabel}>Cambiar a</label>
                        <select
                          className={styles.modalSelect}
                          value={metodoEdit}
                          onChange={e => setMetodoEdit(e.target.value)}
                        >
                          {METODOS_PAGO.map(m => (
                            <option key={m} value={m}>
                              {m.charAt(0).toUpperCase() + m.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Guardar */}
                  <button
                    className={styles.btnGuardar}
                    onClick={guardarCambios}
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              )}

              {/* Botón WhatsApp (siempre visible) */}
              <button
                className={styles.btnWhatsapp}
                onClick={() => contactarWhatsApp(detalle)}
              >
                Contactar al cliente por WhatsApp
              </button>

            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCerrar} onClick={() => setDetalle(null)}>Cerrar</button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}