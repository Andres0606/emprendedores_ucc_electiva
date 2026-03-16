"use client";
import { useState } from "react";
import styles from "../css/inicioemprendedor/page.module.css";

import Sidebar               from "./components/Sidebar";
import Topbar                from "./components/Topbar";
import DashboardSection      from "./components/Dashboardsection";
import EmprendimientoSection from "./components/Emprendimientosection";
import ProductosSection      from "./components/Productossection";
import ConfiguracionSection  from "./components/Configuracionsection";

type Seccion  = "dashboard" | "emprendimiento" | "productos" | "config";
type EstadoEmp = "activo" | "pausado";

export default function DashboardPage() {
  const [seccion,     setSeccion]     = useState<Seccion>("dashboard");
  const [estadoEmp,   setEstadoEmp]   = useState<EstadoEmp>("activo");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className={styles.wrapper}>
      {/* ── Sidebar ── */}
      <Sidebar
        seccion={seccion}
        setSeccion={(id) => setSeccion(id as Seccion)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className={styles.main}>
        <Topbar seccion={seccion} setSidebarOpen={setSidebarOpen} />

        {seccion === "dashboard"      && (
          <DashboardSection
            estadoEmp={estadoEmp}
            setEstadoEmp={setEstadoEmp}
            setSeccion={(id) => setSeccion(id as Seccion)}
          />
        )}
        {seccion === "emprendimiento" && (
          <EmprendimientoSection
            estadoEmp={estadoEmp}
            setEstadoEmp={setEstadoEmp}
          />
        )}
        {seccion === "productos"      && <ProductosSection />}
        {seccion === "config"         && <ConfiguracionSection />}
      </div>
    </div>
  );
}