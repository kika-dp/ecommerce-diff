import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

export const UserLayout = () => (
  <div className="app-shell">
    <div className="app-shell__main">
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  </div>
);

export const AdminLayout = () => (
  <div className="app-shell app-shell--admin">
    <Sidebar />
    <div className="app-shell__main">
      <main className="page">
        <Outlet />
      </main>
    </div>
  </div>
);

export default UserLayout;
