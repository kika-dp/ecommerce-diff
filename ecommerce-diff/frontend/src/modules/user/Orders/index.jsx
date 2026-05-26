import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import StatusBadge from '@components/StatusBadge';
import { formatDateTime } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

export const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    api.get(ENDPOINTS.ORDERS.MINE).then((res) => setOrders(unwrap(res) || []));
  }, []);
  return (
    <>
      <Helmet title="My orders" />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Atelier</p>
            <h1 className="aura-display-md">Order history</h1>
          </div>
          <Link to={ROUTES.USER.PROFILE} className="aura-label">Back to profile</Link>
        </header>
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet. Explore the collection to place your first.</p>
            <Link to={ROUTES.USER.SHOP} className="btn btn--primary" style={{ marginTop: 24 }}>
              Shop now
            </Link>
          </div>
        ) : (
          <div className="surface" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Placed</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => navigate(`${ROUTES.USER.ORDERS}/${o.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{o.orderNumber}</td>
                    <td>{formatDateTime(o.createdAt)}</td>
                    <td>{o.items?.length || 0}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => {
    api.get(ENDPOINTS.ORDERS.MY_ONE(id)).then((res) => setOrder(unwrap(res)));
  }, [id]);

  const onCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    const res = await api.patch(ENDPOINTS.ORDERS.MY_CANCEL(id));
    setOrder(unwrap(res));
  };

  if (!order) {
    return <div className="container" style={{ paddingTop: 160 }}><div className="skeleton" style={{ height: 240 }} /></div>;
  }

  return (
    <>
      <Helmet title={`Order ${order.orderNumber}`} />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Order · {order.orderNumber}</p>
            <h1 className="aura-display-md">Status: {order.status}</h1>
            <p className="aura-body">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <StatusBadge status={order.status} />
            {!['delivered', 'shipped', 'cancelled'].includes(order.status) && (
              <button className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel order</button>
            )}
          </div>
        </header>
        <div className="order-grid">
          <div className="surface" style={{ padding: 24 }}>
            <h3 className="aura-headline" style={{ marginBottom: 16 }}>Items</h3>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p className="aura-title">{item.productName}</p>
                  <p className="aura-mono">SKU · {item.productSku}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="aura-body">×{item.quantity}</p>
                  <p className="aura-title">{item.lineTotal}</p>
                </div>
              </div>
            ))}
          </div>
          <aside className="surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="aura-headline">Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Subtotal</span><strong>{order.subtotal}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Shipping</span><strong>{order.shippingFee}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-body">Tax</span><strong>{order.taxAmount}</strong></div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="aura-headline">Total</span><span className="aura-headline">{order.total}</span></div>
            <div className="divider" />
            <h4 className="aura-label">Shipping to</h4>
            <p className="aura-body" style={{ color: '#fff' }}>{order.shippingAddress?.fullName}</p>
            <p className="aura-body">{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
            <p className="aura-body">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
            <p className="aura-mono">{order.shippingAddress?.mobile}</p>
            <p className="aura-mono">PAY: {order.paymentMethod}</p>
          </aside>
        </div>
      </div>
      <style>{`
        .order-grid {
          display: grid; gap: 24px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .order-grid { grid-template-columns: 1.6fr 1fr; }
        }
      `}</style>
    </>
  );
};

export default OrdersListPage;
