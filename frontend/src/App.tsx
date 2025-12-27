import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.is_admin ? <>{children}</> : <Navigate to="/" />;
}

function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '20px',
      textAlign: 'center',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      fontSize: '14px',
      color: '#666'
    }}>
      <p style={{ margin: 0 }}>
        Besoin d'une solution informatique (logiciel, intégration, autre...) ?{' '}
        <a href="mailto:brucemongthe13@gmail.com" style={{ color: '#4CAF50', textDecoration: 'none' }}>
          Contactez-moi
        </a>
      </p>
    </footer>
  );
}

function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header>
      <div className="container">
        <h1>Gestion Poubelles</h1>
        <nav>
          <Link to="/">Calendrier</Link>
          {user.is_admin && <Link to="/admin">Administration</Link>}
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button className="btn btn-secondary" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
