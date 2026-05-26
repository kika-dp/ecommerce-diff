import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '@routes/routesConstants';

const RedirectToLogin = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = requireAdmin ? ROUTES.ADMIN.LOGIN : ROUTES.AUTH.LOGIN;
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  if (requireAdmin && role !== 'admin') {
    return <Navigate to={ROUTES.USER.HOME} replace />;
  }
  return children;
};

export default RedirectToLogin;
