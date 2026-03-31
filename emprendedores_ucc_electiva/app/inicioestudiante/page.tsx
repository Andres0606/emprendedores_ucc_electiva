"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../css/inicioestudiante/inicioestudiante.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre?: string;
  usuarioId: string;
  estado: string;
  telefono?: string;
  imagenes?: string[];
  productos?: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
}

interface SeguimientoConFecha {
  id: string;
  emprendimientoId: string;
  fecha: string;
}

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: string;
  descripcion: string;
  tipo: string;
  imagen: string;
}

interface Actividad {
  id: string;
  tipo: "seguimiento" | "carrito" | "categoria";
  titulo: string;
  descripcion: string;
  fecha: string;
  icono: string;
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

// Quick Links SIN EMOJIS
const quickLinks = [
  { href: "/inicioestudiante/miperfil", label: "Mi Perfil", bg: "#e8f0fe", color: "#1565c0" },
  { href: "/inicioestudiante/seguidos", label: "Seguidos", bg: "#e8f5e9", color: "#2e7d32" },
  { href: "/inicioestudiante/configuracion", label: "Configuración", bg: "#fce4ec", color: "#c62828" },
];

const fmt = (precio: number) => `$${precio.toLocaleString()}`;

export default function InicioEstudiantePage() {
  const router = useRouter();
  const carritoIconRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState("resumen");
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [ultimoEmprendimiento, setUltimoEmprendimiento] = useState<Emprendimiento | null>(null);
  const [loadingUltimo, setLoadingUltimo] = useState(true);
  const [totalSeguidos, setTotalSeguidos] = useState(0);
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(true);

  // Carrito
  const [itemsCarrito, setItemsCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoAnimando, setCarritoAnimando] = useState(false);
  const [vistaFactura, setVistaFactura] = useState(false);
  const [numFactura, setNumFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");
  const [creandoPedido, setCreandoPedido] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(false);

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      sessionStorage.clear();
      localStorage.removeItem("categoriasInteres");
      localStorage.removeItem("carrito");
      router.push("/");
    }
  };

