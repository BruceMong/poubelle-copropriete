import { useState, useEffect } from 'react';
import { adminAPI } from '../api/client';
import { useToast } from '../context/ToastContext';

interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

interface Reservation {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  week_start: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reservations'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, showConfirm } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, reservationsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getReservations(),
      ]);
      setUsers(usersRes.data.users);
      setReservations(reservationsRes.data.reservations);
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = (id: number) => {
    showConfirm('Voulez-vous vraiment supprimer cet utilisateur ?', async () => {
      try {
        await adminAPI.deleteUser(id);
        await loadData();
        showToast('Utilisateur supprimé', 'success');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        showToast(error.response?.data?.error || 'Erreur lors de la suppression', 'error');
      }
    });
  };

  const handleDeleteReservation = (id: number) => {
    showConfirm('Voulez-vous vraiment supprimer cette réservation ?', async () => {
      try {
        await adminAPI.deleteReservation(id);
        await loadData();
        showToast('Réservation supprimée', 'success');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        showToast(error.response?.data?.error || 'Erreur lors de la suppression', 'error');
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '24px' }}>Administration</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs ({users.length})
        </button>
        <button
          className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reservations')}
        >
          Réservations ({reservations.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Nom</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Rôle</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Inscription</th>
                <th style={{ textAlign: 'right', padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 8px' }}>{user.name}</td>
                  <td style={{ padding: '12px 8px', color: '#6b7280' }}>{user.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {user.is_admin ? (
                      <span
                        style={{
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        Admin
                      </span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>Utilisateur</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    {!user.is_admin && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="card">
          {reservations.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              Aucune réservation
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Semaine</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Réservé par</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Email</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px' }}>{formatDate(reservation.week_start)}</td>
                    <td style={{ padding: '12px 8px' }}>{reservation.user_name}</td>
                    <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                      {reservation.user_email}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleDeleteReservation(reservation.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
