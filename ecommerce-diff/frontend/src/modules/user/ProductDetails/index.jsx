import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import ProductCard from '@components/ProductCard';
import { addToCart } from '@store/cartSlice';
import { toggleWishlist } from '@store/wishlistSlice';
import { formatPrice } from '@utils/format';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const wishlist = useSelector((s) => s.wishlist.items);
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.PRODUCTS.BY_SLUG(slug));
        setProduct(data.data);
        const sim = await api.get(ENDPOINTS.PRODUCTS.SIMILAR(data.data.id));
        setSimilar(unwrap(sim) || []);
        setActiveImage(0);
        setVariantId(data.data.variants?.[0]?.id || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="container" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <div className="skeleton" style={{ height: 480 }} />
      </div>
    );
  }

  const isWishlisted = wishlist.some((w) => w.productId === product.id);
  const images = product.images || [];

  const onAdd = async () => {
    if (!isAuth) {
      toast.error('Sign in to add items.');
      return;
    }
    const res = await dispatch(addToCart({ productId: product.id, variantId, quantity }));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Added to bag.');
  };

  return (
    <>
      <Helmet title={product.name} description={product.shortDescription} />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div className="pdp-grid">
          <div className="pdp-gallery">
            <div className="pdp-gallery__hero">
              {images[activeImage] && (
                <img src={images[activeImage].url} alt={images[activeImage].alt || product.name} />
              )}
            </div>
            {images.length > 1 && (
              <div className="pdp-gallery__thumbs">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`pdp-gallery__thumb ${activeImage === idx ? 'active' : ''}`}
                  >
                    <img src={img.url} alt={img.alt || product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="pdp-info">
            <p className="aura-label">{product.brand} · {product.productType?.name}</p>
            <h1 className="aura-display-md">{product.name}</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span className="aura-display-md" style={{ fontSize: 32 }}>{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="aura-body-lg">{product.description}</p>

            {product.variants?.length > 0 && (
              <div>
                <p className="aura-label" style={{ marginBottom: 12 }}>Variant</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`chip ${variantId === v.id ? 'active' : ''}`}
                      onClick={() => setVariantId(v.id)}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="quantity">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="decrease">−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="increase">+</button>
              </div>
              <span className="aura-mono">{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn--primary" onClick={onAdd} disabled={product.stock === 0}>Add to bag</button>
              <button
                className={`btn ${isWishlisted ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => dispatch(toggleWishlist(product.id))}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {isWishlisted ? 'favorite' : 'favorite_border'}
                </span>
                {isWishlisted ? 'In wishlist' : 'Wishlist'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
              <p className="aura-label">Cash on Delivery</p>
              <p className="aura-body">Pay at delivery. Free shipping over ₹5,000. 14-day atelier exchange.</p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section style={{ marginTop: 96 }}>
            <h2 className="aura-display-md" style={{ marginBottom: 32 }}>You may also love</h2>
            <div className="product-grid">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .pdp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .pdp-grid { grid-template-columns: 1.2fr 1fr; gap: 80px; }
        }
        .pdp-gallery__hero {
          aspect-ratio: 4/5;
          background: #161616;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          overflow: hidden;
        }
        .pdp-gallery__hero img { width: 100%; height: 100%; object-fit: cover; }
        .pdp-gallery__thumbs {
          display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;
        }
        .pdp-gallery__thumb {
          width: 72px; height: 72px; border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08); padding: 0; background: #111;
        }
        .pdp-gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pdp-gallery__thumb.active { border-color: #fff; }
        .pdp-info { display: flex; flex-direction: column; gap: 24px; }
        .quantity { display: inline-flex; align-items: center; gap: 16px; border: 1px solid rgba(255,255,255,0.18); padding: 8px 16px; border-radius: 999px; }
        .quantity button { font-size: 18px; }
        .product-grid {
          display: grid; gap: 24px;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        }
      `}</style>
    </>
  );
};

export default ProductDetailsPage;
