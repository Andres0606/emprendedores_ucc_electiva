// Emprendimientosection.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/EmprendimientoSection.module.css";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  imagenes: string[];
  productos: any[];
  telefono?: string;
}

interface EmprendimientoSectionProps {
  estadoEmp: "activo" | "pausado" | "pendiente" | "rechazado";
  setEstadoEmp: (estado: "activo" | "pausado" | "pendiente" | "rechazado") => void;
}

// Mapeo de categorías - ACTUALIZADO con los IDs reales de MongoDB
const categorias: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "Tecnología",
  "69bf25148374500218c043ee": "Gastronomía",
  "69bf25148374500218c043ef": "Moda y Diseño",
  "69bf25148374500218c043f0": "Salud y Bienestar",
  "69bf25148374500218c043f1": "Arte y Cultura",
  "69bf25148374500218c043f2": "Servicios",
  "69adb8da781c765dca3ab5f2": "Comida",
};

// Emojis por categoría
const emojisPorCategoria: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "💻",
  "69bf25148374500218c043ee": "🍽️",
  "69bf25148374500218c043ef": "👗",
  "69bf25148374500218c043f0": "🧘",
  "69bf25148374500218c043f1": "🎨",
  "69bf25148374500218c043f2": "🛠️",
  "69adb8da781c765dca3ab5f2": "🍔",
};

// Configuración de estados con colores y mensajes (sin el mensaje de pausado)
const estadoConfig: Record<string, { color: string; bg: string; icon: string; mensaje: string }> = {
  activo: {
    color: "#10b981",
    bg: "#d1fae5",
    icon: "✅",
    mensaje: "Tu emprendimiento está activo y visible para toda la comunidad"
  },
  pausado: {
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "⏸️",
    mensaje: "" // Mensaje vacío
  },
  pendiente: {
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "⏳",
    mensaje: "Tu emprendimiento está en revisión. Un administrador lo evaluará pronto"
  },
  rechazado: {
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "❌",
    mensaje: "Tu emprendimiento fue rechazado. Por favor, revisa los comentarios del administrador"
  }
};

