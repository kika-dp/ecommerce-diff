import AuthShell from './components/AuthShell';
import LoginForm from './components/LoginForm';
import Helmet from '@components/Helmet';

const AdminLoginPage = () => (
  <>
    <Helmet title="Admin · Sign In" />
    <AuthShell title="Atelier access" subtitle="Administrator portal">
      <LoginForm adminMode />
    </AuthShell>
  </>
);

export default AdminLoginPage;
