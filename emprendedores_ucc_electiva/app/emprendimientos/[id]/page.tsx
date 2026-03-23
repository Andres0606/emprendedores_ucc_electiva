"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import styles from "../../css/paginaEmprendimientos/detalle.module.css";

interface Emprendimiento {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  estado: string;
  imagenes: string[];
  telefono?: string;
  productos: Array<{
    nombre: string;
    precio: number;
    stock: number;
    imagen: string;
  }>;
}

interface Usuario {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  carrera: string;
  tipoUsuario: string;
}

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion: string;
}

const categoriaEmoji: Record<string, string> = {
  "Tecnología": "💻",
  "Gastronomía": "🍽️",
  "Comida": "🍔",
  "Moda y Diseño": "👗",
  "Salud y Bienestar": "🧘",
  "Arte y Cultura": "🎨",
  "Servicios": "🛠️",
};

const formatearNumeroWhatsApp = (telefono: string): string => {
  let numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  
  if (!numeroLimpio.startsWith('+')) {
    if (numeroLimpio.startsWith('57')) {
      numeroLimpio = '+' + numeroLimpio;
    } else {
      numeroLimpio = '+57' + numeroLimpio;
    }
  }
  
  return numeroLimpio;
};

export default function DetalleEmprendimientoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  
  const [usuarioActual, setUsuarioActual] = useState<{ id: string; tipoUsuario?: string } | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(false);

  // Obtener usuario logueado
  useEffect(() => {
    console.log("=== VERIFICANDO AUTENTICACIÓN ===");
    console.log("SessionStorage completo:", sessionStorage);
    
    const userStr = sessionStorage.getItem('usuario');
    const userId = sessionStorage.getItem('usuarioId');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    
    console.log("Datos de sessionStorage:");
    console.log("- usuario:", userStr);
    console.log("- usuarioId:", userId);
    console.log("- tipoUsuario:", tipoUsuario);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("Usuario parseado:", user);
        
        const usuarioId = user.id || user._id || userId;
        console.log("ID de usuario obtenido:", usuarioId);
        
        if (usuarioId) {
          setUsuarioActual({ 
            id: usuarioId,
            tipoUsuario: user.tipoUsuario || tipoUsuario || undefined
          });
          console.log("✅ Usuario autenticado:", { id: usuarioId, tipo: user.tipoUsuario });
        } else {
          console.log("❌ Usuario sin ID válido");
          setUsuarioActual(null);
        }
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        setUsuarioActual(null);
      }
    } else {
      console.log("❌ No hay usuario autenticado en sessionStorage");
      setUsuarioActual(null);
    }
  }, []);

  const obtenerCategoria = async (categoriaId: string) => {
    try {
      const respuesta = await fetch(`http://localhost:8080/api/categorias/${categoriaId}`);
      if (!respuesta.ok) return null;
      const data = await respuesta.json();
      return {
        id: data.id || data._id,
        nombre: data.nombre,
        descripcion: data.descripcion
      };
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      return null;
    }
  };

  const obtenerUsuario = async (usuarioId: string) => {
    try {
      const respuesta = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
      if (!respuesta.ok) return null;
      const data = await respuesta.json();
      return {
        id: data.id || data._id,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        carrera: data.carrera,
        tipoUsuario: data.tipoUsuario
      };
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  const verificarSeguimiento = async () => {
    if (!usuarioActual || !usuarioActual.id || !emprendimiento) {
      console.log("⚠️ No se puede verificar seguimiento: usuario no autenticado");
      return;
    }
    
    try {
      const emprendimientoId = emprendimiento.id || emprendimiento._id;
      console.log("🔍 Verificando seguimiento - Usuario:", usuarioActual.id, "Emprendimiento:", emprendimientoId);
      
      const url = `http://localhost:8080/api/seguimientos/verificar?usuarioId=${usuarioActual.id}&emprendimientoId=${emprendimientoId}`;
      console.log("URL de verificación:", url);
      
      const respuesta = await fetch(url);
      console.log("Respuesta verificación - Status:", respuesta.status);
      
      if (respuesta.ok) {
        const data = await respuesta.json();
        console.log("Datos de verificación:", data);
        setSiguiendo(data.estaSiguiendo);
        setTotalSeguidores(data.totalSeguidores);
      } else {
        const errorText = await respuesta.text();
        console.error("❌ Error al verificar seguimiento:", errorText);
      }
    } catch (error) {
      console.error("❌ Error en verificarSeguimiento:", error);
    }
  };

  const toggleSeguimiento = async () => {
    console.log("=== EJECUTANDO TOGGLE SEGUIMIENTO ===");
    
    // Verificar autenticación
    if (!usuarioActual || !usuarioActual.id) {
      console.log("⚠️ Intento de seguir sin autenticación");
      const confirmLogin = confirm("Debes iniciar sesión para seguir emprendimientos. ¿Quieres ir al login?");
      if (confirmLogin) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/autenticacion/login');
      }
      return;
    }
    
    if (!emprendimiento) {
      console.error("❌ No hay emprendimiento cargado");
      return;
    }
    
    setCargandoSeguimiento(true);
    
    try {
      const emprendimientoId = emprendimiento.id || emprendimiento._id;
      console.log("Datos para la petición:");
      console.log("- usuarioId:", usuarioActual.id);
      console.log("- emprendimientoId:", emprendimientoId);
      
      if (siguiendo) {
        // DEJAR DE SEGUIR
        console.log("🔄 Dejando de seguir...");
        const url = `http://localhost:8080/api/seguimientos/dejar-de-seguir`;
        const body = JSON.stringify({
          usuarioId: usuarioActual.id,
          emprendimientoId: emprendimientoId
        });
        
        console.log("URL:", url);
        console.log("Body:", body);
        
        const respuesta = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body
        });
        
        console.log("Respuesta status:", respuesta.status);
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("Respuesta exitosa:", data);
          setSiguiendo(false);
          setTotalSeguidores(data.totalSeguidores);
          alert("✅ Has dejado de seguir este emprendimiento");
        } else {
          const error = await respuesta.json();
          console.error("❌ Error en respuesta:", error);
          alert(error.message || "Error al dejar de seguir");
        }
      } else {
        // SEGUIR
        console.log("🔄 Siguiendo emprendimiento...");
        const url = `http://localhost:8080/api/seguimientos/seguir`;
        const body = JSON.stringify({
          usuarioId: usuarioActual.id,
          emprendimientoId: emprendimientoId
        });
        
        console.log("URL:", url);
        console.log("Body:", body);
        
        const respuesta = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body
        });
        
        console.log("Respuesta status:", respuesta.status);
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("Respuesta exitosa:", data);
          setSiguiendo(true);
          setTotalSeguidores(data.totalSeguidores);
          alert("✅ ¡Ahora sigues este emprendimiento!");
        } else {
          const error = await respuesta.json();
          console.error("❌ Error en respuesta:", error);
          alert(error.message || "Error al seguir");
        }
      }
    } catch (error) {
      console.error("❌ Error en toggleSeguimiento:", error);
      alert("Error al procesar la solicitud");
    } finally {
      setCargandoSeguimiento(false);
    }
  };

  // Cargar datos del emprendimiento
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        console.log("=== CARGANDO EMPRENDIMIENTO ID:", id);
        
        const respuesta = await fetch(`http://localhost:8080/api/emprendimientos/${id}`);
        console.log("Respuesta emprendimiento - Status:", respuesta.status);
        
        if (!respuesta.ok) {
          if (respuesta.status === 404) {
            throw new Error("Emprendimiento no encontrado");
          }
          throw new Error(`Error ${respuesta.status}`);
        }
        
        const data: Emprendimiento = await respuesta.json();
        console.log("Emprendimiento cargado:", data);
        setEmprendimiento(data);
        
        if (data.usuarioId) {
          const usuarioData = await obtenerUsuario(data.usuarioId);
          if (usuarioData) {
            setUsuario(usuarioData);
          }
        }
        
        if (data.categoriaId) {
          const categoriaData = await obtenerCategoria(data.categoriaId);
          if (categoriaData) {
            setCategoria(categoriaData);
          }
        }
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError(error instanceof Error ? error.message : "Error al cargar el emprendimiento");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id]);

  // Verificar seguimiento
  useEffect(() => {
    if (emprendimiento && usuarioActual && usuarioActual.id) {
      verificarSeguimiento();
    } else if (emprendimiento && !usuarioActual) {
      const obtenerContadorSolamente = async () => {
        try {
          const emprendimientoId = emprendimiento.id || emprendimiento._id;
          const respuesta = await fetch(`http://localhost:8080/api/seguimientos/verificar?usuarioId=dummy&emprendimientoId=${emprendimientoId}`);
          if (respuesta.ok) {
            const data = await respuesta.json();
            setTotalSeguidores(data.totalSeguidores);
            console.log("📊 Total seguidores:", data.totalSeguidores);
          }
        } catch (error) {
          console.error("Error al obtener contador:", error);
        }
      };
      obtenerContadorSolamente();
    }
  }, [emprendimiento, usuarioActual]);

  const formatearPrecio = (precio: number): string => {
    return `$${precio.toLocaleString()}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando emprendimiento...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !emprendimiento) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <span className={styles.errorEmoji}>😔</span>
            <h2>{error || "Emprendimiento no encontrado"}</h2>
            <p>El emprendimiento que buscas no existe o ha sido eliminado.</p>
            <Link href="/emprendimientos" className={styles.backButton}>
              ← Volver a emprendimientos
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const emojiCategoria = categoriaEmoji[categoria?.nombre || ""] || "🚀";
  const telefonoContacto = emprendimiento.telefono || usuario?.telefono;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/">Inicio</Link>
          <span>/</span>
          <Link href="/emprendimientos">Emprendimientos</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{emprendimiento.nombre}</span>
        </div>

        <div className={styles.container}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {emprendimiento.imagenes && emprendimiento.imagenes.length > 0 && emprendimiento.imagenes[imagenSeleccionada] ? (
                <img 
                  src={emprendimiento.imagenes[imagenSeleccionada]} 
                  alt={emprendimiento.nombre}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.png";
                  }}
                />
              ) : (
                <div className={styles.noImage}>
                  <span>📷</span>
                  <p>Sin imagen</p>
                </div>
              )}
            </div>
            
            {emprendimiento.imagenes && emprendimiento.imagenes.length > 1 && (
              <div className={styles.thumbnailList}>
                {emprendimiento.imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${imagenSeleccionada === idx ? styles.thumbnailActive : ""}`}
                    onClick={() => setImagenSeleccionada(idx)}
                  >
                    <img src={img} alt={`Imagen ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.header}>
              <span className={styles.category}>
                {emojiCategoria} {categoria?.nombre || "Sin categoría"}
              </span>
              <span className={`${styles.status} ${styles.statusActive}`}>
                {emprendimiento.estado === "activo" ? "Activo" : "Pausado"}
              </span>
            </div>

            <h1 className={styles.title}>{emprendimiento.nombre}</h1>
            <p className={styles.description}>{emprendimiento.descripcion}</p>

            <div className={styles.followSection}>
              <button 
                onClick={toggleSeguimiento}
                className={`${styles.followButton} ${siguiendo ? styles.followingButton : styles.notFollowingButton}`}
                disabled={cargandoSeguimiento}
              >
                {cargandoSeguimiento ? (
                  <span className={styles.spinnerSmall}>⏳</span>
                ) : !usuarioActual || !usuarioActual.id ? (
                  <>
                    <span>🔒</span> Inicia sesión para seguir
                  </>
                ) : siguiendo ? (
                  <>
                    <span>✓</span> Siguiendo
                  </>
                ) : (
                  <>
                    <span>+</span> Seguir emprendimiento
                  </>
                )}
              </button>
              <div className={styles.followersCount}>
                <span>👥</span> {totalSeguidores} seguidor{totalSeguidores !== 1 ? 'es' : ''}
              </div>
            </div>

            <div className={styles.entrepreneur}>
              <h3>Emprendedor</h3>
              <div className={styles.entrepreneurInfo}>
                <div className={styles.avatar}>
                  {usuario ? usuario.nombre.charAt(0) : "U"}
                </div>
                <div>
                  <p className={styles.entrepreneurName}>
                    {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Estudiante UCC"}
                  </p>
                  <p className={styles.entrepreneurCareer}>
                    {usuario?.carrera || "Universidad Cooperativa de Colombia"}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.contactButtons}>
              {telefonoContacto && (
                <a
                  href={`https://wa.me/${formatearNumeroWhatsApp(telefonoContacto)}?text=Hola%21%20Vi%20tu%20emprendimiento%20%22${encodeURIComponent(emprendimiento.nombre)}%22%20en%20EmprendedoresUCC%20y%20me%20interesa%20saber%20m%C3%A1s.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              )}
              
              {usuario?.correo && (
                <a
                  href={`mailto:${usuario.correo}?subject=Interés en ${emprendimiento.nombre}`}
                  className={styles.emailButton}
                >
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 7L12 13 2 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Enviar correo
                </a>
              )}
            </div>
          </div>
        </div>

        {emprendimiento.productos && emprendimiento.productos.length > 0 && (
          <section className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <h2>Productos y Servicios</h2>
              <p>{emprendimiento.productos.length} producto{emprendimiento.productos.length !== 1 ? "s" : ""} disponible{emprendimiento.productos.length !== 1 ? "s" : ""}</p>
            </div>

            <div className={styles.productsGrid}>
              {emprendimiento.productos.map((producto, idx) => (
                <div key={idx} className={styles.productCard}>
                  {producto.imagen && (
                    <div className={styles.productImage}>
                      <img src={producto.imagen} alt={producto.nombre} />
                    </div>
                  )}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{producto.nombre}</h3>
                    <p className={styles.productPrice}>{formatearPrecio(producto.precio)}</p>
                    {producto.stock > 0 ? (
                      <span className={styles.productStock}>Stock: {producto.stock} unidades</span>
                    ) : (
                      <span className={styles.productOutOfStock}>Agotado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.backSection}>
          <Link href="/emprendimientos" className={styles.backToList}>
            ← Ver todos los emprendimientos
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}