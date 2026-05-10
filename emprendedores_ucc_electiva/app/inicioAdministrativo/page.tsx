"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../css/inicioAdministrativo/inicioadministrativo.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/config/api";

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

const quickLinks = [
  { href: "/inicioAdministrativo/pedidos", label: "Mis Pedidos"},
  { href: "/inicioAdministrativo/seguidos", label: "Seguidos" },
  { href: "/inicioAdministrativo/miperfil", label: "Mi Perfil" },
  { href: "/inicioAdministrativo/configuracion", label: "Configuración" },
];

const fmt = (precio: number) => `$${precio.toLocaleString()}`;

export default function InicioAdministrativoPage() {
  const router = useRouter();
  const carritoIconRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState("resumen");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
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

    // Modal WhatsApp
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [productosAgrupados, setProductosAgrupados] = useState<Record<string, any>>({});

  const handleCerrarSesion = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      sessionStorage.clear();
      router.push("/");
    }
  };

// 🔥 FUNCIÓN PARA AVISAR CAMBIOS DEL CARRITO
const emitirCambioCarrito = (items: ItemCarrito[], uid: string) => {
  window.dispatchEvent(
    new CustomEvent("carritoActualizado", {
      detail: { items }
    })
  );

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: `carrito_${uid}`,
      newValue: JSON.stringify(items)
    })
  );
};

// 🔥 FUNCIÓN PARA CARGAR EL CARRITO
const cargarCarrito = (): ItemCarrito[] => {
  const uid = sessionStorage.getItem("usuarioId");

  if (!uid) {
    setItemsCarrito([]);
    return [];
  }

  try {
    const data = localStorage.getItem(`carrito_${uid}`);
    const items = data ? JSON.parse(data) : [];

    if (Array.isArray(items)) {
      setItemsCarrito(items);
      console.log("🛒 Carrito cargado:", items.length, "productos");
      return items;
    }

    setItemsCarrito([]);
    return [];
  } catch (error) {
    console.error("Error cargando carrito:", error);
    setItemsCarrito([]);
    return [];
  }
};

// 🔥 FUNCIÓN PARA GUARDAR EL CARRITO
const guardarCarrito = (items: ItemCarrito[]) => {
  const uid = sessionStorage.getItem("usuarioId");

  if (!uid) {
    setItemsCarrito([]);
    return;
  }

  const itemsValidos = items.filter(item => item.emprendimientoId);

  localStorage.setItem(`carrito_${uid}`, JSON.stringify(itemsValidos));
  setItemsCarrito(itemsValidos);
  emitirCambioCarrito(itemsValidos, uid);
};

  const totalItems = itemsCarrito.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = itemsCarrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const abrirCarrito = () => {
    cargarCarrito();
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
  const c = cargarCarrito();

  if (!c[idx]) return;

  const nuevo = c[idx].cantidad + delta;

  if (nuevo < 1 || nuevo > c[idx].stock) return;

  c[idx].cantidad = nuevo;
  guardarCarrito(c);
};

const eliminarItem = (idx: number) => {
  const c = cargarCarrito().filter((_, i) => i !== idx);
  guardarCarrito(c);
};

const vaciarCarrito = () => {
  guardarCarrito([]);
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
    const agrupado: Record<string, any> = {};
    
    for (const item of itemsCarrito) {
      if (!agrupado[item.emprendimientoId]) {
        let telefono = "";
        
        try {
          // 🔥 Obtener el emprendimiento completo
          const resEmp = await fetch(`${API_URL}/api/emprendimientos/${item.emprendimientoId}`);
          if (resEmp.ok) {
            const emprendimiento = await resEmp.json();
            
            // 🔥 PRIORIDAD 1: Teléfono del emprendimiento
            if (emprendimiento.telefono && emprendimiento.telefono !== "") {
              telefono = emprendimiento.telefono;
            } 
            // 🔥 PRIORIDAD 2: Teléfono del usuario emprendedor
            else if (emprendimiento.usuarioId) {
              const resUser = await fetch(`${API_URL}/api/usuarios/${emprendimiento.usuarioId}`);
              if (resUser.ok) {
                const usuario = await resUser.json();
                telefono = usuario.telefono || "";
              }
            }
          }
        } catch (error) {
          console.error("Error al obtener teléfono:", error);
        }
        
        agrupado[item.emprendimientoId] = {
          id: item.emprendimientoId,
          nombre: item.emprendimientoNombre,
          productos: [],
          total: 0,
          telefono: telefono,
        };
      }
      
      const subtotal = item.precio * item.cantidad;
      agrupado[item.emprendimientoId].productos.push({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: subtotal,
      });
      agrupado[item.emprendimientoId].total += subtotal;
    }
    
    setProductosAgrupados(agrupado);
    setMostrarModalWhatsApp(true);
    
    return true;
    
  } catch (error) {
    console.error('Error al preparar pedido:', error);
    alert('Error al preparar el pedido');
    return false;
  } finally {
    setCreandoPedido(false);
  }
};


