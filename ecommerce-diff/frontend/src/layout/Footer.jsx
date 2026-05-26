const Footer = () => (
  <footer
    style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '80px 24px 32px',
      background: '#0e0e0e',
      marginTop: 96,
    }}
  >
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <span className="aura-display-lg" style={{ opacity: 0.08 }}>
          AURA
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <a className="aura-label" href="#sustainability">Sustainability</a>
          <a className="aura-label" href="#story">Maison Story</a>
          <a className="aura-label" href="#bespoke">Bespoke Services</a>
          <a className="aura-label" href="#privacy">Privacy</a>
        </div>
      </div>
      <div className="aura-label" style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} AURA LUXURY INTERNATIONALE · ALL RIGHTS RESERVED
      </div>
    </div>
  </footer>
);

export default Footer;
