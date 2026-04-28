"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioemprendedor/crearemprendimiento.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/config/api";

interface Categoria {
  id?: string;
  _id?: string;
  nombre: string;
}

interface Producto {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  telefono: string;
  categoriaId: string;
  productos: Producto[];
  imagenes: string[];
}

const PASOS = [
  { num: 1, label: "Información general" },
  { num: 2, label: "Productos" },
  { num: 3, label: "Imágenes" },
];

const GUIA_IMAGEN = `1. Ve a postimages.org
2. Inicia sesión o crea una cuenta gratuita
3. Cambia el tamaño a "320x240"
4. Selecciona tu imagen y haz clic en "Subir"
5. Busca "Miniatura para sitios web"
6. Copia solo la URL dentro de src='...'`;

export default function CrearEmprendimientoPage() {
  const router = useRouter();

  const [paso,        setPaso]        = useState(1);
  const [categorias,  setCategorias]  = useState<Categoria[]>([]);
  const [enviando,    setEnviando]    = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [guiaProdAbierta, setGuiaProdAbierta] = useState(false);

  // Form principal
  const [form, setForm] = useState<FormData>({
    nombre: "",
    descripcion: "",
    telefono: "",
    categoriaId: "",
    productos: [],
    imagenes: [""],
  });

  // Producto en edición
  const [prodForm, setProdForm] = useState<Producto>({
    nombre: "", precio: 0, stock: 0, imagen: "",
  });

  // Errores paso 1
  const [err1, setErr1] = useState({ nombre: "", descripcion: "", telefono: "", categoriaId: "" });
  // Error paso 2
  const [errProd, setErrProd] = useState("");
  // Error paso 3
  const [errImg, setErrImg] = useState("");

  useEffect(() => {
    const guardado = sessionStorage.getItem("usuario");
    if (!guardado) { router.push("/autenticacion/login"); return; }

    fetch(`${API_URL}/api/categorias`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategorias(data))
      .catch(() => {});
  }, []);

  /* ── Helpers ── */
  const setField = (k: keyof FormData, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const urlValida = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");

  /* ── Validar paso 1 ── */
  const validarPaso1 = () => {
    const e = { nombre: "", descripcion: "", telefono: "", categoriaId: "" };
    let ok = true;
    if (!form.nombre.trim())        { e.nombre      = "El nombre es obligatorio.";      ok = false; }
    if (!form.descripcion.trim())   { e.descripcion = "La descripción es obligatoria."; ok = false; }
    if (!/^\d{10}$/.test(form.telefono)) {
      e.telefono = "El teléfono debe tener exactamente 10 dígitos."; ok = false;
    }
    if (!form.categoriaId)          { e.categoriaId = "Selecciona una categoría.";      ok = false; }
    setErr1(e);
    return ok;
  };

  /* ── Agregar producto ── */
  const agregarProducto = () => {
    if (!prodForm.nombre.trim()) { setErrProd("El nombre del producto es obligatorio."); return; }
    if (prodForm.precio <= 0)    { setErrProd("El precio debe ser mayor a 0.");          return; }
    if (prodForm.stock < 0)      { setErrProd("El stock no puede ser negativo.");        return; }
    setErrProd("");
    setForm(prev => ({ ...prev, productos: [...prev.productos, { ...prodForm }] }));
    setProdForm({ nombre: "", precio: 0, stock: 0, imagen: "" });
  };

  const eliminarProducto = (i: number) =>
    setForm(prev => ({ ...prev, productos: prev.productos.filter((_, idx) => idx !== i) }));

  /* ── Imágenes ── */
  const setImagen = (i: number, val: string) => {
    const imgs = [...form.imagenes];
    imgs[i] = val;
    setField("imagenes", imgs);
  };

  const agregarCampoImagen = () =>
    setField("imagenes", [...form.imagenes, ""]);

  const eliminarImagen = (i: number) => {
    if (form.imagenes.length === 1) return;
    setField("imagenes", form.imagenes.filter((_, idx) => idx !== i));
  };

  /* ── Navegación ── */
  const irASiguiente = () => {
    if (paso === 1) {
      if (!validarPaso1()) return;
      setPaso(2);
    } else if (paso === 2) {
      if (form.productos.length === 0) { setErrProd("Debes agregar al menos un producto para continuar."); return; }
      setErrProd("");
      setPaso(3);
    }
  };

  const irAAtras = () => setPaso(p => Math.max(1, p - 1));

  /* ── Publicar ── */
  const publicar = async () => {
    const imagenesValidas = form.imagenes.filter(urlValida);
    if (imagenesValidas.length === 0) {
      setErrImg("Debes agregar al menos una imagen válida (URL que comience con http:// o https://).");
      return;
    }
    setErrImg("");

    const guardado = sessionStorage.getItem("usuario");
    if (!guardado) { router.push("/autenticacion/login"); return; }
    const usuario = JSON.parse(guardado);
    const uid = usuario.id || usuario._id;

    const payload = {
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      telefono:    form.telefono.trim(),
      categoriaId: form.categoriaId,
      usuarioId:   uid,
      estado:      "pendiente",
      productos:   form.productos,
      imagenes:    imagenesValidas,
    };

    setEnviando(true);
    setErrorGlobal(null);
    try {
      const res = await fetch(`${API_URL}/api/emprendimientos`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al crear el emprendimiento.");
      router.push("/inicioemprendedor/misemprendimientos");
    } catch (e: any) {
      setErrorGlobal(e.message || "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  const imagenesValidas = form.imagenes.filter(urlValida);
  const catNombre = categorias.find(c => (c.id || c._id) === form.categoriaId)?.nombre || "—";

  return (
    <div className={styles.layout}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarLogo}>
            <span className={styles.logoIcon} />
            <span className={styles.logoText}>EmprendedoresUCC</span>
          </Link>
          <div className={styles.sidebarHero}>
            <h2 className={styles.sidebarTitle}>Publica tu emprendimiento</h2>
            <p className={styles.sidebarDesc}>
              Completa los 3 pasos para que tu proyecto llegue a toda la comunidad UCC.
            </p>
          </div>
          <nav className={styles.stepper}>
            {PASOS.map((p, i) => {
              const done    = paso > p.num;
              const current = paso === p.num;
              return (
                <div key={p.num} className={styles.stepItem}>
                  <div className={`${styles.stepCircle} ${done ? styles.stepDone : current ? styles.stepCurrent : styles.stepPending}`}>
                    {done ? <span className={styles.stepCheck}>✓</span> : <span>{p.num}</span>}
                  </div>
                  {i < PASOS.length - 1 && (
                    <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ""}`} />
                  )}
                  <div className={styles.stepLabels}>
                    <span className={styles.stepMeta}>PASO {p.num}</span>
                    <span className={`${styles.stepLabel} ${current ? styles.stepLabelActive : ""}`}>{p.label}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
        <p className={styles.sidebarFooter}>2025 EmprendedoresUCC · UCC Villavicencio</p>
      </aside>

      {/* ── Contenido ── */}
      <main className={styles.content}>
        <div className={styles.formWrap}>

          {/* ════════════════════
              PASO 1
          ════════════════════ */}
          {paso === 1 && (
            <div className={styles.step}>
              <span className={styles.stepTag}>PASO 1 DE 3</span>
              <h1 className={styles.stepTitle}>Información general</h1>
              <p className={styles.stepSub}>Cuéntanos sobre tu emprendimiento</p>

              <div className={styles.field}>
                <label className={styles.label}>Nombre del emprendimiento *</label>
                <input
                  className={`${styles.input} ${err1.nombre ? styles.inputError : ""}`}
                  placeholder="Ej: TecnoMarket"
                  value={form.nombre}
                  onChange={e => setField("nombre", e.target.value)}
                />
                {err1.nombre && <p className={styles.fieldErr}>{err1.nombre}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Descripción *</label>
                <textarea
                  className={`${styles.textarea} ${err1.descripcion ? styles.inputError : ""}`}
                  rows={5}
                  placeholder="Describe tu emprendimiento, qué ofreces y a quién va dirigido..."
                  value={form.descripcion}
                  onChange={e => setField("descripcion", e.target.value)}
                />
                {err1.descripcion && <p className={styles.fieldErr}>{err1.descripcion}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Teléfono de contacto * (exactamente 10 dígitos)</label>
                <input
                  className={`${styles.input} ${err1.telefono ? styles.inputError : ""}`}
                  placeholder="Ej: 3102474495"
                  value={form.telefono}
                  maxLength={10}
                  onChange={e => setField("telefono", e.target.value.replace(/\D/g, ""))}
                />
                {err1.telefono && <p className={styles.fieldErr}>{err1.telefono}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Categoría *</label>
                <select
                  className={`${styles.select} ${err1.categoriaId ? styles.inputError : ""}`}
                  value={form.categoriaId}
                  onChange={e => setField("categoriaId", e.target.value)}
                >
                  <option value="">Selecciona categoría</option>
                  {categorias.map(c => {
                    const cid = c.id || c._id;
                    return <option key={cid} value={cid}>{c.nombre}</option>;
                  })}
                </select>
                {err1.categoriaId && <p className={styles.fieldErr}>{err1.categoriaId}</p>}
              </div>
            </div>
          )}

          {/* ════════════════════
              PASO 2
          ════════════════════ */}
          {paso === 2 && (
            <div className={styles.step}>
              <span className={styles.stepTag}>PASO 2 DE 3</span>
              <h1 className={styles.stepTitle}>Productos</h1>
              <p className={styles.stepSub}>Agrega los productos de tu emprendimiento</p>

              {errProd && (
                <div className={styles.alertWarn}>
                  {errProd}
                </div>
              )}

              <div className={styles.prodCard}>
                <div className={styles.prodGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre del producto *</label>
                    <input
                      className={styles.input}
                      placeholder="Ej: Mouse Gamer"
                      value={prodForm.nombre}
                      onChange={e => setProdForm(p => ({ ...p, nombre: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Precio (COP) *</label>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="80000"
                      min={0}
                      value={prodForm.precio || ""}
                      onChange={e => setProdForm(p => ({ ...p, precio: Number(e.target.value) }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Stock</label>
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="15"
                      min={0}
                      value={prodForm.stock || ""}
                      onChange={e => setProdForm(p => ({ ...p, stock: Number(e.target.value) }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>URL imagen del producto</label>
                    <input
                      className={styles.input}
                      placeholder="https://i.postimg.cc/xxxx/imagen.jpg"
                      value={prodForm.imagen}
                      onChange={e => setProdForm(p => ({ ...p, imagen: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Guía imagen producto */}
                <div className={styles.guiaToggle} onClick={() => setGuiaProdAbierta(v => !v)}>
                  <span className={styles.guiaToggleLabel}>Como obtener la URL de mi imagen?</span>
                  <span className={styles.guiaToggleArrow}>{guiaProdAbierta ? "▲" : "▼"}</span>
                </div>
                {guiaProdAbierta && (
                  <div className={styles.guiaBody}>
                    <pre className={styles.guiaPre}>{GUIA_IMAGEN}</pre>
                  </div>
                )}

                <button className={styles.btnAgregar} onClick={agregarProducto}>
                  + Agregar producto
                </button>
              </div>

              {/* Lista productos */}
              {form.productos.length > 0 && (
                <div className={styles.prodListWrap}>
                  <p className={styles.prodListTitle}>{form.productos.length} PRODUCTO{form.productos.length !== 1 ? "S" : ""} AGREGADO{form.productos.length !== 1 ? "S" : ""}</p>
                  <div className={styles.prodList}>
                    {form.productos.map((p, i) => (
                      <div key={i} className={styles.prodRow}>
                        <div className={styles.prodRowImg}>
                          {p.imagen && urlValida(p.imagen)
                            ? <img src={p.imagen} alt={p.nombre} />
                            : <span>{p.nombre[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div className={styles.prodRowInfo}>
                          <p className={styles.prodRowNombre}>{p.nombre}</p>
                          <p className={styles.prodRowMeta}>${p.precio.toLocaleString("es-CO")} COP · Stock: {p.stock}</p>
                        </div>
                        <button className={styles.prodRowDel} onClick={() => eliminarProducto(i)} title="Eliminar">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════
              PASO 3
          ════════════════════ */}
          {paso === 3 && (
            <div className={styles.step}>
              <span className={styles.stepTag}>PASO 3 DE 3</span>
              <h1 className={styles.stepTitle}>Imágenes</h1>
              <p className={styles.stepSub}>Agrega las URLs de las imágenes de tu emprendimiento</p>

              {errImg && (
                <div className={styles.alertWarn}>
                  {errImg}
                </div>
              )}

              {form.imagenes.map((img, i) => (
                <div key={i} className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>URL imagen {i + 1}</label>
                    {form.imagenes.length > 1 && (
                      <button className={styles.btnQuitarImg} onClick={() => eliminarImagen(i)}>
                        Quitar
                      </button>
                    )}
                  </div>
                  <input
                    className={`${styles.input} ${img && !urlValida(img) ? styles.inputError : ""}`}
                    placeholder="https://i.postimg.cc/xxxx/imagen.jpg"
                    value={img}
                    onChange={e => setImagen(i, e.target.value)}
                  />
                  {img && !urlValida(img) && (
                    <p className={styles.fieldErr}>La URL debe comenzar con http:// o https://</p>
                  )}
                  {img && urlValida(img) && (
                    <div className={styles.imgPreview}>
                      <img src={img} alt="preview" onError={e => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                </div>
              ))}

              {/* Guía imagen */}
              <div className={styles.guiaToggle} onClick={() => setGuiaAbierta(v => !v)}>
                <span className={styles.guiaToggleLabel}>Como obtener la URL de mi imagen?</span>
                <span className={styles.guiaToggleArrow}>{guiaAbierta ? "▲" : "▼"}</span>
              </div>
              {guiaAbierta && (
                <div className={styles.guiaBody}>
                  <pre className={styles.guiaPre}>{GUIA_IMAGEN}</pre>
                </div>
              )}

              <button className={styles.btnAgregarImg} onClick={agregarCampoImagen}>
                + Agregar otra imagen
              </button>

              {/* Resumen */}
              <div className={styles.resumenCard}>
                <p className={styles.resumenTitle}>RESUMEN DEL EMPRENDIMIENTO</p>
                <div className={styles.resumenGrid}>
                  <div>
                    <span className={styles.resumenLabel}>NOMBRE</span>
                    <p className={styles.resumenVal}>{form.nombre || "—"}</p>
                  </div>
                  <div>
                    <span className={styles.resumenLabel}>CATEGORÍA</span>
                    <p className={styles.resumenVal}>{catNombre}</p>
                  </div>
                  <div>
                    <span className={styles.resumenLabel}>ESTADO</span>
                    <p className={`${styles.resumenVal} ${styles.resumenEstado}`}>Pendiente</p>
                  </div>
                  <div>
                    <span className={styles.resumenLabel}>TELÉFONO</span>
                    <p className={styles.resumenVal}>{form.telefono || "—"}</p>
                  </div>
                  <div>
                    <span className={styles.resumenLabel}>PRODUCTOS</span>
                    <p className={styles.resumenVal}>{form.productos.length} agregado{form.productos.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div>
                    <span className={styles.resumenLabel}>IMÁGENES</span>
                    <p className={styles.resumenVal}>{imagenesValidas.length} válida{imagenesValidas.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>

              {errorGlobal && <p className={styles.errorGlobal}>{errorGlobal}</p>}
            </div>
          )}

          {/* ── Footer de navegación ── */}
          <div className={styles.navFooter}>
            {paso === 1 ? (
              <Link href="/inicioemprendedor" className={styles.btnCancelar}>← Cancelar</Link>
            ) : (
              <button className={styles.btnAtras} onClick={irAAtras}>← Atrás</button>
            )}

            {paso < 3 ? (
              <button className={styles.btnSiguiente} onClick={irASiguiente}>
                {paso === 1 ? "Siguiente: Productos →" : "Siguiente: Imágenes →"}
              </button>
            ) : (
              <button
                className={styles.btnPublicar}
                onClick={publicar}
                disabled={enviando}
              >
                {enviando ? "Publicando..." : "Publicar emprendimiento"}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}