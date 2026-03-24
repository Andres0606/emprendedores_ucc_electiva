"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/inicioAdmin/page.module.css";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  telefono?: string;
  imagenes: string[];
  productos: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
  createdAt?: string;
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  carrera: string;
  tipoUsuario: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
}

export default function InicioAdminPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del dashboard
  const [stats, setStats] = useState({
    totalEmprendimientos: 0,
    pendientesAprobacion: 0,
    activos: 0,
    totalUsuarios: 0,
    emprendedores: 0,
    estudiantes: 0,
  });
  
  const [emprendimientosPendientes, setEmprendimientosPendientes] = useState<Emprendimiento[]>([]);
  const [emprendimientosActivos, setEmprendimientosActivos] = useState<Emprendimiento[]>([]);
  const [categorias, setCategorias] = useState<Map<string, string>>(new Map());
  const [usuariosMap, setUsuariosMap] = useState<Map<string, Usuario>>(new Map());
  
  const [activeTab, setActiveTab] = useState<"pendientes" | "activos" | "todos">("pendientes");
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar sesión al cargar
  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    
    if (!usuarioGuardado) {
      router.push("/autenticacion/login");
      return;
    }
    
    const user = JSON.parse(usuarioGuardado);
    
    // Verificar que sea administrador
    if (user.tipoUsuario !== "admin") {
      alert("⚠️ No tienes permisos de administrador");
      router.push("/");
      return;
    }
    
    setUsuario(user);
    cargarDatos();
  }, [router]);

  // Obtener categorías
  const obtenerCategorias = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categorias");
      if (!response.ok) return;
      const data: Categoria[] = await response.json();
      const map = new Map<string, string>();
      data.forEach(cat => {
        const id = cat.id || cat._id;
        if (id) map.set(id, cat.nombre);
      });
      setCategorias(map);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  // Obtener usuarios por ID
  const obtenerUsuario = async (usuarioId: string): Promise<Usuario | null> => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  // Obtener todos los usuarios
  const obtenerTodosUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/usuarios");
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
  };

  // Cargar todos los datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Obtener categorías
      await obtenerCategorias();
      
      // Obtener todos los emprendimientos
      const response = await fetch("http://localhost:8080/api/emprendimientos");
      if (!response.ok) throw new Error("Error al cargar emprendimientos");
      
      const emprendimientos: Emprendimiento[] = await response.json();
      
      // Obtener todos los usuarios
      const usuarios = await obtenerTodosUsuarios();
      const usuariosMapTemp = new Map<string, Usuario>();
      usuarios.forEach((u: Usuario) => {
        const id = u.id || u._id;
        if (id) usuariosMapTemp.set(id, u);
      });
      setUsuariosMap(usuariosMapTemp);
      
      // Calcular estadísticas
      const pendientes = emprendimientos.filter(e => e.estado === "pendiente");
      const activos = emprendimientos.filter(e => e.estado === "activo");
      const emprendedores = usuarios.filter((u: Usuario) => u.tipoUsuario === "emprendedor");
      const estudiantes = usuarios.filter((u: Usuario) => u.tipoUsuario === "estudiante" || u.tipoUsuario === "administrativo");
      
      setStats({
        totalEmprendimientos: emprendimientos.length,
        pendientesAprobacion: pendientes.length,
        activos: activos.length,
        totalUsuarios: usuarios.length,
        emprendedores: emprendedores.length,
        estudiantes: estudiantes.length,
      });
      
      setEmprendimientosPendientes(pendientes);
      setEmprendimientosActivos(activos);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Aprobar emprendimiento
  const aprobarEmprendimiento = async (id: string) => {
    if (!confirm("¿Estás seguro de aprobar este emprendimiento?")) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/emprendimientos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "activo" })
      });
      
      if (response.ok) {
        alert("✅ Emprendimiento aprobado correctamente");
        cargarDatos(); // Recargar datos
      } else {
        alert("❌ Error al aprobar el emprendimiento");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  // Rechazar emprendimiento
  const rechazarEmprendimiento = async (id: string) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/emprendimientos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado" })
      });
      
      if (response.ok) {
        alert(`❌ Emprendimiento rechazado. Motivo: ${motivo}`);
        cargarDatos();
      } else {
        alert("Error al rechazar el emprendimiento");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  // Eliminar emprendimiento
  const eliminarEmprendimiento = async (id: string) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar este emprendimiento? Esta acción no se puede deshacer.")) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/emprendimientos/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        alert("🗑️ Emprendimiento eliminado correctamente");
        cargarDatos();
      } else {
        alert("Error al eliminar el emprendimiento");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  // Filtrar emprendimientos por búsqueda
  const filtrarEmprendimientos = (emprendimientos: Emprendimiento[]) => {
    if (!searchTerm) return emprendimientos;
    return emprendimientos.filter(emp =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Obtener nombre de categoría
  const getNombreCategoria = (categoriaId: string): string => {
    return categorias.get(categoriaId) || "Sin categoría";
  };

  // Obtener nombre del emprendedor
  const getNombreEmprendedor = (usuarioId: string): string => {
    const user = usuariosMap.get(usuarioId);
    return user ? `${user.nombre} ${user.apellido}` : "Usuario no encontrado";
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando panel de administración...</p>
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
          <div className={styles.errorContainer}>
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
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
        
        {/* Header del Admin */}
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.title}>Panel de Administración</h1>
            <p className={styles.subtitle}>
              Bienvenido, {usuario?.nombre} {usuario?.apellido}
            </p>
          </div>
          <div className={styles.adminBadge}>
            <span className={styles.badge}>Administrador</span>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalEmprendimientos}</span>
              <span className={styles.statLabel}>Total emprendimientos</span>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statPending}`}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pendientesAprobacion}</span>
              <span className={styles.statLabel}>Pendientes de aprobación</span>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statActive}`}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.activos}</span>
              <span className={styles.statLabel}>Emprendimientos activos</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalUsuarios}</span>
              <span className={styles.statLabel}>Usuarios registrados</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🚀</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.emprendedores}</span>
              <span className={styles.statLabel}>Emprendedores</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎓</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.estudiantes}</span>
              <span className={styles.statLabel}>Estudiantes</span>
            </div>
          </div>
        </div>

        {/* Sección de gestión de emprendimientos */}
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Emprendimientos</h2>
            
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "pendientes" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("pendientes")}
              >
                Pendientes ({emprendimientosPendientes.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === "activos" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("activos")}
              >
                Activos ({emprendimientosActivos.length})
              </button>
            </div>
            
            {/* Búsqueda */}
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Buscar emprendimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          
          {/* Lista de emprendimientos pendientes */}
          {activeTab === "pendientes" && (
            <div className={styles.venturesList}>
              {filtrarEmprendimientos(emprendimientosPendientes).length === 0 ? (
                <div className={styles.emptyState}>
                  <span>🎉</span>
                  <p>No hay emprendimientos pendientes de aprobación</p>
                </div>
              ) : (
                filtrarEmprendimientos(emprendimientosPendientes).map((emp) => (
                  <div key={emp.id || emp._id} className={styles.ventureCard}>
                    <div className={styles.ventureInfo}>
                      <div className={styles.ventureImage}>
                        {emp.imagenes && emp.imagenes[0] ? (
                          <img src={emp.imagenes[0]} alt={emp.nombre} />
                        ) : (
                          <div className={styles.imagePlaceholder}>📷</div>
                        )}
                      </div>
                      <div className={styles.ventureDetails}>
                        <h3>{emp.nombre}</h3>
                        <p className={styles.ventureDescription}>{emp.descripcion}</p>
                        <div className={styles.ventureMeta}>
                          <span className={styles.ventureCategory}>
                            📁 {getNombreCategoria(emp.categoriaId)}
                          </span>
                          <span className={styles.ventureAuthor}>
                            👤 {getNombreEmprendedor(emp.usuarioId)}
                          </span>
                          <span className={styles.ventureProducts}>
                            📦 {emp.productos?.length || 0} productos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.ventureActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => aprobarEmprendimiento(emp.id || emp._id || "")}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => rechazarEmprendimiento(emp.id || emp._id || "")}
                      >
                        ❌ Rechazar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => eliminarEmprendimiento(emp.id || emp._id || "")}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Lista de emprendimientos activos */}
          {activeTab === "activos" && (
            <div className={styles.venturesList}>
              {filtrarEmprendimientos(emprendimientosActivos).length === 0 ? (
                <div className={styles.emptyState}>
                  <span>📭</span>
                  <p>No hay emprendimientos activos</p>
                </div>
              ) : (
                filtrarEmprendimientos(emprendimientosActivos).map((emp) => (
                  <div key={emp.id || emp._id} className={styles.ventureCard}>
                    <div className={styles.ventureInfo}>
                      <div className={styles.ventureImage}>
                        {emp.imagenes && emp.imagenes[0] ? (
                          <img src={emp.imagenes[0]} alt={emp.nombre} />
                        ) : (
                          <div className={styles.imagePlaceholder}>📷</div>
                        )}
                      </div>
                      <div className={styles.ventureDetails}>
                        <h3>{emp.nombre}</h3>
                        <p className={styles.ventureDescription}>{emp.descripcion}</p>
                        <div className={styles.ventureMeta}>
                          <span className={styles.ventureCategory}>
                            📁 {getNombreCategoria(emp.categoriaId)}
                          </span>
                          <span className={styles.ventureAuthor}>
                            👤 {getNombreEmprendedor(emp.usuarioId)}
                          </span>
                          <span className={styles.ventureProducts}>
                            📦 {emp.productos?.length || 0} productos
                          </span>
                          <span className={styles.ventureStatus}>
                            ✅ Activo
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.ventureActions}>
                      <Link
                        href={`/emprendimientos/${emp.id || emp._id}`}
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                      >
                        👁️ Ver
                      </Link>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => eliminarEmprendimiento(emp.id || emp._id || "")}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className={styles.quickActions}>
          <h3>Acciones rápidas</h3>
          <div className={styles.actionsGrid}>
            <Link href="/usuarios" className={styles.actionCard}>
              <span>👥</span>
              <p>Gestionar usuarios</p>
            </Link>
            <Link href="/categorias" className={styles.actionCard}>
              <span>📁</span>
              <p>Gestionar categorías</p>
            </Link>
            <Link href="/reportes" className={styles.actionCard}>
              <span>📊</span>
              <p>Ver reportes</p>
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}