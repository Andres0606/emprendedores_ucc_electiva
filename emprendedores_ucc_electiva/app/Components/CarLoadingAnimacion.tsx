'use client';

import { useState, useEffect, useRef } from 'react';
import '../globals.css';

/* ─── Icons ─────────────────────────────────────────── */
const Ic = {
  Car:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>,
  File:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Swap:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Tag:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Check:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Pin:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Arrow:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  User:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Eye:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  X:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Menu:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="16" y2="18"/></svg>,
  Mail:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Phone:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>,
  Star:   () => <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Zap:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

/* ─── Data ───────────────────────────────────────────── */
const SERVICIOS = [
  { icon: <Ic.File />,   label: 'Matrícula & Registro',   desc: 'Registro inicial y actualización de vehículos ante tránsito.',   color: 'blue' },
  { icon: <Ic.Swap />,   label: 'Traspaso de Vehículo',   desc: 'Cambio de propietario con toda la documentación requerida.',     color: 'violet' },
  { icon: <Ic.Pin />,    label: 'Traslado de Matrícula',  desc: 'Radicado y traslado entre municipios del departamento.',         color: 'cyan' },
  { icon: <Ic.Car />,    label: 'Duplicado de Placas',    desc: 'Trámite de duplicado de placas y licencias de tránsito.',        color: 'emerald' },
  { icon: <Ic.Shield />, label: 'Prenda & Cancelación',   desc: 'Inscripción, levantamiento y cancelación de matrículas.',       color: 'amber' },
  { icon: <Ic.Tag />,    label: 'Cambios de Servicio',    desc: 'Color, carrocería, servicio y más trámites ante el RUNT.',      color: 'rose' },
];

const SEDES = [
  { ciudad: 'Villavicencio', agentes: 5, emoji: '🏙️', tag: 'Sede principal', desc: 'Capital del Meta · 5 agentes disponibles', principal: true },
  { ciudad: 'Acacias',       agentes: 2, emoji: '🌿', tag: null, desc: '2 agentes disponibles' },
  { ciudad: 'Pto. López',    agentes: 1, emoji: '🌊', tag: null, desc: '1 agente disponible' },
  { ciudad: 'Pto. Gaitán',   agentes: 1, emoji: '🛣️', tag: null, desc: '1 agente disponible' },
  { ciudad: 'Restrepo',      agentes: 1, emoji: '⛰️', tag: null, desc: '1 agente disponible' },
];

/* ─── Animated counter ──────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let v = 0;
        const step = Math.ceil(to / 55);
        const t = setInterval(() => { v = Math.min(v + step, to); setVal(v); if (v >= to) clearInterval(t); }, 28);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Floating blobs background ─────────────────────── */
function Blobs() {
  return (
    <div className="blobs" aria-hidden>
      <div className="blob blob--1" />
      <div className="blob blob--2" />
      <div className="blob blob--3" />
      <div className="blob blob--4" />
    </div>
  );
}

/* ─── Login Modal ────────────────────────────────────── */
function LoginModal({ onClose }: { onClose: () => void }) {
  const [tab,     setTab]     = useState<'login'|'register'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', password:'' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bd" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal__x" onClick={onClose}><Ic.X /></button>

        <div className="modal__logo">
          <span className="modal__logo-mark"><Ic.Car /></span>
          <span>TransMeta</span>
        </div>

        <div className="modal__tabs">
          <button className={`modal__tab${tab==='login'?' on':''}`} onClick={() => setTab('login')}>Ingresar</button>
          <button className={`modal__tab${tab==='register'?' on':''}`} onClick={() => setTab('register')}>Registrarse</button>
          <div className={`modal__tab-slider${tab==='register'?' right':''}`} />
        </div>

        <div className="modal__body">
          {tab === 'login' ? (
            <>
              <h2 className="modal__h2">¡Bienvenido de nuevo!</h2>
              <p className="modal__sub">Accede a tu panel de trámites</p>
              <Field icon={<Ic.Mail />} label="Correo" type="email" placeholder="correo@email.com" value={form.email} onChange={set('email')} />
              <Field icon={<Ic.Lock />} label="Contraseña" type={showPwd?'text':'password'} placeholder="••••••••"
                value={form.password} onChange={set('password')}
                right={<button className="eye-btn" onClick={() => setShowPwd(v=>!v)}>{showPwd?<Ic.EyeOff />:<Ic.Eye />}</button>} />
              <a href="#" className="modal__forgot">¿Olvidaste tu contraseña?</a>
              <button className="modal__cta">Ingresar</button>
            </>
          ) : (
            <>
              <h2 className="modal__h2">Crea tu cuenta gratis</h2>
              <p className="modal__sub">Gestiona tus trámites en línea</p>
              <Field icon={<Ic.User />}  label="Nombre completo" type="text"     placeholder="Tu nombre"       value={form.name}     onChange={set('name')} />
              <Field icon={<Ic.Mail />}  label="Correo"          type="email"    placeholder="correo@email.com" value={form.email}    onChange={set('email')} />
              <Field icon={<Ic.Phone />} label="Teléfono"        type="tel"      placeholder="310 000 0000"    value={form.phone}    onChange={set('phone')} />
              <Field icon={<Ic.Lock />}  label="Contraseña"      type={showPwd?'text':'password'} placeholder="Mín. 8 caracteres"
                value={form.password} onChange={set('password')}
                right={<button className="eye-btn" onClick={() => setShowPwd(v=>!v)}>{showPwd?<Ic.EyeOff />:<Ic.Eye />}</button>} />
              <button className="modal__cta">Crear cuenta</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, type, placeholder, value, onChange, right }: {
  icon: React.ReactNode; label: string; type: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div className="field__row">
        <span className="field__ico">{icon}</span>
        <input className="field__input" type={type} placeholder={placeholder} value={value} onChange={onChange} />
        {right}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function HomePage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    // trigger entrance animation
    const t = setTimeout(() => setVisible(true), 80);
    return () => { window.removeEventListener('scroll', fn); clearTimeout(t); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showLogin ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showLogin]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const openLogin = () => setShowLogin(true);

  return (
    <div className="pg">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* NAV */}
      <header className={`nav${scrolled?' nav--up':''}`}>
        <button className="nav__logo" onClick={() => go('inicio')}>
          <span className="nav__mark"><Ic.Car /></span>
          TransMeta
        </button>

        <nav className={`nav__links${menuOpen?' open':''}`}>
          {['inicio','servicios','sedes','nosotros'].map(s => (
            <button key={s} className="nav__a" onClick={() => go(s)}>
              {s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
          <button className="nav__a nav__a--cta" onClick={openLogin}>Ingresar</button>
        </nav>

        <div className="nav__right">
          <button className="nav__in" onClick={openLogin}><Ic.User /> Ingresar</button>
          <button className="nav__reg" onClick={openLogin}>Registrarse →</button>
          <button className="nav__burg" onClick={() => setMenuOpen(v=>!v)}>
            {menuOpen ? <Ic.X /> : <Ic.Menu />}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" className="hero">
        <Blobs />

        <div className={`hero__inner${visible?' visible':''}`}>
          <div className="hero__copy">
            <div className="hero__pill">
              <span className="hero__dot" />
              Especialistas en trámites · Meta, Colombia
            </div>

            <h1 className="hero__h1">
              Tus trámites<br/>
              de tránsito,<br/>
              <span className="hero__gradient">sin complicaciones.</span>
            </h1>

            <p className="hero__p">
              10 agentes certificados en 5 municipios del Meta. Matrícula,
              traspasos, duplicados y más — rápido, claro y sin filas.
            </p>

            <div className="hero__btns">
              <button className="btn-blue" onClick={() => go('servicios')}>Ver servicios <Ic.Arrow /></button>
              <button className="btn-ghost" onClick={openLogin}>Crear cuenta gratis</button>
            </div>

            <div className="hero__chips">
              {['Sin filas','Precio claro','Seguimiento en tiempo real'].map(c => (
                <span key={c} className="chip"><Ic.Check />{c}</span>
              ))}
            </div>
          </div>

          {/* floating card */}
          <div className="hero__right">
            <div className="hcard">
              <div className="hcard__head">
                <div className="hcard__ico"><Ic.File /></div>
                <div>
                  <div className="hcard__name">Traspaso de vehículo</div>
                  <div className="hcard__meta">Villav. · Carlos Rodríguez</div>
                </div>
                <span className="hcard__status">En curso</span>
              </div>

              <div className="hcard__steps">
                {['Recibido','Radicado','Aprobación','Listo'].map((s,i) => (
                  <div key={s} className={`hcard__step${i<2?' done':i===2?' cur':''}`}>
                    <div className="hcard__dot" />
                    {i<3 && <div className="hcard__line" />}
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <div className="hcard__prog-row"><span>Progreso</span><span>68%</span></div>
              <div className="hcard__bar"><div className="hcard__fill" /></div>
            </div>

            {/* floating decorative pills */}
            <div className="fpill fpill--a"><Ic.Zap /><span>Rápido</span></div>
            <div className="fpill fpill--b"><Ic.Star /><span>4.9 ★</span></div>
            <div className="fpill fpill--c"><span className="fpill__num">500+</span><span>trámites/mes</span></div>
          </div>
        </div>

        {/* wave divider */}
        <div className="hero__wave" aria-hidden>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#F0F7FF"/></svg>
        </div>
      </section>

      {/* STATS */}
      <div className="statsbar">
        {([
          [2800,'+','Trámites realizados'],
          [5,'','Municipios'],
          [10,'','Agentes certificados'],
          [98,'%','Satisfacción'],
        ] as [number,string,string][]).map(([n,s,l]) => (
          <div key={l} className="statsbar__item">
            <strong><Counter to={n} suffix={s} /></strong>
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="servicios" className="sec services">
        <div className="sec__head">
          <p className="eyebrow">Lo que hacemos</p>
          <h2 className="sec__h2">Todos los trámites,<br/><em>un solo lugar</em></h2>
          <p className="sec__sub">Gestionamos ante las Secretarías de Tránsito de cada municipio con agilidad y experiencia.</p>
        </div>

        <div className="svc-grid">
          {SERVICIOS.map(({ icon, label, desc, color }, i) => (
            <div key={label} className={`svc svc--${color}`} style={{ '--di': i } as React.CSSProperties}>
              <div className="svc__ico">{icon}</div>
              <h3 className="svc__label">{label}</h3>
              <p className="svc__desc">{desc}</p>
              <span className="svc__arr"><Ic.Arrow /></span>
            </div>
          ))}
        </div>
      </section>

      {/* SEDES */}
      <section id="sedes" className="sec sedes">
        <div className="sec__head">
          <p className="eyebrow">Cobertura regional</p>
          <h2 className="sec__h2">Estamos en<br/><em>tu municipio</em></h2>
          <p className="sec__sub">Un agente presencial que conoce la oficina de tránsito local y sus procedimientos.</p>
        </div>

        <div className="sedes-grid">
          {SEDES.map(({ ciudad, agentes, emoji, tag, desc, principal }, i) => (
            <div key={ciudad} className={`sede${principal?' sede--main':''}`} style={{ '--di': i } as React.CSSProperties}>
              <div className="sede__top">
                <span className="sede__emoji">{emoji}</span>
                {tag && <span className="sede__tag">{tag}</span>}
              </div>
              <h3 className="sede__city">{ciudad}</h3>
              <p className="sede__desc">{desc}</p>
              <div className="sede__dots">
                {Array.from({ length: agentes }).map((_,k) => <span key={k} className="adot" />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section id="nosotros" className="sec why">
        <div className="why__wrap">
          <div className="why__left">
            <p className="eyebrow">¿Por qué elegirnos?</p>
            <h2 className="sec__h2 left">Presencia local,<br/><em>resultados reales</em></h2>
            <p className="sec__sub left">Somos el aliado de los propietarios de vehículos en el Meta. Conocemos cada oficina, cada funcionario y cada procedimiento.</p>
            <ul className="why__list">
              {['Personal capacitado en cada municipio','Sin filas ni esperas innecesarias',
                'Seguimiento en tiempo real','Tarifas transparentes, sin sorpresas',
                'Más de 3 años de experiencia regional'].map(item => (
                <li key={item}><span className="why__chk"><Ic.Check /></span>{item}</li>
              ))}
            </ul>
            <button className="btn-blue" onClick={openLogin}>Empezar ahora <Ic.Arrow /></button>
          </div>

          <div className="why__nums">
            {[
              { n:2800, s:'+', l:'Trámites\nrealizados' },
              { n:5,    s:'',  l:'Municipios\ncubiertos' },
              { n:10,   s:'',  l:'Agentes\ncertificados' },
              { n:3,    s:'+', l:'Años de\nexperiencia' },
            ].map(({ n,s,l }) => (
              <div key={l} className="numcard">
                <strong><Counter to={n} suffix={s} /></strong>
                <span style={{ whiteSpace:'pre-line' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta">
        <div className="cta__gfx" aria-hidden>
          <div className="cta__blob cta__blob--1" />
          <div className="cta__blob cta__blob--2" />
        </div>
        <div className="cta__text">
          <h2>¿Listo para gestionar tu trámite?</h2>
          <p>Crea tu cuenta gratis y un agente de tu municipio te atiende hoy.</p>
        </div>
        <div className="cta__btns">
          <button className="btn-white" onClick={openLogin}>Crear cuenta gratis <Ic.Arrow /></button>
          <button className="btn-ghost-w"><Ic.Phone /> Llamar ahora</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__brand">
          <span className="nav__mark"><Ic.Car /></span>
          TransMeta®
        </div>
        <p className="footer__tag">Especialistas en trámites vehiculares · Meta, Colombia</p>
        <div className="footer__links">
          {['inicio','servicios','sedes','nosotros'].map(s => (
            <button key={s} onClick={() => go(s)} className="footer__a">
              {s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} TransMeta. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}