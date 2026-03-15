import Link from "next/link";
import styles from "../css/modulos/page.module.css";
import Header from "./header";
import Footer from "./footer";

const featuredVentures = [
  {
    id: 1,
    name: "EcoTech Soluciones",
    category: "Tecnología",
    description: "Apps móviles y soluciones digitales para pequeños negocios locales.",
    price: "Desde $150.000",
    emoji: "💻",
    author: "Carlos Muñoz",
    semester: "7°",
  },
  {
    id: 2,
    name: "Sabor Costeño",
    category: "Gastronomía",
    description: "Comida tradicional costeña con entrega a domicilio en Medellín.",
    price: "Desde $12.000",
    emoji: "🍽️",
    author: "Daniela Herrera",
    semester: "5°",
  },
  {
    id: 3,
    name: "Studio Hilo",
    category: "Moda y Diseño",
    description: "Ropa sostenible y accesorios hechos a mano con telas recicladas.",
    price: "Desde $45.000",
    emoji: "🧵",
    author: "Valentina Ríos",
    semester: "8°",
  },
  {
    id: 4,
    name: "MindBalance",
    category: "Salud y Bienestar",
    description: "Sesiones de meditación guiada y coaching de bienestar personal.",
    price: "Desde $30.000",
    emoji: "🧘",
    author: "Andrés Palacio",
    semester: "6°",
  },
];

const stats = [
  { value: "120+", label: "Emprendimientos activos", icon: "🏢" },
  { value: "400+", label: "Productos publicados",    icon: "📦" },
  { value: "8",    label: "Facultades participantes",icon: "🎓" },
  { value: "3.200+",label: "Estudiantes conectados", icon: "👥" },
];

const values = [
  {
    icon: "🤝",
    title: "Cooperativismo",
    desc: "Fomentamos la solidaridad y el trabajo colectivo como base del crecimiento económico y social.",
  },
  {
    icon: "💡",
    title: "Innovación",
    desc: "Impulsamos ideas disruptivas que transforman comunidades desde la academia hacia la realidad.",
  },
  {
    icon: "🌱",
    title: "Sostenibilidad",
    desc: "Priorizamos emprendimientos con impacto social y ambiental positivo para las generaciones futuras.",
  },
  {
    icon: "🎓",
    title: "Formación integral",
    desc: "Combinamos el conocimiento académico con la experiencia empresarial para formar líderes completos.",
  },
];

const categories = [
  { label: "Tecnología",       icon: "💻", count: 28 },
  { label: "Gastronomía",      icon: "🍽️", count: 22 },
  { label: "Moda y Diseño",    icon: "🧵", count: 18 },
  { label: "Salud y Bienestar",icon: "🧘", count: 15 },
  { label: "Arte y Cultura",   icon: "🎨", count: 12 },
  { label: "Servicios",        icon: "🛠️", count: 25 },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ══════════════════════════════
            HERO
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
              <Link href="/emprendimientos/nuevo" className={styles.btnGhost}>
                Publicar el mío →
              </Link>
            </div>
          </div>


        </section>

        {/* ══════════════════════════════
            ESTADÍSTICAS
        ══════════════════════════════ */}
        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            QUIÉNES SOMOS
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
            VALORES / FINES
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
            CATEGORÍAS
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
            EMPRENDIMIENTOS DESTACADOS
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
                    <span className={styles.ventureEmoji}>{v.emoji}</span>
                    <span className={styles.ventureCat}>{v.category}</span>
                  </div>
                  <h3 className={styles.ventureName}>{v.name}</h3>
                  <p className={styles.ventureDesc}>{v.description}</p>
                  <div className={styles.ventureMeta}>
                    <div className={styles.ventureAuthor}>
                      <span className={styles.ventureAvatarLetter}>{v.author.charAt(0)}</span>
                      <div>
                        <p className={styles.ventureAuthorName}>{v.author}</p>
                        <p className={styles.ventureAuthorSem}>Semestre {v.semester}</p>
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
            CTA FINAL
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
                <Link href="/emprendimientos/nuevo" className={styles.ctaBtnWhite}>
                  Publicar mi emprendimiento
                </Link>
                <Link href="/nosotros" className={styles.ctaBtnGhost}>
                  Saber más
                </Link>
              </div>
            </div>
            <div className={styles.ctaRight} aria-hidden>
              <span>🚀</span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}