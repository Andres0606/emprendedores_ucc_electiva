import Link from "next/link";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/nosotros/page.module.css";

const valores = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Cooperativismo",
    desc: "Creemos en el poder del trabajo colectivo. En EmprendedoresUCC, cada estudiante no compite — colabora. Compartimos recursos, conocimiento y redes para que todos crezcan juntos, siguiendo el espíritu fundacional de la Universidad Cooperativa de Colombia.",
    tag: "Pilar fundamental",
    color: "#009FE3",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2"/><path d="M12 18v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/><path d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      </svg>
    ),
    title: "Innovación",
    desc: "No basta con tener una idea — hay que desarrollarla, probarla y mejorarla. Fomentamos el pensamiento creativo y disruptivo en nuestros estudiantes, dándoles las herramientas para convertir sus proyectos en soluciones reales para su comunidad.",
    tag: "Motor de cambio",
    color: "#8DC63F",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20Z"/><path d="M2 12h20"/>
      </svg>
    ),
    title: "Sostenibilidad",
    desc: "Cada emprendimiento que publicamos tiene una responsabilidad con el entorno. Priorizamos proyectos que generen impacto social y ambiental positivo, porque entendemos que el éxito empresarial y el bienestar colectivo no son conceptos opuestos.",
    tag: "Compromiso social",
    color: "#009FE3",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M6.5 18H20"/>
      </svg>
    ),
    title: "Formación Integral",
    desc: "La academia y la práctica empresarial van de la mano. Nuestros estudiantes aplican lo que aprenden en el aula al mundo real, desarrollando competencias que van más allá del currículo: liderazgo, resiliencia, comunicación y visión estratégica.",
    tag: "Educación aplicada",
    color: "#8DC63F",
  },
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
              Universidad Cooperativa de Colombia · Villavicencio
            </span>
            <h1 className={styles.heroTitle}>
              Sobre <span className={styles.heroGreen}>EmprendedoresUCC</span>
            </h1>
            <p className={styles.heroDesc}>
              Somos la plataforma oficial de emprendimiento estudiantil de la
              Universidad Cooperativa de Colombia, sede Villavicencio. Conectamos
              talento, ideas e innovación en un solo lugar.
            </p>
          </div>
        </section>

        {/* ══ MISIÓN Y VISIÓN ══ */}
        <section className={styles.mvSection}>
          <div className={styles.mvInner}>
            <div className={styles.mvCard}>
              <div className={styles.mvIconWrap}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="#009FE3" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="7"  stroke="#009FE3" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="2.5" fill="#8DC63F"/>
                  <line x1="14" y1="1"  x2="14" y2="5"  stroke="#009FE3" strokeWidth="2" strokeLinecap="round"/>
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
                <div key={v.title} className={styles.valorItem}>
                  <div className={styles.valorLeft}>
                    <div className={styles.valorIconBox} style={{background: `${v.color}15`, border: `1.5px solid ${v.color}30`}}>
                      <span className={styles.valorIcon}>{v.icon}</span>
                    </div>
                    <div className={styles.valorLine} />
                  </div>
                  <div className={styles.valorRight}>
                    <div className={styles.valorMeta}>
                      <span className={styles.valorNum}>0{i + 1}</span>
                      <span className={styles.valorTag} style={{color: v.color, background: `${v.color}12`, border: `1px solid ${v.color}25`}}>
                        {v.tag}
                      </span>
                    </div>
                    <h3 className={styles.valorTitle}>{v.title}</h3>
                    <p className={styles.valorDesc}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
}