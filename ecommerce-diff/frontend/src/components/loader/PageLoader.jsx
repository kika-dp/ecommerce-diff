const PageLoader = ({ label = 'AURA' }) => (
  <div className="aura-loader" role="status" aria-live="polite">
    <div className="aura-loader__mark">{label}</div>
  </div>
);

export default PageLoader;
