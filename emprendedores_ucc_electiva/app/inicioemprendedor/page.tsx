"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/inicioemprendedor/inicioemprendedor.module.css";
import Link from "next/link";
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
  telefono?: string;
  tipoUsuario: string;
  carrera?: string;
}

const quickLinks = [
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

  const getTimestampFromId = (id: string) => {
    try {
      const hexTimestamp = id.substring(0, 8);
      const timestamp = parseInt(hexTimestamp, 16) * 1000;
      return timestamp;
    } catch {
      return 0;
    }
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
      const res = await fetch("http://localhost:8080/api/emprendimientos");
      if (res.ok) {
        const emps: Emprendimiento[] = await res.json();
        const misEmprendimientos = emps.filter(e => String(e.usuarioId) === String(uid));
        
        const ordenados = [...misEmprendimientos].sort((a, b) => {
          const idA = a.id || a._id || "";
          const idB = b.id || b._id || "";
          const timestampA = getTimestampFromId(idA);
          const timestampB = getTimestampFromId(idB);
          return timestampB - timestampA;
        });
        
        setEmprendimientos(ordenados);
        
        const total = ordenados.reduce((sum, emp) => sum + (emp.productos?.length || 0), 0);
        setTotalProductos(total);
        
        const ultimoEmp = ordenados[0];
        if (ultimoEmp && ultimoEmp.productos && ultimoEmp.productos.length > 0) {
          setUltimosProductos(ultimoEmp.productos.slice(-2));
        } else {
          setUltimosProductos([]);
        }
        
        for (const emp of ordenados) {
          if (emp.categoriaId) {
            try {
              const resCat = await fetch(`http://localhost:8080/api/categorias/${emp.categoriaId}`);
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

  // Cargar datos al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔥 ESCUCHAR CAMBIOS EN localStorage (cuando se crean productos)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "productosActualizados") {
        console.log("📦 Productos actualizados, recargando datos...");
        cargarDatos();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // También recargar cuando la página recibe foco
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
    return styles.badgePendiente;
  }

  const ultimoEmprendimiento = emprendimientos.length > 0 ? emprendimientos[0] : null;

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
                <Link href="/inicioemprendedor/misemprendimientos" className={styles.btnLink}>
                  Crear emprendimiento →
                </Link>
              </>
            )}
          </div>

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
                        {p.imagen
                          ? <img src={p.imagen} alt={p.nombre} />
                          : <span>{p.nombre[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className={styles.productoRowInfo}>
                        <p className={styles.productoRowNombre}>{p.nombre}</p>
                        <p className={styles.productoRowPrecio}>${p.precio.toLocaleString("es-CO")}</p>
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
                  href={ultimoEmprendimiento ? "/inicioemprendedor/misproductos" : "/inicioemprendedor/misemprendimientos"} 
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