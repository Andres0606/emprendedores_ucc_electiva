"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import styles from "../../css/paginaEmprendimientos/detalle.module.css";

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
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  carrera: string;
  tipoUsuario: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
}

interface ProductoCarritoState {
  mostrarSelector: boolean;
  cantidad: number;
}

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imagen: string;
  activo: boolean;
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

const categoriaEmoji: Record<string, string> = {
  "Tecnología": "💻",
  "Gastronomía": "🍽️",
  "Comida": "🍔",
  "Moda y Diseño": "👗",
  "Salud y Bienestar": "🧘",
  "Arte y Cultura": "🎨",
  "Servicios": "🛠️",
};

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

const fechaActual = () =>
  new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

export default function DetalleEmprendimientoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  const [usuarioActual, setUsuarioActual] = useState<{ id: string; tipoUsuario?: string } | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(false);
  const [creandoPedido, setCreandoPedido] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false); // Nuevo estado

  // Carrito - selector por producto
  const [estadoCarrito, setEstadoCarrito] = useState<Record<number, ProductoCarritoState>>({});
  const [flyingParticles, setFlyingParticles] = useState<FlyingParticle[]>([]);
  const carritoIconRef = useRef<HTMLDivElement>(null);
  const particleCounter = useRef(0);

  // Drawer del carrito
  const [itemsCarrito, setItemsCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoAnimando, setCarritoAnimando] = useState(false);
  const [vistaFactura, setVistaFactura] = useState(false);
  const [numFactura, setNumFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");

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
      
      const response = await fetch('http://localhost:8080/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carritoData)
      });
      
      if (!response.ok) {
        console.error('Error al sincronizar carrito con backend');
      }
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
    }
  };

  const cargarCarritoDesdeBackend = async (usuarioId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/carrito/${usuarioId}`);
      if (response.ok) {
        const carritoBackend = await response.json();
        if (carritoBackend && carritoBackend.productos && carritoBackend.productos.length > 0) {
          const itemsCarritoFrontend = carritoBackend.productos.map((p: any) => ({
            nombre: p.nombreProducto,
            precio: p.precio,
            imagen: p.imagen || "",
            cantidad: p.cantidad,
            stock: 999,
            emprendimientoId: p.emprendimientoId,
            emprendimientoNombre: ""
          }));
          
          localStorage.setItem('carrito', JSON.stringify(itemsCarritoFrontend));
          setItemsCarrito(itemsCarritoFrontend);
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito desde backend:', error);
    }
  };

  // 🔥 FUNCIÓN CORREGIDA: Primero muestra la factura, luego crea el pedido
  const mostrarFactura = () => {
    if (itemsCarrito.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }
    
    // Generar número de factura y mostrar la vista
    setNumFactura(generarNumFactura());
    setFechaFactura(fechaActual());
    setPedidoConfirmado(false);
    setVistaFactura(true);
  };

  // 🔥 FUNCIÓN PARA CONFIRMAR EL PEDIDO (desde la factura)
 // Confirmar pedido (ajustado a la estructura de MongoDB)
// Confirmar pedido (ajustado a tu estructura de backend con DTOs)
const confirmarPedido = async () => {
  if (!usuarioActual?.id) {
    alert("Debes iniciar sesión para realizar un pedido");
    router.push('/autenticacion/login');
    return false;
  }
  
  if (itemsCarrito.length === 0) {
    alert("No hay productos en el carrito");
    return false;
  }
  
  setCreandoPedido(true);
  
  try {
    const fechaActualStr = new Date().toISOString().split('T')[0];
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
    const fechaExpiracionStr = fechaExpiracion.toISOString().split('T')[0];
    
    // Agrupar productos por emprendimiento
    const productosPorEmprendimiento = itemsCarrito.reduce((acc, item) => {
      if (!acc[item.emprendimientoId]) {
        acc[item.emprendimientoId] = {
          emprendimientoId: item.emprendimientoId,
          productos: [],
          total: 0
        };
      }
      acc[item.emprendimientoId].productos.push({
        productoId: item.nombre, // El nombre del producto como identificador
        cantidad: item.cantidad
      });
      acc[item.emprendimientoId].total += item.precio * item.cantidad;
      return acc;
    }, {} as Record<string, any>);
    
    // Crear un pedido por cada emprendimiento
    for (const empId of Object.keys(productosPorEmprendimiento)) {
      const grupo = productosPorEmprendimiento[empId];
      
      // Estructura que espera tu backend (PedidoRequestDTO)
      const pedidoData = {
        clienteId: usuarioActual.id,
        emprendimientoId: empId,
        productos: grupo.productos.map((p: any) => ({
          productoId: p.productoId,
          cantidad: p.cantidad
        })),
        total: grupo.total,
        estado: "pendiente",
        fechaPedido: fechaActualStr,
        fechaExpiracion: fechaExpiracionStr
      };
      
      console.log("Enviando pedido al backend:", pedidoData);
      
      const response = await fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error al crear el pedido: ${response.status} - ${errorText}`);
      }
      
      const pedidoCreado = await response.json();
      console.log("Pedido creado exitosamente:", pedidoCreado);
    }
    
    // Vaciar carrito después de crear los pedidos
    guardarCarrito([]);
    
    if (usuarioActual?.id) {
      try {
        await fetch(`http://localhost:8080/api/carrito/${usuarioActual.id}/vaciar`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.log("Error al vaciar carrito en backend:", error);
      }
    }
    
    setPedidoConfirmado(true);
    alert(`✅ ¡Pedido realizado exitosamente! El emprendedor se pondrá en contacto contigo para coordinar el pago y la entrega.`);
    return true;
    
  } catch (error) {
    console.error('Error al crear pedido:', error);
    alert(`❌ Error al realizar el pedido: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor intenta nuevamente.`);
    return false;
  } finally {
    setCreandoPedido(false);
  }
};

  // Cerrar factura y volver al carrito
  const cerrarFactura = () => {
    if (pedidoConfirmado) {
      // Si el pedido ya fue confirmado, cerrar todo
      setCarritoAbierto(false);
      setVistaFactura(false);
      setPedidoConfirmado(false);
    } else {
      // Solo cerrar la factura, volver al carrito
      setVistaFactura(false);
    }
  };

  // ── Leer carrito ──
  const leerCarrito = () => {
  if (!usuarioActual?.id) {
    setItemsCarrito([]);
    return;
  }
  const carritoKey = `carrito_${usuarioActual.id}`;
  const data = JSON.parse(localStorage.getItem(carritoKey) || '[]');
  setItemsCarrito(data);
};
const guardarCarrito = (items: ItemCarrito[]) => {
  if (!usuarioActual?.id) return;
  
  // Validar que todos los items tengan emprendimientoId
  const itemsValidos = items.filter(item => item.emprendimientoId);
  
  const carritoKey = `carrito_${usuarioActual.id}`;
  localStorage.setItem(carritoKey, JSON.stringify(itemsValidos));
  setItemsCarrito(itemsValidos);
  
  if (usuarioActual?.id) {
    sincronizarCarritoConBackend(usuarioActual.id, itemsValidos);
  }
};

  useEffect(() => { 
  if (usuarioActual?.id) {
    leerCarrito();
  } else {
    setItemsCarrito([]);
  }
}, [usuarioActual]);

  const totalItems = itemsCarrito.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = itemsCarrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  // Escape cierra drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCarritoAbierto(false); setVistaFactura(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = carritoAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [carritoAbierto]);

  // ── Acciones drawer ──
  const cambiarCantidadDrawer = (idx: number, delta: number) => {
  const c = [...itemsCarrito];
  const nuevo = c[idx].cantidad + delta;
  if (nuevo < 1 || nuevo > c[idx].stock) return;
  c[idx].cantidad = nuevo;
  guardarCarrito(c);
};

  const eliminarItemDrawer = (idx: number) => {
  const c = itemsCarrito.filter((_, i) => i !== idx);
  guardarCarrito(c);
};

  const vaciarCarrito = async () => {
  if (confirm("¿Estás seguro de vaciar todo el carrito?")) {
    guardarCarrito([]);
    setVistaFactura(false);
    
    if (usuarioActual?.id) {
      await sincronizarCarritoConBackend(usuarioActual.id, []);
    }
  }
};

  const abrirCarrito = () => {
    leerCarrito();
    setVistaFactura(false);
    setPedidoConfirmado(false);
    setCarritoAnimando(true);
    setTimeout(() => setCarritoAnimando(false), 600);
    setCarritoAbierto(true);
  };

  const cerrarDrawer = () => { setCarritoAbierto(false); setVistaFactura(false); setPedidoConfirmado(false); };

  // ── Animación partícula ──
  const lanzarAnimacion = (botonEl: HTMLButtonElement, imagenProducto: string) => {
    const botonRect = botonEl.getBoundingClientRect();
    let endX = window.innerWidth - 60;
    let endY = 20;
    if (carritoIconRef.current) {
      const r = carritoIconRef.current.getBoundingClientRect();
      endX = r.left + r.width / 2;
      endY = r.top + r.height / 2;
    }
    const startX = botonRect.left + botonRect.width / 2;
    const startY = botonRect.top + botonRect.height / 2;
    particleCounter.current += 1;
    const newParticle: FlyingParticle = {
      id: particleCounter.current, startX, startY, endX, endY,
      imagen: imagenProducto, activo: true,
    };
    setFlyingParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setCarritoAnimando(true);
      setTimeout(() => setCarritoAnimando(false), 600);
    }, 700);
    setTimeout(() => {
      setFlyingParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 900);
  };

  // ── Selector de cantidad por producto ──
  const abrirSelectorCantidad = (idx: number) => {
    setEstadoCarrito(prev => ({
      ...prev,
      [idx]: { mostrarSelector: true, cantidad: prev[idx]?.cantidad || 1 },
    }));
  };

  const cambiarCantidad = (idx: number, nuevaCantidad: number, stockMax: number) => {
    if (nuevaCantidad < 1 || nuevaCantidad > stockMax) return;
    setEstadoCarrito(prev => ({ ...prev, [idx]: { ...prev[idx], cantidad: nuevaCantidad } }));
  };

  const cancelarSeleccion = (idx: number) => {
    setEstadoCarrito(prev => ({ ...prev, [idx]: { mostrarSelector: false, cantidad: 1 } }));
  };

