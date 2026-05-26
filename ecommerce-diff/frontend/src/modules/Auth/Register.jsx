import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from './slice/AuthSlice';
import AuthShell from './components/AuthShell';
import Helmet from '@components/Helmet';
import SimpleDotLoader from '@components/loader/SimpleDotLoader';
import { ROUTES } from '@routes/routesConstants';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(register(form));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome to AURA.');
      navigate(ROUTES.USER.HOME, { replace: true });
    } else {
      toast.error(result.payload || 'Could not create account');
    }
  };

  return (
    <>
      <Helmet title="Create account" />
      <AuthShell
        title="Create account"
        subtitle="New member"
        footer={
          <p className="aura-body">
            Already a member?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="aura-label" style={{ color: '#fff' }}>
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label className="field__label">Full name</label>
            <input className="field__input" required name="fullName" value={form.fullName} onChange={onChange} />
          </div>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="field__input" required type="email" name="email" value={form.email} onChange={onChange} />
          </div>
          <div className="field">
            <label className="field__label">Mobile</label>
            <input className="field__input" required name="mobile" value={form.mobile} onChange={onChange} placeholder="+91 9876500000" />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input className="field__input" required minLength={8} type="password" name="password" value={form.password} onChange={onChange} />
            <span className="field__hint">Minimum 8 characters.</span>
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <SimpleDotLoader /> : 'Create account'}
          </button>
        </form>
      </AuthShell>
    </>
  );
};

export default RegisterPage;
