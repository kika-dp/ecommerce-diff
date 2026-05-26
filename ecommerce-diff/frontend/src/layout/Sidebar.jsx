import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ROUTES } from '@routes/routesConstants';
import { logout } from '@modules/Auth/slice/AuthSlice';

const navGroups = [
  {
    title: 'Overview',
    items: [{ to: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    title: 'Commerce',
    items: [
      { to: ROUTES.ADMIN.PRODUCTS, label: 'Products', icon: 'inventory_2' },
      { to: ROUTES.ADMIN.PRODUCT_TYPES, label: 'Categories', icon: 'category' },
      { to: ROUTES.ADMIN.ORDERS, label: 'Orders', icon: 'receipt_long' },
    ],
  },
  {
    title: 'Audience',
    items: [{ to: ROUTES.ADMIN.USERS, label: 'Users', icon: 'group' }],
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.ADMIN.LOGIN);
  };

  return (
    <aside className="aura-sidebar">
      <div className="aura-sidebar__brand">AURA · Admin</div>
      {navGroups.map((group) => (
        <div key={group.title} className="aura-sidebar__group">
          <div className="aura-sidebar__group-title">{group.title}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `aura-sidebar__item ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
      <button onClick={onLogout} className="aura-sidebar__item" style={{ marginTop: 'auto' }}>
        <span className="material-symbols-outlined">logout</span>
        Log out
      </button>
    </aside>
  );
};

export default Sidebar;
