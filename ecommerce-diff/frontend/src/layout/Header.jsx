import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@routes/routesConstants';
import { logout } from '@modules/Auth/slice/AuthSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.summary?.itemCount || 0);

  const onLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <header className="aura-header">
      <NavLink to={ROUTES.USER.HOME} className="aura-header__logo">
        AURA
      </NavLink>
      <nav className="aura-header__nav" aria-label="primary">
        <NavLink to={ROUTES.USER.SHOP} end>
          Shop
        </NavLink>
        <NavLink to="/shop/shoes">Shoes</NavLink>
        <NavLink to="/shop/watches">Watches</NavLink>
        <NavLink to="/shop/jewellery">Jewellery</NavLink>
      </nav>
      <div className="aura-header__actions">
        <NavLink to={ROUTES.USER.WISHLIST} className="aura-header__icon-btn" aria-label="wishlist">
          <span className="material-symbols-outlined">favorite</span>
        </NavLink>
        <NavLink to={ROUTES.USER.CART} className="aura-header__icon-btn" aria-label="cart">
          <span className="material-symbols-outlined">shopping_bag</span>
          {cartCount > 0 && <span className="aura-header__badge">{cartCount}</span>}
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to={ROUTES.USER.PROFILE} className="aura-header__icon-btn" aria-label="profile">
              <span className="material-symbols-outlined">person</span>
            </NavLink>
            <button className="btn btn--ghost btn--sm" onClick={onLogout} aria-label="logout">
              Logout
            </button>
          </>
        ) : (
          <NavLink to={ROUTES.AUTH.LOGIN} className="btn btn--primary btn--sm">
            Sign In
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
