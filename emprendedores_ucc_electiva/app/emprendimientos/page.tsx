"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

// Emojis por categoría (por nombre)
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

// Función para formatear número de WhatsApp
const formatearNumeroWhatsApp = (telefono: string): string => {
  let numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  
  if (!numeroLimpio.startsWith('+')) {
    if (numeroLimpio.startsWith('57')) {
      numeroLimpio = '+' + numeroLimpio;
    } else {
      numeroLimpio = '+57' + numeroLimpio;
    }
  }
  
  return numeroLimpio;
};

export default function EmprendimientosPage() {
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [usuarios, setUsuarios] = useState<Map<string, Usuario>>(new Map());
  const [categorias, setCategorias] = useState<Map<string, string>>(new Map()); // ID -> Nombre
  const [categoriasList, setCategoriasList] = useState<{id: string, nombre: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [precioIdx, setPrecioIdx] = useState(0);

  // Función para obtener usuarios
  const obtenerUsuario = async (usuarioId: string): Promise<Usuario | null> => {
    try {
      const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!respuesta.ok) return null;
      return await respuesta.json();
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  // Función para obtener categorías
  const obtenerCategorias = async () => {
    try {
      const respuesta = await fetch("http://localhost:8080/api/categorias");
      if (!respuesta.ok) return;
      
      const data: Categoria[] = await respuesta.json();
      console.log("📦 Categorías recibidas:", data);
      
      const categoriasMap = new Map<string, string>();
      const categoriasArray: {id: string, nombre: string}[] = [];
      
      data.forEach(cat => {
        // 🔥 IMPORTANTE: Usar 'id' o '_id' según venga del backend
        const id = cat.id || cat._id;
        if (id) {
          categoriasMap.set(id, cat.nombre);
          categoriasArray.push({ id, nombre: cat.nombre });
          console.log(`✅ Categoría mapeada: ${id} -> ${cat.nombre}`);
        } else {
          console.error("❌ Categoría sin ID:", cat);
        }
      });
      
      setCategorias(categoriasMap);
      setCategoriasList(categoriasArray);
      
      console.log("🗺️ Mapa de categorías creado con", categoriasMap.size, "categorías");
      console.log("🔑 IDs disponibles:", Array.from(categoriasMap.keys()));
      
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener categorías primero
        await obtenerCategorias();
        
        // Obtener emprendimientos
        const respuesta = await fetch("http://localhost:8080/api/emprendimientos");
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}`);
        }
        
        const emprendimientosData: Emprendimiento[] = await respuesta.json();
        console.log("📦 Emprendimientos recibidos:", emprendimientosData);
        
        // Obtener usuarios
        const usuariosMap = new Map<string, Usuario>();
        const usuariosIds = [...new Set(emprendimientosData.map(emp => emp.usuarioId))];
        
        for (const usuarioId of usuariosIds) {
          const usuario = await obtenerUsuario(usuarioId);
          if (usuario) {
            usuariosMap.set(usuarioId, usuario);
          }
        }
        
        setUsuarios(usuariosMap);
        setEmprendimientos(emprendimientosData);
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("No se pudieron cargar los emprendimientos");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Obtener el nombre de la categoría por ID
  const getNombreCategoria = (categoriaId: string): string => {
    if (!categoriaId) return "Sin categoría";
    
    const nombre = categorias.get(categoriaId);
    
    if (!nombre) {
      console.warn(`⚠️ No se encontró categoría para ID: ${categoriaId}`);
      console.log("IDs disponibles en mapa:", Array.from(categorias.keys()));
      return "Sin categoría";
    }
    
    return nombre;
  };

  // Obtener emoji por nombre de categoría
  const getEmojiCategoria = (nombreCategoria: string): string => {
    return categoriaEmoji[nombreCategoria] || "🚀";
  };

  // Obtener el precio más bajo del emprendimiento
  const getPrecioMinimo = (emprendimiento: Emprendimiento): number => {
    const precios = emprendimiento.productos?.map(p => p.precio) || [];
    return precios.length > 0 ? Math.min(...precios) : 0;
  };

  // Formatear precio
  const formatearPrecio = (precio: number): string => {
    return precio > 0 ? `Desde $${precio.toLocaleString()}` : "Consultar";
  };

  // Filtrar emprendimientos
  const emprendimientosFiltrados = emprendimientos.filter(emp => {
    // Solo mostrar activos
    if (emp.estado !== "activo") return false;
    
    const nombreCategoria = getNombreCategoria(emp.categoriaId);
    const precioMin = getPrecioMinimo(emp);
    const rango = precioRangos[precioIdx];
    
    // Búsqueda por texto
    const matchBusqueda = busqueda === "" || 
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtro por categoría
    const matchCategoria = categoriaSeleccionada === "Todas" || 
      nombreCategoria === categoriaSeleccionada;
    
    // Filtro por precio
    const matchPrecio = precioMin >= rango.min && precioMin <= rango.max;
    
    return matchBusqueda && matchCategoria && matchPrecio;
  });

  // Obtener lista de categorías para los filtros
  const categoriasFiltro = ["Todas", ...categoriasList.map(c => c.nombre)];

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div>Cargando emprendimientos...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div style={{ textAlign: "center", padding: "4rem", color: "#dc2626" }}>
            <p>❌ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer"
              }}
            >
              Reintentar
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* Hero */}
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

        {/* Filtros + Grid */}
        <section className={styles.content}>

          {/* Barra de búsqueda */}
          <div className={styles.searchBar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="6"/>
                <path d="M15 15l3 3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o autor..."
                className={styles.searchInput}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button className={styles.searchClear} onClick={() => setBusqueda("")}>✕</button>
              )}
            </div>
            <span className={styles.resultCount}>
              {emprendimientosFiltrados.length} resultado{emprendimientosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filtros */}
          <div className={styles.filters}>
            {/* Categorías */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Categoría</span>
              <div className={styles.filterPills}>
                {categoriasFiltro.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterPill} ${categoriaSeleccionada === cat ? styles.filterPillActive : ""}`}
                    onClick={() => setCategoriaSeleccionada(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Precio</span>
              <div className={styles.filterPills}>
                {precioRangos.map((r, i) => (
                  <button
                    key={r.label}
                    className={`${styles.filterPill} ${precioIdx === i ? styles.filterPillActive : ""}`}
                    onClick={() => setPrecioIdx(i)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
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
                        <span className={`${styles.cardEstado} ${styles.cardEstadoActivo}`}>
                          {emp.estado}
                        </span>
                      </div>
                    </div>

                    <h3 className={styles.cardName}>{emp.nombre}</h3>
                    <p className={styles.cardDesc}>{emp.descripcion}</p>

                    <div className={styles.cardMeta}>
                      <span className={styles.cardMetaItem}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="4" width="16" height="13" rx="2"/>
                          <path d="M2 7l8 5 8-5" strokeLinecap="round"/>
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

                    {/* Botones */}
                    <div className={styles.cardButtons}>
                      <Link href={`/emprendimientos/${emp.id || emp._id}`} className={styles.cardBtn}>
                        Ver emprendimiento →
                      </Link>
                      
                      {telefono && (
                        <a
                          href={`https://wa.me/${formatearNumeroWhatsApp(telefono)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(emp.nombre)}%22%20en%20EmprendedoresUCC%20y%20me%20interesa%20saber%20m%C3%A1s.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.whatsappBtn}
                        >
                          <svg className={styles.whatsappIcon} viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
              <button 
                className={styles.emptyBtn} 
                onClick={() => { 
                  setBusqueda(""); 
                  setCategoriaSeleccionada("Todas"); 
                  setPrecioIdx(0); 
                }}
              >
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