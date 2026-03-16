"use client";
import Link from "next/link";
import styles from "../../css/inicioemprendedor/page.module.css";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  estado: "activo" | "pausado";
}

const productos: Producto[] = [
  { id: 1, nombre: "Mouse Gamer",         precio: 80000,  stock: 15, imagen: "🖱️", estado: "activo"  },
  { id: 2, nombre: "Teclado Mecánico",    precio: 150000, stock: 10, imagen: "⌨️", estado: "activo"  },
  { id: 3, nombre: "Audífonos Bluetooth", precio: 120000, stock: 5,  imagen: "🎧", estado: "pausado" },
  { id: 4, nombre: "Webcam HD",           precio: 95000,  stock: 8,  imagen: "📷", estado: "activo"  },
];

export default function ProductosSection() {
  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Mis productos</h1>
          <p className={styles.welcomeDesc}>{productos.length} productos en tu catálogo.</p>
        </div>
        <Link href="/miemprendimiento" className={styles.topbarCta}>
          + Agregar producto
        </Link>
      </div>

      <div className={styles.prodTable}>
        <div className={styles.prodTableHead}>
          <span>Producto</span>
          <span>Precio</span>
          <span>Stock</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {productos.map((p) => (
          <div key={p.id} className={styles.prodTableRow}>
            <div className={styles.prodTableName}>
              <span className={styles.prodTableEmoji}>{p.imagen}</span>
              <span>{p.nombre}</span>
            </div>
            <span className={styles.prodTablePrecio}>
              ${p.precio.toLocaleString("es-CO")}
            </span>
            <span className={styles.prodTableStock}>{p.stock} uds.</span>
            <span className={`${styles.prodEstado} ${p.estado === "activo" ? styles.prodActivo : styles.prodPausado}`}>
              {p.estado}
            </span>
            <div className={styles.prodTableActions}>
              <button className={styles.prodBtnEdit}>✏️</button>
              <button className={styles.prodBtnDel}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}