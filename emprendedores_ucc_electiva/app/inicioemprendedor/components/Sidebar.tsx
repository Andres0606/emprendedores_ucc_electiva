"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../css/inicioemprendedor/Sidebar.module.css";

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

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  tipoUsuario: string;
  carrera: string;
  semestre?: string;
}

export default function Sidebar({ seccion, setSeccion, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        // Obtener usuario de sessionStorage
        const usuarioGuardado = sessionStorage.getItem("usuario");
        
        if (!usuarioGuardado) {
          setCargando(false);
          return;
        }

        const usuarioData = JSON.parse(usuarioGuardado);
        const usuarioId = usuarioData.id || usuarioData._id;
        
        if (!usuarioId) {
          setCargando(false);
          return;
        }

        // Obtener datos actualizados del backend
        const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}`);
        }
        
        const usuarioActualizado = await respuesta.json();
        setUsuario(usuarioActualizado);
        
      } catch (error) {
        console.error("Error al cargar usuario en sidebar:", error);
        // Si hay error, intentar usar los datos de sessionStorage
        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } finally {
        setCargando(false);
      }
    };
    
    cargarUsuario();
  }, []);

  // Función para obtener la inicial del nombre
  const obtenerInicial = () => {
    if (!usuario) return "?";
    return usuario.nombre.charAt(0).toUpperCase();
  };

  // Función para obtener el nombre completo
  const obtenerNombreCompleto = () => {
    if (!usuario) return "Usuario";
    return `${usuario.nombre} ${usuario.apellido}`;
  };

  // Función para obtener el rol y semestre/carrera
  const obtenerRolInfo = () => {
    if (!usuario) return "Emprendedor UCC";
    
    const tipo = usuario.tipoUsuario === "estudiante" ? "Emprendedor" : "Emprendedor";
    const carrera = usuario.carrera ? ` · ${usuario.carrera}` : "";
    
    return `${tipo}${carrera}`;
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("usuarioId");
    router.push("/");
  };

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

      {/* Perfil - con datos reales */}
      <div className={styles.sidebarProfile}>
        <div className={styles.sidebarAvatar}>
          {cargando ? "..." : obtenerInicial()}
        </div>
        <div className={styles.sidebarProfileInfo}>
          <span className={styles.sidebarProfileName}>
            {cargando ? "Cargando..." : obtenerNombreCompleto()}
          </span>
          <span className={styles.sidebarProfileRole}>
            {cargando ? "..." : obtenerRolInfo()}
          </span>
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
      <button onClick={cerrarSesion} className={styles.sidebarLogout}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M13 15l4-5-4-5M17 10H7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" strokeLinecap="round" />
        </svg>
        Cerrar sesión
      </button>
    </aside>
  );
}