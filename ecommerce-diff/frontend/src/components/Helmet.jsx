import { Helmet as ReactHelmet } from 'react-helmet-async';

const Helmet = ({ title, description }) => {
  const fullTitle = title ? `${title} — AURA Luxury` : 'AURA — Luxury Futuristic Commerce';
  return (
    <ReactHelmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </ReactHelmet>
  );
};

export default Helmet;
