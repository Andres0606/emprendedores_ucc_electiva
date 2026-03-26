"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../css/Header.module.css";

const navLinks = [
  { label: "Inicio",          href: "/" },
  { label: "Nosotros",        href: "/nosotros" },
  { label: "Emprendimientos", href: "/emprendimientos" },
  { label: "Eventos",         href: "/eventos" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<{ 
    id: string; 
    nombre: string; 
    tipoUsuario?: string 
  } | null>(null);

  // Verificar si hay usuario logueado
  useEffect(() => {
    const userStr = sessionStorage.getItem('usuario');
    const userName = sessionStorage.getItem('nombreUsuario');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsuarioActual({
          id: user.id || user._id || sessionStorage.getItem('usuarioId') || '',
          nombre: user.nombre || userName || 'Usuario',
          tipoUsuario: user.tipoUsuario || tipoUsuario || undefined
        });
      } catch {
        setUsuarioActual(null);
      }
    } else {
      setUsuarioActual(null);
    }
  }, []);

  // Función para redirigir al perfil según el tipo de usuario
  const irAlPerfil = () => {
    const tipoUsuario = usuarioActual?.tipoUsuario || sessionStorage.getItem('tipoUsuario');
    
    if (tipoUsuario === "admin") {
      router.push("/inicioadmin");
    } else if (tipoUsuario === "emprendedor") {
      router.push("/inicioemprendedor");
    } else if (tipoUsuario === "estudiante" || tipoUsuario === "administrativo") {
      router.push("/inicioestudiante");
    } else {
      console.warn("Tipo de usuario no reconocido:", tipoUsuario);
      router.push("/");
    }
    
    // Cerrar menú móvil si está abierto
    setMenuOpen(false);
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    // Limpiar sessionStorage
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('usuarioId');
    sessionStorage.removeItem('nombreUsuario');
    sessionStorage.removeItem('tipoUsuario');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Actualizar estado
    setUsuarioActual(null);
    
    // Cerrar menú móvil si está abierto
    setMenuOpen(false);
    
    // Redirigir al inicio
    router.push('/');
  };

  // Verificar si el usuario es emprendedor o estudiante/administrativo (no admin)
  const puedeVerPedidos = usuarioActual?.tipoUsuario !== "admin";
  const puedeVerEmprendimientos = usuarioActual?.tipoUsuario === "emprendedor";
  
  // 🔥 REGLA: Mostrar botón "Publicar emprendimiento" SOLO si:
  // 1. No hay usuario logueado, O
  // 2. El usuario logueado es EMPRENDEDOR
  const mostrarBotonPublicar = !usuarioActual || usuarioActual?.tipoUsuario === "emprendedor";

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
          {usuarioActual ? (
            // Usuario logueado - mostrar perfil con menú desplegable
            <div className={styles.userMenu}>
              <button className={styles.userButton}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="7" r="3.5"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round"/>
                </svg>
                <span className={styles.userName}>
                  {usuarioActual.nombre.split(' ')[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1L6 6L11 1" strokeLinecap="round"/>
                </svg>
              </button>
              <div className={styles.userDropdown}>
                {/* Mi perfil - redirige según tipo de usuario */}
                <button onClick={irAlPerfil} className={styles.dropdownItem}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <circle cx="10" cy="7" r="3.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
                  </svg>
                  Mi perfil
                </button>
                
                {/* Mis emprendimientos (solo para emprendedores) */}
                {puedeVerEmprendimientos && (
                  <Link href="/mis-emprendimientos" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <rect x="2" y="4" width="16" height="13" rx="2"/>
                      <path d="M2 7l8 5 8-5"/>
                    </svg>
                    Mis emprendimientos
                  </Link>
                )}
                
                {/* Mis pedidos (solo para NO administradores) */}
                {puedeVerPedidos && (
                  <Link href="/mis-pedidos" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    </svg>
                    Mis pedidos
                  </Link>
                )}
                
                <div className={styles.dropdownDivider} />
                <button onClick={cerrarSesion} className={styles.dropdownItemLogout}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M13 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3M8 15l5-5-5-5M13 10H3" strokeLinecap="round"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            // Usuario no logueado - mostrar ingresar
            <Link href="/autenticacion/login" className={styles.loginLink}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10" cy="7" r="3.5"/>
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round"/>
              </svg>
              Ingresar
            </Link>
          )}
          
          {/* 🔥 Botón "Publicar emprendimiento" - Aparece si NO hay usuario logueado O es EMPRENDEDOR */}
          {mostrarBotonPublicar && (
            <Link href="/miemprendimiento" className={styles.ctaBtn}>
              Publicar emprendimiento →
            </Link>
          )}
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
          {usuarioActual ? (
            // Menú móvil para usuario logueado
            <>
              <div className={styles.mobileUserInfo}>
                <span className={styles.mobileUserAvatar}>
                  {usuarioActual.nombre.charAt(0).toUpperCase()}
                </span>
                <span className={styles.mobileUserName}>{usuarioActual.nombre}</span>
              </div>
              
              {/* Mi perfil en móvil - botón con redirección */}
              <button onClick={irAlPerfil} className={styles.mobileLink} style={{ width: '100%', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <circle cx="10" cy="7" r="3.5"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
                </svg>
                Mi perfil
              </button>
              
              {/* Mis emprendimientos (solo para emprendedores) */}
              {puedeVerEmprendimientos && (
                <Link href="/mis-emprendimientos" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <rect x="2" y="4" width="16" height="13" rx="2"/>
                    <path d="M2 7l8 5 8-5"/>
                  </svg>
                  Mis emprendimientos
                </Link>
              )}
              
              {/* Mis pedidos (solo para NO administradores) */}
              {puedeVerPedidos && (
                <Link href="/mis-pedidos" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  </svg>
                  Mis pedidos
                </Link>
              )}
              
              <button onClick={cerrarSesion} className={styles.mobileLogoutBtn}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M13 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3M8 15l5-5-5-5M13 10H3" strokeLinecap="round"/>
                </svg>
                Cerrar sesión
              </button>
            </>
          ) : (
            // Menú móvil para usuario no logueado
            <>
              <Link href="/autenticacion/login" className={styles.mobileLogin} onClick={() => setMenuOpen(false)}>
                Ingresar
              </Link>
              <Link href="/autenticacion/registro" className={styles.mobileRegister} onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
          
          {/* 🔥 Botón "Publicar emprendimiento" en móvil - Aparece si NO hay usuario logueado O es EMPRENDEDOR */}
          {mostrarBotonPublicar && (
            <Link href="/miemprendimiento" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
              Publicar emprendimiento →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}