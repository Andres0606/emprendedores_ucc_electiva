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
}

interface EmprendimientoSectionProps {
  estadoEmp: "activo" | "pausado";
  setEstadoEmp: (estado: "activo" | "pausado") => void;
}

// Mapeo de categorías
const categorias: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "Tecnología",
  "69adb8d5781c765dca3ab5f1": "Alimentos",
  "69adb8d5781c765dca3ab5f2": "Moda",
  "69adb8d5781c765dca3ab5f3": "Artesanías",
  "69adb8d5781c765dca3ab5f4": "Servicios",
};

// Emojis por categoría
const emojisPorCategoria: Record<string, string> = {
  "69adb8d5781c765dca3ab5f0": "💻",
  "69adb8d5781c765dca3ab5f1": "🥗",
  "69adb8d5781c765dca3ab5f2": "👕",
  "69adb8d5781c765dca3ab5f3": "🎨",
  "69adb8d5781c765dca3ab5f4": "🔧",
};

export default function EmprendimientoSection({ estadoEmp, setEstadoEmp }: EmprendimientoSectionProps) {
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState<string | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    const obtenerEmprendimientos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Obtener el usuario de sessionStorage
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

        // Hacer la petición al backend
        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/usuario/${usuarioId}`);
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        const emprendimientosData = await respuesta.json();
        console.log("Emprendimientos encontrados:", emprendimientosData);
        
        setEmprendimientos(emprendimientosData);
        
        // Si hay emprendimientos, seleccionar el primero por defecto
        if (emprendimientosData.length > 0) {
          setEmprendimientoSeleccionado(emprendimientosData[0].id || emprendimientosData[0]._id);
          setEstadoEmp(emprendimientosData[0].estado as "activo" | "pausado");
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
      
      // Actualizar la lista de emprendimientos
      setEmprendimientos(prevEmprendimientos => 
        prevEmprendimientos.map(emp => 
          (emp.id || emp._id) === emprendimientoId ? emprendimientoActualizado : emp
        )
      );

      // Si el emprendimiento actualizado es el seleccionado, actualizar el estado global
      if (emprendimientoSeleccionado === emprendimientoId) {
        setEstadoEmp(emprendimientoActualizado.estado);
      }
      
      alert(`Emprendimiento ${emprendimientoActualizado.estado === "activo" ? "activado" : "pausado"} correctamente`);
      
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado. Por favor, intenta de nuevo.");
    } finally {
      setActualizandoEstado(false);
    }
  };

  // Función para seleccionar un emprendimiento
  const seleccionarEmprendimiento = (emprendimientoId: string, estado: string) => {
    setEmprendimientoSeleccionado(emprendimientoId);
    setEstadoEmp(estado as "activo" | "pausado");
  };

  // Obtener el emprendimiento seleccionado
  const emprendimientoActual = emprendimientos.find(
    emp => (emp.id || emp._id) === emprendimientoSeleccionado
  );

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
              href="/crear-emprendimiento" 
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
                backgroundColor: emp.estado === "activo" ? "#10b981" : "#9ca3af",
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
                <span className={`${styles.estadoBadge} ${estadoEmp === "activo" ? styles.estadoActivo : styles.estadoPausado}`}>
                  ● {estadoEmp === "activo" ? "Activo" : "Pausado"}
                </span>
              </div>
            </div>
            
            <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.editLabel}>Descripción</label>
              <div className={styles.editValue}>{emprendimientoActual.descripcion}</div>
            </div>

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
            <Link 
              href={`/inicioemprendedor/editarEmprendimiento/${emprendimientoActual.id || emprendimientoActual._id}`} 
              className={styles.btnEditar}
            >
              ✏️ Editar este emprendimiento
            </Link>
            
            <button
              className={`${styles.btnEstado} ${estadoEmp === "activo" ? styles.btnPausar : styles.btnActivar}`}
              onClick={() => cambiarEstado(
                emprendimientoActual.id || emprendimientoActual._id!, 
                emprendimientoActual.estado
              )}
              disabled={actualizandoEstado}
            >
              {actualizandoEstado ? (
                "⏳ Procesando..."
              ) : (
                estadoEmp === "activo" ? "⏸ Pausar este emprendimiento" : "▶ Activar este emprendimiento"
              )}
            </button>
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