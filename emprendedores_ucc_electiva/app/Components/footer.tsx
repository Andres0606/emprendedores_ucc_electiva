import Link from "next/link";
import styles from "../css/Footer.module.css";

const quickLinks = [
  { label: "Inicio", href: "/" },
  { label: "Emprendimientos", href: "/emprendimientos" },
  { label: "Publicar mi emprendimiento", href: "/miemprendimiento" },
];

const categories = [
  "Tecnología",
  "Gastronomía",
  "Moda y Diseño",
  "Arte y Cultura",
  "Salud y Bienestar",
  "Servicios",
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Wave decoration */}
      <div className={styles.wave}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="var(--ucc-navy)"
          />
        </svg>
      </div>

      <div className={styles.footerBody}>
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2"  y="2"  width="11" height="22" rx="3" fill="#009FE3"/>
                <rect x="2"  y="18" width="11" height="6"  rx="2" fill="#009FE3"/>
                <rect x="16" y="2"  width="11" height="22" rx="3" fill="#8DC63F"/>
                <circle cx="30" cy="10" r="6"   fill="none" stroke="#009FE3" strokeWidth="2.5"/>
                <circle cx="30" cy="10" r="2.5" fill="#8DC63F"/>
              </svg>
              <div>
                <span className={styles.brandMain}>Emprendedores</span>
                <span className={styles.brandSub}>UCC</span>
              </div>
            </div>
            <p className={styles.brandDesc}>
              Plataforma oficial de emprendimientos estudiantiles de la
              Universidad Cooperativa de Colombia. Conectamos talento, ideas
              e innovación.
            </p>
            <div className={styles.socialRow}>
              {/* Instagram */}
              <a href="https://www.instagram.com/ucc_villavicencio/" className={styles.socialIcon} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/UCCVillavo/" className={styles.socialIcon} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/school/universidad-cooperativa-de-colombia/?originalSubdomain=co" className={styles.socialIcon} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Navegación</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.footerLink}>
                    <span className={styles.linkArrow}>›</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Categorías</h4>
            <ul className={styles.linkList}>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/emprendimientos?categoria=${encodeURIComponent(cat)}`} className={styles.footerLink}>
                    <span className={styles.linkArrow}>›</span> {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Contacto</h4>
            <p className={styles.contactItem}>
              <span></span> Calle 50A #4-197, Bello, Antioquia
            </p>
            <p className={styles.contactItem}>
              <span></span> emprendedores@ucc.edu.co
            </p>
            <p className={styles.contactItem}>
              <span></span> (604) 444 3700
            </p>
            <div className={styles.badge}>
              <span>Programa de Emprendimiento</span>
              <span className={styles.badgeSub}>UCC Villavicencio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span>© {new Date().getFullYear()} EmprendedoresUCC — Universidad Cooperativa de Colombia</span>
        <span className={styles.bottomLinks}>
        </span>
      </div>
    </footer>
  );
}