"use client";
import styles from "../../css/inicioemprendedor/page.module.css";

interface Campo {
  label: string;
  value: string;
}

const campos: Campo[] = [
  { label: "Nombre",   value: "Carlos Muñoz"                  },
  { label: "Apellido", value: "Muñoz García"                   },
  { label: "Correo",   value: "carlos.munoz@campusucc.edu.co"  },
  { label: "Teléfono", value: "300 000 0000"                   },
  { label: "Facultad", value: "Ingeniería de Sistemas"         },
  { label: "Semestre", value: "7°"                             },
];

export default function ConfiguracionSection() {
  return (
    <div className={styles.content}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Configuración</h1>
          <p className={styles.welcomeDesc}>Gestiona tu cuenta y preferencias.</p>
        </div>
      </div>

      <div className={styles.configCard}>
        <div className={styles.configAvatar}>C</div>

        <div className={styles.configFields}>
          {campos.map((f) => (
            <div key={f.label} className={styles.configField}>
              <label className={styles.editLabel}>{f.label}</label>
              <div className={styles.editValue}>{f.value}</div>
            </div>
          ))}
        </div>

        <button className={styles.btnEditar} style={{ alignSelf: "flex-start" }}>
          ✏️ Editar perfil
        </button>
      </div>
    </div>
  );
}