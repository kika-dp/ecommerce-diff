import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Helmet from '@components/Helmet';
import { fetchWishlist, toggleWishlist } from '@store/wishlistSlice';
import { addToCart } from '@store/cartSlice';
import { formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const items = useSelector((s) => s.wishlist.items);

  useEffect(() => {
    if (isAuth) dispatch(fetchWishlist());
  }, [dispatch, isAuth]);

  if (!isAuth) {
    return (
      <div className="container" style={{ paddingTop: 160 }}>
        <div className="empty-state">
          <h2 className="aura-headline">Wishlist requires sign in.</h2>
          <Link to={ROUTES.AUTH.LOGIN} className="btn btn--primary" style={{ marginTop: 24 }}>Sign in</Link>
        </div>
      </div>
    );
  }

  const moveToCart = async (productId) => {
    const res = await dispatch(addToCart({ productId, quantity: 1 }));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(toggleWishlist(productId));
      toast.success('Moved to bag.');
    }
  };

  return (
    <>
      <Helmet title="Wishlist" />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Saved</p>
            <h1 className="aura-display-md">Your wishlist</h1>
          </div>
        </header>
        {items.length === 0 ? (
          <div className="empty-state">
            <h2 className="aura-headline">Nothing saved yet.</h2>
            <Link to={ROUTES.USER.SHOP} className="btn btn--primary" style={{ marginTop: 24 }}>Browse collection</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => {
              const img = item.product?.images?.[0]?.url;
              return (
                <article key={item.id} className="surface" style={{ display: 'flex', gap: 24, padding: 16 }}>
                  <Link to={`/product/${item.product?.slug}`} style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', background: '#0f0f0f', flexShrink: 0 }}>
                    {img && <img src={img} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </Link>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p className="aura-label">{item.product?.brand}</p>
                    <Link to={`/product/${item.product?.slug}`} className="aura-title">{item.product?.name}</Link>
                    <span className="aura-mono">{formatPrice(item.product?.price)}</span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn--primary btn--sm" onClick={() => moveToCart(item.productId)}>Move to bag</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => dispatch(toggleWishlist(item.productId))}>Remove</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .wishlist-grid {
          display: grid; gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
};

export default WishlistPage;
