'use client';

import Header from "../Components/header";
import Footer from "../Components/footer";
import styles from "../css/Terminos.module.css";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Términos, Condiciones y Privacidad</h1>
          <p className={styles.subtitle}>
            Bienvenido a EmprendedoresUCC. Al utilizar nuestra plataforma, aceptas las siguientes políticas y condiciones de uso.
          </p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Política de Privacidad</h2>
            <p className={styles.text}>
              En <span className={styles.highlight}>EmprendedoresUCC</span>, valoramos y protegemos la privacidad de nuestros usuarios. Los datos personales recolectados a través de la plataforma son utilizados exclusivamente para:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Facilitar la conexión entre emprendedores y clientes de la comunidad UCC.</li>
              <li className={styles.listItem}>Verificar la autenticidad de la vinculación académica con la Universidad Cooperativa de Colombia.</li>
              <li className={styles.listItem}>Mejorar la experiencia de usuario y el funcionamiento técnico del sitio.</li>
            </ul>
            <p className={styles.text}>
              No compartimos información personal con terceros ajenos a la institución sin el consentimiento previo del usuario, salvo requerimiento legal.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Responsabilidad del Contenido</h2>
            <div className={styles.disclaimer}>
              <p className={styles.text}>
                <strong>Aviso Importante:</strong> EmprendedoresUCC es una plataforma de visibilización. La administración del sitio <strong>no se hace responsable</strong> por el contenido, la calidad de los productos, la veracidad de los servicios o las transacciones realizadas entre usuarios.
              </p>
            </div>
            <p className={styles.text}>
              Cada usuario es el único responsable de la información, descripciones y material multimedia que suba a la plataforma. EmprendedoresUCC se reserva el derecho de retirar cualquier contenido que considere inapropiado, ofensivo o que incumpla los principios institucionales de la UCC.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Uso de Imágenes y Derechos de Autor</h2>
            <p className={styles.text}>
              El uso de imágenes en nuestra plataforma está sujeto a las siguientes reglas:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Propiedad Intelectual:</strong> Los emprendedores declaran poseer los derechos de autor o las licencias necesarias sobre las imágenes de productos y logos que suben a la plataforma.
              </li>
              <li className={styles.listItem}>
                <strong>Uso Institucional:</strong> Al subir imágenes, el usuario autoriza a EmprendedoresUCC y a la Universidad Cooperativa de Colombia a utilizar dicho material con fines de promoción de la plataforma y del ecosistema de emprendimiento estudiantil.
              </li>
              <li className={styles.listItem}>
                <strong>Protección de Imagen:</strong> Queda prohibido subir contenido que vulnere la privacidad o el derecho a la propia imagen de terceros sin su autorización expresa.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Veracidad de la Información</h2>
            <p className={styles.text}>
              Los usuarios se comprometen a proporcionar información veraz sobre sus emprendimientos. Cualquier intento de fraude, suplantación de identidad o publicidad engañosa resultará en la suspensión inmediata de la cuenta y el reporte a las instancias universitarias correspondientes.
            </p>
          </section>

          <section className={styles.section} style={{ marginBottom: 0 }}>
            <h2 className={styles.sectionTitle}>Contacto</h2>
            <p className={styles.text}>
              Si tienes dudas sobre estos términos, puedes contactarnos a través del correo institucional: <br />
              <Link href="mailto:emprendedores@ucc.edu.co" className={styles.highlight}>emprendedores@ucc.edu.co</Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
