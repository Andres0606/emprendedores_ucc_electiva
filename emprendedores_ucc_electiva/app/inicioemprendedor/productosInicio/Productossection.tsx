"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../css/inicioemprendedor/ProductosSection.module.css";

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

export default function ProductosSection() {
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoProducto, setEditandoProducto] = useState<number | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    nombre: "",
    precio: 0,
    stock: 0,
    imagen: ""
  });

  useEffect(() => {
    const cargarEmprendimientos = async () => {
      try {
        setCargando(true);
        
        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (!usuarioGuardado) {
          setError("No hay usuario logueado");
          setCargando(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const usuarioId = usuario.id || usuario._id;

        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/usuario/${usuarioId}`);
        
        if (!respuesta.ok) {
          throw new Error("Error al cargar emprendimientos");
        }

        const data = await respuesta.json();
        setEmprendimientos(data);
        
        if (data.length > 0) {
          setEmprendimientoSeleccionado(data[0].id || data[0]._id);
        }
        
      } catch (error) {
        console.error("Error:", error);
        setError("No se pudieron cargar los emprendimientos");
      } finally {
        setCargando(false);
      }
    };
    
    cargarEmprendimientos();
  }, []);

  const emprendimientoActual = emprendimientos.find(
    emp => (emp.id || emp._id) === emprendimientoSeleccionado
  );

  const productos = emprendimientoActual?.productos || [];

  const actualizarProductos = async (nuevosProductos: Producto[]) => {
    if (!emprendimientoActual) return false;
    
    try {
      const emprendimientoId = emprendimientoActual.id || emprendimientoActual._id;
      
      const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${emprendimientoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...emprendimientoActual,
          productos: nuevosProductos
        })
      });
      
      if (!respuesta.ok) {
        throw new Error("Error al actualizar productos");
      }
      
      const actualizado = await respuesta.json();
      
      setEmprendimientos(prev => 
        prev.map(emp => 
          (emp.id || emp._id) === emprendimientoId ? actualizado : emp
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo actualizar los productos");
      return false;
    }
  };

  const agregarProducto = async () => {
    if (!nuevoProducto.nombre?.trim()) {
      alert("Por favor ingresa el nombre del producto");
      return;
    }
    
    if (!nuevoProducto.precio || nuevoProducto.precio <= 0) {
      alert("Por favor ingresa un precio válido");
      return;
    }
    
    const nuevoProductoCompleto: Producto = {
      nombre: nuevoProducto.nombre,
      precio: nuevoProducto.precio,
      stock: nuevoProducto.stock || 0,
      imagen: nuevoProducto.imagen || ""
    };
    
    const nuevosProductos = [...productos, nuevoProductoCompleto];
    const exito = await actualizarProductos(nuevosProductos);
    
    if (exito) {
      setNuevoProducto({ nombre: "", precio: 0, stock: 0, imagen: "" });
      alert("✅ Producto agregado correctamente");
    }
  };

  const editarProducto = async (index: number, productoEditado: Producto) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = productoEditado;
    const exito = await actualizarProductos(nuevosProductos);
    
    if (exito) {
      setEditandoProducto(null);
      alert("✅ Producto actualizado correctamente");
    }
  };

  const eliminarProducto = async (index: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      const nuevosProductos = productos.filter((_, i) => i !== index);
      const exito = await actualizarProductos(nuevosProductos);
      
      if (exito) {
        alert("✅ Producto eliminado correctamente");
      }
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis productos</h1>
            <p className={styles.welcomeDesc}>Cargando tus productos...</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis productos</h1>
            <p className={styles.welcomeDesc}>Error al cargar la información</p>
          </div>
        </div>
        <div className={styles.card}>
          <p style={{ color: "#dc2626" }}>❌ {error}</p>
          <button onClick={() => window.location.reload()} className={styles.btnReintentar}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (emprendimientos.length === 0) {
    return (
      <div className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Mis productos</h1>
            <p className={styles.welcomeDesc}>No tienes emprendimientos creados</p>
          </div>
        </div>
        <div className={styles.card}>
          <p>Primero crea un emprendimiento para agregar productos</p>
          <button 
            onClick={() => window.location.href = "/inicioemprendedor?tab=emprendimiento"}
            className={styles.btnCrearEmprendimiento}
          >
            Crear emprendimiento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Mis productos</h1>
          <p className={styles.welcomeDesc}>
            {productos.length} {productos.length === 1 ? 'producto' : 'productos'} en tu catálogo
          </p>
        </div>
        <Link 
  href={`/inicioemprendedor/crearProducto/${emprendimientoSeleccionado}`} 
  className={styles.topbarCta}
>
  + Agregar producto
</Link>
      </div>

      {/* Selector de emprendimiento (solo si tiene más de uno) */}
      {emprendimientos.length > 1 && (
        <div className={styles.selectorEmprendimiento}>
          <label>Emprendimiento:</label>
          <select 
            value={emprendimientoSeleccionado || ""}
            onChange={(e) => setEmprendimientoSeleccionado(e.target.value)}
            className={styles.select}
          >
            {emprendimientos.map(emp => (
              <option key={emp.id || emp._id} value={emp.id || emp._id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {productos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📦</span>
          <h3>No tienes productos</h3>
          <p>Agrega tu primer producto usando el botón "+ Agregar producto"</p>
        </div>
      ) : (
        <div className={styles.prodTable}>
          <div className={styles.prodTableHead}>
            <span>Producto</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Acciones</span>
          </div>
          
          {productos.map((producto, index) => (
            <div key={index} className={styles.prodTableRow}>
              {editandoProducto === index ? (
                // Modo edición
                <div className={styles.editFormInline}>
                  <input
                    type="text"
                    value={producto.nombre}
                    onChange={(e) => {
                      const nuevos = [...productos];
                      nuevos[index].nombre = e.target.value;
                      setEmprendimientos(prev => {
                        const actualizados = [...prev];
                        const empIndex = actualizados.findIndex(e => (e.id || e._id) === emprendimientoSeleccionado);
                        if (empIndex !== -1) {
                          actualizados[empIndex].productos = nuevos;
                        }
                        return actualizados;
                      });
                    }}
                    className={styles.inputSmall}
                  />
                  <input
                    type="number"
                    value={producto.precio}
                    onChange={(e) => {
                      const nuevos = [...productos];
                      nuevos[index].precio = parseInt(e.target.value) || 0;
                      setEmprendimientos(prev => {
                        const actualizados = [...prev];
                        const empIndex = actualizados.findIndex(e => (e.id || e._id) === emprendimientoSeleccionado);
                        if (empIndex !== -1) {
                          actualizados[empIndex].productos = nuevos;
                        }
                        return actualizados;
                      });
                    }}
                    className={styles.inputSmall}
                  />
                  <input
                    type="number"
                    value={producto.stock}
                    onChange={(e) => {
                      const nuevos = [...productos];
                      nuevos[index].stock = parseInt(e.target.value) || 0;
                      setEmprendimientos(prev => {
                        const actualizados = [...prev];
                        const empIndex = actualizados.findIndex(e => (e.id || e._id) === emprendimientoSeleccionado);
                        if (empIndex !== -1) {
                          actualizados[empIndex].productos = nuevos;
                        }
                        return actualizados;
                      });
                    }}
                    className={styles.inputSmall}
                  />
                  <div className={styles.editActionsInline}>
                    <button 
                      onClick={() => editarProducto(index, productos[index])}
                      className={styles.btnGuardarSmall}
                    >
                      💾
                    </button>
                    <button 
                      onClick={() => setEditandoProducto(null)}
                      className={styles.btnCancelarSmall}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <>
                  <div className={styles.prodTableName}>
                    <span className={styles.prodTableEmoji}>
                      {producto.imagen || "📦"}
                    </span>
                    <span>{producto.nombre}</span>
                  </div>
                  <span className={styles.prodTablePrecio}>
                    {formatearPrecio(producto.precio)}
                  </span>
                  <span className={styles.prodTableStock}>
                    {producto.stock} uds.
                  </span>
                  <div className={styles.prodTableActions}>
                    <button 
                      onClick={() => setEditandoProducto(index)}
                      className={styles.prodBtnEdit}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarProducto(index)}
                      className={styles.prodBtnDel}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}