"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/inicioemprendedor/inicioemprendedor.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/config/api";

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  createdAt?: string;
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
  telefono?: string;
  tipoUsuario: string;
  carrera?: string;
}

const quickLinks = [
  { href: "/inicioemprendedor/pedidos",          label: "Pedidos recibidos",  mod: "blue"  },  
  { href: "/inicioemprendedor/misemprendimientos", label: "Mis emprendimientos", mod: "blue"  },
  { href: "/inicioemprendedor/misproductos",       label: "Productos",          mod: "green" },
  { href: "/inicioemprendedor/configuracion",      label: "Configuración",      mod: "red"   },
];

export default function InicioEmprendedorPage() {
  const router = useRouter();

  const [nombreUsuario,   setNombreUsuario]   = useState("");
  const [usuario,         setUsuario]         = useState<Usuario | null>(null);
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [totalProductos,  setTotalProductos]  = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [ultimosProductos, setUltimosProductos] = useState<Producto[]>([]);
  const [ultimoEmprendimiento, setUltimoEmprendimiento] = useState<Emprendimiento | null>(null);

  // 🔥 Función para obtener timestamp de forma confiable
  const getTimestamp = (item: any): number => {
    if (item.createdAt) {
      const timestamp = new Date(item.createdAt).getTime();
      if (!isNaN(timestamp)) return timestamp;
    }
    
    const id = item.id || item._id;
    if (id && id.length > 8) {
      try {
        const hexTimestamp = id.substring(0, 8);
        const timestamp = parseInt(hexTimestamp, 16) * 1000;
        if (!isNaN(timestamp)) return timestamp;
      } catch {}
    }
    
    return 0;
  };

  // 🔥 Función para ordenar por fecha (más reciente primero)
  const ordenarPorFecha = <T extends { createdAt?: string; id?: string; _id?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const timestampA = getTimestamp(a);
      const timestampB = getTimestamp(b);
      return timestampB - timestampA;
    });
  };

  const cargarDatos = async () => {
    console.log("🔄 Cargando datos...");
    
    const guardado = sessionStorage.getItem("usuario");
    if (!guardado) { 
      setLoading(false);
      return; 
    }

    const u: Usuario = JSON.parse(guardado);
    setUsuario(u);
    setNombreUsuario(`${u.nombre} ${u.apellido}`);

    const uid = u.id || u._id;
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/emprendimientos`);
      if (res.ok) {
        const emps: Emprendimiento[] = await res.json();
        const misEmprendimientos = emps.filter(e => String(e.usuarioId) === String(uid));
        
        const ordenados = ordenarPorFecha(misEmprendimientos);
        
        setEmprendimientos(ordenados);
        
        const total = ordenados.reduce((sum, emp) => sum + (emp.productos?.length || 0), 0);
        setTotalProductos(total);
        
        const ultimo = ordenados.length > 0 ? ordenados[0] : null;
        setUltimoEmprendimiento(ultimo);
        
        const todosLosProductos: (Producto & { emprendimientoNombre: string; fechaCreacion: number })[] = [];
        
        for (const emp of ordenados) {
          if (emp.productos && emp.productos.length > 0) {
            for (const producto of emp.productos) {
              todosLosProductos.push({
                ...producto,
                emprendimientoNombre: emp.nombre,
                fechaCreacion: getTimestamp(producto)
              });
            }
          }
        }
        
        const productosOrdenados = todosLosProductos.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
        
        setUltimosProductos(productosOrdenados.slice(0, 2));
        
        for (const emp of ordenados) {
          if (emp.categoriaId) {
            try {
              const resCat = await fetch(`${API_URL}/api/categorias/${emp.categoriaId}`);
              if (resCat.ok) {
                const cat = await resCat.json();
                emp.categoriaNombre = cat.nombre;
              }
            } catch { emp.categoriaNombre = "Sin categoría"; }
          }
        }
      }
    } catch (e) { 
      console.error(e);
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "productosActualizados" || e.key === "emprendimientosActualizados") {
        console.log("📦 Datos actualizados, recargando...");
        cargarDatos();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      console.log("📌 Página enfocada, recargando...");
      cargarDatos();
    };
    
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleCerrarSesion = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      sessionStorage.clear();
      router.push("/");
    }
  };

  function estadoBadgeCls(estado: string) {
    if (estado === "activo")    return styles.badgeActivo;
    if (estado === "pendiente") return styles.badgePendiente;
    if (estado === "rechazado") return styles.badgeRechazado;
    if (estado === "suspendido") return styles.badgeSuspendido;
    return styles.badgePendiente;
  }

  return (
    <main className={styles.main}>

      <div className={styles.heroContainer}>
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Panel del emprendedor</span>
            <h1 className={styles.heroTitle}>
              Hola, <span className={styles.heroName}>{usuario?.nombre || "Emprendedor"}</span>
            </h1>
            <p className={styles.heroSub}>
              Gestiona tu emprendimiento, productos y configuración desde aquí.
            </p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.btnSecondary}>← Inicio</Link>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </section>
        
        <button onClick={handleCerrarSesion} className={styles.btnLogoutTop}>
          Cerrar sesión
        </button>
      </div>

      <section className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{totalProductos}</span>
          <span className={styles.statLabel}>PRODUCTOS PUBLICADOS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{emprendimientos.length}</span>
          <span className={styles.statLabel}>EMPRENDIMIENTOS</span>
        </div>
      </section>

      <div className={styles.body}>

        <nav className={styles.quickNav}>
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className={`${styles.quickCard} ${styles[`quickCard_${link.mod}`]}`}>
              <span className={styles.quickLabel}>{link.label}</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
          ))}
        </nav>

        <div className={styles.summaryGrid}>
          {/* ÚLTIMO EMPRENDIMIENTO */}
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>ÚLTIMO EMPRENDIMIENTO</p>
            {loading ? (
              <p className={styles.loadingText}>Cargando...</p>
            ) : ultimoEmprendimiento ? (
              <>
                <p className={styles.empName}>{ultimoEmprendimiento.nombre}</p>
                <p className={styles.empDesc}>
                  {ultimoEmprendimiento.descripcion?.substring(0, 100) || "Sin descripción"}
                  {(ultimoEmprendimiento.descripcion?.length || 0) > 100 ? "..." : ""}
                </p>
                <div className={styles.empMeta}>
                  {ultimoEmprendimiento.categoriaNombre && (
                    <span className={styles.catBadge}>{ultimoEmprendimiento.categoriaNombre}</span>
                  )}
                  <span className={`${styles.estadoBadge} ${estadoBadgeCls(ultimoEmprendimiento.estado)}`}>
                    {ultimoEmprendimiento.estado.charAt(0).toUpperCase() + ultimoEmprendimiento.estado.slice(1)}
                  </span>
                </div>
                <Link href="/inicioemprendedor/misemprendimientos" className={styles.btnLink}>
                  Ver detalles →
                </Link>
              </>
            ) : (
              <>
                <p className={styles.empName}>Aún no tienes un emprendimiento</p>
                <p className={styles.empDesc}>Crea tu emprendimiento y empieza a publicar productos.</p>
                <Link href="/inicioemprendedor/crearemprendimiento" className={styles.btnLink}>
                  Crear emprendimiento →
                </Link>
              </>
            )}
          </div>

          {/* ÚLTIMOS PRODUCTOS (de todos los emprendimientos) */}
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>ÚLTIMOS PRODUCTOS</p>
            {loading ? (
              <p className={styles.loadingText}>Cargando...</p>
            ) : ultimosProductos.length > 0 ? (
              <>
                <div className={styles.productosList}>
                  {ultimosProductos.map((p, i) => (
                    <div key={i} className={styles.productoRow}>
                      <div className={styles.productoRowImg}>
                        {p.imagen && p.imagen.startsWith('http')
                          ? <img src={p.imagen} alt={p.nombre} />
                          : <span>{p.nombre[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className={styles.productoRowInfo}>
                        <p className={styles.productoRowNombre}>{p.nombre}</p>
                        <p className={styles.productoRowPrecio}>${p.precio.toLocaleString("es-CO")}</p>
                        {(p as any).emprendimientoNombre && (
                          <p className={styles.productoRowEmp}>📦 {(p as any).emprendimientoNombre}</p>
                        )}
                      </div>
                      <span className={styles.productoRowStock}>Stock: {p.stock}</span>
                    </div>
                  ))}
                </div>
                <Link href="/inicioemprendedor/misproductos" className={styles.btnLink}>
                  Ver todos los productos →
                </Link>
              </>
            ) : (
              <>
                <p className={styles.empName}>No tienes productos aún</p>
                <p className={styles.empDesc}>
                  {ultimoEmprendimiento 
                    ? "Agrega tu primer producto al catálogo." 
                    : "Primero crea un emprendimiento para poder agregar productos."}
                </p>
                <Link 
                  href={ultimoEmprendimiento ? "/inicioemprendedor/misproductos" : "/inicioemprendedor/crearemprendimiento"} 
                  className={styles.btnLink}
                >
                  {ultimoEmprendimiento ? "Agregar producto →" : "Crear emprendimiento →"}
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}