import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Helmet from '@components/Helmet';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import { fetchProfile, logout } from '@modules/Auth/slice/AuthSlice';
import { ROUTES } from '@routes/routesConstants';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ fullName: user?.fullName || '', mobile: user?.mobile || '' });

  useEffect(() => {
    dispatch(fetchProfile());
    api.get(ENDPOINTS.USERS.ADDRESSES).then((res) => setAddresses(unwrap(res) || []));
    api.get(ENDPOINTS.ORDERS.MINE, { params: { limit: 5 } }).then((res) => setOrders(unwrap(res) || []));
  }, [dispatch]);

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, mobile: user.mobile || '' });
  }, [user]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch(ENDPOINTS.USERS.ME, form);
      dispatch(fetchProfile());
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update');
    }
  };

  const onLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <Helmet title="Profile" />
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <header className="section__head">
          <div>
            <p className="aura-label">Member</p>
            <h1 className="aura-display-md">{user?.fullName}</h1>
            <p className="aura-body">{user?.email}</p>
          </div>
          <button className="btn btn--ghost" onClick={onLogout}>Log out</button>
        </header>

        <div className="profile-grid">
          <form onSubmit={onSave} className="surface" style={{ padding: 32, display: 'grid', gap: 16 }}>
            <h3 className="aura-headline">Personal details</h3>
            <div className="field">
              <label className="field__label">Full name</label>
              <input className="field__input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Mobile</label>
              <input className="field__input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <button className="btn btn--primary" type="submit">Save changes</button>
          </form>

          <div className="surface" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="aura-headline">Saved addresses</h3>
              <Link to={ROUTES.USER.ORDERS} className="aura-label">View orders</Link>
            </div>
            {addresses.length === 0 ? (
              <p className="aura-body">Add an address at checkout to save it here.</p>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="surface" style={{ padding: 20 }}>
                  <p className="aura-title">{a.fullName}</p>
                  <p className="aura-body">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                  <p className="aura-body">{a.city}, {a.state} {a.pincode}</p>
                  <p className="aura-mono">{a.mobile}</p>
                </div>
              ))
            )}
          </div>

          <div className="surface" style={{ padding: 32, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="aura-headline">Recent orders</h3>
              <Link to={ROUTES.USER.ORDERS} className="aura-label">All orders</Link>
            </div>
            {orders.length === 0 ? (
              <p className="aura-body">No orders yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} onClick={() => navigate(`${ROUTES.USER.ORDERS}/${o.id}`)} style={{ cursor: 'pointer' }}>
                      <td>{o.orderNumber}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge badge--${o.status}`}>{o.status}</span></td>
                      <td>{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .profile-grid {
          display: grid; gap: 24px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .profile-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
      `}</style>
    </>
  );
};

export default ProfilePage;
