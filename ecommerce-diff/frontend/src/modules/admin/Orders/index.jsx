import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { unwrap, unwrapMeta } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import Pagination from '@components/Pagination';
import StatusBadge from '@components/StatusBadge';
import { formatDateTime, formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export const AdminOrders = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(ENDPOINTS.ORDERS.LIST, { params: { page, limit: 12, status: status || undefined } })
      .then((res) => {
        const { data, meta: m } = unwrapMeta(res);
        setItems(data || []);
        setMeta(m);
      });
  }, [page, status]);

  return (
    <>
      <Helmet title="Admin · Orders" />
      <header className="section__head">
        <div>
          <p className="aura-label">Atelier</p>
          <h1 className="aura-display-md">Orders</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`chip ${!status ? 'active' : ''}`} onClick={() => { setStatus(''); setPage(1); }}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => { setStatus(s); setPage(1); }}>{s}</button>
          ))}
        </div>
      </header>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Status</th><th>Placed</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>No orders.</td></tr>
            ) : items.map((o) => (
              <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`${ROUTES.ADMIN.ORDERS}/${o.id}`)}>
                <td>{o.orderNumber}</td>
                <td>{o.user?.fullName}<br /><span className="aura-mono">{o.user?.email}</span></td>
                <td><StatusBadge status={o.status} /></td>
                <td>{formatDateTime(o.createdAt)}</td>
                <td>{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPage={(p) => setPage(p)} />
    </>
  );
};

export const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const load = () => api.get(ENDPOINTS.ORDERS.ONE(id)).then((res) => setOrder(unwrap(res)));
  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status) => {
    await api.patch(ENDPOINTS.ORDERS.STATUS(id), { status });
    toast.success(`Status updated to ${status}.`);
    load();
  };

  if (!order) return <div className="skeleton" style={{ height: 240 }} />;

  return (
    <>
      <Helmet title={`Order ${order.orderNumber}`} />
      <header className="section__head">
        <div>
          <p className="aura-label">Order · {order.orderNumber}</p>
          <h1 className="aura-display-md">{order.user?.fullName}</h1>
          <p className="aura-body">{order.user?.email} · {formatDateTime(order.createdAt)}</p>
        </div>
        <Link to={ROUTES.ADMIN.ORDERS} className="btn btn--ghost btn--sm">Back</Link>
      </header>

      <div className="order-grid">
        <div className="surface" style={{ padding: 24 }}>
          <h3 className="aura-headline">Items</h3>
          {order.items?.map((it) => (
            <div key={it.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {it.productImage && <img src={it.productImage} alt={it.productName} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
              <div style={{ flex: 1 }}>
                <p className="aura-title">{it.productName}</p>
                <p className="aura-mono">SKU · {it.productSku}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>×{it.quantity}</p>
                <p className="aura-title">{formatPrice(it.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>
        <aside className="surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="aura-headline">Status</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATUSES.map((s) => (
              <button key={s} className={`chip ${order.status === s ? 'active' : ''}`} onClick={() => updateStatus(s)}>{s}</button>
            ))}
          </div>
          <div className="divider" />
          <h4 className="aura-label">Shipping</h4>
          <p className="aura-body" style={{ color: '#fff' }}>{order.shippingAddress?.fullName}</p>
          <p className="aura-body">{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
          <p className="aura-body">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
          <p className="aura-mono">{order.shippingAddress?.mobile}</p>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{formatPrice(order.subtotal)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{formatPrice(order.shippingFee)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><strong>{formatPrice(order.taxAmount)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-headline">Total</span><span className="aura-headline">{formatPrice(order.total)}</span></div>
        </aside>
      </div>
      <style>{`
        .order-grid { display: grid; gap: 24px; grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .order-grid { grid-template-columns: 1.6fr 1fr; } }
      `}</style>
    </>
  );
};

export default AdminOrders;
