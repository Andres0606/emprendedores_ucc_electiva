"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioAdministrativo/pedidos.module.css";
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
  id: string;
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

/* ── Config de estados ── */
const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  pendiente:   { label: "Pendiente",   cls: "estadoPendiente"   },
  confirmado:  { label: "Confirmado",  cls: "estadoConfirmado"  },
  pagado:      { label: "Pagado",      cls: "estadoPagado"      },
  entregado:   { label: "Entregado",   cls: "estadoEntregado"   },
  cancelado:   { label: "Cancelado",   cls: "estadoCancelado"   },
};

const FILTROS = ["todos", "pendiente", "confirmado", "pagado", "entregado", "cancelado"];

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
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export default function PedidosPage() {
  const router = useRouter();

  const [pedidos,    setPedidos]    = useState<Transaccion[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [filtro,     setFiltro]     = useState("todos");
  const [detalle,    setDetalle]    = useState<Transaccion | null>(null);

  /* ── Carga ── */
  useEffect(() => {
    const cargar = async () => {
      const guardado = sessionStorage.getItem("usuario");
      if (!guardado) { router.push("/autenticacion/login"); return; }

      const u = JSON.parse(guardado);
      const uid = u.id || u._id;

      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/transacciones/comprador/${uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos.");
        const data: Transaccion[] = await res.json();

        const ordenados = data
          .filter(t => t.comprador?.id === uid)
          .sort((a, b) => b.numeroPedido - a.numeroPedido);

        setPedidos(ordenados);
      } catch (e: any) {
        setError(e.message || "Error inesperado.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  /* ── Filtrado ── */
  const pedidosFiltrados = filtro === "todos"
    ? pedidos
    : pedidos.filter(p => p.estado === filtro);

  const contactarWhatsApp = (pedido: Transaccion) => {
    let telefono = pedido.telefonoEmprendimiento?.replace(/\D/g, "") || "";
    
    if (!telefono) {
      telefono = pedido.vendedor?.telefono?.replace(/\D/g, "") || "";
    }
    
    if (!telefono) {
      alert(`No hay número de teléfono disponible para ${pedido.emprendimiento.nombre}`);
      return;
    }
    
    const msg = encodeURIComponent(
      `Hola, soy administrativo de la UCC. Me comunico por el pedido ${numPedido(pedido.numeroPedido)} de "${pedido.emprendimiento.nombre}". ¿Podemos coordinar el pago y la entrega?`
    );
    
    window.open(`https://wa.me/${telefono}?text=${msg}`, "_blank");
  };

  const cancelarPedido = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/transacciones/${id}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: "cancelado" })
      });
      
      if (res.ok) {
        alert("✅ Pedido cancelado exitosamente");
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || "Error al cancelar el pedido");
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      alert("Error de conexión. Por favor intenta nuevamente.");
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando tus pedidos...</p>
      </div>
    </main>
  );

  /* ── Error ── */
  if (error) return (
    <main className={styles.main}>
      <div className={styles.fullscreenCenter}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.btnRetry} onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    </main>
  );

  /* ══ Render ══ */
  return (
    <>
      <main className={styles.main}>

        {/* ══ Hero ══ */}
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Historial de compras</span>
            <h1 className={styles.heroTitle}>Mis pedidos</h1>
            <p className={styles.heroSub}>
              Consulta el estado de tus compras realizadas en EmprendedoresUCC.
            </p>
            <div className={styles.heroActions}>
              <Link href="/inicioAdministrativo" className={styles.btnSecondary}>
                ← Panel principal
              </Link>
              <Link href="/emprendimientos" className={styles.btnPrimary}>
                Explorar emprendimientos →
              </Link>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </section>

        {/* ══ Stats ══ */}
        <section className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{pedidos.length}</span>
            <span className={styles.statLabel}>PEDIDOS TOTALES</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {pedidos.filter(p => p.estado === "pendiente").length}
            </span>
            <span className={styles.statLabel}>PENDIENTES</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {pedidos.filter(p => p.estado === "entregado").length}
            </span>
            <span className={styles.statLabel}>ENTREGADOS</span>
          </div>
        </section>

        {/* ══ Body ══ */}
        <div className={styles.body}>

          {/* ── Filtros ── */}
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

          {/* ── Lista de pedidos ── */}
          {pedidosFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>
                {filtro === "todos"
                  ? "Aún no tienes pedidos"
                  : `No tienes pedidos ${filtro === "pendiente" ? "pendientes" : filtro + "s"}`}
              </h3>
              <p className={styles.emptyDesc}>
                {filtro === "todos"
                  ? "Explora los emprendimientos y realiza tu primera compra."
                  : "Prueba con otro filtro para ver tus pedidos."}
              </p>
              {filtro === "todos" && (
                <Link href="/emprendimientos" className={styles.btnPrimaryLg}>
                  Explorar emprendimientos
                </Link>
              )}
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
                        <span className={`${styles.estadoBadge} ${styles[cfg.cls]}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className={styles.pedidoFecha}>{fmtFechaCorta(pedido.fecha)}</span>
                    </div>

                    <div className={styles.pedidoCardSep} />

                    <p className={styles.pedidoEmpNombre}>{pedido.emprendimiento.nombre}</p>

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

                    <div className={styles.pedidoCardFooter}>
                      <span className={styles.pedidoTotal}>Total: {fmt(pedido.total)}</span>
                      <div className={styles.pedidoCardFooterButtons}>
                        {pedido.estado === "pendiente" && (
                          <button
                            className={styles.btnCancelar}
                            onClick={() => cancelarPedido(pedido.id)}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          className={styles.btnDetalle}
                          onClick={() => setDetalle(pedido)}
                        >
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

      {/* ══ Modal detalle ══ */}
      {detalle && (
        <div className={styles.overlay} onClick={() => setDetalle(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Detalle del pedido</h2>
                <p className={styles.modalNum}>{numPedido(detalle.numeroPedido)}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setDetalle(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>

              <div className={styles.modalInfoGrid}>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>FECHA</span>
                  <p className={styles.modalInfoVal}>{fmtFecha(detalle.fecha)}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>ESTADO</span>
                  <span className={`${styles.estadoBadge} ${styles[(ESTADO_CONFIG[detalle.estado] || ESTADO_CONFIG.pendiente).cls]}`}>
                    {(ESTADO_CONFIG[detalle.estado] || ESTADO_CONFIG.pendiente).label}
                  </span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>MÉTODO DE PAGO</span>
                  <p className={styles.modalInfoVal}>
                    {detalle.metodoPago.charAt(0).toUpperCase() + detalle.metodoPago.slice(1)}
                  </p>
                </div>
              </div>

              <div className={styles.modalSep} />

              <div className={styles.modalVendedorCard}>
                <div className={styles.modalVendedorRow}>
                  <span className={styles.modalInfoLabel}>EMPRENDIMIENTO</span>
                  <p className={styles.modalEmpNombre}>{detalle.emprendimiento.nombre}</p>
                </div>
                <div className={styles.modalVendedorRow}>
                  <span className={styles.modalInfoLabel}>VENDEDOR</span>
                  <p className={styles.modalInfoVal}>
                    {detalle.vendedor.nombre} {detalle.vendedor.apellido}
                  </p>
                </div>
                {detalle.vendedor.telefono && (
                  <div className={styles.modalVendedorRow}>
                    <span className={styles.modalInfoLabel}>TELÉFONO</span>
                    <p className={styles.modalInfoVal}>{detalle.vendedor.telefono}</p>
                  </div>
                )}
              </div>

              <div className={styles.modalSep} />

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

              <div className={styles.modalTotal}>
                <span>Total a pagar</span>
                <span className={styles.modalTotalMonto}>{fmt(detalle.total)}</span>
              </div>

              {detalle.vendedor?.telefono && (
                <button
                  className={styles.btnWhatsapp}
                  onClick={() => contactarWhatsApp(detalle)}
                >
                  Contactar al emprendedor por WhatsApp
                </button>
              )}

              {detalle.estado === "pendiente" && (
                <button
                  className={styles.btnCancelarModal}
                  onClick={() => cancelarPedido(detalle.id)}
                >
                  Cancelar pedido
                </button>
              )}

            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCerrar} onClick={() => setDetalle(null)}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}