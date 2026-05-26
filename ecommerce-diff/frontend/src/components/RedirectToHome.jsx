import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '@routes/routesConstants';

const RedirectToHome = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.HOME} replace />;
  }
  return children;
};

export default RedirectToHome;
