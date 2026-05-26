import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Helmet from '@components/Helmet';
import { fetchCart, removeCartItem, updateCartItem } from '@store/cartSlice';
import { formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const { items, summary, status } = useSelector((s) => s.cart);

  useEffect(() => {
    if (isAuth) dispatch(fetchCart());
  }, [dispatch, isAuth]);

  if (!isAuth) {
    return (
      <div className="container" style={{ paddingTop: 160 }}>
        <div className="empty-state">
          <h2 className="aura-headline">Your bag is private.</h2>
          <p className="aura-body" style={{ marginTop: 12 }}>Sign in to view items.</p>
          <Link to={ROUTES.AUTH.LOGIN} className="btn btn--primary" style={{ marginTop: 24 }}>Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet title="Shopping bag" />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Bag</p>
            <h1 className="aura-display-md">Your selection</h1>
          </div>
          <p className="aura-mono">{summary.itemCount} item{summary.itemCount === 1 ? '' : 's'}</p>
        </header>

        {status === 'loading' ? (
          <div className="skeleton" style={{ height: 240 }} />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h2 className="aura-headline">Your bag is empty.</h2>
            <Link to={ROUTES.USER.SHOP} className="btn btn--primary" style={{ marginTop: 24 }}>
              Explore collections
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item) => {
                const img = item.product?.images?.[0]?.url;
                const unit = parseFloat(item.variant?.priceOverride || item.product?.price || 0);
                return (
                  <div key={item.id} className="surface" style={{ display: 'flex', gap: 24, padding: 16 }}>
                    <div style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', background: '#0f0f0f', flexShrink: 0 }}>
                      {img && <img src={img} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p className="aura-label">{item.product?.brand}</p>
                      <Link to={`/product/${item.product?.slug}`} className="aura-title">{item.product?.name}</Link>
                      {item.variant && <span className="aura-mono">{item.variant.name}</span>}
                      <span className="aura-mono">SKU · {item.variant?.sku || item.product?.sku}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                      <span className="aura-title">{formatPrice(unit * item.quantity)}</span>
                      <div className="quantity" style={{ padding: '6px 12px', gap: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, display: 'inline-flex', alignItems: 'center' }}>
                        <button type="button" onClick={() => dispatch(updateCartItem({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
                      </div>
                      <button className="aura-label" onClick={() => dispatch(removeCartItem(item.id))}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="surface" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content', position: 'sticky', top: 120 }}>
              <h3 className="aura-headline">Order summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="aura-body">Subtotal</span>
                <strong>{formatPrice(summary.subtotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="aura-body">Shipping</span>
                <span className="aura-body">Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="aura-body">Payment</span>
                <span className="aura-mono">CASH ON DELIVERY</span>
              </div>
              <div className="divider" />
              <button className="btn btn--primary" onClick={() => navigate(ROUTES.USER.CHECKOUT)}>
                Proceed to checkout
              </button>
              <Link to={ROUTES.USER.SHOP} className="btn btn--ghost">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .cart-grid { grid-template-columns: 1.6fr 1fr; gap: 40px; }
        }
      `}</style>
    </>
  );
};

export default CartPage;
