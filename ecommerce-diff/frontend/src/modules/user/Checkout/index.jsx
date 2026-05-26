import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Helmet from '@components/Helmet';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import { fetchCart, resetCart } from '@store/cartSlice';
import { formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items, summary } = useSelector((s) => s.cart);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const subtotal = parseFloat(summary.subtotal || 0);
  const shipping = subtotal >= 5000 ? 0 : 99;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + shipping + tax;

  const onSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post(ENDPOINTS.ORDERS.PLACE, {
        shippingAddress: form,
        notes,
      });
      const order = unwrap({ data });
      dispatch(resetCart());
      toast.success(`Order ${order.orderNumber} confirmed.`);
      navigate(`${ROUTES.USER.ORDERS}/${order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 160 }}>
        <div className="empty-state">
          <h2 className="aura-headline">Your bag is empty.</h2>
          <Link to={ROUTES.USER.SHOP} className="btn btn--primary" style={{ marginTop: 24 }}>
            Explore the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet title="Checkout" />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Checkout</p>
            <h1 className="aura-display-md">Confirm your delivery</h1>
          </div>
          <p className="aura-mono">Cash on Delivery</p>
        </header>

        <form className="checkout-grid" onSubmit={onSubmit}>
          <div className="surface" style={{ padding: 32, display: 'grid', gap: 16 }}>
            <h3 className="aura-headline">Shipping address</h3>
            <div className="checkout-row">
              <div className="field">
                <label className="field__label">Full name</label>
                <input className="field__input" name="fullName" required value={form.fullName} onChange={onChange} />
              </div>
              <div className="field">
                <label className="field__label">Mobile</label>
                <input className="field__input" name="mobile" required value={form.mobile} onChange={onChange} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Address line 1</label>
              <input className="field__input" name="line1" required value={form.line1} onChange={onChange} />
            </div>
            <div className="field">
              <label className="field__label">Address line 2 (optional)</label>
              <input className="field__input" name="line2" value={form.line2} onChange={onChange} />
            </div>
            <div className="checkout-row">
              <div className="field">
                <label className="field__label">City</label>
                <input className="field__input" name="city" required value={form.city} onChange={onChange} />
              </div>
              <div className="field">
                <label className="field__label">State</label>
                <input className="field__input" name="state" required value={form.state} onChange={onChange} />
              </div>
            </div>
            <div className="checkout-row">
              <div className="field">
                <label className="field__label">Pincode</label>
                <input className="field__input" name="pincode" required value={form.pincode} onChange={onChange} />
              </div>
              <div className="field">
                <label className="field__label">Landmark (optional)</label>
                <input className="field__input" name="landmark" value={form.landmark} onChange={onChange} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Order notes (optional)</label>
              <textarea className="field__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any instruction for the atelier" />
            </div>
          </div>

          <aside className="surface" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content', position: 'sticky', top: 120 }}>
            <h3 className="aura-headline">Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="aura-body" style={{ color: '#fff' }}>{it.product?.name} × {it.quantity}</span>
                  <span>{formatPrice(parseFloat(it.variant?.priceOverride || it.product?.price || 0) * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Shipping</span><strong>{formatPrice(shipping)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Tax (5%)</span><strong>{formatPrice(tax)}</strong></div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-headline">Total</span><span className="aura-headline">{formatPrice(total)}</span></div>
            <button className="btn btn--primary" disabled={placing} type="submit">
              {placing ? 'Placing…' : 'Place order'}
            </button>
            <p className="aura-mono" style={{ textAlign: 'center' }}>Payment collected at delivery</p>
          </aside>
        </form>
      </div>

      <style>{`
        .checkout-grid {
          display: grid; gap: 24px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .checkout-grid { grid-template-columns: 1.4fr 1fr; gap: 40px; }
        }
        .checkout-row { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 600px) {
          .checkout-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;