const confirmarAgregarAlCarrito = async (
  idx: number,
  producto: Emprendimiento["productos"][0],
  event: React.MouseEvent<HTMLButtonElement>
) => {
  const cantidad = estadoCarrito[idx]?.cantidad || 1;
  const carritoActual = [...itemsCarrito];
  const empId = emprendimiento?.id || emprendimiento?._id;
  
  // 🔥 Validar que el ID del emprendimiento existe
  if (!empId) {
    console.error("No se pudo obtener el ID del emprendimiento");
    alert("Error al agregar al carrito. Intenta de nuevo.");
    return;
  }
  
  const itemExistente = carritoActual.findIndex(
    (item: any) =>
      item.nombre === producto.nombre &&
      item.emprendimientoId === empId
  );
  
  if (itemExistente >= 0) {
    carritoActual[itemExistente].cantidad += cantidad;
  } else {
    carritoActual.push({
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
      stock: producto.stock,
      emprendimientoId: empId, // ✅ Ahora es string, no undefined
      emprendimientoNombre: emprendimiento?.nombre || "",
    });
  }
  guardarCarrito(carritoActual);
  lanzarAnimacion(event.currentTarget, producto.imagen || "🛒");
  cancelarSeleccion(idx);
};

  // ── Auth ──
  useEffect(() => {
    const userStr = sessionStorage.getItem('usuario');
    const userId = sessionStorage.getItem('usuarioId');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const usuarioId = user.id || user._id || userId;
        if (usuarioId) {
          setUsuarioActual({ id: usuarioId, tipoUsuario: user.tipoUsuario || tipoUsuario || undefined });
          cargarCarritoDesdeBackend(usuarioId);
        } else {
          setUsuarioActual(null);
        }
      } catch { 
        setUsuarioActual(null); 
      }
    } else { 
      setUsuarioActual(null); 
    }
  }, []);

  const obtenerCategoria = async (categoriaId: string) => {
    try {
      const r = await fetch(`http://localhost:8080/api/categorias/${categoriaId}`);
      if (!r.ok) return null;
      const d = await r.json();
      return { id: d.id || d._id, nombre: d.nombre, descripcion: d.descripcion };
    } catch { return null; }
  };

  const obtenerUsuario = async (usuarioId: string) => {
    try {
      const r = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!r.ok) return null;
      const d = await r.json();
      return { id: d.id || d._id, nombre: d.nombre, apellido: d.apellido, correo: d.correo, telefono: d.telefono, carrera: d.carrera, tipoUsuario: d.tipoUsuario };
    } catch { return null; }
  };

  const verificarSeguimiento = async () => {
    if (!usuarioActual?.id || !emprendimiento) return;
    try {
      const empId = emprendimiento.id || emprendimiento._id;
      const r = await fetch(`http://localhost:8080/api/seguimientos/verificar?usuarioId=${usuarioActual.id}&emprendimientoId=${empId}`);
      if (r.ok) { const d = await r.json(); setSiguiendo(d.estaSiguiendo); setTotalSeguidores(d.totalSeguidores); }
    } catch { /* silent */ }
  };

  const toggleSeguimiento = async () => {
    if (!usuarioActual?.id) {
      const ok = confirm("Debes iniciar sesión para seguir emprendimientos. ¿Quieres ir al login?");
      if (ok) { sessionStorage.setItem('redirectAfterLogin', window.location.pathname); router.push('/autenticacion/login'); }
      return;
    }
    if (!emprendimiento) return;
    setCargandoSeguimiento(true);
    try {
      const empId = emprendimiento.id || emprendimiento._id;
      const r = await fetch(
        siguiendo ? `http://localhost:8080/api/seguimientos/dejar-de-seguir` : `http://localhost:8080/api/seguimientos/seguir`,
        { method: siguiendo ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: usuarioActual.id, emprendimientoId: empId }) }
      );
      if (r.ok) {
        const d = await r.json();
        setSiguiendo(!siguiendo);
        setTotalSeguidores(d.totalSeguidores);
        alert(siguiendo ? "✅ Has dejado de seguir este emprendimiento" : "✅ ¡Ahora sigues este emprendimiento!");
      } else {
        const err = await r.json();
        alert(err.message || "Error al procesar seguimiento");
      }
    } catch { alert("Error al procesar la solicitud"); }
    finally { setCargandoSeguimiento(false); }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const r = await fetch(`http://localhost:8080/api/emprendimientos/${id}`);
        if (!r.ok) throw new Error(r.status === 404 ? "Emprendimiento no encontrado" : `Error ${r.status}`);
        const data: Emprendimiento = await r.json();
        setEmprendimiento(data);
        if (data.usuarioId) { const u = await obtenerUsuario(data.usuarioId); if (u) setUsuario(u as Usuario); }
        if (data.categoriaId) { const c = await obtenerCategoria(data.categoriaId); if (c) setCategoria(c as Categoria); }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally { setLoading(false); }
    };
    if (id) cargar();
  }, [id]);

  useEffect(() => {
    if (emprendimiento && usuarioActual?.id) {
      verificarSeguimiento();
    } else if (emprendimiento && !usuarioActual) {
      const getCount = async () => {
        try {
          const empId = emprendimiento.id || emprendimiento._id;
          const r = await fetch(`http://localhost:8080/api/seguimientos/verificar?usuarioId=dummy&emprendimientoId=${empId}`);
          if (r.ok) { const d = await r.json(); setTotalSeguidores(d.totalSeguidores); }
        } catch { /* silent */ }
      };
      getCount();
    }
  }, [emprendimiento, usuarioActual]);

  const formatearPrecio = (precio: number) => `$${precio.toLocaleString()}`;

  if (loading) return (<><Header /><main className={styles.main}><div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Cargando emprendimiento...</p></div></main><Footer /></>);
  if (error || !emprendimiento) return (<><Header /><main className={styles.main}><div className={styles.errorContainer}><span className={styles.errorEmoji}>😔</span><h2>{error || "Emprendimiento no encontrado"}</h2><p>El emprendimiento que buscas no existe o ha sido eliminado.</p><Link href="/emprendimientos" className={styles.backButton}>← Volver a emprendimientos</Link></div></main><Footer /></>);

  const emojiCategoria = categoriaEmoji[categoria?.nombre || ""] || "🚀";
  const telefonoContacto = emprendimiento.telefono || usuario?.telefono;

  return (
    <>
      <Header />

      {/* ══ ÍCONO FLOTANTE DEL CARRITO ══ */}
      <div
        ref={carritoIconRef}
        className={`${styles.carritoFlotante} ${carritoAnimando ? styles.carritoAnimando : ''}`}
        onClick={abrirCarrito}
        title="Ver carrito"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {totalItems > 0 && (
          <span className={`${styles.carritoBadge} ${carritoAnimando ? styles.badgeAnimando : ''}`}>
            {totalItems}
          </span>
        )}
      </div>

      {/* ══ DRAWER DEL CARRITO ══ */}
      {carritoAbierto && (
        <div className={`${styles.drawerOverlay} ${vistaFactura ? styles.drawerOverlayPrint : ''}`} onClick={cerrarDrawer}>
          <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>

            {/* Cabecera */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderLeft}>
                {vistaFactura ? (
                  <button className={styles.drawerBackBtn} onClick={cerrarFactura}>← Volver</button>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span className={styles.drawerTitle}>Mi carrito</span>
                    {totalItems > 0 && (
                      <span className={styles.drawerBadge}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                    )}
                  </>
                )}
              </div>
              <button className={styles.drawerClose} onClick={cerrarDrawer} aria-label="Cerrar">✕</button>
            </div>

            {/* ── VISTA FACTURA ── */}
            {vistaFactura ? (
              <div className={styles.drawerBody}>
                <div className={styles.facturaContainer}>
                  {/* Cabecera de factura */}
                  <div className={styles.facturaHeader}>
                    <div className={styles.facturaHeaderTop}>
                      <span className={styles.facturaLogo}>🎓</span>
                      <div className={styles.facturaHeaderInfo}>
                        <h3>EmprendedoresUCC</h3>
                        <span className={styles.facturaSubtitulo}>Universidad Cooperativa de Colombia</span>
                        <span className={styles.facturaSubtitulo}>Villavicencio, Meta</span>
                      </div>
                    </div>
                    <div className={styles.facturaHeaderMeta}>
                      <span className={styles.facturaNumero}>Factura {numFactura}</span>
                      <span className={styles.facturaFecha}>{fechaFactura}</span>
                    </div>
                  </div>

                  {/* Tabla de items */}
                  <div className={styles.facturaTabla}>
                    <div className={styles.facturaTablaHead}>
                      <span>Producto</span>
                      <span>Emprendimiento</span>
                      <span className={styles.textCenter}>Cant.</span>
                      <span className={styles.textRight}>Precio u.</span>
                      <span className={styles.textRight}>Total</span>
                    </div>
                    {itemsCarrito.map((item, idx) => (
                      <div key={idx} className={styles.facturaTablaRow}>
                        <span className={styles.facturaItemNombre}>{item.nombre}</span>
                        <span className={styles.facturaItemEmp}>{item.emprendimientoNombre}</span>
                        <span className={`${styles.facturaItemCant} ${styles.textCenter}`}>{item.cantidad}</span>
                        <span className={`${styles.facturaItemPrecioU} ${styles.textRight}`}>{fmt(item.precio)}</span>
                        <span className={`${styles.facturaItemTotal} ${styles.textRight}`}>{fmt(item.precio * item.cantidad)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className={styles.facturaTotalesBloque}>
                    <div className={styles.facturaTotalFila}>
                      <span>Subtotal</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    <div className={styles.facturaTotalFila}>
                      <span>Descuento</span>
                      <span>$0</span>
                    </div>
                    <div className={`${styles.facturaTotalFila} ${styles.facturaTotalFilaFinal}`}>
                      <span>TOTAL A PAGAR</span>
                      <span className={styles.facturaTotalMonto}>{fmt(subtotal)}</span>
                    </div>
                  </div>

                  {/* Aviso */}
                  <div className={styles.facturaAviso}>
                    ⚠️ Esta factura es un comprobante de intención de compra. Coordina el pago directamente con cada emprendedor.
                    Imprimir primero la factura
                  </div>

                  {/* Pie de página */}
                  <div className={styles.facturaPie}>
                    <span>Gracias por apoyar los emprendimientos estudiantiles</span>
                    <span>EmprendedoresUCC · Universidad Cooperativa de Colombia · Villavicencio</span>
                  </div>

                  {/* 🔥 BOTONES CORREGIDOS */}
                  <div className={styles.facturaAcciones}>
                    <button 
                      className={styles.facturaVaciarBtn} 
                      onClick={cerrarFactura}
                    >
                      ← Volver
                    </button>
                    <button 
                      className={styles.facturaPrintBtn} 
                      onClick={() => window.print()}
                    >
                      🖨️ Imprimir factura
                    </button>
                    {!pedidoConfirmado && (
                      <button 
                        className={styles.facturaConfirmarBtn} 
                        onClick={confirmarPedido}
                        disabled={creandoPedido}
                      >
                        {creandoPedido ? "⏳ Procesando..." : "✅ Confirmar pedido"}
                      </button>
                    )}
                    {pedidoConfirmado && (
                      <div className={styles.facturaExito}>
                        <span>🎉 ¡Pedido confirmado! Puedes imprimir esta factura como comprobante.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            ) : (
              /* ── VISTA CARRITO NORMAL ── */
              <>
                <div className={styles.drawerBody}>
                  {itemsCarrito.length === 0 ? (
                    <div className={styles.drawerEmpty}>
                      <span className={styles.drawerEmptyEmoji}>🛒</span>
                      <p>Tu carrito está vacío</p>
                      <span>Agrega productos desde esta página</span>
                    </div>
                  ) : (
                    <div className={styles.drawerItems}>
                      {itemsCarrito.map((item, idx) => (
                        <div key={idx} className={styles.drawerItem}>
                          <div className={styles.drawerItemImg}>
                            {item.imagen && item.imagen.startsWith('http')
                              ? <img src={item.imagen} alt={item.nombre} />
                              : <span>🛍️</span>}
                          </div>
                          <div className={styles.drawerItemInfo}>
                            <p className={styles.drawerItemNombre}>{item.nombre}</p>
                            <p className={styles.drawerItemEmp}>{item.emprendimientoNombre}</p>
                            <p className={styles.drawerItemPrecio}>{fmt(item.precio)} c/u</p>
                          </div>
                          <div className={styles.drawerItemDerecha}>
                            <p className={styles.drawerItemSubtotal}>{fmt(item.precio * item.cantidad)}</p>
                            <div className={styles.drawerItemControles}>
                              <button className={styles.drawerCantBtn} onClick={() => cambiarCantidadDrawer(idx, -1)} disabled={item.cantidad <= 1}>−</button>
                              <span className={styles.drawerCantNum}>{item.cantidad}</span>
                              <button className={styles.drawerCantBtn} onClick={() => cambiarCantidadDrawer(idx, 1)} disabled={item.cantidad >= item.stock}>+</button>
                            </div>
                            <button className={styles.drawerItemEliminar} onClick={() => eliminarItemDrawer(idx)} title="Eliminar">🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {itemsCarrito.length > 0 && (
                  <div className={styles.drawerFooter}>
                    <div className={styles.drawerResumen}>
                      <div className={styles.drawerResumenFila}>
                        <span>Productos ({totalItems})</span>
                        <span>{fmt(subtotal)}</span>
                      </div>
                      <div className={`${styles.drawerResumenFila} ${styles.drawerResumenTotal}`}>
                        <span>Total</span>
                        <span>{fmt(subtotal)}</span>
                      </div>
                    </div>
                    <div className={styles.drawerAcciones}>
                      <button className={styles.drawerVaciarBtn} onClick={vaciarCarrito}>Vaciar</button>
                      <button className={styles.drawerPagarBtn} onClick={mostrarFactura}>
                        💳 Pagar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ PARTÍCULAS VOLADORAS ══ */}
      {flyingParticles.map(p => (
        <div
          key={p.id}
          className={styles.flyingParticle}
          style={{
            '--start-x': `${p.startX}px`,
            '--start-y': `${p.startY}px`,
            '--end-x': `${p.endX}px`,
            '--end-y': `${p.endY}px`,
          } as React.CSSProperties}
        >
          {p.imagen && p.imagen.startsWith('http')
            ? <img src={p.imagen} alt="" />
            : <span>🛒</span>}
        </div>
      ))}

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/">Inicio</Link><span>/</span>
          <Link href="/emprendimientos">Emprendimientos</Link><span>/</span>
          <span className={styles.breadcrumbCurrent}>{emprendimiento.nombre}</span>
        </div>

        <div className={styles.container}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {emprendimiento.imagenes?.length > 0 && emprendimiento.imagenes[imagenSeleccionada] ? (
                <img src={emprendimiento.imagenes[imagenSeleccionada]} alt={emprendimiento.nombre}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }} />
              ) : (
                <div className={styles.noImage}><span>📷</span><p>Sin imagen</p></div>
              )}
            </div>
            {emprendimiento.imagenes?.length > 1 && (
              <div className={styles.thumbnailList}>
                {emprendimiento.imagenes.map((img, idx) => (
                  <button key={idx}
                    className={`${styles.thumbnail} ${imagenSeleccionada === idx ? styles.thumbnailActive : ""}`}
                    onClick={() => setImagenSeleccionada(idx)}>
                    <img src={img} alt={`Imagen ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.header}>
              <span className={styles.category}>{emojiCategoria} {categoria?.nombre || "Sin categoría"}</span>
              <span className={`${styles.status} ${styles.statusActive}`}>{emprendimiento.estado === "activo" ? "Activo" : "Pausado"}</span>
            </div>
            <h1 className={styles.title}>{emprendimiento.nombre}</h1>
            <p className={styles.description}>{emprendimiento.descripcion}</p>

            <div className={styles.followSection}>
              <button onClick={toggleSeguimiento}
                className={`${styles.followButton} ${siguiendo ? styles.followingButton : styles.notFollowingButton}`}
                disabled={cargandoSeguimiento}>
                {cargandoSeguimiento ? <span className={styles.spinnerSmall}>⏳</span>
                  : !usuarioActual?.id ? <><span>🔒</span> Inicia sesión para seguir</>
                  : siguiendo ? <><span>✓</span> Siguiendo</>
                  : <><span>+</span> Seguir emprendimiento</>}
              </button>
              <div className={styles.followersCount}><span>👥</span> {totalSeguidores} seguidor{totalSeguidores !== 1 ? 'es' : ''}</div>
            </div>

            <div className={styles.entrepreneur}>
              <h3>Emprendedor</h3>
              <div className={styles.entrepreneurInfo}>
                <div className={styles.avatar}>{usuario ? usuario.nombre.charAt(0) : "U"}</div>
                <div>
                  <p className={styles.entrepreneurName}>{usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC"}</p>
                  <p className={styles.entrepreneurCareer}>{usuario?.carrera || "Universidad Cooperativa de Colombia"}</p>
                </div>
              </div>
            </div>

            <div className={styles.contactButtons}>
              {telefonoContacto && (
                <a href={`https://wa.me/${formatearNumeroWhatsApp(telefonoContacto)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(emprendimiento.nombre)}%22%20en%20EmprendedoresUCC%20y%20me%20interesa%20saber%20m%C3%A1s.`}
                  target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contactar por WhatsApp
                </a>
              )}
              {usuario?.correo && (
                <a href={`mailto:${usuario.correo}?subject=Interés en ${emprendimiento.nombre}`} className={styles.emailButton}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7L12 13 2 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Enviar correo
                </a>
              )}
            </div>
          </div>
        </div>

        {emprendimiento.productos?.length > 0 && (
          <section className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <h2>Productos y Servicios</h2>
              <p>{emprendimiento.productos.length} producto{emprendimiento.productos.length !== 1 ? "s" : ""} disponible{emprendimiento.productos.length !== 1 ? "s" : ""}</p>
            </div>

            <div className={styles.productsGrid}>
              {emprendimiento.productos.map((producto, idx) => {
                const estado = estadoCarrito[idx];
                const agotado = producto.stock <= 0;

                return (
                  <div key={idx} className={styles.productCard}>
                    {producto.imagen && (
                      <div className={styles.productImage}>
                        <img src={producto.imagen} alt={producto.nombre} />
                      </div>
                    )}
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{producto.nombre}</h3>
                      <p className={styles.productPrice}>{formatearPrecio(producto.precio)}</p>
                      {!agotado
                        ? <span className={styles.productStock}>Stock: {producto.stock} unidades</span>
                        : <span className={styles.productOutOfStock}>Agotado</span>}

                      {!agotado && (
                        <>
                          {!estado?.mostrarSelector ? (
                            <button className={styles.addToCartButton} onClick={() => abrirSelectorCantidad(idx)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                              </svg>
                              Agregar al carrito
                            </button>
                          ) : (
                            <div className={styles.cantidadSelector}>
                              <p className={styles.cantidadLabel}>¿Cuántas unidades?</p>
                              <div className={styles.cantidadControles}>
                                <button className={styles.cantidadBtn} onClick={() => cambiarCantidad(idx, (estado.cantidad || 1) - 1, producto.stock)} disabled={(estado.cantidad || 1) <= 1}>−</button>
                                <span className={styles.cantidadNumero}>{estado.cantidad || 1}</span>
                                <button className={styles.cantidadBtn} onClick={() => cambiarCantidad(idx, (estado.cantidad || 1) + 1, producto.stock)} disabled={(estado.cantidad || 1) >= producto.stock}>+</button>
                              </div>
                              <p className={styles.cantidadSubtotal}>Subtotal: <strong>{formatearPrecio(producto.precio * (estado.cantidad || 1))}</strong></p>
                              <div className={styles.cantidadAcciones}>
                                <button className={styles.cancelarBtn} onClick={() => cancelarSeleccion(idx)}>Cancelar</button>
                                <button className={styles.confirmarCarritoBtn} onClick={(e) => confirmarAgregarAlCarrito(idx, producto, e)}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                  </svg>
                                  Agregar al carrito
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className={styles.backSection}>
          <Link href="/emprendimientos" className={styles.backToList}>← Ver todos los emprendimientos</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}