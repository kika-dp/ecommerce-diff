const StatusBadge = ({ status }) => {
  const label = (status || '').toString().toLowerCase();
  return (
    <span className={`badge badge--${label}`}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
      {label}
    </span>
  );
};

export default StatusBadge;
