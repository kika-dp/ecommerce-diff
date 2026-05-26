const Box = ({ label, value, hint, icon }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="stat-card__label">{label}</span>
      {icon && <span className="material-symbols-outlined" style={{ color: '#9c9c9c' }}>{icon}</span>}
    </div>
    <span className="stat-card__value">{value}</span>
    {hint && <span className="stat-card__hint">{hint}</span>}
  </div>
);

export default Box;
