"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/emprendimientos/page.module.css";

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

const categoriaEmoji: Record<string, string> = {
  "Tecnología": "💻",
  "Gastronomía": "🍽️",
  "Comida": "🍔",
  "Moda y Diseño": "👗",
  "Salud y Bienestar": "🧘",
  "Arte y Cultura": "🎨",
  "Servicios": "🛠️",
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
  const [loading, setLoading] = useState(true);
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
  const [pedidoCreado, setPedidoCreado] = useState(false); // MODIFICADO: Nuevo estado

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

  // MODIFICADO: Función para mostrar la factura (sin crear pedido aún)
  const mostrarFactura = () => {
    setNumFactura(generarNumFactura());
    setFechaFactura(fechaActual());
    setPedidoCreado(false);
    setVistaFactura(true);
  };

  // MODIFICADO: Función para confirmar y crear el pedido
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
      const productosPorEmprendimiento = itemsCarrito.reduce((acc, item) => {
        if (!acc[item.emprendimientoId]) {
          acc[item.emprendimientoId] = {
            emprendimientoId: item.emprendimientoId,
            productos: [],
            total: 0
          };
        }
        acc[item.emprendimientoId].productos.push({
          productoId: item.nombre,
          cantidad: item.cantidad
        });
        acc[item.emprendimientoId].total += item.precio * item.cantidad;
        return acc;
      }, {} as Record<string, any>);
      
      const fechaActualStr = new Date().toISOString().split('T')[0];
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
      
      for (const empId of Object.keys(productosPorEmprendimiento)) {
        const pedidoData = {
          clienteId: usuarioActual.id,
          emprendimientoId: empId,
          productos: productosPorEmprendimiento[empId].productos,
          total: productosPorEmprendimiento[empId].total,
          estado: "pendiente",
          fechaPedido: fechaActualStr,
          fechaExpiracion: fechaExpiracion.toISOString().split('T')[0]
        };
        
        const response = await fetch('http://localhost:8080/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedidoData)
        });
        
        if (!response.ok) {
          throw new Error('Error al crear el pedido');
        }
      }
      
      localStorage.setItem('carrito', '[]');
      setItemsCarrito([]);
      
      if (usuarioActual?.id) {
        await fetch(`http://localhost:8080/api/carrito/${usuarioActual.id}/vaciar`, {
          method: 'DELETE'
        });
      }
      
      setPedidoCreado(true);
      alert('¡Pedido creado exitosamente! Revisa tu correo para más detalles.');
      return true;
      
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido. Por favor intenta nuevamente.');
      return false;
    } finally {
      setCreandoPedido(false);
    }
  };

  // MODIFICADO: Función para cerrar la factura
  const cerrarFactura = () => {
    if (pedidoCreado) {
      setCarritoAbierto(false);
      setVistaFactura(false);
      setPedidoCreado(false);
    } else {
      setVistaFactura(false);
    }
  };

  // ── Carrito ──
  const leerCarrito = () => {
    const data = JSON.parse(localStorage.getItem('carrito') || '[]');
    setItemsCarrito(data);
  };

  useEffect(() => { 
    leerCarrito(); 
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCarritoAbierto(false); setVistaFactura(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = carritoAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [carritoAbierto]);

  const cambiarCantidad = (idx: number, delta: number) => {
    const c = [...itemsCarrito];
    const nuevo = c[idx].cantidad + delta;
    if (nuevo < 1 || nuevo > c[idx].stock) return;
    c[idx].cantidad = nuevo;
    localStorage.setItem('carrito', JSON.stringify(c));
    setItemsCarrito(c);
    
    if (usuarioActual?.id) {
      sincronizarCarritoConBackend(usuarioActual.id, c);
    }
  };

  const eliminarItem = (idx: number) => {
    const c = itemsCarrito.filter((_, i) => i !== idx);
    localStorage.setItem('carrito', JSON.stringify(c));
    setItemsCarrito(c);
    
    if (usuarioActual?.id) {
      sincronizarCarritoConBackend(usuarioActual.id, c);
    }
  };

  const vaciarCarrito = async () => {
    localStorage.setItem('carrito', '[]');
    setItemsCarrito([]);
    setVistaFactura(false);
    
    if (usuarioActual?.id) {
      await sincronizarCarritoConBackend(usuarioActual.id, []);
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
  // Abrir una nueva ventana con solo la factura
  const ventana = window.open('', '_blank');
  if (ventana) {
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${numFactura}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            padding: 20px;
          }
          .factura {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #009FE3;
          }
          .header h1 {
            color: #009FE3;
            font-size: 28px;
            margin: 5px 0;
          }
          .header p {
            color: #666;
            margin: 3px 0;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .info div p {
            margin: 5px 0;
          }
          .info strong {
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #333;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totales {
            width: 300px;
            margin-left: auto;
            margin-bottom: 25px;
          }
          .totales table {
            width: 100%;
            border: none;
          }
          .totales td {
            border: none;
            padding: 6px;
          }
          .total-final {
            border-top: 2px solid #333 !important;
            font-weight: bold;
            font-size: 1.2em;
            padding-top: 8px !important;
            margin-top: 4px;
          }
          .aviso {
            background: #fff3e0;
            padding: 12px;
            margin: 20px 0;
            border: 1px solid #ffcc80;
            border-radius: 8px;
            font-size: 12px;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .factura {
              margin: 0;
              padding: 0;
            }
            .info {
              background: none;
              border: 1px solid #eee;
            }
            @page {
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="factura">
          <div class="header">
            <h1>EmprendedoresUCC</h1>
            <p>Universidad Cooperativa de Colombia</p>
            <p>Villavicencio, Meta</p>
          </div>
          
          <div class="info">
            <div>
              <p><strong>Factura N°:</strong> ${numFactura}</p>
              <p><strong>Fecha:</strong> ${fechaFactura}</p>
            </div>
            <div>
              <p><strong>Cliente:</strong> ${sessionStorage.getItem("nombreUsuario") || "Usuario"}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Emprendimiento</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio u.</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsCarrito.map(item => `
                <tr>
                  <td>${item.nombre}</td>
                  <td>${item.emprendimientoNombre}</td>
                  <td class="text-center">${item.cantidad}</td>
                  <td class="text-right">${fmt(item.precio)}</td>
                  <td class="text-right">${fmt(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totales">
            <table>
              <tr>
                <td>Subtotal</td>
                <td class="text-right">${fmt(subtotal)}</td>
              </tr>
              <tr>
                <td>Descuento</td>
                <td class="text-right">$0</td>
              </tr>
              <tr class="total-final">
                <td><strong>TOTAL A PAGAR</strong></td>
                <td class="text-right"><strong>${fmt(subtotal)}</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="aviso">
            ⚠️ Esta factura es un comprobante de intención de compra. Coordina el pago directamente con cada emprendedor.
          </div>
          
          <div class="footer">
            <p>Gracias por apoyar los emprendimientos estudiantiles</p>
            <p>EmprendedoresUCC · Universidad Cooperativa de Colombia · Villavicencio</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
            
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  }
};
  const cerrarDrawer = () => {
    setCarritoAbierto(false);
    setVistaFactura(false);
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

  // ── Datos ──
  const obtenerUsuario = async (usuarioId: string): Promise<Usuario | null> => {
    try {
      const r = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  };

  const obtenerCategorias = async () => {
    try {
      const r = await fetch("http://localhost:8080/api/categorias");
      if (!r.ok) return;
      const data: Categoria[] = await r.json();
      const map = new Map<string, string>();
      const arr: { id: string; nombre: string }[] = [];
      data.forEach(cat => {
        const id = cat.id || cat._id;
        if (id) { map.set(id, cat.nombre); arr.push({ id, nombre: cat.nombre }); }
      });
      setCategorias(map);
      setCategoriasList(arr);
    } catch { /* silent */ }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        await obtenerCategorias();
        const r = await fetch("http://localhost:8080/api/emprendimientos");
        if (!r.ok) throw new Error(`Error ${r.status}`);
        const data: Emprendimiento[] = await r.json();
        const usuariosMap = new Map<string, Usuario>();
        const ids = [...new Set(data.map(e => e.usuarioId))];
        for (const uid of ids) {
          const u = await obtenerUsuario(uid);
          if (u) usuariosMap.set(uid, u);
        }
        setUsuarios(usuariosMap);
        setEmprendimientos(data);
      } catch {
        setError("No se pudieron cargar los emprendimientos");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const getNombreCategoria = (id: string) => categorias.get(id) || "Sin categoría";
  const getEmojiCategoria = (nombre: string) => categoriaEmoji[nombre] || "🚀";
  const getPrecioMinimo = (emp: Emprendimiento) => {
    const p = emp.productos?.map(p => p.precio) || [];
    return p.length > 0 ? Math.min(...p) : 0;
  };
  const formatearPrecio = (precio: number) =>
    precio > 0 ? `Desde $${precio.toLocaleString()}` : "Consultar";

  const emprendimientosFiltrados = emprendimientos.filter(emp => {
    if (emp.estado !== "activo") return false;
    const nombreCat = getNombreCategoria(emp.categoriaId);
    const precioMin = getPrecioMinimo(emp);
    const rango = precioRangos[precioIdx];
    const matchBusqueda = busqueda === "" ||
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaSeleccionada === "Todas" || nombreCat === categoriaSeleccionada;
    const matchPrecio = precioMin >= rango.min && precioMin <= rango.max;
    return matchBusqueda && matchCategoria && matchPrecio;
  });

  const categoriasFiltro = ["Todas", ...categoriasList.map(c => c.nombre)];

  if (loading) return (
    <><Header />
      <main className={styles.main}>
        <div style={{ textAlign: "center", padding: "4rem" }}>Cargando emprendimientos...</div>
      </main>
      <Footer /></>
  );

  if (error) return (
    <><Header />
      <main className={styles.main}>
        <div style={{ textAlign: "center", padding: "4rem", color: "#dc2626" }}>
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </main>
      <Footer /></>
  );

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
                  </div>

                  {/* Pie de factura */}
                  <div className={styles.facturaPie}>
                    <span>Gracias por apoyar los emprendimientos estudiantiles</span>
                    <span>EmprendedoresUCC · Universidad Cooperativa de Colombia · Villavicencio</span>
                  </div>

                  {/* Botones - MODIFICADOS */}
                  <div className={styles.facturaAcciones}>
                    <button 
                      className={styles.facturaVaciarBtn} 
                      onClick={cerrarFactura}
                    >
                      ← Volver
                    </button>
                    <button 
                      className={styles.facturaPrintBtn} 
                      onClick={imprimirFactura}
                    >
                      🖨️ Imprimir factura
                    </button>
                    <button 
                      className={styles.facturaConfirmarBtn} 
                      onClick={confirmarPedido}
                      disabled={creandoPedido || pedidoCreado}
                      style={{
                        backgroundColor: pedidoCreado ? '#10b981' : '#3b82f6'
                      }}
                    >
                      {creandoPedido ? "Procesando..." : pedidoCreado ? "✓ Pedido creado" : "✅ Confirmar pedido"}
                    </button>
                  </div>

                  {/* Mensaje de éxito */}
                  {pedidoCreado && (
                    <div className={styles.facturaExito}>
                      <span>🎉 ¡Pedido confirmado! Puedes imprimir esta factura como comprobante.</span>
                    </div>
                  )}
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
                      <span>Explora los emprendimientos y agrega productos</span>
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
                              <button className={styles.drawerCantBtn} onClick={() => cambiarCantidad(idx, -1)} disabled={item.cantidad <= 1}>−</button>
                              <span className={styles.drawerCantNum}>{item.cantidad}</span>
                              <button className={styles.drawerCantBtn} onClick={() => cambiarCantidad(idx, 1)} disabled={item.cantidad >= item.stock}>+</button>
                            </div>
                            <button className={styles.drawerItemEliminar} onClick={() => eliminarItem(idx)} title="Eliminar">🗑</button>
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
                      <button 
                        className={styles.drawerPagarBtn} 
                        onClick={mostrarFactura}  // MODIFICADO: ahora llama a mostrarFactura
                        disabled={creandoPedido}
                      >
                        {creandoPedido ? "Procesando..." : "💳 Pagar"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              {emprendimientos.filter(e => e.estado === "activo").length} emprendimientos activos · UCC Villavicencio
            </span>
            <h1 className={styles.heroTitle}>Explora los emprendimientos</h1>
            <p className={styles.heroDesc}>
              Descubre proyectos creados por estudiantes de la Universidad Cooperativa de Colombia.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.searchBar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="6" />
                <path d="M15 15l3 3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o autor..."
                className={styles.searchInput}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && <button className={styles.searchClear} onClick={() => setBusqueda("")}>✕</button>}
            </div>
            <span className={styles.resultCount}>
              {emprendimientosFiltrados.length} resultado{emprendimientosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Categoría</span>
              <div className={styles.filterPills}>
                {categoriasFiltro.map((cat) => (
                  <button key={cat}
                    className={`${styles.filterPill} ${categoriaSeleccionada === cat ? styles.filterPillActive : ""}`}
                    onClick={() => setCategoriaSeleccionada(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Precio</span>
              <div className={styles.filterPills}>
                {precioRangos.map((r, i) => (
                  <button key={r.label}
                    className={`${styles.filterPill} ${precioIdx === i ? styles.filterPillActive : ""}`}
                    onClick={() => setPrecioIdx(i)}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {emprendimientosFiltrados.length > 0 ? (
            <div className={styles.grid}>
              {emprendimientosFiltrados.map((emp) => {
                const usuario = usuarios.get(emp.usuarioId);
                const nombreCategoria = getNombreCategoria(emp.categoriaId);
                const emoji = getEmojiCategoria(nombreCategoria);
                const precioMin = getPrecioMinimo(emp);
                const precioFormateado = formatearPrecio(precioMin);
                const nombreAutor = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC";
                const telefono = emp.telefono || usuario?.telefono || "";

                return (
                  <div key={emp.id || emp._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardEmoji}>{emoji}</div>
                      <div className={styles.cardBadges}>
                        <span className={styles.cardCat}>{nombreCategoria}</span>
                        <span className={`${styles.cardEstado} ${styles.cardEstadoActivo}`}>{emp.estado}</span>
                      </div>
                    </div>
                    <h3 className={styles.cardName}>{emp.nombre}</h3>
                    <p className={styles.cardDesc}>{emp.descripcion}</p>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardMetaItem}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="4" width="16" height="13" rx="2" />
                          <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                        </svg>
                        {emp.productos?.length || 0} productos
                      </span>
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardAuthor}>
                        <span className={styles.cardAvatar}>{nombreAutor.charAt(0)}</span>
                        <div>
                          <p className={styles.cardAuthorName}>{nombreAutor}</p>
                          <p className={styles.cardAuthorSem}>{usuario?.carrera || "Estudiante"}</p>
                        </div>
                      </div>
                      <span className={styles.cardPrice}>{precioFormateado}</span>
                    </div>
                    <div className={styles.cardButtons}>
                      <Link href={`/emprendimientos/${emp.id || emp._id}`} className={styles.cardBtn}>
                        Ver emprendimiento →
                      </Link>
                      {telefono && (
                        <a
                          href={`https://wa.me/${formatearNumeroWhatsApp(telefono)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(emp.nombre)}%22%20en%20EmprendedoresUCC%20y%20me%20interesa%20saber%20m%C3%A1s.`}
                          target="_blank" rel="noopener noreferrer"
                          className={styles.whatsappBtn}
                        >
                          <svg className={styles.whatsappIcon} viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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
            <div className={styles.empty}>
              <span className={styles.emptyEmoji}>🔍</span>
              <h3 className={styles.emptyTitle}>Sin resultados</h3>
              <p className={styles.emptyDesc}>Intenta con otros filtros o términos de búsqueda.</p>
              <button className={styles.emptyBtn}
                onClick={() => { setBusqueda(""); setCategoriaSeleccionada("Todas"); setPrecioIdx(0); }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}