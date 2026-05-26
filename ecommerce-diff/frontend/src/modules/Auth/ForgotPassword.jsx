import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@services/api';
import { ENDPOINTS } from '@constants/url';
import AuthShell from './components/AuthShell';
import Helmet from '@components/Helmet';
import SimpleDotLoader from '@components/loader/SimpleDotLoader';
import { ROUTES } from '@routes/routesConstants';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.FORGOT, { email });
      const devOtp = data?.data?.devOtp;
      toast.success(devOtp ? `OTP sent. Dev OTP: ${devOtp}` : 'If the account exists, we sent an OTP.');
      navigate(ROUTES.AUTH.VERIFY_OTP, { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet title="Forgot password" />
      <AuthShell
        title="Reset your password"
        subtitle="Recovery"
        footer={
          <p className="aura-body">
            Remembered it?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="aura-label" style={{ color: '#fff' }}>
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label className="field__label">Email</label>
            <input
              className="field__input"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <SimpleDotLoader /> : 'Send OTP'}
          </button>
        </form>
      </AuthShell>
    </>
  );
};

export default ForgotPasswordPage;
