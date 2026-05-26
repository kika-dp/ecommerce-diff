import Helmet from '@components/Helmet';
import AuthShell from './components/AuthShell';
import LoginForm from './components/LoginForm';

export const LoginPage = () => (
  <>
    <Helmet title="Sign In" />
    <AuthShell title="Sign in" subtitle="Member access">
      <LoginForm />
    </AuthShell>
  </>
);

export default LoginPage;
