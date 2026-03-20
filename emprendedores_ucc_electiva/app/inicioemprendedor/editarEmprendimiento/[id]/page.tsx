"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../../../css/inicioemprendedor/EditarEmprendimiento.module.css";

// Mapeo de categorías (debe coincidir con el de EmprendimientoSection)
const categoriasLista = [
  { id: "69adb8d5781c765dca3ab5f0", nombre: "Tecnología", emoji: "💻" },
  { id: "69adb8d5781c765dca3ab5f1", nombre: "Alimentos", emoji: "🥗" },
  { id: "69adb8d5781c765dca3ab5f2", nombre: "Moda", emoji: "👕" },
  { id: "69adb8d5781c765dca3ab5f3", nombre: "Artesanías", emoji: "🎨" },
  { id: "69adb8d5781c765dca3ab5f4", nombre: "Servicios", emoji: "🔧" },
];

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

export default function EditarEmprendimientoPage() {
  const router = useRouter();
  const params = useParams();
  const emprendimientoId = params?.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    imagenes: [] as string[]
  });

  useEffect(() => {
    const cargarEmprendimiento = async () => {
      try {
        setCargando(true);
        
        // Verificar que hay usuario logueado
        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (!usuarioGuardado) {
          router.push("/autenticacion/login");
          return;
        }

        // Obtener datos del emprendimiento
        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}`);
        
        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el emprendimiento");
        }
        
        const emprendimiento: Emprendimiento = await respuesta.json();
        
        // Verificar que el usuario es el dueño
        const usuario = JSON.parse(usuarioGuardado);
        const usuarioId = usuario.id || usuario._id;
        
        if (emprendimiento.usuarioId !== usuarioId) {
          alert("No tienes permiso para editar este emprendimiento");
          router.push("/inicioemprendedor");
          return;
        }
        
        // Llenar formulario
        setFormData({
          nombre: emprendimiento.nombre,
          descripcion: emprendimiento.descripcion,
          categoriaId: emprendimiento.categoriaId,
          imagenes: emprendimiento.imagenes || []
        });
        
      } catch (error) {
        console.error("Error:", error);
        setError("No se pudo cargar el emprendimiento");
      } finally {
        setCargando(false);
      }
    };
    
    if (emprendimientoId) {
      cargarEmprendimiento();
    }
  }, [emprendimientoId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Por ahora solo permitimos URLs de imágenes
    const urls = e.target.value.split(',').map(url => url.trim());
    setFormData(prev => ({
      ...prev,
      imagenes: urls
    }));
  };

  const guardarCambios = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa el nombre del emprendimiento");
      return;
    }
    
    if (!formData.descripcion.trim()) {
      alert("Por favor ingresa una descripción");
      return;
    }
    
    if (!formData.categoriaId) {
      alert("Por favor selecciona una categoría");
      return;
    }
    
    try {
      setGuardando(true);
      
      // Obtener usuario actual
      const usuarioGuardado = sessionStorage.getItem("usuario");
      if (!usuarioGuardado) {
        alert("No hay usuario logueado");
        return;
      }
      
      const usuario = JSON.parse(usuarioGuardado);
      const usuarioId = usuario.id || usuario._id;
      
      // Preparar datos para actualizar
      const datosActualizar = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: formData.categoriaId,
        usuarioId: usuarioId,
        imagenes: formData.imagenes,
        estado: "activo", // Mantener el estado actual
        productos: [] // Los productos se editan aparte
      };
      
      const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizar)
      });
      
      if (!respuesta.ok) {
        const errorData = await respuesta.text();
        throw new Error(errorData || "Error al actualizar");
      }
      
      const emprendimientoActualizado = await respuesta.json();
      console.log("Emprendimiento actualizado:", emprendimientoActualizado);
      
      alert("✅ Emprendimiento actualizado correctamente");
      router.push("/inicioemprendedor");
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ No se pudo actualizar el emprendimiento. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className={styles.spinner}></div>
            <p>Cargando emprendimiento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div style={{ textAlign: "center", padding: "3rem", color: "#dc2626" }}>
            <p>❌ {error}</p>
            <Link href="/inicioemprendedor" className={styles.btnVolver}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <Link href="/inicioemprendedor" className={styles.backButton}>
            ← Volver
          </Link>
          <h1 className={styles.title}>Editar emprendimiento</h1>
          <p className={styles.subtitle}>Actualiza la información de tu emprendimiento</p>
        </div>

        <div className={styles.form}>
          {/* Nombre */}
          <div className={styles.field}>
            <label className={styles.label}>Nombre del emprendimiento *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: EcoTech Soluciones"
              className={styles.input}
            />
          </div>

          {/* Categoría */}
          <div className={styles.field}>
            <label className={styles.label}>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="">Selecciona una categoría</option>
              {categoriasLista.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className={styles.field}>
            <label className={styles.label}>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe tu emprendimiento, qué ofreces, cuál es tu misión..."
              rows={5}
              className={styles.textarea}
            />
          </div>

          {/* Imágenes (URLs) */}
          <div className={styles.field}>
            <label className={styles.label}>Imágenes (URLs)</label>
            <input
              type="text"
              name="imagenes"
              value={formData.imagenes.join(', ')}
              onChange={handleImagenChange}
              placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
              className={styles.input}
            />
            <small className={styles.helperText}>
              Separa las URLs con comas. Puedes subir imágenes a servicios como Imgur o Cloudinary.
            </small>
          </div>

          {/* Vista previa de imágenes */}
          {formData.imagenes.length > 0 && formData.imagenes[0] && (
            <div className={styles.field}>
              <label className={styles.label}>Vista previa</label>
              <div className={styles.imagePreview}>
                {formData.imagenes.map((img, index) => (
                  img && (
                    <div key={index} className={styles.imageItem}>
                      <img src={img} alt={`Imagen ${index + 1}`} />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className={styles.actions}>
            <button
              onClick={guardarCambios}
              disabled={guardando}
              className={styles.btnGuardar}
            >
              {guardando ? "Guardando..." : "💾 Guardar cambios"}
            </button>
            <Link href="/inicioemprendedor" className={styles.btnCancelar}>
              Cancelar
            </Link>
          </div>

          <div className={styles.infoBox}>
            <p>💡 <strong>Nota:</strong> Los productos se editan desde la sección "Productos".</p>
          </div>
        </div>
      </div>
    </div>
  );
}