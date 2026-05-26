import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import StatusBadge from '@components/StatusBadge';
import Box from './components/Box';
import { formatDateTime, formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(ENDPOINTS.DASHBOARD.OVERVIEW).then((res) => setData(unwrap(res)));
  }, []);

  return (
    <>
      <Helmet title="Admin Dashboard" />
      <header className="section__head">
        <div>
          <p className="aura-label">Atelier · Overview</p>
          <h1 className="aura-display-md">Dashboard</h1>
        </div>
        <Link to={ROUTES.ADMIN.ORDERS} className="btn btn--ghost btn--sm">View orders</Link>
      </header>

      <div className="metric-grid">
        <Box label="Total users" value={data?.cards.totalUsers ?? '—'} icon="group" hint="Lifetime members" />
        <Box label="Catalogue size" value={data?.cards.totalProducts ?? '—'} icon="inventory_2" hint="Active SKUs" />
        <Box label="Orders" value={data?.cards.totalOrders ?? '—'} icon="receipt_long" hint="All time" />
        <Box label="Revenue" value={data ? formatPrice(data.cards.revenue) : '—'} icon="trending_up" hint="Delivered orders" />
      </div>

      <section style={{ marginTop: 48 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Recent</p>
            <h2 className="aura-headline">Latest orders</h2>
          </div>
          <Link to={ROUTES.ADMIN.ORDERS} className="aura-label">View all</Link>
        </header>
        <div className="surface" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Placed</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.length ? (
                data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`${ROUTES.ADMIN.ORDERS}/${o.id}`} style={{ color: '#fff' }}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{formatDateTime(o.createdAt)}</td>
                    <td>{o.user?.fullName || '—'}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>{formatPrice(o.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 24px;
        }
        @media (min-width: 768px) {
          .metric-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1280px) {
          .metric-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