  // Funciones del carrito
  const leerCarrito = () => {
    const data = JSON.parse(localStorage.getItem('carrito') || '[]');
    setItemsCarrito(data);
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

  const cerrarDrawer = () => {
    setCarritoAbierto(false);
    setVistaFactura(false);
  };

  const cambiarCantidad = (idx: number, delta: number) => {
    const c = [...itemsCarrito];
    const nuevo = c[idx].cantidad + delta;
    if (nuevo < 1 || nuevo > c[idx].stock) return;
    c[idx].cantidad = nuevo;
    localStorage.setItem('carrito', JSON.stringify(c));
    setItemsCarrito(c);
  };

  const eliminarItem = (idx: number) => {
    const c = itemsCarrito.filter((_, i) => i !== idx);
    localStorage.setItem('carrito', JSON.stringify(c));
    setItemsCarrito(c);
  };

  const vaciarCarrito = () => {
    localStorage.setItem('carrito', '[]');
    setItemsCarrito([]);
    setVistaFactura(false);
  };

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
      setTimeout(() => {
        localStorage.setItem('carrito', '[]');
        setItemsCarrito([]);
        setPedidoCreado(true);
        alert('¡Pedido creado exitosamente!');
        setCreandoPedido(false);
      }, 1000);
      return true;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido');
      setCreandoPedido(false);
      return false;
    }
  };

  const cerrarFactura = () => {
    if (pedidoCreado) {
      setCarritoAbierto(false);
      setVistaFactura(false);
      setPedidoCreado(false);
    } else {
      setVistaFactura(false);
    }
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
              <p><strong>Cliente:</strong> ${nombreUsuario}</p>
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

  const getFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  const formatearFechaRelativa = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return "hoy";
    if (diffDias === 1) return "ayer";
    if (diffDias <= 7) return `hace ${diffDias} días`;
    return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  const obtenerProximosEventos = () => {
    const guardados = localStorage.getItem("eventos_ucc");
    if (guardados) {
      try {
        const eventos: Evento[] = JSON.parse(guardados);
        const fechaHoy = getFechaHoy();
        
        const futuros = eventos
          .filter(evento => evento.fecha >= fechaHoy)
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .slice(0, 3);
        
        setProximosEventos(futuros);
      } catch (e) {
        console.error("Error al cargar eventos:", e);
        setProximosEventos([]);
      }
    } else {
      setProximosEventos([]);
    }
  };

  const obtenerActividad = async (usuarioId: string) => {
    try {
      const actividadesTemp: Actividad[] = [];
      
      const resSeguimientos = await fetch(`http://localhost:8080/api/seguimientos/usuario/${usuarioId}`);
      if (resSeguimientos.ok) {
        const seguimientos: SeguimientoConFecha[] = await resSeguimientos.json();
        const seguimientosRecientes = seguimientos
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 2);
        
        for (const seg of seguimientosRecientes) {
          const resEmp = await fetch(`http://localhost:8080/api/emprendimientos/${seg.emprendimientoId}`);
          if (resEmp.ok) {
            const emp = await resEmp.json();
            actividadesTemp.push({
              id: `seg-${seg.id}`,
              tipo: "seguimiento",
              titulo: "Emprendimiento seguido",
              descripcion: `Comenzaste a seguir "${emp.nombre}"`,
              fecha: seg.fecha,
              icono: "🔔"
            });
          }
        }
      }
      
      const carritoGuardado = localStorage.getItem("carrito");
      if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        if (carrito.length > 0) {
          const ultimoProducto = carrito[carrito.length - 1];
          actividadesTemp.push({
            id: `carrito-${Date.now()}`,
            tipo: "carrito",
            titulo: "Producto agregado al carrito",
            descripcion: `Agregaste "${ultimoProducto.nombre}" a tu carrito`,
            fecha: new Date().toISOString(),
            icono: "🛒"
          });
        }
      }
      
      const categoriasGuardadas = localStorage.getItem("categoriasInteres");
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        if (categorias.length > 0) {
          const categoriaNombres = {
            1: "Gastronomía",
            2: "Moda y Diseño",
            3: "Salud y Bienestar",
            4: "Arte y Cultura",
            5: "Servicios",
            6: "Comida",
            7: "Tecnología"
          };
          const ultimaCategoria = categorias[categorias.length - 1];
          const nombreCategoria = categoriaNombres[ultimaCategoria as keyof typeof categoriaNombres] || "Categoría";
          
          actividadesTemp.push({
            id: `categoria-${Date.now()}`,
            tipo: "categoria",
            titulo: "Categoría de interés agregada",
            descripcion: `Seleccionaste "${nombreCategoria}" como categoría de interés`,
            fecha: new Date().toISOString(),
            icono: "🏷️"
          });
        }
      }
      
      actividadesTemp.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setActividades(actividadesTemp.slice(0, 5));
      
    } catch (error) {
      console.error("Error al obtener actividad:", error);
    } finally {
      setLoadingActividades(false);
    }
  };

  const obtenerUltimoSeguido = async (usuarioId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/seguimientos/usuario/${usuarioId}/emprendimientos`);
      
      if (!res.ok) {
        return null;
      }
      
      const emprendimientos: Emprendimiento[] = await res.json();
      
      if (emprendimientos.length === 0) {
        setTotalSeguidos(0);
        return null;
      }
      
      setTotalSeguidos(emprendimientos.length);
      
      const ultimoEmprendimiento = emprendimientos[emprendimientos.length - 1];
      
      try {
        const resCat = await fetch(`http://localhost:8080/api/categorias/${ultimoEmprendimiento.categoriaId}`);
        let categoriaNombre = "Sin categoría";
        if (resCat.ok) {
          const categoria = await resCat.json();
          categoriaNombre = categoria.nombre;
        }
        ultimoEmprendimiento.categoriaNombre = categoriaNombre;
      } catch (e) {
        ultimoEmprendimiento.categoriaNombre = "Sin categoría";
      }
      
      return ultimoEmprendimiento;
      
    } catch (error) {
      console.error("Error al obtener seguidos:", error);
      return null;
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const tipo = sessionStorage.getItem("tipoUsuario") || "estudiante";
      const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
      const usuarioId = sessionStorage.getItem("usuarioId");
      const usuarioGuardado = sessionStorage.getItem("usuario");
      
      let nombreCompleto = nombre;
      if (usuarioGuardado && (!nombre || nombre === "Usuario" || nombre.split(" ").length === 1)) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          if (usuario.nombre && usuario.apellido) {
            nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
            sessionStorage.setItem("nombreUsuario", nombreCompleto);
          } else if (usuario.nombre) {
            nombreCompleto = usuario.nombre;
          }
        } catch (e) {
          console.error("Error al parsear usuario:", e);
        }
      }
      
      setTipoUsuario(tipo.toLowerCase());
      setNombreUsuario(nombreCompleto);
      
      obtenerProximosEventos();
      
      if (usuarioId && tipo.toLowerCase() === "estudiante") {
        const ultimo = await obtenerUltimoSeguido(usuarioId);
        setUltimoEmprendimiento(ultimo);
        await obtenerActividad(usuarioId);
      } else {
        setLoadingActividades(false);
      }
      
      setLoadingUltimo(false);
    };
    
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      obtenerProximosEventos();
      leerCarrito();
      const usuarioId = sessionStorage.getItem("usuarioId");
      if (usuarioId) {
        obtenerActividad(usuarioId);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const esEstudiante = tipoUsuario === "estudiante";

  const stats = esEstudiante
    ? [
        { value: totalSeguidos.toString(), label: "EMPRENDIMIENTOS SEGUIDOS" },
      ]
    : [
        { value: "12", label: "EMPRENDIMIENTOS ACTIVOS" },
      ];

  return (
    <>
      {/* ÍCONO FLOTANTE DEL CARRITO */}
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

      {/* DRAWER DEL CARRITO */}
      {carritoAbierto && (
        <div className={`${styles.drawerOverlay} ${vistaFactura ? styles.drawerOverlayPrint : ''}`} onClick={cerrarDrawer}>
          <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>
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

            {vistaFactura ? (
              <div className={styles.drawerBody}>
                <div className={styles.facturaContainer}>
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

                  <div className={styles.facturaAviso}>
                    ⚠️ Esta factura es un comprobante de intención de compra. Coordina el pago directamente con cada emprendedor.
                  </div>

                  <div className={styles.facturaPie}>
                    <span>Gracias por apoyar los emprendimientos estudiantiles</span>
                    <span>EmprendedoresUCC · Universidad Cooperativa de Colombia · Villavicencio</span>
                  </div>

                  <div className={styles.facturaAcciones}>
                    <button className={styles.facturaVaciarBtn} onClick={cerrarFactura}>← Volver</button>
                    <button className={styles.facturaPrintBtn} onClick={imprimirFactura}>🖨️ Imprimir factura</button>
                    <button className={styles.facturaConfirmarBtn} onClick={confirmarPedido} disabled={creandoPedido || pedidoCreado}>
                      {creandoPedido ? "Procesando..." : pedidoCreado ? "✓ Pedido creado" : "✅ Confirmar pedido"}
                    </button>
                  </div>

                  {pedidoCreado && (
                    <div className={styles.facturaExito}>
                      <span>🎉 ¡Pedido confirmado! Puedes imprimir esta factura como comprobante.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
                      <button className={styles.drawerPagarBtn} onClick={mostrarFactura} disabled={creandoPedido}>
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
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>👋 Bienvenido de nuevo</span>
            <h1 className={styles.heroTitle}>
              Hola, <span className={styles.heroName}>{nombreUsuario}</span>
            </h1>
            <p className={styles.heroSub}>
              {esEstudiante
                ? "Descubre emprendimientos, sigue los que te inspiran y gestiona tu perfil."
                : "Apoya y gestiona los emprendimientos estudiantiles, conecta con la comunidad UCC."}
            </p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.btnSecondary}>
                ← Inicio
              </Link>
              <Link href="/emprendimientos" className={styles.btnPrimary}>
                Explorar emprendimientos →
              </Link>
              <button onClick={handleCerrarSesion} className={styles.btnLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </section>

        <section className={styles.statsBar}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </section>

        <div className={styles.body}>
          <nav className={styles.quickNav}>
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.quickCard}>
                <span className={styles.quickLabel}>{link.label}</span>
                <span className={styles.quickArrow}>→</span>
              </Link>
            ))}
          </nav>

          <div className={styles.tabs}>
            {["resumen", "actividad"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "resumen" && (
            <div className={styles.tabContent}>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>
                    {esEstudiante ? "ÚLTIMO EMPRENDIMIENTO SEGUIDO" : "PROGRAMA DESTACADO"}
                  </p>
                  {loadingUltimo ? (
                    <div className={styles.loadingText}>Cargando...</div>
                  ) : ultimoEmprendimiento ? (
                    <>
                      <p className={styles.empName}>{ultimoEmprendimiento.nombre}</p>
                      <p className={styles.empDesc}>
                        {ultimoEmprendimiento.descripcion?.substring(0, 100) || "Sin descripción"}
                        {ultimoEmprendimiento.descripcion?.length > 100 ? "..." : ""}
                      </p>
                      {ultimoEmprendimiento.categoriaNombre && (
                        <p className={styles.empCat}>
                          <span className={styles.catBadge}>{ultimoEmprendimiento.categoriaNombre}</span>
                        </p>
                      )}
                      <Link href={`/emprendimientos/${ultimoEmprendimiento.id || ultimoEmprendimiento._id}`} className={styles.btnLink}>
                        Ver más →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className={styles.empName}>No sigues ningún emprendimiento</p>
                      <p className={styles.empDesc}>
                        Explora emprendimientos y dale click en "Seguir" para verlos aquí.
                      </p>
                      <Link href="/emprendimientos" className={styles.btnLink}>
                        Explorar emprendimientos →
                      </Link>
                    </>
                  )}
                </div>

                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>PRÓXIMOS EVENTOS O FERIAS UCC</p>
                  
                  {proximosEventos.length === 0 ? (
                    <>
                      <p className={styles.empName}>No hay eventos próximos</p>
                      <p className={styles.empDesc}>
                        Pronto se anunciarán nuevas fechas. ¡Mantente atento!
                      </p>
                      <Link href="/eventos" className={styles.btnLink}>
                        Ver todos los eventos →
                      </Link>
                    </>
                  ) : (
                    <div className={styles.eventosLista}>
                      {proximosEventos.map((evento, idx) => (
                        <div key={evento.id} className={styles.eventoItem}>
                          <div className={styles.eventoFecha}>
                            <span className={styles.eventoFechaDia}>
                              {evento.fecha.split("-")[2]}
                            </span>
                            <span className={styles.eventoFechaMes}>
                              {new Date(evento.fecha).toLocaleDateString("es-CO", { month: "short" }).toUpperCase()}
                            </span>
                          </div>
                          <div className={styles.eventoInfo}>
                            <p className={styles.eventoNombre}>{evento.nombre}</p>
                            <p className={styles.eventoDetalle}>
                              <span className={styles.eventoHora}>🕐 {evento.hora}</span>
                              <span className={styles.eventoLugar}>📍 {evento.lugar}</span>
                            </p>
                          </div>
                          {idx < proximosEventos.length - 1 && <div className={styles.eventoDivider} />}
                        </div>
                      ))}
                      <Link href="/eventos" className={styles.btnLink} style={{ marginTop: "12px" }}>
                        Ver todos los eventos →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "actividad" && (
            <div className={styles.tabContent}>
              {loadingActividades ? (
                <div className={styles.loadingText}>Cargando actividad...</div>
              ) : actividades.length === 0 ? (
                <div className={styles.activityPlaceholder}>
                  <span className={styles.placeholderIcon}>✨</span>
                  <h3 className={styles.placeholderTitle}>Aún no hay actividad</h3>
                  <p className={styles.placeholderDesc}>
                    Comienza a seguir emprendimientos o agrega productos al carrito para ver tu actividad.
                  </p>
                  <Link href="/emprendimientos" className={styles.btnLink} style={{ marginTop: "12px" }}>
                    Explorar emprendimientos →
                  </Link>
                </div>
              ) : (
                <ul className={styles.activityList}>
                  {actividades.map((act) => (
                    <li key={act.id} className={styles.activityItem}>
                      <span className={styles.activityIcon}>{act.icono}</span>
                      <div>
                        <p className={styles.activityTitle}>{act.titulo}</p>
                        <p className={styles.activityDesc}>{act.descripcion}</p>
                        <p className={styles.activityFecha}>{formatearFechaRelativa(act.fecha)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}