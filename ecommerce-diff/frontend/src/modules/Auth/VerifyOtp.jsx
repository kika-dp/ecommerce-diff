import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@services/api';
import { ENDPOINTS } from '@constants/url';
import AuthShell from './components/AuthShell';
import Helmet from '@components/Helmet';
import SimpleDotLoader from '@components/loader/SimpleDotLoader';
import { ROUTES } from '@routes/routesConstants';

const LEN = 6;

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(Array(LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const onDigit = (idx, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < LEN - 1) inputs.current[idx + 1]?.focus();
  };

  const onKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== LEN) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp: code });
      toast.success('OTP verified.');
      navigate(ROUTES.AUTH.RESET, { state: { email, otp: code } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet title="Verify OTP" />
      <AuthShell
        title="Verify identity"
        subtitle="Two-factor"
        footer={
          <Link to={ROUTES.AUTH.FORGOT} className="aura-label" style={{ color: '#fff' }}>
            Use a different email
          </Link>
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
          <div className="field">
            <label className="field__label">6-digit code</label>
            <div className="otp-grid">
              {otp.map((value, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputs.current[idx] = el)}
                  value={value}
                  onChange={(e) => onDigit(idx, e.target.value)}
                  onKeyDown={(e) => onKey(idx, e)}
                  inputMode="numeric"
                  maxLength={1}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <SimpleDotLoader /> : 'Verify'}
          </button>
        </form>
      </AuthShell>
    </>
  );
};

export default VerifyOtpPage;
