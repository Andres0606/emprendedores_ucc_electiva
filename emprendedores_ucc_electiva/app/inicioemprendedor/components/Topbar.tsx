"use client";
import Link from "next/link";
import styles from "../../css/inicioemprendedor/Topbar.module.css";

const navItems = [
  { icon: "🏠", label: "Dashboard",         id: "dashboard"      },
  { icon: "📊", label: "Mi emprendimiento", id: "emprendimiento" },
  { icon: "📦", label: "Productos",          id: "productos"      },
  { icon: "⚙️", label: "Configuración",     id: "config"         },
];

interface TopbarProps {
  seccion: string;
  setSidebarOpen: (open: boolean) => void;
}

export default function Topbar({ seccion, setSidebarOpen }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      <button
        className={styles.menuBtn}
        onClick={() => setSidebarOpen(true)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>

      <div className={styles.topbarTitle}>
        {navItems.find((n) => n.id === seccion)?.label}
      </div>

      <Link href="/miemprendimiento" className={styles.topbarCta}>
        + Nuevo emprendimiento
      </Link>
    </div>
  );
}