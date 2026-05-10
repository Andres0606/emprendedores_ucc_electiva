'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../css/modulos/page.module.css";
import Header from "./header";
import Footer from "./footer";
import { API_URL } from "@/src/config/api";

interface Categoria {
  _id: string;
  nombre: string;
  descripcion: string;
}

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
  tipoUsuario?: string;
}

// Categorías por defecto en caso de que el backend no responda
const CATEGORIAS_POR_DEFECTO: Categoria[] = [
  { _id: "1", nombre: "Tecnología", descripcion: "Apps, software, hardware y servicios tecnológicos" },
  { _id: "2", nombre: "Gastronomía", descripcion: "Comidas, bebidas y productos alimenticios" },
  { _id: "3", nombre: "Moda y Diseño", descripcion: "Ropa, accesorios y diseño creativo" },
  { _id: "4", nombre: "Salud y Bienestar", descripcion: "Productos y servicios para el bienestar físico y mental" },
  { _id: "5", nombre: "Arte y Cultura", descripcion: "Artesanías, pintura, música y expresión cultural" },
  { _id: "6", nombre: "Servicios", descripcion: "Servicios profesionales y asesorías" },
  { _id: "7", nombre: "Educación", descripcion: "Cursos, talleres y materiales educativos" },
  { _id: "8", nombre: "Sostenibilidad", descripcion: "Productos ecológicos y soluciones sostenibles" },
];

