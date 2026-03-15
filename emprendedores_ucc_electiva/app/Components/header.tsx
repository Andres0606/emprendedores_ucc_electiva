"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../css/Header.module.css";

const navLinks = [
  { label: "Inicio",          href: "/" },
  { label: "Nosotros",        href: "/nosotros" },
  { label: "Emprendimientos", href: "/emprendimientos" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── Logo ── */}
        <Link href="/" className={styles.logo}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2"  y="2"  width="11" height="22" rx="3" fill="#009FE3"/>
            <rect x="2"  y="18" width="11" height="6"  rx="2" fill="#009FE3"/>
            <rect x="16" y="2"  width="11" height="22" rx="3" fill="#8DC63F"/>
            <circle cx="30" cy="10" r="6"   fill="none" stroke="#009FE3" strokeWidth="2.5"/>
            <circle cx="30" cy="10" r="2.5" fill="#8DC63F"/>
          </svg>
          <div className={styles.logoTexts}>
            <span className={styles.logoMain}>Emprendedores</span>
            <span className={styles.logoSub}>UCC</span>
          </div>
        </Link>

        {/* ── Nav centrado ── */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Acciones derecha ── */}
        <div className={styles.actions}>
          <Link href="/autenticacion/login" className={styles.loginLink}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="7" r="3.5"/>
              <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round"/>
            </svg>
            Ingresar
          </Link>
          <Link href="/miemprendimiento" className={styles.ctaBtn}>
            Publicar emprendimiento →
          </Link>
        </div>

        {/* ── Hamburger ── */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span className={`${styles.bar} ${menuOpen ? styles.bar1Open : ""}`}/>
          <span className={`${styles.bar} ${menuOpen ? styles.bar2Open : ""}`}/>
          <span className={`${styles.bar} ${menuOpen ? styles.bar3Open : ""}`}/>
        </button>
      </div>

      {/* ── Menú móvil ── */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className={styles.mobileSep}/>
          <Link href="/autenticacion/login" className={styles.mobileLogin} onClick={() => setMenuOpen(false)}>
            Ingresar
          </Link>
          <Link href="/miemprendimiento" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
            Publicar emprendimiento →
          </Link>
        </div>
      )}
    </header>
  );
}