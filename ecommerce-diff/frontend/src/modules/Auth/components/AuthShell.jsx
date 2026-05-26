import { Link } from 'react-router-dom';

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#0b0b0b',
    }}
    className="auth-shell"
  >
    <aside
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
      }}
      className="auth-shell__art"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(80% 60% at 30% 30%, rgba(255,255,255,0.08), transparent 70%), linear-gradient(160deg, #111 0%, #000 100%)',
        }}
      />
      <Link
        to="/"
        style={{ position: 'relative', zIndex: 1 }}
        className="aura-display-md"
      >
        AURA
      </Link>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p className="aura-label" style={{ marginBottom: 16 }}>The new standard</p>
        <h2 className="aura-display-md" style={{ maxWidth: 460, marginBottom: 16 }}>
          Engineered artifacts for the elite.
        </h2>
        <p className="aura-body-lg" style={{ maxWidth: 420 }}>
          Sign in to your AURA account or create a new one to access the private collection.
        </p>
      </div>
    </aside>
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <header>
          <p className="aura-label" style={{ marginBottom: 16 }}>{subtitle}</p>
          <h1 className="aura-display-md">{title}</h1>
        </header>
        {children}
        {footer && <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>{footer}</div>}
      </div>
    </section>
    <style>{`
      @media (max-width: 1024px) {
        .auth-shell { grid-template-columns: 1fr !important; }
        .auth-shell__art { display: none !important; }
      }
    `}</style>
  </div>
);

export default AuthShell;
