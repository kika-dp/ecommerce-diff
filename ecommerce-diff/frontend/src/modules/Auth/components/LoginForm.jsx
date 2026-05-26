import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '@modules/Auth/slice/AuthSlice';
import { ROUTES } from '@routes/routesConstants';
import SimpleDotLoader from '@components/loader/SimpleDotLoader';

const LoginForm = ({ adminMode = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(login(form));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      const user = result.payload.user;
      if (adminMode && user.role !== 'admin') {
        toast.error('This portal is for administrators only.');
        return;
      }
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}.`);
      const target = location.state?.from?.pathname || (user.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.HOME);
      navigate(target, { replace: true });
    } else {
      toast.error(result.payload || 'Could not sign in');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="field">
        <label className="field__label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="field__input"
          value={form.email}
          onChange={onChange}
          placeholder="you@aura.luxe"
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="field__input"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
        />
      </div>
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? <SimpleDotLoader /> : 'Sign In'}
      </button>
      {!adminMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link to={ROUTES.AUTH.FORGOT} className="aura-label">Forgot password?</Link>
          <Link to={ROUTES.AUTH.REGISTER} className="aura-label">Create account</Link>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
