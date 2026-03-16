"use client";
import Link from "next/link";
import styles from "../../css/inicioemprendedor/page.module.css";

interface NavItem {
  icon: string;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: "🏠", label: "Dashboard",         id: "dashboard"      },
  { icon: "📊", label: "Mi emprendimiento", id: "emprendimiento" },
  { icon: "📦", label: "Productos",          id: "productos"      },
  { icon: "⚙️", label: "Configuración",     id: "config"         },
];

interface SidebarProps {
  seccion: string;
  setSeccion: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ seccion, setSeccion, sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarBg} aria-hidden />

      {/* Logo */}
      <Link href="/" className={styles.sidebarLogo}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect width="34" height="34" rx="9" fill="rgba(255,255,255,0.12)" />
          <rect x="4" y="4" width="9" height="17" rx="2.5" fill="#fff" />
          <rect x="4" y="15" width="9" height="5" rx="2" fill="rgba(255,255,255,0.5)" />
          <rect x="15" y="4" width="9" height="17" rx="2.5" fill="#8DC63F" />
          <circle cx="28" cy="8" r="4" fill="none" stroke="#8DC63F" strokeWidth="1.8" />
          <circle cx="28" cy="8" r="1.5" fill="#fff" />
        </svg>
        <span className={styles.sidebarLogoText}>EmprendedoresUCC</span>
      </Link>

      {/* Perfil */}
      <div className={styles.sidebarProfile}>
        <div className={styles.sidebarAvatar}>C</div>
        <div className={styles.sidebarProfileInfo}>
          <span className={styles.sidebarProfileName}>Carlos Muñoz</span>
          <span className={styles.sidebarProfileRole}>Emprendedor · Sem. 7°</span>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${seccion === item.id ? styles.navItemActive : ""}`}
            onClick={() => {
              setSeccion(item.id);
              setSidebarOpen(false);
            }}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <Link href="/" className={styles.sidebarLogout}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M13 15l4-5-4-5M17 10H7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" strokeLinecap="round" />
        </svg>
        Cerrar sesión
      </Link>
    </aside>
  );
}