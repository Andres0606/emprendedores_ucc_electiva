"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../../../css/inicioemprendedor/CrearProducto.module.css";

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  imagenes: string[];
  productos: Producto[];
}

export default function CrearProductoPage() {
  const router = useRouter();
  const params = useParams();
  const emprendimientoId = params?.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    precio: 0,
    stock: 0,
    imagen: ""
  });

  useEffect(() => {
    const cargarEmprendimiento = async () => {
      try {
        setCargando(true);

        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (!usuarioGuardado) {
          router.push("/autenticacion/login");
          return;
        }

        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}`);

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el emprendimiento");
        }

        const data: Emprendimiento = await respuesta.json();

        const usuario = JSON.parse(usuarioGuardado);
        const usuarioId = usuario.id || usuario._id;

        if (data.usuarioId !== usuarioId) {
          alert("No tienes permiso para agregar productos a este emprendimiento");
          router.push("/inicioemprendedor");
          return;
        }

        setEmprendimiento(data);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "precio" || name === "stock" ? parseInt(value) || 0 : value
    }));
  };

  const guardarProducto = async () => {
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa el nombre del producto");
      return;
    }

    if (!formData.precio || formData.precio <= 0) {
      alert("Por favor ingresa un precio válido");
      return;
    }

    try {
      setGuardando(true);

      const nuevoProducto: Producto = {
        nombre: formData.nombre,
        precio: formData.precio,
        stock: formData.stock || 0,
        imagen: formData.imagen || ""
      };

      const productosActualizados = [...(emprendimiento?.productos || []), nuevoProducto];

      const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emprendimiento,
          productos: productosActualizados
        })
      });

      if (!respuesta.ok) {
        throw new Error("Error al agregar el producto");
      }

      alert("✅ Producto agregado correctamente");
      router.push("/inicioemprendedor?tab=productos");

    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ No se pudo agregar el producto. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const formatearPrecioInput = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(valor);
  };

  /* ── Estados de carga / error ── */
  if (cargando) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.spinner} />
          <p style={{ textAlign: "center", color: "#64748b", paddingBottom: "2rem" }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (error || !emprendimiento) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.errorContainer}>
            <p>❌ {error || "Emprendimiento no encontrado"}</p>
            <Link href="/inicioemprendedor" className={styles.btnVolver}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Vista principal ── */
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>

        {/* Header */}
        <div className={styles.header}>
          <Link href="/inicioemprendedor?tab=productos" className={styles.backButton}>
            ← Volver a productos
          </Link>
          <h1 className={styles.title}>Agregar nuevo producto</h1>
          <p className={styles.subtitle}>
            Para: <strong>{emprendimiento.nombre}</strong>
          </p>
        </div>

        <div className={styles.form}>

          {/* Nombre */}
          <div className={styles.field}>
            <label className={styles.label}>Nombre del producto *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Proteína Whey, Camiseta Deportiva…"
              className={styles.input}
              autoFocus
            />
          </div>

          {/* Precio + Stock en la misma fila */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Precio *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio || ""}
                onChange={handleInputChange}
                placeholder="Ej: 80000"
                className={styles.input}
              />
              {formData.precio > 0 && (
                <small className={styles.previewPrice}>
                  {formatearPrecioInput(formData.precio)}
                </small>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Stock disponible</label>
              <input
                type="number"
                name="stock"
                value={formData.stock || ""}
                onChange={handleInputChange}
                placeholder="Cantidad en inventario"
                className={styles.input}
              />
              <small className={styles.helperText}>
                Deja en 0 si es digital o sin límite
              </small>
            </div>
          </div>

          {/* Imagen URL */}
          <div className={styles.field}>
            <label className={styles.label}>Imagen del producto (URL)</label>
            <input
              type="text"
              name="imagen"
              value={formData.imagen}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className={styles.input}
            />
            <small className={styles.helperText}>
              Puedes usar Imgur, Cloudinary o tu propio servidor
            </small>
          </div>

          {/* Vista previa de imagen */}
          {formData.imagen && (
            <div className={styles.field}>
              <label className={styles.label}>Vista previa</label>
              <div className={styles.imagePreview}>
                <img src={formData.imagen} alt="Vista previa del producto" />
              </div>
            </div>
          )}

          {/* Resumen en grid de 3 columnas */}
          <div className={styles.resumenCard}>
            <p className={styles.resumenTitle}>Resumen del producto</p>
            <div className={styles.resumenGrid}>
              <div className={styles.resumenItem}>
                <span className={styles.resumenItemLabel}>Nombre</span>
                <span className={`${styles.resumenItemValue} ${!formData.nombre ? styles.empty : ""}`}>
                  {formData.nombre || "Sin definir"}
                </span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenItemLabel}>Precio</span>
                <span className={`${styles.resumenItemValue} ${formData.precio > 0 ? styles.precio : styles.empty}`}>
                  {formData.precio > 0 ? formatearPrecioInput(formData.precio) : "Sin definir"}
                </span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenItemLabel}>Stock</span>
                <span className={styles.resumenItemValue}>
                  {formData.stock || 0} uds.
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button
              onClick={guardarProducto}
              disabled={guardando}
              className={styles.btnGuardar}
            >
              {guardando ? "Guardando..." : "✅ Agregar producto"}
            </button>
            <Link href="/inicioemprendedor?tab=productos" className={styles.btnCancelar}>
              Cancelar
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}