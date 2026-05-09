"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/emprendimientos/page.module.css";
import { API_URL } from "@/src/config/api";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  imagenes: string[];
  telefono?: string;
  productos: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
  totalVentas?: number;
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  carrera: string;
  telefono?: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
}

interface ItemCarrito {
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  stock: number;
  emprendimientoId: string;
  emprendimientoNombre: string;
}

const CategoryIcon = ({ nombre, size = 24 }: { nombre: string; size?: number }) => {
  const getColors = (n: string) => {
    switch (n) {
      case "Tecnología": return { bg: "#e0f2fe", border: "#bae6fd", icon: "#0369a1" };
      case "Gastronomía":
      case "Comida": return { bg: "#fef2f2", border: "#fecaca", icon: "#991b1b" };
      case "Moda y Diseño": return { bg: "#f5f3ff", border: "#ddd6fe", icon: "#5b21b6" };
      case "Salud y Bienestar": return { bg: "#f0fdf4", border: "#bbf7d0", icon: "#166534" };
      case "Arte y Cultura": return { bg: "#fff7ed", border: "#fed7aa", icon: "#9a3412" };
      case "Servicios": return { bg: "#f8fafc", border: "#e2e8f0", icon: "#334155" };
      default: return { bg: "#f1f5f9", border: "#e2e8f0", icon: "#475569" };
    }
  };

  const colors = getColors(nombre);
  const iconProps: React.SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: colors.icon,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const renderIcon = () => {
    switch (nombre) {
      case "Tecnología":
        return (
          <svg {...iconProps}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case "Gastronomía":
      case "Comida":
        return (
          <svg {...iconProps}>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        );
      case "Moda y Diseño":
        return (
          <svg {...iconProps}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case "Salud y Bienestar":
        return (
          <svg {...iconProps}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        );
      case "Arte y Cultura":
        return (
          <svg {...iconProps}>
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.77 1.7-1.7 0-.44-.19-.84-.49-1.12-.29-.28-.48-.68-.48-1.13 0-.92.75-1.67 1.67-1.67h1.91c4.22 0 7.6-3.38 7.6-7.6 0-4.75-3.8-8.5-8.5-8.5Z" />
          </svg>
        );
      case "Servicios":
        return (
          <svg {...iconProps}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
    }
  };

  return (
    <div style={{
      width: size + 16,
      height: size + 16,
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {renderIcon()}
    </div>
  );
};

const precioRangos = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $20.000", min: 0, max: 20000 },
  { label: "$20.000 – $50.000", min: 20000, max: 50000 },
  { label: "$50.000 – $150.000", min: 50000, max: 150000 },
  { label: "Más de $150.000", min: 150000, max: Infinity },
];

const formatearNumeroWhatsApp = (telefono: string): string => {
  let numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  if (!numeroLimpio.startsWith('+')) {
    numeroLimpio = numeroLimpio.startsWith('57') ? '+' + numeroLimpio : '+57' + numeroLimpio;
  }
  return numeroLimpio;
};

const fmt = (precio: number) => `$${precio.toLocaleString()}`;

const generarNumFactura = () => {
  const now = new Date();
  return `UCC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

const fechaActual = () => {
  return new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function EmprendimientosPage() {
  const router = useRouter();
  const carritoIconRef = useRef<HTMLDivElement>(null);

  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [usuarios, setUsuarios] = useState<Map<string, Usuario>>(new Map());
  const [categorias, setCategorias] = useState<Map<string, string>>(new Map());
  const [categoriasList, setCategoriasList] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<{ id: string; tipoUsuario?: string } | null>(null);

  // Carrito
  const [itemsCarrito, setItemsCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoAnimando, setCarritoAnimando] = useState(false);
  const [vistaFactura, setVistaFactura] = useState(false);
  const [numFactura, setNumFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");
  const [creandoPedido, setCreandoPedido] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(false);

  // Modal WhatsApp
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [productosAgrupados, setProductosAgrupados] = useState<Record<string, any>>({});

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [precioIdx, setPrecioIdx] = useState(0);

  // ── Funciones de sincronización con backend ──
  const sincronizarCarritoConBackend = async (usuarioId: string, items: ItemCarrito[]) => {
    if (!usuarioId) return;
    try {
      const carritoData = {
        usuarioId: usuarioId,
        productos: items.map(item => ({
          emprendimientoId: item.emprendimientoId,
          nombreProducto: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          imagen: item.imagen
        })),
        total: items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      };
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/carrito`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(carritoData)
      });
      if (!response.ok) console.error('Error al sincronizar carrito');
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
    }
  };

  const cargarCarritoDesdeBackend = async (usuarioId: string) => {
    try {
      const carritoLocal = localStorage.getItem(`carrito_${usuarioId}`);
      if (carritoLocal !== null) {
        setItemsCarrito(JSON.parse(carritoLocal));
        return;
      }
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/carrito/${usuarioId}`, {
        headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
      });
      if (response.ok) {
        const carritoBackend = await response.json();
        if (carritoBackend && carritoBackend.productos && carritoBackend.productos.length > 0) {
          const items = carritoBackend.productos.map((p: any) => ({
            nombre: p.nombreProducto, precio: p.precio, imagen: p.imagen || "",
            cantidad: p.cantidad, stock: 999, emprendimientoId: p.emprendimientoId,
            emprendimientoNombre: p.emprendimientoNombre || ""
          }));
          localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(items));
          setItemsCarrito(items);
        } else {
          localStorage.setItem(`carrito_${usuarioId}`, "[]");
          setItemsCarrito([]);
        }
      } else if (response.status === 404) {
        localStorage.setItem(`carrito_${usuarioId}`, "[]");
        setItemsCarrito([]);
      }
    } catch (error) {}
  };

  const mostrarFactura = () => {
    setNumFactura(generarNumFactura());
    setFechaFactura(fechaActual());
    setPedidoCreado(false);
    setVistaFactura(true);
  };

  const confirmarPedido = async () => {
    if (itemsCarrito.length === 0) {
      alert("No hay productos en el carrito");
      return false;
    }
    setCreandoPedido(true);
    try {
      const agrupado: Record<string, any> = {};
      for (const item of itemsCarrito) {
        if (!agrupado[item.emprendimientoId]) {
          let telefono = "";
          try {
            const resEmp = await fetch(`${API_URL}/api/emprendimientos/${item.emprendimientoId}`);
            if (resEmp.ok) {
              const emprendimiento = await resEmp.json();
              if (emprendimiento.telefono) telefono = emprendimiento.telefono;
              else if (emprendimiento.usuarioId) {
                const resUser = await fetch(`${API_URL}/api/usuarios/${emprendimiento.usuarioId}`);
                if (resUser.ok) {
                  const usuario = await resUser.json();
                  telefono = usuario.telefono || "";
                }
              }
            }
          } catch (error) {}
          agrupado[item.emprendimientoId] = {
            id: item.emprendimientoId, nombre: item.emprendimientoNombre,
            productos: [], total: 0, telefono: telefono,
          };
        }
        const subtotal = item.precio * item.cantidad;
        agrupado[item.emprendimientoId].productos.push({
          nombre: item.nombre, cantidad: item.cantidad, precio: item.precio, subtotal: subtotal,
        });
        agrupado[item.emprendimientoId].total += subtotal;
      }
      setProductosAgrupados(agrupado);
      setMostrarModalWhatsApp(true);
      return true;
    } catch (error) {
      alert('Error al preparar el pedido');
      return false;
    } finally {
      setCreandoPedido(false);
    }
  };

  const enviarWhatsApp = (emprendimientoId: string, nombreEmp: string, productos: any[], total: number, telefono: string) => {
    if (!telefono) {
      alert(`No hay teléfono para ${nombreEmp}`);
      return;
    }
    const nombreCliente = sessionStorage.getItem("nombreUsuario") || "Cliente";
    const lista = productos.map(p => `• ${p.nombre} x${p.cantidad} = $${p.subtotal.toLocaleString()}`).join('\n');
    const mensaje = `NUEVO PEDIDO - EmprendedoresUCC\n\nCliente: ${nombreCliente}\n\nPRODUCTOS:\n${lista}\n\nTOTAL: $${total.toLocaleString()}\n\nGracias por apoyar los emprendimientos UCC`;
    const numeroLimpio = telefono.replace(/\D/g, '').startsWith('57') ? telefono.replace(/\D/g, '') : '57' + telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const finalizarPedidoPorEmpresa = async (emp: any) => {
    const uid = sessionStorage.getItem("usuarioId");
    const usuarioStr = sessionStorage.getItem("usuario");
    let compradorData = null;
    try {
      if (usuarioStr) {
        const u = JSON.parse(usuarioStr);
        compradorData = {
          id: u.id || u._id || uid, nombre: u.nombre || "",
          apellido: u.apellido || "", tipoUsuario: sessionStorage.getItem("tipoUsuario") || "estudiante",
          telefono: u.telefono || "", correo: u.correo || ""
        };
      }
    } catch {}

    let vendedorData = { id: "", nombre: "", apellido: "", telefono: "", correo: "" };
    try {
      const resEmp = await fetch(`${API_URL}/api/emprendimientos/${emp.id}`);
      if (resEmp.ok) {
        const e = await resEmp.json();
        const resUser = await fetch(`${API_URL}/api/usuarios/${e.usuarioId}`);
        if (resUser.ok) {
          const v = await resUser.json();
          vendedorData = {
            id: v.id || v._id, nombre: v.nombre || "", apellido: v.apellido || "",
            telefono: v.telefono || emp.telefono || "", correo: v.correo || ""
          };
        }
      }
    } catch {}

    const transaccionData = {
      comprador: compradorData, vendedor: vendedorData,
      emprendimiento: { id: emp.id, nombre: emp.nombre },
      productos: emp.productos.map((p: any) => ({ nombre: p.nombre, cantidad: p.cantidad, precio: p.precio, subtotal: p.subtotal })),
      total: emp.total, metodoPago: "pendiente", estado: "pendiente", telefonoEmprendimiento: emp.telefono
    };

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/transacciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(transaccionData)
      });
      if (res.ok) {
        const nuevosItems = itemsCarrito.filter(item => item.emprendimientoId !== emp.id);
        if (uid) {
          localStorage.setItem(`carrito_${uid}`, JSON.stringify(nuevosItems));
          setItemsCarrito(nuevosItems);
        }
        const nuevosAgrupados = { ...productosAgrupados };
        delete nuevosAgrupados[emp.id];
        setProductosAgrupados(nuevosAgrupados);
        window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: { items: nuevosItems } }));
        window.dispatchEvent(new Event('storage'));
        if (Object.keys(nuevosAgrupados).length === 0) {
          setMostrarModalWhatsApp(false); setCarritoAbierto(false); setVistaFactura(false);
        }
        alert(`¡Pedido de "${emp.nombre}" realizado exitosamente!`);
      } else {
        alert("Error al guardar el pedido");
      }
    } catch {
      alert("Error al procesar el pedido");
    }
  };

  const finalizarTodosLosPedidos = async () => {
    for (const emp of Object.values(productosAgrupados)) {
      await finalizarPedidoPorEmpresa(emp);
    }
    setMostrarModalWhatsApp(false); setCarritoAbierto(false); setVistaFactura(false);
    alert('¡Todos los pedidos realizados exitosamente!');
  };

  const cerrarFactura = () => setVistaFactura(false);

  const leerCarrito = () => {
    const uid = sessionStorage.getItem("usuarioId");
    if (!uid) { setItemsCarrito([]); return; }
    setItemsCarrito(JSON.parse(localStorage.getItem(`carrito_${uid}`) || '[]'));
  };

  useEffect(() => { if (sessionStorage.getItem("usuarioId")) leerCarrito(); }, [usuarioActual]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setCarritoAbierto(false); setVistaFactura(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = carritoAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [carritoAbierto]);

  const cambiarCantidad = (idx: number, delta: number) => {
    const uid = sessionStorage.getItem("usuarioId");
    if (!uid) return;
    const c = [...itemsCarrito];
    const n = c[idx].cantidad + delta;
    if (n < 1 || n > c[idx].stock) return;
    c[idx].cantidad = n;
    localStorage.setItem(`carrito_${uid}`, JSON.stringify(c));
    setItemsCarrito(c);
    window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: { items: c } }));
    window.dispatchEvent(new Event('storage'));
  };

  const eliminarItem = (idx: number) => {
    const uid = sessionStorage.getItem("usuarioId");
    if (!uid) return;
    const c = itemsCarrito.filter((_, i) => i !== idx);
    localStorage.setItem(`carrito_${uid}`, JSON.stringify(c));
    setItemsCarrito(c);
    window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: { items: c } }));
    window.dispatchEvent(new Event('storage'));
  };

  const vaciarCarrito = () => {
    const uid = sessionStorage.getItem("usuarioId");
    if (uid) {
      localStorage.setItem(`carrito_${uid}`, '[]');
      setItemsCarrito([]);
      setVistaFactura(false);
      window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: { items: [] } }));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const totalItems = itemsCarrito.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = itemsCarrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const abrirCarrito = () => {
    leerCarrito();
    setVistaFactura(false);
    setCarritoAnimando(true);
    setTimeout(() => setCarritoAnimando(false), 600);
    setCarritoAbierto(true);
  };

  const imprimirFactura = () => {
    const v = window.open('', '_blank');
    if (!v) return;
    v.document.write(`<html><head><title>Factura ${numFactura}</title><style>body{font-family:sans-serif;padding:30px}.factura{max-width:800px;margin:0 auto}header{text-align:center;border-bottom:3px solid #009FE3;padding-bottom:20px}table{width:100%;border-collapse:collapse;margin:25px 0}th,td{border:1px solid #ddd;padding:12px;text-align:left}.text-right{text-align:right}.totales{width:300px;margin-left:auto}.total-final{font-weight:800;border-top:2px solid #000}</style></head><body><div class="factura"><header><h1>EmprendedoresUCC</h1><p>Universidad Cooperativa de Colombia</p></header><div><p>Factura N°: ${numFactura}</p><p>Fecha: ${fechaFactura}</p></div><table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${itemsCarrito.map(i => `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>${fmt(i.precio)}</td><td>${fmt(i.precio*i.cantidad)}</td></tr>`).join('')}</tbody></table><div class="totales"><table><tr><td>TOTAL</td><td class="text-right">${fmt(subtotal)}</td></tr></table></div></div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}};</script></body></html>`);
    v.document.close();
  };

  const cerrarDrawer = () => { setCarritoAbierto(false); setVistaFactura(false); };

  useEffect(() => {
    const uStr = sessionStorage.getItem('usuario');
    const uId = sessionStorage.getItem('usuarioId');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        const id = u.id || u._id || uId;
        if (id) {
          setUsuarioActual({ id, tipoUsuario: u.tipoUsuario || sessionStorage.getItem('tipoUsuario') || undefined });
          cargarCarritoDesdeBackend(id);
        }
      } catch {}
    }
  }, []);

  const obtenerUsuario = async (id: string): Promise<Usuario | null> => {
    try {
      const r = await fetch(`${API_URL}/api/usuarios/${id}`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  };

  const obtenerCategorias = async () => {
    try {
      const r = await fetch(`${API_URL}/api/categorias`);
      if (r.ok) {
        const d: Categoria[] = await r.json();
        const m = new Map<string, string>();
        const a: { id: string; nombre: string }[] = [];
        d.forEach(c => { const id = c.id || c._id; if (id) { m.set(id, c.nombre); a.push({ id, nombre: c.nombre }); } });
        setCategorias(m); setCategoriasList(a);
      }
    } catch {}
  };

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      await obtenerCategorias();
      try {
        const r = await fetch(`${API_URL}/api/emprendimientos`);
        if (r.ok) {
          const d: Emprendimiento[] = await r.json();
          setEmprendimientos(d);
          const uMap = new Map<string, Usuario>();
          const ids = [...new Set(d.map(e => e.usuarioId))];
          const results = await Promise.all(ids.map(async id => ({ id, u: await obtenerUsuario(id) })));
          results.forEach(({ id, u }) => { if (u) uMap.set(id, u); });
          setUsuarios(uMap);
        }
      } catch { setError("Error al cargar datos"); }
      setLoading(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    const handle = () => {
      const uid = sessionStorage.getItem("usuarioId");
      if (uid) {
        const c = localStorage.getItem(`carrito_${uid}`);
        if (c) setItemsCarrito(JSON.parse(c));
      }
    };
    window.addEventListener("focus", handle);
    window.addEventListener("storage", (e) => { if (e.key?.startsWith("carrito_")) handle(); });
    window.addEventListener('carritoActualizado', ((e: CustomEvent) => { if (e.detail?.items) setItemsCarrito(e.detail.items); }) as EventListener);
    return () => {
      window.removeEventListener("focus", handle);
      window.removeEventListener('carritoActualizado', handle as EventListener);
    };
  }, []);

  const getNombreCategoria = (id: string) => categorias.get(id) || "Sin categoría";
  const getPrecioMinimo = (e: Emprendimiento) => { const p = e.productos?.map(x => x.precio) || []; return p.length > 0 ? Math.min(...p) : 0; };
  const formatearPrecio = (p: number) => p > 0 ? `Desde $${p.toLocaleString()}` : "Consultar";

  const emprendimientosFiltrados = emprendimientos.filter(e => {
    if (e.estado !== "activo") return false;
    const cat = getNombreCategoria(e.categoriaId);
    const p = getPrecioMinimo(e);
    const r = precioRangos[precioIdx];
    return (busqueda === "" || e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.descripcion.toLowerCase().includes(busqueda.toLowerCase())) &&
           (categoriaSeleccionada === "Todas" || cat === categoriaSeleccionada) &&
           (p >= r.min && p <= r.max);
  });

  if (error) return (
    <><Header /><main className={styles.main}><div style={{textAlign:"center",padding:"4rem",color:"#dc2626"}}><p>❌ {error}</p><button onClick={()=>window.location.reload()} style={{marginTop:"1rem",padding:"0.5rem 1rem",backgroundColor:"#3b82f6",color:"white",border:"none",borderRadius:"0.5rem",cursor:"pointer"}}>Reintentar</button></div></main><Footer /></>
  );

  return (
    <>
      <Header />
      {usuarioActual?.id && (
        <div ref={carritoIconRef} className={`${styles.carritoFlotante} ${carritoAnimando ? styles.carritoAnimando : ''}`} onClick={abrirCarrito} title="Ver carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && <span className={`${styles.carritoBadge} ${carritoAnimando ? styles.badgeAnimando : ''}`}>{totalItems}</span>}
        </div>
      )}

      {carritoAbierto && (
        <div className={styles.drawerOverlay} onClick={cerrarDrawer}>
          <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderLeft}>
                {vistaFactura ? <button className={styles.drawerBackBtn} onClick={cerrarFactura}>← Volver</button> : <><span className={styles.drawerTitle}>Mi carrito</span></>}
              </div>
              <button className={styles.drawerClose} onClick={cerrarDrawer}>✕</button>
            </div>

            <div className={styles.drawerBody}>
              {vistaFactura ? (
                <div className={styles.facturaContainer}>
                  <div className={styles.facturaHeader}>
                    <h3>EmprendedoresUCC</h3>
                    <p>Factura {numFactura}</p>
                    <p>{fechaFactura}</p>
                  </div>
                  <div className={styles.facturaTabla}>
                    {itemsCarrito.map((i, idx) => (
                      <div key={idx} className={styles.facturaTablaRow}>
                        <span>{i.nombre} x{i.cantidad}</span>
                        <span className={styles.textRight}>{fmt(i.precio * i.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.facturaTotalFilaFinal}>
                    <span>TOTAL</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className={styles.facturaAcciones}>
                    <button className={styles.facturaPrintBtn} onClick={imprimirFactura}>Imprimir</button>
                    <button className={styles.facturaConfirmarBtn} onClick={confirmarPedido} disabled={creandoPedido}>Confirmar pedido</button>
                  </div>
                </div>
              ) : (
                itemsCarrito.length === 0 ? (
                  <div className={styles.drawerEmpty}>
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  <div className={styles.drawerItems}>
                    {itemsCarrito.map((item, idx) => (
                      <div key={idx} className={styles.drawerItem}>
                        <div className={styles.drawerItemInfo}>
                          <p className={styles.drawerItemNombre}>{item.nombre}</p>
                          <p className={styles.drawerItemPrecio}>{fmt(item.precio)}</p>
                        </div>
                        <div className={styles.drawerItemDerecha}>
                          <div className={styles.drawerItemControles}>
                            <button className={styles.drawerCantBtn} onClick={() => cambiarCantidad(idx, -1)}>−</button>
                            <span>{item.cantidad}</span>
                            <button className={styles.drawerCantBtn} onClick={() => cambiarCantidad(idx, 1)}>+</button>
                          </div>
                          <button onClick={() => eliminarItem(idx)}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            {!vistaFactura && itemsCarrito.length > 0 && (
              <div className={styles.drawerFooter}>
                <div className={styles.drawerResumenTotal}><span>Total: {fmt(subtotal)}</span></div>
                <div className={styles.drawerAcciones}>
                  <button onClick={vaciarCarrito}>Vaciar</button>
                  <button onClick={mostrarFactura}>Continuar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Explora los emprendimientos</h1>
            <p className={styles.heroDesc}>Descubre proyectos creados por estudiantes de la UCC Villavicencio.</p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Buscar..." className={styles.searchInput} value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              {["Todas", ...categoriasList.map(c=>c.nombre)].map(c=>(
                <button key={c} className={`${styles.filterPill} ${categoriaSeleccionada===c?styles.filterPillActive:""}`} onClick={()=>setCategoriaSeleccionada(c)}>{c}</button>
              ))}
            </div>
          </div>

          {!loading && !busqueda && categoriaSeleccionada === "Todas" && (
            <div className={styles.rankingSection}>
              <h2 className={styles.rankingTitle}>
                <span>Los más vendidos</span>
                <div style={{
                  width: '32px', height: '32px', backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
              </h2>
              <div className={styles.rankingGrid}>
                {[...emprendimientos]
                  .filter(e => e.estado === "activo" && (e.totalVentas || 0) > 0)
                  .sort((a, b) => (b.totalVentas || 0) - (a.totalVentas || 0))
                  .slice(0, 5)
                  .map((emp, index) => {
                    const nombreCategoria = getNombreCategoria(emp.categoriaId);
                    return (
                      <Link key={emp.id || emp._id} href={`/emprendimientos/${emp.id || emp._id}`} className={styles.rankingCard}>
                      <div className={styles.rankingBadge}>#{index + 1}</div>
                        <div className={styles.rankingContent}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CategoryIcon nombre={nombreCategoria} size={18} />
                            <div>
                              <h4 className={styles.rankingName}>{emp.nombre}</h4>
                              <p className={styles.rankingVentas}>{emp.totalVentas} ventas</p>
                            </div>
                          </div>
                        </div>
                    </Link>
                  )})}
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.empty}><p>Cargando...</p></div>
          ) : emprendimientosFiltrados.length > 0 ? (
            <div className={styles.grid}>
              {emprendimientosFiltrados.map((emp) => {
                const usuario = usuarios.get(emp.usuarioId);
                const nombreCategoria = getNombreCategoria(emp.categoriaId);
                const precioMin = getPrecioMinimo(emp);
                const precioFormateado = formatearPrecio(precioMin);
                const nombreAutor = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC";
                const telefono = emp.telefono || usuario?.telefono || "";

                return (
                  <div key={emp.id || emp._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardEmoji}><CategoryIcon nombre={nombreCategoria} size={32} /></div>
                      <span className={styles.cardCat}>{nombreCategoria}</span>
                    </div>
                    <h3 className={styles.cardName}>{emp.nombre}</h3>
                    <p className={styles.cardDesc}>{emp.descripcion}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardAuthorName}>{nombreAutor}</span>
                      <span className={styles.cardPrice}>{precioFormateado}</span>
                    </div>
                    <div className={styles.cardButtons}>
                      <Link href={`/emprendimientos/${emp.id || emp._id}`} className={styles.cardBtn}>
                        Ver emprendimiento →
                      </Link>
                      {telefono && (
                        <a
                          href={`https://wa.me/${formatearNumeroWhatsApp(telefono)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(emp.nombre)}%22%20en%20EmprendedoresUCC.`}
                          target="_blank" rel="noopener noreferrer"
                          className={styles.whatsappBtn}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Contactar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}><h3>Sin resultados</h3></div>
          )}
        </section>
      </main>
      <Footer />

      {mostrarModalWhatsApp && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModalWhatsApp(false)}>
          <div className={styles.modalWhatsApp} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h3>Confirma tu pedido</h3></div>
            <div className={styles.modalBody}>
              {Object.values(productosAgrupados).map((emp: any) => (
                <div key={emp.id} className={styles.empresaCard}>
                  <h4>{emp.nombre}</h4>
                  <p>Total: ${emp.total.toLocaleString()}</p>
                  <button onClick={() => enviarWhatsApp(emp.id, emp.nombre, emp.productos, emp.total, emp.telefono)}>WhatsApp</button>
                  <button onClick={() => finalizarPedidoPorEmpresa(emp)}>Finalizar</button>
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setMostrarModalWhatsApp(false)}>Cerrar</button>
              {Object.keys(productosAgrupados).length > 1 && <button onClick={finalizarTodosLosPedidos}>Finalizar todos</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}