// Componente para Iconos de Categoría (SVG)
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
      case "Educación": return { bg: "#ecfeff", border: "#cffafe", icon: "#0891b2" };
      case "Sostenibilidad": return { bg: "#f0fdf4", border: "#dcfce7", icon: "#166534" };
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
    strokeWidth: "2",
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
      case "Educación":
        return (
          <svg {...iconProps}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      case "Sostenibilidad":
        return (
          <svg {...iconProps}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
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

export default function HomePage() {
  const [featuredVentures, setFeaturedVentures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Map<string, Usuario>>(new Map());
  const [categorias, setCategorias] = useState<Map<string, Categoria>>(new Map());
  const [categoriesList, setCategoriesList] = useState<Categoria[]>(CATEGORIAS_POR_DEFECTO);
  const [todosLosActivos, setTodosLosActivos] = useState<Emprendimiento[]>([]);
  
  // Estadísticas reales
  const [stats, setStats] = useState([
    { value: "0", label: "Emprendimientos activos" },
    { value: "0", label: "Productos publicados" },
    { value: "0", label: "Facultades UCC" },
  ]);

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

  // Función para obtener un usuario por ID
  const obtenerUsuario = async (usuarioId: string): Promise<Usuario | null> => {
    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioId}`);
      if (!respuesta.ok) return null;
      const data = await respuesta.json();
      return {
        id: data.id || data._id,
        _id: data._id || data.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        carrera: data.carrera || "",
        telefono: data.telefono || "",
        tipoUsuario: data.tipoUsuario || ""
      };
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  // Función para obtener todas las categorías (con fallback a categorías por defecto)
  const obtenerCategorias = async (): Promise<Map<string, Categoria>> => {
    try {
      const respuesta = await fetch(`${API_URL}/api/categorias`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      if (!respuesta.ok) {
        setCategoriesList(CATEGORIAS_POR_DEFECTO);
        return convertirArrayAMapa(CATEGORIAS_POR_DEFECTO);
      }
      
      const categoriasData: any[] = await respuesta.json();
      
      if (!categoriasData || categoriasData.length === 0) {
        setCategoriesList(CATEGORIAS_POR_DEFECTO);
        return convertirArrayAMapa(CATEGORIAS_POR_DEFECTO);
      }
      
      const categoriasMap = new Map<string, Categoria>();
      
      categoriasData.forEach((cat, index) => {
        const id = cat._id || cat.id;
        
        if (!id) {
          return;
        }
        
        const idString = id.toString();
        const categoria: Categoria = {
          _id: idString,
          nombre: cat.nombre,
          descripcion: cat.descripcion || ""
        };
        
        categoriasMap.set(idString, categoria);
      });
      
      const categoriesArray = Array.from(categoriasMap.values());
      
      if (categoriesArray.length === 0) {
        setCategoriesList(CATEGORIAS_POR_DEFECTO);
        return convertirArrayAMapa(CATEGORIAS_POR_DEFECTO);
      }
      
      setCategoriesList(categoriesArray);
      return categoriasMap;
      
    } catch (error) {
      setCategoriesList(CATEGORIAS_POR_DEFECTO);
      return convertirArrayAMapa(CATEGORIAS_POR_DEFECTO);
    }
  };
  
  // Función auxiliar para convertir array de categorías a Map
  const convertirArrayAMapa = (categoriasArray: Categoria[]): Map<string, Categoria> => {
    const map = new Map<string, Categoria>();
    categoriasArray.forEach(cat => {
      map.set(cat._id, cat);
    });
    return map;
  };

  // Función auxiliar para extraer semestre de la carrera
  const extraerSemestre = (carrera: string): string => {
    if (!carrera) return "Estudiante";
    const match = carrera.match(/(\d+)(?:er|do|to|°)?\s*semestre/i);
    if (match) {
      return `${match[1]}° semestre`;
    }
    return "Estudiante";
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Primero obtener las categorías (si falla, usa las de defecto)
        const categoriasMap = await obtenerCategorias();
        setCategorias(categoriasMap);
        
        // Obtener todos los emprendimientos
        const respuesta = await fetch(`${API_URL}/api/emprendimientos`);
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const emprendimientos: Emprendimiento[] = await respuesta.json();
        
        // Filtrar solo los activos
        const activos = emprendimientos.filter(emp => emp.estado === "activo");
        setTodosLosActivos(activos);
        
        // Obtener información de los usuarios
        const usuariosMap = new Map<string, Usuario>();
        const usuariosIds = [...new Set(activos.map(emp => emp.usuarioId))];
        
        const usuariosResultados = await Promise.all(
          usuariosIds.map(async (usuarioId) => {
            const usuario = await obtenerUsuario(usuarioId);
            return { usuarioId, usuario };
          })
        );

        usuariosResultados.forEach(({ usuarioId, usuario }) => {
          if (usuario) {
            usuariosMap.set(usuarioId, usuario);
          }
        });
        
        setUsuarios(usuariosMap);
        
        // 🔥 CALCULAR LOS MÁS VENDIDOS PARA LA PORTADA
        const venturesDisplay = activos
          .sort((a, b) => (b.totalVentas || 0) - (a.totalVentas || 0))
          .slice(0, 4)
          .map(emp => {
          const usuario = usuariosMap.get(emp.usuarioId);
          const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC";
          const carrera = usuario?.carrera || "";
          const semestre = extraerSemestre(carrera);
          
          const categoriaIdString = emp.categoriaId?.toString() || "";
          
          // Buscar la categoría (primero en el mapa de la BD, si no en las de defecto)
          let categoria = categoriasMap.get(categoriaIdString);
          if (!categoria) {
            categoria = CATEGORIAS_POR_DEFECTO.find(c => c._id === categoriaIdString);
          }
          
          const nombreCategoria = categoria?.nombre || "Sin categoría";
          
          // Obtener el precio más bajo de los productos
          const precios = emp.productos?.map(p => p.precio) || [];
          const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
          const precioFormateado = precioMin > 0 ? `Desde $${precioMin.toLocaleString()}` : "Consultar";
          
          // Obtener teléfono
          const telefono = emp.telefono || usuario?.telefono || "";
          
          return {
            id: emp.id || emp._id,
            name: emp.nombre,
            category: nombreCategoria,
            categoryId: emp.categoriaId,
            description: emp.descripcion,
            price: precioFormateado,
            author: nombreCompleto,
            semester: semestre,
            images: emp.imagenes || [],
            telefono: telefono
          };
        });
        
        setFeaturedVentures(venturesDisplay);
        
        // 🔥 CALCULAR ESTADÍSTICAS REALES
        const totalActivos = activos.length;
        
        // Calcular total de productos SOLO de emprendimientos ACTIVOS
        const totalProductos = activos.reduce((sum, emp) => {
            const productosCount = Array.isArray(emp.productos) ? emp.productos.length : 0;
            return sum + productosCount;
          }, 0);
        
        // 🔥 CALCULAR FACULTADES CORRECTAMENTE
        let facultadesUnicas = new Set<string>();

        try {
          const resUsuarios = await fetch(`${API_URL}/api/usuarios`);
          if (resUsuarios.ok) {
            const todosUsuarios = await resUsuarios.json();
            for (const usuario of todosUsuarios) {
              if ((usuario.tipoUsuario === "estudiante" || usuario.tipoUsuario === "emprendedor") 
                  && usuario.carrera && usuario.carrera.trim() !== "") {
                facultadesUnicas.add(usuario.carrera);
              }
            }
          }
        } catch (error) {
          for (const usuario of usuariosMap.values()) {
            if (usuario && usuario.carrera && usuario.carrera.trim() !== "") {
              facultadesUnicas.add(usuario.carrera);
            }
          }
        }

        const totalFacultades = facultadesUnicas.size || 5;
        
        setStats([
          { value: totalActivos.toString(), label: "Emprendimientos activos" },
          { value: totalProductos.toString(), label: "Productos publicados" },
          { value: totalFacultades.toString(), label: "Facultades UCC" },
        ]);
        
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        setError("No se pudieron cargar los emprendimientos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

 

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
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <span className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              Plataforma oficial · UCC Villavicencio
            </span>
            <h1 className={styles.heroTitle}>
              Emprende.<br />
              <span className={styles.heroAccent}>Innova.</span><br />
              Transforma.
            </h1>
            <p className={styles.heroSub}>
              Productos, servicios e ideas de los estudiantes de la
              <strong> Universidad Cooperativa de Colombia</strong>.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/emprendimientos" className={styles.btnWhite}>
                Explorar catálogo
              </Link>
              <Link href="/miemprendimiento" className={styles.btnGhost}>
                Publicar mi idea →
              </Link>
            </div>
          </div>
        </section>

        {/* ESTADÍSTICAS */}
        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* QUIÉNES SOMOS */}
        <section className={styles.about}>
          <div className={styles.aboutInner}>
            <div className={styles.aboutLeft}>
              <span className={styles.sectionTag}>¿Quiénes somos?</span>
              <h2 className={styles.sectionTitle}>
                Un ecosistema construido por estudiantes
              </h2>
              <p className={styles.aboutText}>
                <strong>EmprendedoresUCC</strong> es el espacio oficial para conectar los emprendimientos de la comunidad UCC sede Villavicencio.
              </p>
              <Link href="/nosotros" className={styles.btnPrimary}>
                Conocer más →
              </Link>
            </div>

            <div className={styles.aboutRight}>
              <div className={styles.aboutGrid}>
                <div className={`${styles.aboutBox} ${styles.aboutBoxBlue}`}>
                  <span className={styles.aboutBoxNum}>2026</span>
                  <span className={styles.aboutBoxLbl}>Fundación</span>
                </div>
                <div className={`${styles.aboutBox} ${styles.aboutBoxGreen}`}>
                  <span className={styles.aboutBoxNum}>100%</span>
                  <span className={styles.aboutBoxLbl}>Talento UCC</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className={styles.values}>
          <div className={styles.valuesInner}>
            <div className={styles.valuesHeader}>
              <span className={styles.sectionTag}>Nuestros valores</span>
              <h2 className={styles.sectionTitle}>Lo que nos mueve</h2>
            </div>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <div key={v.title} className={styles.valueCard}>
                  <div className={styles.valueNum}>0{i + 1}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className={styles.categories}>
          <div className={styles.categoriesInner}>
            <div className={styles.categoriesHeader}>
              <span className={styles.sectionTag}>Explora</span>
              <h2 className={styles.sectionTitle}>¿Qué estás buscando?</h2>
            </div>
            <div className={styles.categoriesGrid}>
              {categoriesList.map((cat) => {
                const count = todosLosActivos.filter(emp => emp.categoriaId?.toString() === cat._id).length;
                
                return (
                  <Link
                    key={cat._id}
                    href={`/emprendimientos?categoria=${encodeURIComponent(cat.nombre)}`}
                    className={styles.categoryCard}
                  >
                    <div className={styles.categoryIconWrapper}>
                      <CategoryIcon nombre={cat.nombre} size={28} />
                    </div>
                    <span className={styles.categoryLabel}>{cat.nombre}</span>
                    <span className={styles.categoryCount}>
                      {count} {count === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>


        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <div className={styles.ctaLeft}>
              <h2 className={styles.ctaTitle}>¿Tienes un emprendimiento?</h2>
              <p className={styles.ctaDesc}>
                Únete a la comunidad. Publica tu proyecto, llega a más personas
                y accede a recursos de la Universidad Cooperativa de Colombia.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/miemprendimiento" className={styles.ctaBtnWhite}>
                  Publicar mi emprendimiento
                </Link>
                <Link href="/nosotros" className={styles.ctaBtnGhost}>
                  Saber más
                </Link>
              </div>
            </div>
            <div className={styles.ctaRight} aria-hidden>
              <span></span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

const values = [
  {
    icon: "",
    title: "Cooperativismo",
    desc: "Fomentamos la solidaridad y el trabajo colectivo como base del crecimiento económico y social.",
  },
  {
    icon: "",
    title: "Innovación",
    desc: "Impulsamos ideas disruptivas que transforman comunidades desde la academia hacia la realidad.",
  },
  {
    icon: "",
    title: "Sostenibilidad",
    desc: "Priorizamos emprendimientos con impacto social y ambiental positivo para las generaciones futuras.",
  },
  {
    icon: "",
    title: "Formación integral",
    desc: "Combinamos el conocimiento académico con la experiencia empresarial para formar líderes completos.",
  },
];