const enviarWhatsApp = (emprendimientoId: string, nombreEmp: string, productos: any[], total: number, telefono: string) => {
  console.log("📞 Teléfono recibido:", telefono, "para:", nombreEmp);
  
  if (!telefono || telefono === "") {
    alert(`No hay número de teléfono disponible para ${nombreEmp}. El emprendedor debe actualizar su perfil.`);
    return;
  }
  
  const nombreCliente = sessionStorage.getItem("nombreUsuario") || "Cliente";
  const telefonoCliente = sessionStorage.getItem("telefono") || "No especificado";
  
  const listaProductos = productos.map(p => 
    `• ${p.nombre} x${p.cantidad} → $${p.precio.toLocaleString()} c/u = $${p.subtotal.toLocaleString()}`
  ).join('\n');
  
  const mensaje = `NUEVO PEDIDO - EmprendedoresUCC

Cliente: ${nombreCliente}
Telefono: ${telefonoCliente}

PRODUCTOS:
${listaProductos}

─────────────────
TOTAL A PAGAR: $${total.toLocaleString()}

El cliente esta interesado en coordinar pago y entrega.

Contacta al cliente directamente para acordar los detalles.

Gracias por apoyar los emprendimientos UCC`;
  
  let numeroLimpio = telefono.replace(/\D/g, '');
  if (!numeroLimpio.startsWith('57')) {
    numeroLimpio = '57' + numeroLimpio;
  }
  
  const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
};


