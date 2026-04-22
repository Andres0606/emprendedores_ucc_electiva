"use client";

import React, { useState, useEffect } from "react";
import styles from "../../css/inicioAdministrativo/miperfil.module.css";
import Link from "next/link";

export default function MiPerfilAdministrativoPage() {
  const [tipoUsuario, setTipoUsuario] = useState("administrativo");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargo, setCargo] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const tipo = sessionStorage.getItem("tipoUsuario") || "administrativo";
        const nombre = sessionStorage.getItem("nombreUsuario") || "Usuario";
        const usuarioId = sessionStorage.getItem("usuarioId");
        const usuarioGuardado = sessionStorage.getItem("usuario");

        let nombreCompleto = nombre;
        let cargoData = "";
        let dependenciaData = "";
        let emailData = "";
        let telefonoData = "";

        if (usuarioGuardado) {
          try {
            const usuario = JSON.parse(usuarioGuardado);
            if (usuario.nombre && usuario.apellido) {
              nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
              sessionStorage.setItem("nombreUsuario", nombreCompleto);
            } else if (usuario.nombre) {
              nombreCompleto = usuario.nombre;
            }
            cargoData = usuario.cargo || "Cargo no especificado";
            dependenciaData = usuario.dependencia || "Dependencia no especificada";
            emailData = usuario.correo || "";
            telefonoData = usuario.telefono || "";
          } catch (e) {
            console.error("Error al parsear usuario:", e);
          }
        }

        // Si no tenemos los datos completos, consultar al backend
        if (usuarioId && (!cargoData || cargoData === "Cargo no especificado")) {
          try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`);
            if (res.ok) {
              const data = await res.json();
              cargoData = data.cargo || data.puesto || "Cargo no especificado";
              dependenciaData = data.dependencia || data.area || "Dependencia no especificada";
              emailData = data.correo || emailData;
              telefonoData = data.telefono || telefonoData;
            }
          } catch (error) {
            console.error("Error al obtener datos del backend:", error);
          }
        }

        setTipoUsuario(tipo.toLowerCase());
        setNombreUsuario(nombreCompleto);
        setCargo(cargoData);
        setDependencia(dependenciaData);
        setEmail(emailData);
        setTelefono(telefonoData);

      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatosUsuario();
  }, []);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div>Cargando perfil...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <Link href="/inicioadministrativo" className={styles.back}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {nombreUsuario.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{nombreUsuario}</h1>
            <span className={styles.profileBadge}>Administrativo UCC</span>
            {cargo && cargo !== "Cargo no especificado" && (
              <p className={styles.profileCargo}>{cargo}</p>
            )}
            {dependencia && dependencia !== "Dependencia no especificada" && (
              <p className={styles.profileDependencia}>{dependencia}</p>
            )}
          </div>

          <Link href="/inicioadministrativo/configuracion" className={styles.configBtn}>
            Configuración
          </Link>
        </div>

        {/* Grid */}
        <div className={styles.profileGrid}>

          {/* Información laboral */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Información laboral</h2>
            <ul className={styles.dataList}>
              <li>
                <span className={styles.dataKey}>Cargo</span>
                <span className={styles.dataVal}>{cargo}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Dependencia</span>
                <span className={styles.dataVal}>{dependencia}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Correo institucional</span>
                <span className={styles.dataVal}>{email || "No registrado"}</span>
              </li>
              <li>
                <span className={styles.dataKey}>Teléfono</span>
                <span className={styles.dataVal}>{telefono || "No registrado"}</span>
              </li>
            </ul>
          </section>

          {/* Estadísticas de la plataforma */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Estadísticas UCC Emprende</h2>
            <ul className={styles.dataList}>
              <li>
                <span className={styles.dataKey}>Emprendimientos activos</span>
                <span className={styles.dataVal}>---</span>
              </li>
              <li>
                <span className={styles.dataKey}>Estudiantes emprendedores</span>
                <span className={styles.dataVal}>---</span>
              </li>
              <li>
                <span className={styles.dataKey}>Productos publicados</span>
                <span className={styles.dataVal}>---</span>
              </li>
              <li>
                <span className={styles.dataKey}>Eventos realizados</span>
                <span className={styles.dataVal}>---</span>
              </li>
            </ul>
          </section>

          {/* Funciones del rol */}
          <section className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Funciones como administrativo</h2>
            <div className={styles.funcionesList}>
              <div className={styles.funcionItem}>
                <span className={styles.funcionIcon}>👁️</span>
                <div>
                  <p className={styles.funcionTitle}>Visibilidad general</p>
                  <p className={styles.funcionDesc}>Acceso a todos los emprendimientos registrados en la plataforma.</p>
                </div>
              </div>
              <div className={styles.funcionItem}>
                <span className={styles.funcionIcon}>📊</span>
                <div>
                  <p className={styles.funcionTitle}>Estadísticas</p>
                  <p className={styles.funcionDesc}>Visualización de métricas y crecimiento de la comunidad emprendedora.</p>
                </div>
              </div>
              <div className={styles.funcionItem}>
                <span className={styles.funcionIcon}>🎓</span>
                <div>
                  <p className={styles.funcionTitle}>Apoyo institucional</p>
                  <p className={styles.funcionDesc}>Promoción y difusión de los emprendimientos UCC.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}