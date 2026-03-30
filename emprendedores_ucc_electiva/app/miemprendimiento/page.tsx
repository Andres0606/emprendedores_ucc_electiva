"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../css/miemprendimiento/page.module.css";

const categorias = [
  "Tecnología", "Gastronomía", "Moda y Diseño",
  "Salud y Bienestar", "Arte y Cultura", "Servicios",
];

// 🔥 MAPEO DE CATEGORÍAS A IDs DE MONGODB
const categoriaToId: Record<string, string> = {
  "Tecnología": "69adb8d5781c765dca3ab5f0",
  "Gastronomía": "69bf25148374500218c043ee",
  "Moda y Diseño": "69bf25148374500218c043ef",
  "Salud y Bienestar": "69bf25148374500218c043f0",
  "Arte y Cultura": "69bf25148374500218c043f1",
  "Servicios": "69bf25148374500218c043f2",
};

type Producto = {
  id: string;
  nombre: string;
  precio: string;
  stock: string;
  imagen: string;
};

// Función para validar URL de imagen
const validarURLImagen = (url: string): boolean => {
  if (!url || url.trim() === "") return false;
  const urlPattern = /^(https?:\/\/)([a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+)$/i;
  return urlPattern.test(url.trim());
};

// ── Componente reutilizable para el helper de imagen ──
function ImageHelper() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "8px", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#6366f1",
          transition: "background 0.2s",
          width: "100%",
          textAlign: "left",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f0f0ff")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <span style={{ fontSize: "15px" }}>📸</span>
        ¿Cómo obtener la URL de mi imagen?
        <span style={{
          marginLeft: "auto",
          display: "inline-flex",
          transition: "transform 0.25s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div style={{
          marginTop: "6px",
          background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
          border: "1px solid #e0e4ff",
          borderRadius: "12px",
          padding: "16px 20px",
          fontSize: "13px",
          color: "#444",
          lineHeight: "1.75",
          animation: "fadeIn 0.2s ease",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          <p style={{ margin: "0 0 10px", fontWeight: 600, color: "#6366f1", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Guía paso a paso
          </p>

          <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <li>Ve a{" "}
              <a href="https://postimages.org/es/" target="_blank" rel="noopener noreferrer"
                style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                PostImages.org ↗
              </a>
            </li>
            <li>Inicia sesión o crea una cuenta gratuita</li>
            <li>Verás <strong>"Mi galería (1)"</strong> — déjalo así</li>
            <li>Cambia el tamaño a <strong style={{ color: "#6366f1" }}>"320x240 — tamaño para web"</strong></li>
            <li>Deja <strong>"Sin caducidad"</strong> seleccionado</li>
            <li>Selecciona tu imagen y haz clic en <strong>"Subir"</strong></li>
            <li>Busca la opción <strong style={{ color: "#6366f1" }}>"Miniatura para sitios web"</strong></li>
            <li>Copia SOLO la URL dentro de <code style={{ background: "#e8eaff", borderRadius: "4px", padding: "1px 5px", fontSize: "12px" }}>src='...'</code></li>
          </ol>

          <div style={{
            marginTop: "12px",
            background: "#fff",
            border: "1px dashed #c7caff",
            borderRadius: "8px",
            padding: "10px 14px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.4px" }}>Ejemplo</p>
            <code style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px", wordBreak: "break-all" }}>
              {`<img src='https://i.postimg.cc/xxxx/imagen.jpg' .../>`}
            </code>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888" }}>Copias solo:</p>
            <span style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6366f1",
              background: "#f0f0ff",
              borderRadius: "6px",
              padding: "3px 8px",
              wordBreak: "break-all",
              display: "inline-block",
            }}>
              https://i.postimg.cc/xxxx/imagen.jpg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MiEmprendimientoPage() {
  const [paso, setPaso] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [telefonoError, setTelefonoError] = useState("");
  const [verificandoTelefono, setVerificandoTelefono] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (!usuarioGuardado) {
      alert("Debes iniciar sesión");
      router.push("/autenticacion/login");
      return;
    }
    const usuario = JSON.parse(usuarioGuardado);
    if (!usuario.id && !usuario._id) {
      alert("Sesión inválida. Vuelve a iniciar sesión.");
      router.push("/autenticacion/login");
      return;
    }
    if (usuario.tipoUsuario !== "emprendedor") {
      alert("⚠️ Solo los usuarios registrados como EMPRENDEDORES pueden crear emprendimientos.\n\nTu tipo de usuario es: " + usuario.tipoUsuario);
      router.push("/");
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  const usuarioGuardado =
    typeof window !== "undefined" ? sessionStorage.getItem("usuario") : null;
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // Paso 1
  const [nombre, setNombre]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria]     = useState("");
  const [estado, setEstado]           = useState("activo");
  const [telefono, setTelefono]       = useState("");

  // Paso 2
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [prodNombre, setProdNombre] = useState("");
  const [prodPrecio, setProdPrecio] = useState("");
  const [prodStock, setProdStock]   = useState("");
  const [prodImagen, setProdImagen] = useState("");
  const [urlError, setUrlError] = useState("");

  // Paso 3
  const [imagenes, setImagenes] = useState<string[]>([""]);
  const [imagenesErrores, setImagenesErrores] = useState<string[]>([]);

  // Función para verificar teléfono en backend
  const verificarTelefonoEmprendimiento = async (telefono: string) => {
    if (telefono.length === 10) {
      setVerificandoTelefono(true);
      try {
        const res = await fetch(`http://localhost:8080/api/emprendimientos/verificar-telefono/${telefono}`);
        const data = await res.json();
        if (data.existe) {
          setTelefonoError("Este número de teléfono ya está registrado en otro emprendimiento");
        } else {
          setTelefonoError("");
        }
      } catch (error) {
        console.error("Error verificando teléfono:", error);
        setTelefonoError("Error al verificar teléfono");
      } finally {
        setVerificandoTelefono(false);
      }
    } else {
      setTelefonoError("");
    }
  };

  // Manejar cambio de teléfono
  const manejarCambioTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      setTelefono(valor);
      if (valor.length === 10) {
        verificarTelefonoEmprendimiento(valor);
      } else {
        setTelefonoError("");
      }
    }
  };

  const agregarProducto = () => {
    if (!prodNombre.trim()) {
      alert("⚠️ El nombre del producto es obligatorio");
      return;
    }
    if (!prodPrecio.trim()) {
      alert("⚠️ El precio del producto es obligatorio");
      return;
    }
    if (Number(prodPrecio) <= 0) {
      alert("⚠️ El precio debe ser mayor a 0");
      return;
    }
    
    if (prodImagen && !validarURLImagen(prodImagen)) {
      alert("⚠️ La URL de la imagen del producto debe comenzar con http:// o https://");
      return;
    }
    
    setProductos([...productos, {
      id: Date.now().toString(),
      nombre: prodNombre,
      precio: prodPrecio,
      stock: prodStock,
      imagen: prodImagen,
    }]);
    setProdNombre(""); 
    setProdPrecio(""); 
    setProdStock(""); 
    setProdImagen("");
    setUrlError("");
  };

  const eliminarProducto = (id: string) =>
    setProductos(productos.filter((p) => p.id !== id));

  const agregarImagen = () => {
    setImagenes([...imagenes, ""]);
    setImagenesErrores([...imagenesErrores, ""]);
  };
  
  const actualizarImagen = (i: number, val: string) => {
    const arr = [...imagenes]; 
    arr[i] = val; 
    setImagenes(arr);
    
    const erroresArr = [...imagenesErrores];
    if (val && !validarURLImagen(val)) {
      erroresArr[i] = "La URL debe comenzar con http:// o https://";
    } else {
      erroresArr[i] = "";
    }
    setImagenesErrores(erroresArr);
  };
  
  const eliminarImagen = (i: number) => {
    setImagenes(imagenes.filter((_, idx) => idx !== i));
    setImagenesErrores(imagenesErrores.filter((_, idx) => idx !== i));
  };

  const validarImagenesEmprendimiento = () => {
    const imagenesValidas = imagenes.filter(img => img.trim() !== "" && validarURLImagen(img));
    if (imagenesValidas.length === 0) {
      alert("⚠️ Debes agregar al menos una imagen válida para tu emprendimiento (URL que comience con http:// o https://)");
      return false;
    }
    return true;
  };

  const validarProductos = () => {
    if (productos.length === 0) {
      alert("⚠️ Debes agregar al menos un producto a tu emprendimiento");
      return false;
    }
    return true;
  };

  const publicarEmprendimiento = async () => {
    if (isPublishing) return;
    
    if (!validarProductos()) return;
    if (!validarImagenesEmprendimiento()) return;
    
    if (telefonoError) {
      alert("⚠️ " + telefonoError);
      setPaso(1);
      return;
    }
    
    setIsPublishing(true);

    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (!usuarioGuardado) {
      alert("Debes iniciar sesión primero");
      setIsPublishing(false);
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    if (usuario.tipoUsuario !== "emprendedor") {
      alert("⚠️ No tienes permisos para crear emprendimientos.");
      setIsPublishing(false);
      router.push("/");
      return;
    }

    const usuarioId = usuario.id ?? usuario._id;
    if (!usuarioId) {
      alert("No se encontró el ID del usuario. Vuelve a iniciar sesión.");
      setIsPublishing(false);
      return;
    }

    const telefonoLimpio = telefono.replace(/\D/g, '');
    if (telefonoLimpio.length !== 10) {
      alert("⚠️ El teléfono debe tener EXACTAMENTE 10 dígitos numéricos");
      setPaso(1);
      setIsPublishing(false);
      return;
    }

    const imagenesValidas = imagenes.filter(img => img.trim() !== "" && validarURLImagen(img));
    if (imagenesValidas.length === 0) {
      alert("⚠️ Debes agregar al menos una imagen válida para tu emprendimiento");
      setPaso(3);
      setIsPublishing(false);
      return;
    }

    const categoriaId = categoriaToId[categoria];
    if (!categoriaId) {
      alert("⚠️ Por favor selecciona una categoría válida");
      setPaso(1);
      setIsPublishing(false);
      return;
    }

    const data = {
      nombre,
      descripcion,
      categoriaId: categoriaId,
      usuarioId: usuarioId,
      estado: "pendiente",
      telefono: telefonoLimpio,
      imagenes: imagenesValidas,
      productos: productos.map(p => ({
        nombre: p.nombre,
        precio: Number(p.precio),
        stock: Number(p.stock) || 0,
        imagen: p.imagen || ""
      }))
    };

    try {
      const res = await fetch("http://localhost:8080/api/emprendimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ ¡Emprendimiento publicado correctamente!");
        router.push("/inicioemprendedor");
      } else {
        alert("Error: " + (result.message || result.error || "Error al publicar"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsPublishing(false);
    }
  };

  const puedeAvanzarPaso2 = () => {
    if (productos.length === 0) {
      alert("⚠️ Debes agregar al menos un producto antes de continuar");
      return false;
    }
    return true;
  };

  const pasos = [
    { n: 1, label: "Información general" },
    { n: 2, label: "Productos" },
    { n: 3, label: "Imágenes" },
  ];

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className={styles.wrapper}>

      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarBg} aria-hidden />

        <Link href="/" className={styles.sidebarLogo}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="rgba(255,255,255,0.12)"/>
            <rect x="5"  y="5"  width="10" height="18" rx="3" fill="#fff"/>
            <rect x="5"  y="17" width="10" height="5"  rx="2" fill="rgba(255,255,255,0.5)"/>
            <rect x="17" y="5"  width="10" height="18" rx="3" fill="#8DC63F"/>
            <circle cx="31" cy="9" r="4" fill="none" stroke="#8DC63F" strokeWidth="1.8"/>
            <circle cx="31" cy="9" r="1.6" fill="#fff"/>
          </svg>
          <span className={styles.sidebarLogoText}>EmprendedoresUCC</span>
        </Link>

        <div className={styles.sidebarContent}>
          <h2 className={styles.sidebarTitle}>Publica tu emprendimiento</h2>
          <p className={styles.sidebarDesc}>
            Completa los 3 pasos para que tu proyecto llegue a toda la comunidad UCC.
          </p>

          <div className={styles.steps}>
            {pasos.map((p, idx) => (
              <div key={p.n} className={styles.stepWrap}>
                <div className={`${styles.step} ${paso === p.n ? styles.stepActive : ""} ${paso > p.n ? styles.stepDone : ""}`}>
                  <div className={styles.stepCircle}>
                    {paso > p.n ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : p.n}
                  </div>
                  <div className={styles.stepInfo}>
                    <span className={styles.stepNum}>Paso {p.n}</span>
                    <span className={styles.stepLabel}>{p.label}</span>
                  </div>
                </div>
                {idx < pasos.length - 1 && (
                  <div className={`${styles.stepConnector} ${paso > p.n ? styles.stepConnectorDone : ""}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className={styles.sidebarFooter}>© 2025 EmprendedoresUCC · UCC Villavicencio</p>
      </div>

      {/* ── Contenido ── */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>

          {/* ══ PASO 1 ══ */}
          {paso === 1 && (
            <div className={styles.formStep}>
              <div className={styles.formHead}>
                <span className={styles.formTag}>Paso 1 de 3</span>
                <h1 className={styles.formTitle}>Información general</h1>
                <p className={styles.formSub}>Cuéntanos sobre tu emprendimiento</p>
              </div>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre del emprendimiento *</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="14" height="14" rx="2"/>
                      <path d="M7 7h6M7 10h4" strokeLinecap="round"/>
                    </svg>
                    <input type="text" placeholder="Ej: TecnoMarket" className={styles.input}
                      value={nombre} onChange={(e) => setNombre(e.target.value)}/>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descripción *</label>
                  <textarea
                    placeholder="Describe tu emprendimiento, qué ofreces y a quién va dirigido..."
                    className={styles.textarea} rows={4}
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Teléfono de contacto *
                    <span className={styles.labelHint}>(exactamente 10 dígitos)</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 2h4l1.5 4-2 1.2a11 11 0 005.3 5.3L14 10.5 18 12v4a2 2 0 01-2 2C6.1 18 2 13.9 2 4a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="tel"
                      placeholder="Ej: 3102474495"
                      className={`${styles.input} ${telefonoError ? styles.inputError : ""}`}
                      value={telefono}
                      onChange={manejarCambioTelefono}
                    />
                  </div>
                  {verificandoTelefono && (
                    <small className={styles.helperText}>Verificando disponibilidad...</small>
                  )}
                  {telefono && telefono.length > 0 && (
                    <small className={`${styles.helperText} ${telefono.length === 10 ? styles.validText : styles.invalidText}`}>
                      {telefono.length}/10 dígitos {telefono.length === 10 ? "✅" : "— deben ser exactamente 10"}
                    </small>
                  )}
                  {telefonoError && (
                    <small className={styles.errorText}>{telefonoError}</small>
                  )}
                  {telefono && telefono.length === 10 && !telefonoError && !verificandoTelefono && (
                    <small className={styles.successText}>✓ Teléfono disponible</small>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoría *</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M3 5h14M3 10h14M3 15h8" strokeLinecap="round"/>
                      </svg>
                      <select className={`${styles.input} ${styles.select}`} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="" disabled>Selecciona categoría</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <Link href="/" className={styles.btnBack}>← Cancelar</Link>
                <button
                  type="button"
                  className={styles.btnNext}
                  onClick={() => setPaso(2)}
                  disabled={!nombre || !descripcion || !categoria || telefono.length !== 10 || !!telefonoError}
                >
                  Siguiente: Productos →
                </button>
              </div>
            </div>
          )}

          {/* ══ PASO 2 ══ */}
          {paso === 2 && (
            <div className={styles.formStep}>
              <div className={styles.formHead}>
                <span className={styles.formTag}>Paso 2 de 3</span>
                <h1 className={styles.formTitle}>Productos</h1>
                <p className={styles.formSub}>Agrega los productos de tu emprendimiento</p>
                <p className={styles.formWarning}>⚠️ Debes agregar al menos un producto para continuar</p>
              </div>

              <div className={styles.prodForm}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre del producto *</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="3" width="14" height="14" rx="2"/>
                        <path d="M7 10h6M10 7v6" strokeLinecap="round"/>
                      </svg>
                      <input type="text" placeholder="Ej: Mouse Gamer" className={styles.input}
                        value={prodNombre} onChange={(e) => setProdNombre(e.target.value)}/>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Precio (COP) *</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="10" cy="10" r="8"/>
                        <path d="M10 6v8M7 8h4.5a1.5 1.5 0 010 3H7" strokeLinecap="round"/>
                      </svg>
                      <input type="number" placeholder="80000" className={styles.input}
                        value={prodPrecio} onChange={(e) => setProdPrecio(e.target.value)}/>
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Stock</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M3 7h14M3 13h14M7 3v14M13 3v14" strokeLinecap="round"/>
                      </svg>
                      <input type="number" placeholder="15" className={styles.input}
                        value={prodStock} onChange={(e) => setProdStock(e.target.value)}/>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>URL imagen del producto</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="2" y="4" width="16" height="12" rx="2"/>
                        <circle cx="7" cy="9" r="1.5"/>
                        <path d="M2 14l4-4 3 3 3-3 6 5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input 
                        type="url" 
                        placeholder="https://i.postimg.cc/xxxx/imagen.jpg" 
                        className={`${styles.input} ${prodImagen && !validarURLImagen(prodImagen) ? styles.inputError : ""}`}
                        value={prodImagen} 
                        onChange={(e) => setProdImagen(e.target.value)}
                      />
                    </div>
                    {prodImagen && !validarURLImagen(prodImagen) && (
                      <small className={styles.errorText}>⚠️ La URL debe comenzar con http:// o https://</small>
                    )}
                  </div>
                </div>

                <ImageHelper />

                <button type="button" className={styles.btnAgregar} onClick={agregarProducto}>
                  + Agregar producto
                </button>
              </div>

              {productos.length > 0 && (
                <div className={styles.prodList}>
                  <p className={styles.prodListTitle}>{productos.length} producto{productos.length > 1 ? "s" : ""} agregado{productos.length > 1 ? "s" : ""}</p>
                  {productos.map((p) => (
                    <div key={p.id} className={styles.prodItem}>
                      <div className={styles.prodItemIcon}>📦</div>
                      <div className={styles.prodItemInfo}>
                        <span className={styles.prodItemNombre}>{p.nombre}</span>
                        <span className={styles.prodItemMeta}>
                          ${parseInt(p.precio).toLocaleString("es-CO")} COP
                          {p.stock && ` · Stock: ${p.stock}`}
                        </span>
                      </div>
                      <button type="button" className={styles.prodItemDel} onClick={() => eliminarProducto(p.id)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.btnBack} onClick={() => setPaso(1)}>← Atrás</button>
                <button 
                  type="button" 
                  className={styles.btnNext} 
                  onClick={() => {
                    if (puedeAvanzarPaso2()) {
                      setPaso(3);
                    }
                  }}
                >
                  Siguiente: Imágenes →
                </button>
              </div>
            </div>
          )}

          {/* ══ PASO 3 ══ */}
          {paso === 3 && (
            <div className={styles.formStep}>
              <div className={styles.formHead}>
                <span className={styles.formTag}>Paso 3 de 3</span>
                <h1 className={styles.formTitle}>Imágenes</h1>
                <p className={styles.formSub}>Agrega las URLs de las imágenes de tu emprendimiento</p>
                <p className={styles.formWarning}>⚠️ Debes agregar al menos una imagen válida (URL que comience con http:// o https://)</p>
              </div>

              <div className={styles.fields}>
                {imagenes.map((img, i) => (
                  <div key={i} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                      <div className={styles.field} style={{ flex: 1 }}>
                        <label className={styles.label}>URL imagen {i + 1}</label>
                        <div className={styles.inputWrap}>
                          <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="2" y="4" width="16" height="12" rx="2"/>
                            <circle cx="7" cy="9" r="1.5"/>
                            <path d="M2 14l4-4 3 3 3-3 6 5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <input 
                            type="url" 
                            placeholder="https://i.postimg.cc/xxxx/imagen.jpg" 
                            className={`${styles.input} ${imagenesErrores[i] ? styles.inputError : ""}`}
                            value={img} 
                            onChange={(e) => actualizarImagen(i, e.target.value)}
                          />
                        </div>
                        {imagenesErrores[i] && (
                          <small className={styles.errorText}>{imagenesErrores[i]}</small>
                        )}
                        {img && !imagenesErrores[i] && validarURLImagen(img) && (
                          <small className={styles.successText}>✓ URL válida</small>
                        )}
                      </div>
                      {imagenes.length > 1 && (
                        <button type="button" className={styles.imgDelBtn} onClick={() => eliminarImagen(i)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <ImageHelper />
                  </div>
                ))}

                <button type="button" className={styles.btnAgregarImg} onClick={agregarImagen}>
                  + Agregar otra imagen
                </button>
              </div>

              <div className={styles.resumen}>
                <p className={styles.resumenTitle}>Resumen del emprendimiento</p>
                <div className={styles.resumenGrid}>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Nombre</span>
                    <span className={styles.resumenVal}>{nombre}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Categoría</span>
                    <span className={styles.resumenVal}>{categoria}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Estado</span>
                    <span className={`${styles.resumenVal} ${styles.resumenEstado}`}>{estado}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Teléfono</span>
                    <span className={styles.resumenVal}>{telefono}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Productos</span>
                    <span className={styles.resumenVal}>{productos.length} agregados</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLbl}>Imágenes</span>
                    <span className={styles.resumenVal}>{imagenes.filter(img => img.trim() !== "" && validarURLImagen(img)).length} válidas</span>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnBack} onClick={() => setPaso(2)}>← Atrás</button>
                <button
                  type="button"
                  className={styles.btnSubmit}
                  onClick={publicarEmprendimiento}
                  disabled={isPublishing}
                >
                  {isPublishing ? "Publicando..." : "🚀 Publicar emprendimiento"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}