export default function EmprendimientoSection({ estadoEmp, setEstadoEmp }: EmprendimientoSectionProps) {
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState<string | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState<string | null>(null);

  useEffect(() => {
    const obtenerEmprendimientos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const usuarioGuardado = sessionStorage.getItem("usuario");
        
        if (!usuarioGuardado) {
          setError("No hay usuario logueado");
          setCargando(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const usuarioId = usuario.id || usuario._id;

        if (!usuarioId) {
          setError("ID de usuario no encontrado");
          setCargando(false);
          return;
        }

        console.log("Buscando emprendimientos para usuario:", usuarioId);

        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/usuario/${usuarioId}`);
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        const emprendimientosData = await respuesta.json();
        console.log("Emprendimientos encontrados:", emprendimientosData);
        
        setEmprendimientos(emprendimientosData);
        
        // Verificar si algún emprendimiento fue rechazado para mostrar motivo
        const rechazado = emprendimientosData.find((emp: Emprendimiento) => emp.estado === "rechazado");
        if (rechazado) {
          setMotivoRechazo("Tu emprendimiento no cumple con las políticas de la plataforma. Por favor, contáctanos para más información.");
        }
        
        if (emprendimientosData.length > 0) {
          setEmprendimientoSeleccionado(emprendimientosData[0].id || emprendimientosData[0]._id);
          setEstadoEmp(emprendimientosData[0].estado as "activo" | "pausado" | "pendiente" | "rechazado");
        }

      } catch (error) {
        console.error("Error detallado:", error);
        setError("Error al cargar los emprendimientos. Por favor, intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    obtenerEmprendimientos();
  }, [setEstadoEmp]);

  // Función para cambiar el estado de un emprendimiento específico
  const cambiarEstado = async (emprendimientoId: string, estadoActual: string) => {
    // Solo permitir cambiar entre activo y pausado
    if (estadoActual === "pendiente") {
      alert("⏳ No puedes modificar un emprendimiento que está en revisión. Espera la aprobación del administrador.");
      return;
    }
    
    if (estadoActual === "rechazado") {
      alert("❌ Tu emprendimiento fue rechazado. Por favor, contáctanos para más información.");
      return;
    }
    
    const nuevoEstado = estadoActual === "activo" ? "pausado" : "activo";
    
    try {
      setActualizandoEstado(true);
      
      const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.text();
        throw new Error(errorData || "Error al actualizar el estado");
      }

      const emprendimientoActualizado = await respuesta.json();
      
      setEmprendimientos(prevEmprendimientos => 
        prevEmprendimientos.map(emp => 
          (emp.id || emp._id) === emprendimientoId ? emprendimientoActualizado : emp
        )
      );

      if (emprendimientoSeleccionado === emprendimientoId) {
        setEstadoEmp(emprendimientoActualizado.estado);
      }
      
      alert(`✅ Emprendimiento ${emprendimientoActualizado.estado === "activo" ? "activado" : "pausado"} correctamente`);
      
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("❌ No se pudo actualizar el estado. Por favor, intenta de nuevo.");
    } finally {
      setActualizandoEstado(false);
    }
  };

  // Función para seleccionar un emprendimiento
  const seleccionarEmprendimiento = (emprendimientoId: string, estado: string) => {
    setEmprendimientoSeleccionado(emprendimientoId);
    setEstadoEmp(estado as "activo" | "pausado" | "pendiente" | "rechazado");
    
    // Limpiar motivo de rechazo si el emprendimiento seleccionado no está rechazado
    if (estado !== "rechazado") {
      setMotivoRechazo(null);
    }
  };

  // Obtener el emprendimiento seleccionado
  const emprendimientoActual = emprendimientos.find(
    emp => (emp.id || emp._id) === emprendimientoSeleccionado
  );

  // Función para obtener el badge del estado
  const getEstadoBadge = (estado: string) => {
    const config = estadoConfig[estado] || estadoConfig.pendiente;
    return (
      <span className={`${styles.estadoBadge} ${styles[`estado${estado.charAt(0).toUpperCase() + estado.slice(1)}`]}`}
        style={{ backgroundColor: config.bg, color: config.color }}>
        {config.icon} {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  // Si está cargando
  if (cargando) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis emprendimientos</h1>
            <p className={styles.welcomeDesc}>Cargando tus emprendimientos...</p>
          </div>
        </div>
        <div className={styles.editCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error
  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis emprendimientos</h1>
            <p className={styles.welcomeDesc}>Error al cargar la información</p>
          </div>
        </div>
        <div className={styles.editCard}>
          <div style={{ textAlign: "center", padding: "2rem", color: "#dc2626" }}>
            <p>❌ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer"
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay emprendimientos
  if (emprendimientos.length === 0) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis emprendimientos</h1>
            <p className={styles.welcomeDesc}>Aún no tienes emprendimientos creados</p>
          </div>
        </div>
        <div className={styles.editCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</p>
            <h3 style={{ marginBottom: "1rem", color: "#1f2937" }}>¡Comienza tu aventura emprendedora!</h3>
            <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
              Crea tu primer emprendimiento y empieza a vender tus productos
            </p>
            <Link 
              href="/miemprendimiento" 
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#8DC63F",
                color: "white",
                textDecoration: "none",
                borderRadius: "0.5rem",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7ab32e"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8DC63F"}
            >
              ✨ Crear mi emprendimiento
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Mis emprendimientos</h1>
          <p className={styles.welcomeDesc}>
            Tienes {emprendimientos.length} {emprendimientos.length === 1 ? 'emprendimiento' : 'emprendimientos'}
          </p>
        </div>
      </div>

      {/* Selector de emprendimientos */}
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        {emprendimientos.map((emp) => {
          const empId = emp.id || emp._id;
          const isSelected = emprendimientoSeleccionado === empId;
          const emoji = emojisPorCategoria[emp.categoriaId] || "🚀";
          const estadoInfo = estadoConfig[emp.estado] || estadoConfig.pendiente;
          
          return (
            <button
              key={empId}
              onClick={() => seleccionarEmprendimiento(empId!, emp.estado)}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: isSelected ? "#8DC63F" : "#f3f4f6",
                color: isSelected ? "white" : "#374151",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: isSelected ? "500" : "normal",
                transition: "all 0.2s"
              }}
            >
              <span>{emoji}</span>
              <span>{emp.nombre}</span>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: estadoInfo.color,
                marginLeft: "0.25rem"
              }} />
            </button>
          );
        })}
      </div>

      {/* Detalle del emprendimiento seleccionado */}
      {emprendimientoActual && (
        <div className={styles.editCard}>
          <div className={styles.editEmoji}>
            {emojisPorCategoria[emprendimientoActual.categoriaId] || "🚀"}
          </div>

          <div className={styles.editFields}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Nombre</label>
              <div className={styles.editValue}>{emprendimientoActual.nombre}</div>
            </div>
            
            <div className={styles.editField}>
              <label className={styles.editLabel}>Categoría</label>
              <div className={styles.editValue}>
                {categorias[emprendimientoActual.categoriaId] || "Sin categoría"}
              </div>
            </div>
            
            <div className={styles.editField}>
              <label className={styles.editLabel}>Estado</label>
              <div className={styles.editValue}>
                {getEstadoBadge(estadoEmp)}
              </div>
            </div>

            {/* Mensaje de estado - solo mostrar si no está vacío */}
            {estadoConfig[estadoEmp]?.mensaje && (
              <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: estadoConfig[estadoEmp]?.bg || "#f3f4f6",
                  borderRadius: "0.5rem",
                  color: estadoConfig[estadoEmp]?.color || "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  {estadoConfig[estadoEmp]?.icon} {estadoConfig[estadoEmp]?.mensaje}
                </div>
              </div>
            )}

            {/* Mostrar motivo de rechazo si aplica */}
            {estadoEmp === "rechazado" && motivoRechazo && (
              <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.editLabel}>Motivo del rechazo</label>
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "#fee2e2",
                  borderRadius: "0.5rem",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  borderLeft: "3px solid #dc2626"
                }}>
                  {motivoRechazo}
                </div>
              </div>
            )}
            
            <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.editLabel}>Descripción</label>
              <div className={styles.editValue}>{emprendimientoActual.descripcion}</div>
            </div>

            {/* Teléfono de contacto */}
            {emprendimientoActual.telefono && (
              <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.editLabel}>Teléfono de contacto</label>
                <div className={styles.editValue}>{emprendimientoActual.telefono}</div>
              </div>
            )}

            {emprendimientoActual.imagenes && emprendimientoActual.imagenes.length > 0 && (
              <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.editLabel}>Imágenes</label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  {emprendimientoActual.imagenes.map((img: string, index: number) => (
                    <div key={index} style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb"
                    }}>
                      {img ? (
                        <img 
                          src={img} 
                          alt={`Imagen ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/placeholder.png";
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem"
                        }}>
                          📷
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.editActions}>
            {/* Solo permitir editar si no está rechazado */}
            {estadoEmp !== "rechazado" && (
              <Link 
                href={`/inicioemprendedor/editarEmprendimiento/${emprendimientoActual.id || emprendimientoActual._id}`} 
                className={styles.btnEditar}
              >
                ✏️ Editar este emprendimiento
              </Link>
            )}          
          </div>

          <div style={{ 
            marginTop: "1rem", 
            padding: "0.75rem", 
            backgroundColor: "#f3f4f6", 
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
            textAlign: "center"
          }}>
            <p>📊 Total de productos: {emprendimientoActual.productos?.length || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}