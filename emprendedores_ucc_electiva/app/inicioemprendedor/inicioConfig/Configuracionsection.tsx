"use client";
import { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/ConfiguracionSection.module.css";
import Link from "next/link";

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
  password?: string;
}

export default function ConfiguracionSection() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    carrera: ""
  });

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setCargando(true);
        
        // Obtener usuario de sessionStorage
        const usuarioGuardado = sessionStorage.getItem("usuario");
        
        if (!usuarioGuardado) {
          setError("No hay usuario logueado");
          setCargando(false);
          return;
        }

        const usuarioData = JSON.parse(usuarioGuardado);
        const usuarioId = usuarioData.id || usuarioData._id;
        
        if (!usuarioId) {
          setError("ID de usuario no encontrado");
          setCargando(false);
          return;
        }

        // Obtener datos actualizados del backend
        const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
        
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const usuarioActualizado = await respuesta.json();
        setUsuario(usuarioActualizado);
        
        // Inicializar formulario con datos actuales
        setFormData({
          nombre: usuarioActualizado.nombre || "",
          apellido: usuarioActualizado.apellido || "",
          telefono: usuarioActualizado.telefono || "",
          carrera: usuarioActualizado.carrera || ""
        });
        
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        setError("No se pudo cargar la información del usuario");
      } finally {
        setCargando(false);
      }
    };
    
    cargarUsuario();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarCambios = async () => {
    try {
      const usuarioId = usuario?.id || usuario?._id;
      
      if (!usuarioId) {
        alert("Error: No se encontró el ID del usuario");
        return;
      }
      
      const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...usuario,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          carrera: formData.carrera
        })
      });
      
      if (!respuesta.ok) {
        throw new Error("Error al actualizar el perfil");
      }
      
      const usuarioActualizado = await respuesta.json();
      setUsuario(usuarioActualizado);
      
      // Actualizar sessionStorage
      sessionStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      
      setEditando(false);
      alert("Perfil actualizado correctamente");
      
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("No se pudo actualizar el perfil. Por favor, intenta de nuevo.");
    }
  };

  // Función para obtener la inicial del nombre
  const obtenerInicial = () => {
    if (!usuario) return "?";
    return usuario.nombre.charAt(0).toUpperCase();
  };

  // Estado de carga
  if (cargando) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Configuración</h1>
            <p className={styles.welcomeDesc}>Cargando tu información...</p>
          </div>
        </div>
        <div className={styles.configCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Configuración</h1>
            <p className={styles.welcomeDesc}>Error al cargar la información</p>
          </div>
        </div>
        <div className={styles.configCard}>
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

  // Si no hay usuario
  if (!usuario) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Configuración</h1>
            <p className={styles.welcomeDesc}>No se encontró información del usuario</p>
          </div>
        </div>
        <div className={styles.configCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Por favor, inicia sesión nuevamente</p>
            <Link href="/autenticacion/login" style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#8DC63F",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem"
            }}>
              Ir a login
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
          <h1 className={styles.welcomeTitle}>Configuración</h1>
          <p className={styles.welcomeDesc}>Gestiona tu cuenta y preferencias.</p>
        </div>
      </div>

      <div className={styles.configCard}>
        <div className={styles.configAvatar}>{obtenerInicial()}</div>

        {!editando ? (
          // Modo visualización
          <>
            <div className={styles.configFields}>
              <div className={styles.configField}>
                <label className={styles.editLabel}>Nombre</label>
                <div className={styles.editValue}>{usuario.nombre}</div>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Apellido</label>
                <div className={styles.editValue}>{usuario.apellido}</div>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Correo</label>
                <div className={styles.editValue}>{usuario.correo}</div>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Teléfono</label>
                <div className={styles.editValue}>{usuario.telefono || "No registrado"}</div>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Tipo de usuario</label>
                <div className={styles.editValue}>
                  {usuario.tipoUsuario === "estudiante" ? "Estudiante" : "Docente"}
                </div>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Carrera / Programa</label>
                <div className={styles.editValue}>{usuario.carrera || "No registrada"}</div>
              </div>
            </div>
            
            <button 
              className={styles.btnEditar} 
              onClick={() => setEditando(true)}
              style={{ alignSelf: "flex-start" }}
            >
              ✏️ Editar perfil
            </button>
          </>
        ) : (
          // Modo edición
          <>
            <div className={styles.configFields}>
              <div className={styles.configField}>
                <label className={styles.editLabel}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Tu nombre"
                />
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Tu apellido"
                />
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Correo</label>
                <div className={styles.editValue} style={{ color: "#6b7280" }}>
                  {usuario.correo}
                </div>
                <small style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  El correo no se puede editar
                </small>
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Tu teléfono"
                />
              </div>
              
              <div className={styles.configField}>
                <label className={styles.editLabel}>Carrera / Programa</label>
                <input
                  type="text"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Tu carrera"
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                className={styles.btnGuardar} 
                onClick={guardarCambios}
              >
                💾 Guardar cambios
              </button>
              <button 
                className={styles.btnCancelar} 
                onClick={() => {
                  setEditando(false);
                  // Restaurar datos originales
                  setFormData({
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    telefono: usuario.telefono,
                    carrera: usuario.carrera
                  });
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}