import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@services/api';
import { ENDPOINTS } from '@constants/url';
import AuthShell from './components/AuthShell';
import Helmet from '@components/Helmet';
import SimpleDotLoader from '@components/loader/SimpleDotLoader';
import { ROUTES } from '@routes/routesConstants';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [otp] = useState(location.state?.otp || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.AUTH.RESET, { email, otp, newPassword: password });
      toast.success('Password updated. Please sign in.');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet title="Reset password" />
      <AuthShell
        title="Set a new password"
        subtitle="Final step"
        footer={
          <Link to={ROUTES.AUTH.LOGIN} className="aura-label" style={{ color: '#fff' }}>
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label className="field__label">New password</label>
            <input
              className="field__input"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label">Confirm password</label>
            <input
              className="field__input"
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <SimpleDotLoader /> : 'Reset password'}
          </button>
        </form>
      </AuthShell>
    </>
  );
};

export default ResetPasswordPage;
