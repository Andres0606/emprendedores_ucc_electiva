import Link from "next/link";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/nosotros/page.module.css";

const valores = [
  { icon: "🤝", title: "Cooperativismo",   desc: "Trabajo colectivo y solidaridad como base del crecimiento." },
  { icon: "💡", title: "Innovación",        desc: "Ideas que transforman comunidades desde la academia." },
  { icon: "🌱", title: "Sostenibilidad",    desc: "Impacto social y ambiental positivo en cada proyecto." },
  { icon: "🎓", title: "Formación Integral",desc: "Conocimiento académico aplicado a la realidad empresarial." },
];

const cifras = [
  { val: "2020",  lbl: "Año de fundación" },
  { val: "120+",  lbl: "Emprendimientos" },
  { val: "3.200+",lbl: "Estudiantes" },
  { val: "8",     lbl: "Facultades" },
];

export default function NosotrosPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ══ HERO ══ */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <span className={styles.pill}>
              <span className={styles.pillDot} />
              Universidad Cooperativa de Colombia · Medellín
            </span>
            <h1 className={styles.heroTitle}>
              Sobre <span className={styles.heroGreen}>EmprendedoresUCC</span>
            </h1>
            <p className={styles.heroDesc}>
              Somos la plataforma oficial de emprendimiento estudiantil de la
              Universidad Cooperativa de Colombia, sede Medellín. Conectamos
              talento, ideas e innovación en un solo lugar.
            </p>
          </div>

          {/* Cifras en el hero */}
          <div className={styles.heroCifras}>
            {cifras.map((c) => (
              <div key={c.lbl} className={styles.heroCifra}>
                <span className={styles.heroCifraVal}>{c.val}</span>
                <span className={styles.heroCifraLbl}>{c.lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ MISIÓN Y VISIÓN ══ */}
        <section className={styles.mvSection}>
          <div className={styles.mvInner}>

            {/* Misión */}
            <div className={styles.mvCard}>
              <div className={styles.mvIconWrap}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="#009FE3" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="7"  stroke="#009FE3" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="2.5" fill="#8DC63F"/>
                  <line x1="14" y1="1" x2="14" y2="5"   stroke="#009FE3" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="23" x2="14" y2="27" stroke="#009FE3" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="1"  y1="14" x2="5"  y2="14" stroke="#009FE3" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="23" y1="14" x2="27" y2="14" stroke="#009FE3" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.mvTag}>Misión</div>
              <h2 className={styles.mvTitle}>¿Por qué existimos?</h2>
              <p className={styles.mvText}>
                Visibilizar, fortalecer y conectar los emprendimientos de los
                estudiantes de la Universidad Cooperativa de Colombia, generando
                un ecosistema de innovación que impulse el desarrollo económico
                y social de nuestra comunidad universitaria y su entorno.
              </p>
              <ul className={styles.mvList}>
                <li>Conectar estudiantes con oportunidades reales de mercado</li>
                <li>Fortalecer competencias empresariales desde la academia</li>
                <li>Promover la cultura del emprendimiento cooperativo</li>
              </ul>
            </div>

            {/* Visión */}
            <div className={`${styles.mvCard} ${styles.mvCardDark}`}>
              <div className={`${styles.mvIconWrap} ${styles.mvIconGreen}`}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3L25 8v6c0 6-5 10.5-11 12C2 24.5 3 14 3 14V8L14 3z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 14l3.5 3.5L19 10" stroke="#8DC63F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={`${styles.mvTag} ${styles.mvTagWhite}`}>Visión</div>
              <h2 className={`${styles.mvTitle} ${styles.mvTitleWhite}`}>¿A dónde vamos?</h2>
              <p className={`${styles.mvText} ${styles.mvTextWhite}`}>
                Ser para el 2030 la plataforma de referencia del emprendimiento
                universitario en Colombia, reconocida por transformar ideas
                estudiantiles en proyectos sostenibles con impacto real en la
                sociedad, desde los principios del cooperativismo.
              </p>
              <ul className={`${styles.mvList} ${styles.mvListWhite}`}>
                <li>Referente nacional en emprendimiento universitario</li>
                <li>Red activa en todas las sedes UCC del país</li>
                <li>Alianzas con el sector productivo y gubernamental</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ══ VALORES ══ */}
        <section className={styles.valores}>
          <div className={styles.valoresInner}>
            <div className={styles.valoresHeader}>
              <span className={styles.pill2}>Nuestros valores</span>
              <h2 className={styles.valoresTitle}>Lo que nos define</h2>
              <p className={styles.valoresSub}>
                Cada emprendimiento en nuestra plataforma refleja los principios
                que la Universidad Cooperativa de Colombia lleva décadas promoviendo.
              </p>
            </div>
            <div className={styles.valoresGrid}>
              {valores.map((v, i) => (
                <div key={v.title} className={styles.valorCard}>
                  <div className={styles.valorNum}>0{i + 1}</div>
                  <div className={styles.valorIcon}>{v.icon}</div>
                  <h3 className={styles.valorTitle}>{v.title}</h3>
                  <p className={styles.valorDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>¿Listo para emprender?</h2>
            <p className={styles.ctaDesc}>
              Únete a la comunidad y publica tu emprendimiento hoy.
            </p>
            <div className={styles.ctaBtns}>
              <Link href="/autenticacion/register" className={styles.ctaBtnPrimary}>
                Crear mi cuenta
              </Link>
              <Link href="/emprendimientos" className={styles.ctaBtnGhost}>
                Ver emprendimientos
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}