'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../css/modulos/page.module.css";
import Header from "./header";
import Footer from "./footer";

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
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  carrera: string;
  telefono?: string;
}

// Mapeo de emojis por nombre de categoría
const obtenerEmojiPorCategoria = (nombreCategoria: string): string => {
  const emojis: Record<string, string> = {
    "Tecnología": "💻",
    "Gastronomía": "🍽️",
    "Comida": "🍔",
    "Moda y Diseño": "👗",
    "Salud y Bienestar": "🧘",
    "Arte y Cultura": "🎨",
    "Servicios": "🛠️",
  };
  return emojis[nombreCategoria] || "🚀";
};

export default function HomePage() {
  const [featuredVentures, setFeaturedVentures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Map<string, Usuario>>(new Map());
  const [categorias, setCategorias] = useState<Map<string, Categoria>>(new Map());
  const [categoriesList, setCategoriesList] = useState<Categoria[]>([]);
  
  // Estadísticas reales
  const [stats, setStats] = useState([
    { value: "0", label: "Emprendimientos activos" },
    { value: "0", label: "Productos publicados" },
    { value: "8", label: "Facultades participantes" },
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
      const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!respuesta.ok) return null;
      return await respuesta.json();
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  // Función para obtener todas las categorías
  // Función para obtener todas las categorías
const obtenerCategorias = async (): Promise<Map<string, Categoria>> => {
  try {
    console.log("🔍 Obteniendo categorías...");
    const respuesta = await fetch("http://localhost:8080/api/categorias");
    
    if (!respuesta.ok) {
      console.error("❌ Error al obtener categorías:", respuesta.status);
      return new Map();
    }
    
    const categoriasData: any[] = await respuesta.json();
    console.log("📦 Categorías recibidas (raw):", categoriasData);
    console.log("📊 Número de categorías:", categoriasData.length);
    
    const categoriasMap = new Map<string, Categoria>();
    
    categoriasData.forEach((cat, index) => {
      // 🔥 CORREGIDO: Manejar tanto 'id' como '_id'
      const id = cat._id || cat.id;
      
      if (!id) {
        console.error(`❌ Categoría sin ID en índice ${index}:`, cat);
        return;
      }
      
      const idString = id.toString();
      const categoria: Categoria = {
        _id: idString,
        nombre: cat.nombre,
        descripcion: cat.descripcion
      };
      
      categoriasMap.set(idString, categoria);
      console.log(`✅ Categoría ${index + 1} mapeada: ID=${idString}, Nombre=${cat.nombre}`);
    });
    
    console.log("🗺️ Mapa final de categorías, tamaño:", categoriasMap.size);
    console.log("🔑 IDs disponibles:", Array.from(categoriasMap.keys()));
    
    // Convertir el mapa a array para categoriesList
    const categoriesArray = Array.from(categoriasMap.values());
    setCategoriesList(categoriesArray);
    
    return categoriasMap;
  } catch (error) {
    console.error("❌ Error en la petición de categorías:", error);
    return new Map();
  }
};

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Primero obtener las categorías
        const categoriasMap = await obtenerCategorias();
        setCategorias(categoriasMap);
        
        // Verificar que el mapa no esté vacío
        if (categoriasMap.size === 0) {
          console.warn("⚠️ No se cargaron categorías, verificando endpoint...");
        }
        
        // Obtener todos los emprendimientos
        const respuesta = await fetch("http://localhost:8080/api/emprendimientos");
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const emprendimientos: Emprendimiento[] = await respuesta.json();
        console.log("📦 Emprendimientos recibidos:", emprendimientos);
        
        // Filtrar solo los activos para mostrar
        const activos = emprendimientos.filter(emp => emp.estado === "activo");
        
        // Obtener información de los usuarios
        const usuariosMap = new Map<string, Usuario>();
        const usuariosIds = [...new Set(activos.map(emp => emp.usuarioId))];
        
        for (const usuarioId of usuariosIds) {
          const usuario = await obtenerUsuario(usuarioId);
          if (usuario) {
            usuariosMap.set(usuarioId, usuario);
          }
        }
        
        setUsuarios(usuariosMap);
        
        // Transformar emprendimientos para mostrar
        const venturesDisplay = activos.slice(0, 4).map(emp => {
          const usuario = usuariosMap.get(emp.usuarioId);
          const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC";
          const carrera = usuario?.carrera || "";
          const semestre = extraerSemestre(carrera);
          
          // Convertir a string por si acaso
          const categoriaIdString = emp.categoriaId?.toString() || "";
          
          console.log(`🔍 Buscando categoría para ${emp.nombre}:`);
          console.log(`  - ID buscado: ${categoriaIdString}`);
          console.log(`  - IDs disponibles:`, Array.from(categoriasMap.keys()));
          
          // Buscar la categoría
          const categoria = categoriasMap.get(categoriaIdString);
          
          if (!categoria) {
            console.warn(`⚠️ No se encontró categoría para ID: ${categoriaIdString}`);
          }
          
          const nombreCategoria = categoria?.nombre || "Sin categoría";
          const emojiCategoria = obtenerEmojiPorCategoria(nombreCategoria);
          
          console.log(`  - Resultado: ${nombreCategoria}`);
          
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
            emoji: emojiCategoria,
            author: nombreCompleto,
            semester: semestre,
            images: emp.imagenes || [],
            telefono: telefono
          };
        });
        
        console.log("🎯 Emprendimientos procesados:", venturesDisplay);
        setFeaturedVentures(venturesDisplay);
        
        // Calcular estadísticas
        const totalActivos = emprendimientos.filter(emp => emp.estado === "activo").length;
        const totalProductos = emprendimientos.reduce((sum, emp) => sum + (emp.productos?.length || 0), 0);
        const usuariosUnicos = new Set(emprendimientos.map(emp => emp.usuarioId)).size;
        
        setStats([
          { value: totalActivos.toString(), label: "Emprendimientos activos" },
          { value: totalProductos.toString(), label: "Productos publicados" },
          { value: "8", label: "Facultades participantes" },
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

  // Función auxiliar para extraer semestre de la carrera
  const extraerSemestre = (carrera: string): string => {
    if (!carrera) return "Estudiante";
    const match = carrera.match(/(\d+)(?:er|do|to|°)?\s*semestre/i);
    if (match) {
      return `${match[1]}° semestre`;
    }
    return "Estudiante";
  };

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
              Todo en un solo lugar.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/emprendimientos" className={styles.btnWhite}>
                Explorar emprendimientos
              </Link>
              <Link href="/miemprendimiento" className={styles.btnGhost}>
                Publicar el mío →
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
                Un ecosistema de innovación<br />construido por estudiantes
              </h2>
              <p className={styles.aboutText}>
                <strong>EmprendedoresUCC</strong> es la plataforma oficial de la
                Universidad Cooperativa de Colombia para visibilizar, fortalecer
                y conectar los emprendimientos de la comunidad estudiantil en la
                sede Villavicencio.
              </p>
              <p className={styles.aboutText}>
                Somos el puente entre el aula y el mercado. Cada proyecto
                publicado aquí representa horas de dedicación, aprendizaje y la
                convicción de que el conocimiento universitario puede transformar
                realidades.
              </p>
              <Link href="/nosotros" className={styles.btnPrimary}>
                Conocer más →
              </Link>
            </div>

            <div className={styles.aboutRight}>
              <div className={styles.aboutGrid}>
                <div className={`${styles.aboutBox} ${styles.aboutBoxBlue}`}>
                  <span className={styles.aboutBoxNum}>2020</span>
                  <span className={styles.aboutBoxLbl}>Año de fundación</span>
                </div>
                <div className={`${styles.aboutBox} ${styles.aboutBoxGreen}`}>
                  <span className={styles.aboutBoxNum}>100%</span>
                  <span className={styles.aboutBoxLbl}>Estudiantes UCC</span>
                </div>
                <div className={`${styles.aboutBox} ${styles.aboutBoxDark}`}>
                  <span className={styles.aboutBoxNum}>8</span>
                  <span className={styles.aboutBoxLbl}>Facultades activas</span>
                </div>
                <div className={`${styles.aboutBox} ${styles.aboutBoxLight}`}>
                  <span className={styles.aboutBoxNum}>Villavicencio</span>
                  <span className={styles.aboutBoxLbl}>Sede principal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className={styles.values}>
          <div className={styles.valuesInner}>
            <div className={styles.valuesHeader}>
              <span className={styles.sectionTag}>Nuestros fines</span>
              <h2 className={styles.sectionTitle}>Lo que nos mueve</h2>
              <p className={styles.valuesSub}>
                Construimos desde los principios cooperativos y la educación
                transformadora de la UCC.
              </p>
            </div>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <div key={v.title} className={styles.valueCard}>
                  <div className={styles.valueNum}>0{i + 1}</div>
                  <div className={styles.valueIcon}>{v.icon}</div>
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
              <span className={styles.sectionTag}>Explora por categoría</span>
              <h2 className={styles.sectionTitle}>¿Qué estás buscando?</h2>
            </div>
            <div className={styles.categoriesGrid}>
              {categoriesList.map((cat) => {
                const count = featuredVentures.filter(v => v.categoryId === cat._id).length;
                return (
                  <Link
                    key={cat._id}
                    href={`/emprendimientos?categoria=${encodeURIComponent(cat.nombre)}`}
                    className={styles.categoryCard}
                  >
                    <span className={styles.categoryIcon}>{obtenerEmojiPorCategoria(cat.nombre)}</span>
                    <span className={styles.categoryLabel}>{cat.nombre}</span>
                    <span className={styles.categoryCount}>{count} proyectos</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* EMPRENDIMIENTOS DESTACADOS */}
        <section className={styles.featured}>
          <div className={styles.featuredInner}>
            <div className={styles.featuredHeader}>
              <div>
                <span className={styles.sectionTag}>Destacados</span>
                <h2 className={styles.sectionTitle}>Emprendimientos del momento</h2>
              </div>
              <Link href="/emprendimientos" className={styles.seeAll}>
                Ver todos →
              </Link>
            </div>

            <div className={styles.venturesGrid}>
              {featuredVentures.map((v) => (
                <div key={v.id} className={styles.ventureCard}>
                  <div className={styles.ventureTop}>
                    <span className={styles.ventureCat}>{v.emoji} {v.category}</span>
                  </div>
                  <h3 className={styles.ventureName}>{v.name}</h3>
                  <p className={styles.ventureDesc}>{v.description}</p>
                  <div className={styles.ventureMeta}>
                    <div className={styles.ventureAuthor}>
                      <span className={styles.ventureAvatarLetter}>{v.author.charAt(0)}</span>
                      <div>
                        <p className={styles.ventureAuthorName}>{v.author}</p>
                        <p className={styles.ventureAuthorSem}>{v.semester}</p>
                      </div>
                    </div>
                    <span className={styles.venturePrice}>{v.price}</span>
                  </div>
                  
                  <div className={styles.ventureButtons}>
                    <Link href={`/emprendimientos/${v.id}`} className={styles.ventureBtn}>
                      Ver emprendimiento →
                    </Link>
                    
                    {v.telefono && (
                      <a
                        href={`https://wa.me/${formatearNumeroWhatsApp(v.telefono)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(v.name)}%22%20en%20EmprendedoresUCC%20y%20me%20interesa%20saber%20m%C3%A1s.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappBtn}
                      >
                        <svg className={styles.whatsappIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
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