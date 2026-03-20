'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../css/modulos/page.module.css";
import Header from "./header";
import Footer from "./footer";

// Mapeo de categorías (igual que en tu otro componente)
const categorias: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "Tecnología",
  "69adb8d5781c765dca3ab5f1": "Gastronomía",
  "69adb8d5781c765dca3ab5f2": "Moda y Diseño",
  "69adb8d5781c765dca3ab5f3": "Salud y Bienestar",
  "69adb8d5781c765dca3ab5f4": "Arte y Cultura",
  "69adb8d5781c765dca3ab5f5": "Servicios",
};

// Emojis por categoría
const emojisPorCategoria: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "💻",
  "69adb8d5781c765dca3ab5f1": "🍽️",
  "69adb8d5781c765dca3ab5f2": "🧵",
  "69adb8d5781c765dca3ab5f3": "🧘",
  "69adb8d5781c765dca3ab5f4": "🎨",
  "69adb8d5781c765dca3ab5f5": "🛠️",
};

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  imagenes: string[];
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
}

export default function HomePage() {
  const [featuredVentures, setFeaturedVentures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Map<string, Usuario>>(new Map());
  
  // Estadísticas reales
  const [stats, setStats] = useState([
    { value: "0", label: "Emprendimientos activos" },
    { value: "0", label: "Productos publicados" },
    { value: "8", label: "Facultades participantes" },
    { value: "0", label: "Estudiantes conectados" },
  ]);

  // Categorías con conteos reales
  const [categories, setCategories] = useState([
    { label: "Tecnología", icon: "💻", count: 0, id: "69adb8d5781c765dca3ab5f0" },
    { label: "Gastronomía", icon: "🍽️", count: 0, id: "69adb8d5781c765dca3ab5f1" },
    { label: "Moda y Diseño", icon: "🧵", count: 0, id: "69adb8d5781c765dca3ab5f2" },
    { label: "Salud y Bienestar", icon: "🧘", count: 0, id: "69adb8d5781c765dca3ab5f3" },
    { label: "Arte y Cultura", icon: "🎨", count: 0, id: "69adb8d5781c765dca3ab5f4" },
    { label: "Servicios", icon: "🛠️", count: 0, id: "69adb8d5781c765dca3ab5f5" },
  ]);

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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los emprendimientos
        const respuesta = await fetch("http://localhost:8080/api/emprendimientos");
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const emprendimientos: Emprendimiento[] = await respuesta.json();
        
        // Filtrar solo los activos para mostrar
        const activos = emprendimientos.filter(emp => emp.estado === "activo");
        
        // Obtener información de los usuarios de cada emprendimiento
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
       // Transformar emprendimientos para mostrar (limitado a 5)
const venturesDisplay = activos.slice(0, 5).map(emp => {
  const usuario = usuariosMap.get(emp.usuarioId);
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC";
  const carrera = usuario?.carrera || "";
  const semestre = carrera ? extraerSemestre(carrera) : "Estudiante";
  
  // Obtener el precio más bajo de los productos
  const precios = emp.productos?.map(p => p.precio) || [];
  const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
  const precioFormateado = precioMin > 0 ? `Desde $${precioMin.toLocaleString()}` : "Consultar";
  
  return {
    id: emp.id || emp._id,
    name: emp.nombre,
    category: categorias[emp.categoriaId] || "Sin categoría",
    description: emp.descripcion,
    price: precioFormateado,
    emoji: emojisPorCategoria[emp.categoriaId] || "🚀",
    author: nombreCompleto,
    semester: semestre,
    images: emp.imagenes || []
  };
});

setFeaturedVentures(venturesDisplay); // Aquí ya solo tendrás máximo 5
        
        // Calcular estadísticas reales
        const totalActivos = emprendimientos.filter(emp => emp.estado === "activo").length;
        const totalProductos = emprendimientos.reduce((sum, emp) => sum + (emp.productos?.length || 0), 0);
        const usuariosUnicos = new Set(emprendimientos.map(emp => emp.usuarioId)).size;
        
        setStats([
          { value: totalActivos.toString(), label: "Emprendimientos activos" },
          { value: totalProductos.toString(), label: "Productos publicados" },
          { value: "8", label: "Facultades participantes" },
          { value: usuariosUnicos.toString(), label: "Estudiantes conectados" },
        ]);
        
        // Calcular conteos por categoría
        const conteosCategorias = categories.map(cat => ({
          ...cat,
          count: emprendimientos.filter(emp => emp.categoriaId === cat.id && emp.estado === "activo").length
        }));
        setCategories(conteosCategorias);
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("No se pudieron cargar los emprendimientos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Función auxiliar para extraer semestre de la carrera
  const extraerSemestre = (carrera: string): string => {
    // Esto es un ejemplo, ajusta según cómo guardes la información del semestre
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

        {/* ══════════════════════════════
            HERO (sin cambios)
        ══════════════════════════════ */}
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

        {/* ══════════════════════════════
            ESTADÍSTICAS (con datos reales)
        ══════════════════════════════ */}
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

        {/* ══════════════════════════════
            QUIÉNES SOMOS (sin cambios)
        ══════════════════════════════ */}
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

        {/* ══════════════════════════════
            VALORES / FINES (sin cambios)
        ══════════════════════════════ */}
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

        {/* ══════════════════════════════
            CATEGORÍAS (con conteos reales)
        ══════════════════════════════ */}
        <section className={styles.categories}>
          <div className={styles.categoriesInner}>
            <div className={styles.categoriesHeader}>
              <span className={styles.sectionTag}>Explora por categoría</span>
              <h2 className={styles.sectionTitle}>¿Qué estás buscando?</h2>
            </div>
            <div className={styles.categoriesGrid}>
              {categories.map((c) => (
                <Link
                  key={c.label}
                  href={`/emprendimientos?categoria=${encodeURIComponent(c.label)}`}
                  className={styles.categoryCard}
                >
                  <span className={styles.categoryIcon}>{c.icon}</span>
                  <span className={styles.categoryLabel}>{c.label}</span>
                  <span className={styles.categoryCount}>{c.count} proyectos</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            EMPRENDIMIENTOS DESTACADOS (con datos reales)
        ══════════════════════════════ */}
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
                    <span className={styles.ventureCat}>{v.category}</span>
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
                  <Link href={`/emprendimientos/${v.id}`} className={styles.ventureBtn}>
                    Ver emprendimiento →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            CTA (sin cambios)
        ══════════════════════════════ */}
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

// Datos estáticos que mantienes igual
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