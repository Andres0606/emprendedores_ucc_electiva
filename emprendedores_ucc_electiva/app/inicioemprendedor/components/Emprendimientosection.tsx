"use client";
import Link from "next/link";
import styles from "../../css/inicioemprendedor/page.module.css";

interface EmprendimientoSectionProps {
  estadoEmp: "activo" | "pausado";
  setEstadoEmp: (estado: "activo" | "pausado") => void;
}

const emprendimiento = {
  nombre: "EcoTech Soluciones",
  categoria: "Tecnología",
  descripcion: "Apps móviles y soluciones digitales para pequeños negocios locales.",
  emoji: "💻",
};

export default function EmprendimientoSection({ estadoEmp, setEstadoEmp }: EmprendimientoSectionProps) {
  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Mi emprendimiento</h1>
          <p className={styles.welcomeDesc}>Gestiona la información de tu proyecto.</p>
        </div>
      </div>

      <div className={styles.editCard}>
        <div className={styles.editEmoji}>{emprendimiento.emoji}</div>

        <div className={styles.editFields}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Nombre</label>
            <div className={styles.editValue}>{emprendimiento.nombre}</div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Categoría</label>
            <div className={styles.editValue}>{emprendimiento.categoria}</div>
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Estado</label>
            <div className={styles.editValue}>
              <span className={`${styles.estadoBadge} ${estadoEmp === "activo" ? styles.estadoActivo : styles.estadoPausado}`}>
                ● {estadoEmp}
              </span>
            </div>
          </div>
          <div className={styles.editField} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.editLabel}>Descripción</label>
            <div className={styles.editValue}>{emprendimiento.descripcion}</div>
          </div>
        </div>

        <div className={styles.editActions}>
          <Link href="/miemprendimiento" className={styles.btnEditar}>
            ✏️ Editar emprendimiento
          </Link>
          <button
            className={`${styles.btnEstado} ${estadoEmp === "activo" ? styles.btnPausar : styles.btnActivar}`}
            onClick={() => setEstadoEmp(estadoEmp === "activo" ? "pausado" : "activo")}
          >
            {estadoEmp === "activo" ? "⏸ Pausar emprendimiento" : "▶ Activar emprendimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}