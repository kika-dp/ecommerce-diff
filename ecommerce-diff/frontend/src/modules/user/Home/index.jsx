import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import ProductCard from '@components/ProductCard';
import { ROUTES } from '@routes/routesConstants';

const Section = ({ eyebrow, title, link, children }) => (
  <section className="section container">
    <div className="section__head">
      <div>
        <p className="aura-label">{eyebrow}</p>
        <h2 className="aura-display-md" style={{ marginTop: 8 }}>{title}</h2>
      </div>
      {link && (
        <Link to={link} className="aura-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4 }}>
          View All
        </Link>
      )}
    </div>
    {children}
  </section>
);

const HomePage = () => {
  const [hero, setHero] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [byCategory, setByCategory] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [f, t, b, sh, wa, je] = await Promise.all([
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { featured: true, limit: 6 } }),
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { trending: true, limit: 6 } }),
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { bestseller: true, limit: 6 } }),
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { productTypeSlug: 'shoes', limit: 3 } }),
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { productTypeSlug: 'watches', limit: 3 } }),
          api.get(ENDPOINTS.PRODUCTS.LIST, { params: { productTypeSlug: 'jewellery', limit: 3 } }),
        ]);
        if (!mounted) return;
        const featuredItems = unwrap(f) || [];
        setFeatured(featuredItems);
        setTrending(unwrap(t) || []);
        setBestsellers(unwrap(b) || []);
        setByCategory({ Shoes: unwrap(sh) || [], Watches: unwrap(wa) || [], Jewellery: unwrap(je) || [] });
        setHero(featuredItems[0] || null);
      } catch (_e) {
        /* error toast handled by interceptor */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Helmet title="The new standard" description="AURA — luxury futuristic commerce for shoes, watches, jewellery." />
      <section className="hero">
        <div className="hero__backdrop" />
        <div className="hero__content">
          <p className="hero__eyebrow">{hero?.brand || 'AURA · Maison'}</p>
          <h1 className="aura-display-xl" style={{ color: '#fff' }}>
            {hero?.name || 'THE NEW STANDARD'}
          </h1>
          <p className="aura-body-lg" style={{ maxWidth: 620 }}>
            {hero?.shortDescription || 'Engineered for the elite. Discover meticulously crafted artifacts — shoes, timepieces and high jewellery.'}
          </p>
          <div className="hero__cta">
            <Link to={ROUTES.USER.SHOP} className="btn btn--primary">Shop the collection</Link>
            <Link to="/shop/watches" className="btn btn--ghost">Explore timepieces</Link>
          </div>
        </div>
      </section>

      <Section eyebrow="Curated Artifacts" title="Featured" link={ROUTES.USER.SHOP}>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {Object.entries(byCategory).map(([cat, items]) =>
        items.length ? (
          <Section
            key={cat}
            eyebrow={cat === 'Shoes' ? 'Footwear' : cat === 'Watches' ? 'Timepieces' : 'High Jewellery'}
            title={cat}
            link={`/shop/${cat.toLowerCase()}`}
          >
            <div className="product-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Section>
        ) : null,
      )}

      {trending.length > 0 && (
        <Section eyebrow="Movement" title="Trending Now" link={ROUTES.USER.SHOP}>
          <div className="product-grid">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {bestsellers.length > 0 && (
        <Section eyebrow="Atelier Favourites" title="Best Sellers" link={ROUTES.USER.SHOP}>
          <div className="product-grid">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      <section className="section container">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center', padding: 64 }}>
          <p className="aura-label">Newsletter</p>
          <h3 className="aura-display-md">Receive private invitations</h3>
          <p className="aura-body-lg" style={{ maxWidth: 560 }}>
            Limited drops, atelier events, and bespoke commissions. Reserved for members.
          </p>
          <form
            style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 480 }}
            onSubmit={(e) => {
              e.preventDefault();
              alert('Subscribed to the AURA list.');
            }}
          >
            <input className="field__input" placeholder="you@aura.luxe" type="email" required />
            <button className="btn btn--primary" type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
        @media (min-width: 768px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); gap: 32px; }
        }
      `}</style>
    </>
  );
};

export default HomePage;