// 🔥 FINALIZAR PEDIDO PARA UN EMPRENDIMIENTO ESPECÍFICO
const finalizarPedidoPorEmpresa = async (emp: any) => {
  const uid = sessionStorage.getItem("usuarioId");
  
  // Obtener datos del comprador
  const usuarioStr = sessionStorage.getItem("usuario");
  let compradorData = null;
  try {
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      compradorData = {
        id: usuario.id || usuario._id || uid,
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        tipoUsuario: sessionStorage.getItem("tipoUsuario") || "administrativo",
        telefono: usuario.telefono || "",
        correo: usuario.correo || ""
      };
    }
  } catch (error) {
    console.error("Error al obtener datos del comprador:", error);
  }
  
  // Obtener datos del vendedor
  let vendedorData = {
    id: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correo: ""
  };
  
  try {
    const resEmp = await fetch(`${API_URL}/api/emprendimientos/${emp.id}`);
    if (resEmp.ok) {
      const emprendimiento = await resEmp.json();
      if (emprendimiento.usuarioId) {
        const resUser = await fetch(`${API_URL}/api/usuarios/${emprendimiento.usuarioId}`);
        if (resUser.ok) {
          const usuario = await resUser.json();
          vendedorData = {
            id: usuario.id || usuario._id,
            nombre: usuario.nombre || "",
            apellido: usuario.apellido || "",
            telefono: usuario.telefono || emp.telefono || "",
            correo: usuario.correo || ""
          };
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener vendedor:", error);
    vendedorData.telefono = emp.telefono || "";
  }
  
  // Crear objeto de transacción
  const transaccionData = {
    comprador: compradorData,
    vendedor: vendedorData,
    emprendimiento: {
      id: emp.id,
      nombre: emp.nombre
    },
    productos: emp.productos.map((prod: any) => ({
      nombre: prod.nombre,
      cantidad: prod.cantidad,
      precio: prod.precio,
      subtotal: prod.subtotal
    })),
    total: emp.total,
    metodoPago: "pendiente",
    estado: "pendiente",
    telefonoEmprendimiento: emp.telefono

  };
  
  try {
    const response = await fetch(`${API_URL}/api/transacciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaccionData)
    });
    
    if (response.ok) {
      console.log(`✅ Transacción guardada para ${emp.nombre}`);
      
      // 🔥 ELIMINAR SOLO LOS PRODUCTOS DE ESTE EMPRENDIMIENTO DEL CARRITO
      const nuevosItems = itemsCarrito.filter(item => item.emprendimientoId !== emp.id);
      guardarCarrito(nuevosItems);
      
      // Actualizar productosAgrupados (remover este emprendimiento)
      const nuevosAgrupados = { ...productosAgrupados };
      delete nuevosAgrupados[emp.id];
      setProductosAgrupados(nuevosAgrupados);
      
      // Si no quedan más emprendimientos, cerrar modal
      if (Object.keys(nuevosAgrupados).length === 0) {
        setMostrarModalWhatsApp(false);
        setCarritoAbierto(false);
        setVistaFactura(false);
      }
      
      alert(`✅ Pedido de "${emp.nombre}" realizado exitosamente!`);
    } else {
      const error = await response.text();
      alert(`Error al guardar el pedido de "${emp.nombre}": ${error}`);
    }
  } catch (error) {
    console.error(`Error al guardar transacción para ${emp.nombre}:`, error);
    alert(`Error al procesar el pedido de "${emp.nombre}"`);
  }
};

// 🔥 FINALIZAR TODOS LOS PEDIDOS
const finalizarTodosLosPedidos = async () => {
  const uid = sessionStorage.getItem("usuarioId");
  
  // Guardar cada emprendimiento
  for (const emp of Object.values(productosAgrupados)) {
    await finalizarPedidoPorEmpresa(emp);
  }
  
  // Disparar eventos
  emitirCambioCarrito([], uid || "");
  
  setMostrarModalWhatsApp(false);
  setCarritoAbierto(false);
  setVistaFactura(false);
  
  alert('🎉 ¡Todos los pedidos realizados exitosamente!');
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
            font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
            background: white;
            padding: 30px;
          }
          
          .factura {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 3px solid #009FE3;
          }
          
          .header h1 {
            color: #009FE3;
            font-size: 28px;
            margin: 5px 0;
            font-weight: 800;
          }
          
          .header p {
            color: #666;
            margin: 5px 0;
          }
          
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
          }
          
          .info div p {
            margin: 6px 0;
          }
          
          .info strong {
            color: #1a2e44;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          
          th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
          }
          
          th {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #1a2e44;
            text-align: left;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totales {
            width: 320px;
            margin-left: auto;
            margin-bottom: 25px;
          }
          
          .totales table {
            width: 100%;
            border: none;
          }
          
          .totales td {
            border: none;
            padding: 8px;
          }
          
          .totales tr:first-child td {
            padding-top: 0;
          }
          
          .total-final {
            border-top: 2px solid #1a2e44 !important;
            font-weight: 800 !important;
            font-size: 1.1em;
            padding-top: 10px !important;
            margin-top: 5px;
          }
          
          .total-final td {
            padding-top: 10px !important;
          }
          
          .aviso {
            background: #fff3e0;
            padding: 12px 15px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            font-size: 12px;
            color: #92400e;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .factura {
              margin: 0;
              padding: 20px;
            }
            .info {
              background: none;
              border: 1px solid #e2e8f0;
            }
            .aviso {
              background: #fff3e0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
              <p><strong>Cliente:</strong> ${sessionStorage.getItem("nombreUsuario") || nombreUsuario || "Usuario"}</p>
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
                  <td>${item.emprendimientoNombre || "Emprendimiento UCC"}</td>
                  <td class="text-center">${item.cantidad}</td>
                  <td class="text-right">${fmt(item.precio)}</td>
                  <td class="text-right">${fmt(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totales">
            <table>
              <tr><td>Subtotal</td><td class="text-right">${fmt(subtotal)}</td></tr>
              <tr><td>Descuento</td><td class="text-right">$0</td></tr>
              <tr class="total-final"><td><strong>TOTAL A PAGAR</strong></td><td class="text-right"><strong>${fmt(subtotal)}</strong></td></tr>
            </table>
          </div>
          
          <div class="aviso">
            ⚠️ Esta factura es un comprobante de intención de compra. 
            Coordina el pago directamente con cada emprendedor.
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
            }, 300);
            
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

  // 🔥 CARGAR USUARIO ID AL INICIO
  useEffect(() => {
    const uid = sessionStorage.getItem("usuarioId");
    setUsuarioId(uid);
    cargarCarrito();
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

  const obtenerProximosEventos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/eventos`);
      if (res.ok) {
        const eventos: Evento[] = await res.json();
        const fechaHoy = getFechaHoy();
        const futuros = eventos.filter(evento => evento.fecha >= fechaHoy).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3);
        setProximosEventos(futuros);
      }
    } catch (e) {
      console.error("Error al cargar eventos:", e);
      setProximosEventos([]);
    }
  };

  const obtenerActividad = async (usuarioId: string) => {
    try {
      const actividadesTemp: Actividad[] = [];
      
      const resSeguimientos = await fetch(`${API_URL}/api/seguimientos/usuario/${usuarioId}`);
      if (resSeguimientos.ok) {
        const seguimientos: SeguimientoConFecha[] = await resSeguimientos.json();
        const seguimientosRecientes = seguimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 2);
        
        for (const seg of seguimientosRecientes) {
          const resEmp = await fetch(`${API_URL}/api/emprendimientos/${seg.emprendimientoId}`);
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
      
      const carritoGuardado = localStorage.getItem(`carrito_${usuarioId}`);
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
      
      const categoriasGuardadas = localStorage.getItem("categoriasInteres_admin");
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        if (categorias.length > 0) {
          const categoriaNombres = { 1: "Gastronomía", 2: "Moda y Diseño", 3: "Salud y Bienestar", 4: "Arte y Cultura", 5: "Servicios", 6: "Comida", 7: "Tecnología" };
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

  // CARGA INICIAL DE DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      console.log("🚀 INICIANDO CARGA DE DATOS");
      
      const usuarioIdStorage = sessionStorage.getItem("usuarioId");
      const nombreEnSesion = sessionStorage.getItem("nombreUsuario");
      const usuarioGuardado = sessionStorage.getItem("usuario");

      let nombreParaMostrar = nombreEnSesion || "Usuario";
      let nombreDesdeObj = "";

      if (usuarioGuardado) {
        try {
          const u = JSON.parse(usuarioGuardado);
          nombreDesdeObj = `${u.nombre || ""} ${u.apellido || ""}`.trim();
          if (nombreDesdeObj) nombreParaMostrar = nombreDesdeObj;
        } catch {}
      }

      const esTipoUsuario = ["emprendedor", "estudiante", "administrativo", "admin"].includes(nombreParaMostrar.toLowerCase());
      setNombreUsuario(nombreParaMostrar);

      // Obtener nombre del backend
      if (usuarioIdStorage && (!nombreDesdeObj || esTipoUsuario || nombreParaMostrar === "Usuario")) {
        try {
          const resUser = await fetch(`${API_URL}/api/usuarios/${usuarioIdStorage}`);
          if (resUser.ok) {
            const userData = await resUser.json();
            const nombreReal = `${userData.nombre || ""} ${userData.apellido || ""}`.trim();
            if (nombreReal && nombreReal.toLowerCase() !== "usuario") {
              setNombreUsuario(nombreReal);
              sessionStorage.setItem("nombreUsuario", nombreReal);
              if (usuarioGuardado) {
                const u = JSON.parse(usuarioGuardado);
                sessionStorage.setItem("usuario", JSON.stringify({ ...u, nombre: userData.nombre, apellido: userData.apellido }));
              }
            }
          }
        } catch (e) {
          console.error("Error cargando usuario:", e);
        }
      }
      obtenerProximosEventos();
      
      if (usuarioIdStorage) {
        try {
          const res = await fetch(`${API_URL}/api/seguimientos/usuario/${usuarioIdStorage}/emprendimientos`);
          if (res.ok) {
            const emprendimientos = await res.json();
            console.log("📦 Seguidos obtenidos:", emprendimientos.length);
            setTotalSeguidos(emprendimientos.length);
            
            if (emprendimientos.length > 0) {
              const ultimo = emprendimientos[emprendimientos.length - 1];
              try {
                const resCat = await fetch(`${API_URL}/api/categorias/${ultimo.categoriaId}`);
                if (resCat.ok) {
                  const categoria = await resCat.json();
                  ultimo.categoriaNombre = categoria.nombre;
                }
              } catch (e) {
                ultimo.categoriaNombre = "Sin categoría";
              }
              setUltimoEmprendimiento(ultimo);
            }
            
            await obtenerActividad(usuarioIdStorage);
          }
        } catch (error) {
          console.error("Error cargando seguidos:", error);
        }
      } else {
        setLoadingActividades(false);
      }
      
      setLoadingUltimo(false);
    };
    
    cargarDatos();
  }, []);

  // ESCUCHAR CAMBIOS EN localStorage (carrito)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("carrito_")) {
        cargarCarrito();
      }
      obtenerProximosEventos();
      const usuarioIdStorage = sessionStorage.getItem("usuarioId");
      if (usuarioIdStorage) {
        const actualizarSeguidos = async () => {
          const res = await fetch(`${API_URL}/api/seguimientos/usuario/${usuarioIdStorage}/emprendimientos`);
          if (res.ok) {
            const emprendimientos = await res.json();
            setTotalSeguidos(emprendimientos.length);
          }
          await obtenerActividad(usuarioIdStorage);
        };
        actualizarSeguidos();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // RECARGAR CUANDO LA PÁGINA RECIBE FOCO
  useEffect(() => {
    const handleFocus = async () => {
      const usuarioIdStorage = sessionStorage.getItem("usuarioId");
      if (usuarioIdStorage) {
        console.log("📌 Página enfocada, recargando...");
        cargarCarrito();
        const res = await fetch(`${API_URL}/api/seguimientos/usuario/${usuarioIdStorage}/emprendimientos`);
        if (res.ok) {
          const emprendimientos = await res.json();
          setTotalSeguidos(emprendimientos.length);
        }
        await obtenerActividad(usuarioIdStorage);
        obtenerProximosEventos();
      }
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

    // 🔥 ESCUCHAR FOCUS PARA ACTUALIZAR CARRITO
  useEffect(() => {
    const handleFocus = () => {
      const uid = sessionStorage.getItem("usuarioId");
      if (uid) {
        const carrito = localStorage.getItem(`carrito_${uid}`);
        if (carrito) {
          setItemsCarrito(JSON.parse(carrito));
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);


    // 🔥 ESCUCHAR EVENTO PERSONALIZADO PARA SINCRONIZAR CARRITO EN LA MISMA PESTAÑA
  useEffect(() => {
    const handleCarritoActualizado = (event: CustomEvent) => {
      console.log("📢 Evento carritoActualizado recibido en administrativo:", event.detail);
      if (event.detail?.items) {
        setItemsCarrito(event.detail.items);
      } else {
        const uid = sessionStorage.getItem("usuarioId");
        if (uid) {
          const carrito = localStorage.getItem(`carrito_${uid}`);
          if (carrito) {
            setItemsCarrito(JSON.parse(carrito));
          }
        }
      }
    };
    
    window.addEventListener('carritoActualizado', handleCarritoActualizado as EventListener);
    return () => window.removeEventListener('carritoActualizado', handleCarritoActualizado as EventListener);
  }, []);




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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span className={styles.drawerTitle}>Mi carrito</span>
                    {totalItems > 0 && <span className={styles.drawerBadge}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>}
                  </>
                )}
              </div>
              <button className={styles.drawerClose} onClick={cerrarDrawer}>✕</button>
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
                      <span>Producto</span><span>Emprendimiento</span><span className={styles.textCenter}>Cant.</span><span className={styles.textRight}>Precio u.</span><span className={styles.textRight}>Total</span>
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
                    <div className={styles.facturaTotalFila}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div className={styles.facturaTotalFila}><span>Descuento</span><span>$0</span></div>
                    <div className={`${styles.facturaTotalFila} ${styles.facturaTotalFilaFinal}`}><span>TOTAL A PAGAR</span><span className={styles.facturaTotalMonto}>{fmt(subtotal)}</span></div>
                  </div>

                  <div className={styles.facturaAviso}>⚠️ Esta factura es un comprobante de intención de compra. Coordina el pago directamente con cada emprendedor.</div>
                  <div className={styles.facturaPie}><span>Gracias por apoyar los emprendimientos estudiantiles</span><span>EmprendedoresUCC · Universidad Cooperativa de Colombia · Villavicencio</span></div>
                  <div className={styles.facturaAcciones}>
                    <button className={styles.facturaVaciarBtn} onClick={cerrarFactura}>← Volver</button>
                    <button className={styles.facturaPrintBtn} onClick={imprimirFactura}> Imprimir factura</button>
                    <button className={styles.facturaConfirmarBtn} onClick={confirmarPedido} disabled={creandoPedido || pedidoCreado}>
                      {creandoPedido ? "Procesando..." : pedidoCreado ? "✓ Pedido creado" : " Confirmar pedido"}
                    </button>
                  </div>
                  {pedidoCreado && <div className={styles.facturaExito}><span>🎉 ¡Pedido confirmado! Puedes imprimir esta factura como comprobante.</span></div>}
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
                            {item.imagen && item.imagen.startsWith('http') ? <img src={item.imagen} alt={item.nombre} /> : <span>🛍️</span>}
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
                            <button className={styles.drawerItemEliminar} onClick={() => eliminarItem(idx)}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {itemsCarrito.length > 0 && (
                  <div className={styles.drawerFooter}>
                    <div className={styles.drawerResumen}>
                      <div className={styles.drawerResumenFila}><span>Productos ({totalItems})</span><span>{fmt(subtotal)}</span></div>
                      <div className={`${styles.drawerResumenFila} ${styles.drawerResumenTotal}`}><span>Total</span><span>{fmt(subtotal)}</span></div>
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
            <span className={styles.heroBadge}>Panel Administrativo</span>
            <h1 className={styles.heroTitle}>Hola, <span className={styles.heroName}>{nombreUsuario}</span></h1>
            <p className={styles.heroSub}>Descubre emprendimientos, sigue los que te inspiran y gestiona tu perfil.</p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.btnSecondary}>← Inicio</Link>
              <Link href="/emprendimientos" className={styles.btnPrimary}>Explorar emprendimientos →</Link>
              <button onClick={handleCerrarSesion} className={styles.btnLogout}>Cerrar sesión</button>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </section>

        <section className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalSeguidos}</span>
            <span className={styles.statLabel}>EMPRENDIMIENTOS SEGUIDOS</span>
          </div>
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
              <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "resumen" && (
            <div className={styles.tabContent}>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>ÚLTIMO EMPRENDIMIENTO SEGUIDO</p>
                  {loadingUltimo ? (
                    <div className={styles.loadingText}>Cargando...</div>
                  ) : ultimoEmprendimiento ? (
                    <>
                      <p className={styles.empName}>{ultimoEmprendimiento.nombre}</p>
                      <p className={styles.empDesc}>{ultimoEmprendimiento.descripcion?.substring(0, 100) || "Sin descripción"}{ultimoEmprendimiento.descripcion?.length > 100 ? "..." : ""}</p>
                      {ultimoEmprendimiento.categoriaNombre && <p className={styles.empCat}><span className={styles.catBadge}>{ultimoEmprendimiento.categoriaNombre}</span></p>}
                      <Link href={`/emprendimientos/${ultimoEmprendimiento.id || ultimoEmprendimiento._id}`} className={styles.btnLink}>Ver más →</Link>
                    </>
                  ) : (
                    <>
                      <p className={styles.empName}>No sigues ningún emprendimiento</p>
                      <p className={styles.empDesc}>Explora emprendimientos y dale click en "Seguir" para verlos aquí.</p>
                      <Link href="/emprendimientos" className={styles.btnLink}>Explorar emprendimientos →</Link>
                    </>
                  )}
                </div>

                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>PRÓXIMOS EVENTOS O FERIAS UCC</p>
                  {proximosEventos.length === 0 ? (
                    <>
                      <p className={styles.empName}>No hay eventos próximos</p>
                      <p className={styles.empDesc}>Pronto se anunciarán nuevas fechas. ¡Mantente atento!</p>
                      <Link href="/eventos" className={styles.btnLink}>Ver todos los eventos →</Link>
                    </>
                  ) : (
                    <div className={styles.eventosLista}>
                      {proximosEventos.map((evento, idx) => (
                        <div key={evento.id} className={styles.eventoItem}>
                          <div className={styles.eventoFecha}>
                            <span className={styles.eventoFechaDia}>{evento.fecha.split("-")[2]}</span>
                            <span className={styles.eventoFechaMes}>{new Date(evento.fecha).toLocaleDateString("es-CO", { month: "short" }).toUpperCase()}</span>
                          </div>
                          <div className={styles.eventoInfo}>
                            <p className={styles.eventoNombre}>{evento.nombre}</p>
                            <p className={styles.eventoDetalle}>
                              <span className={styles.eventoHora}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {evento.hora}
                              </span>
                              <span className={styles.eventoLugar}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                {evento.lugar}
                              </span>
                            </p>
                          </div>
                          {idx < proximosEventos.length - 1 && <div className={styles.eventoDivider} />}
                        </div>
                      ))}
                      <Link href="/eventos" className={styles.btnLink} style={{ marginTop: "12px" }}>Ver todos los eventos →</Link>
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
                  <p className={styles.placeholderDesc}>Comienza a seguir emprendimientos o agrega productos al carrito para ver tu actividad.</p>
                  <Link href="/emprendimientos" className={styles.btnLink} style={{ marginTop: "12px" }}>Explorar emprendimientos →</Link>
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

      {/* MODAL WHATSAPP - PRODUCTOS AGRUPADOS POR EMPRENDIMIENTO */}
      {mostrarModalWhatsApp && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModalWhatsApp(false)}>
          <div className={styles.modalWhatsApp} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>📦 Confirma tu pedido</h3>
              <button className={styles.modalClose} onClick={() => setMostrarModalWhatsApp(false)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalDesc}>
                Tu pedido incluye productos de diferentes emprendedores. 
                Contacta a cada uno por WhatsApp para coordinar pago y entrega, 
                o finaliza el pedido directamente.
              </p>
              
              {Object.values(productosAgrupados).map((emp: any) => (
                <div key={emp.id} className={styles.empresaCard}>
                  <div className={styles.empresaHeader}>
                    <span className={styles.empresaIcon}>🏪</span>
                    <div>
                      <h4 className={styles.empresaNombre}>{emp.nombre}</h4>
                      <p className={styles.empresaTotal}>Total: ${emp.total.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className={styles.productosLista}>
                    {emp.productos.map((prod: any, idx: number) => (
                      <div key={idx} className={styles.productoItem}>
                        <span>• {prod.nombre}</span>
                        <span>x{prod.cantidad}</span>
                        <span>${prod.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.empresaButtons}>
                    <button 
                      className={styles.whatsappEmpresaBtn}
                      onClick={() => enviarWhatsApp(emp.id, emp.nombre, emp.productos, emp.total, emp.telefono)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Contactar por WhatsApp
                    </button>
                    
                    <button 
                      className={styles.finalizarEmpresaBtn}
                      onClick={() => finalizarPedidoPorEmpresa(emp)}
                    >
                       Finalizar pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setMostrarModalWhatsApp(false)}>
                Seguir comprando
              </button>
              {Object.keys(productosAgrupados).length > 1 && (
                <button className={styles.btnFinalizarTodos} onClick={finalizarTodosLosPedidos}>
                   Finalizar todos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}