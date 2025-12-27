import { useState, useEffect } from 'react';
import { reservationsAPI } from '../api/client';
import { useToast } from '../context/ToastContext';
import WeekCard from './WeekCard';

interface Week {
  week_start: string;
  week_number: number;
  year: number;
  reservation: {
    id: number;
    user_id: number;
    user_name: string;
    is_mine: boolean;
  } | null;
}

interface UserStats {
  user_id: number;
  user_name: string;
  total_reservations: number;
  upcoming_reservations: number;
  past_reservations: number;
}

export default function Calendar() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast, showConfirm } = useToast();

  const loadWeeks = async () => {
    try {
      const response = await reservationsAPI.getAll();
      setWeeks(response.data.weeks);
      setStats(response.data.stats || []);
      setError('');
    } catch {
      setError('Erreur lors du chargement du calendrier');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, []);

  const handleReserve = async (weekStart: string) => {
    try {
      await reservationsAPI.create(weekStart);
      await loadWeeks();
      showToast('Semaine réservée avec succès !', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showToast(error.response?.data?.error || 'Erreur lors de la réservation', 'error');
    }
  };

  const handleCancel = (reservationId: number) => {
    showConfirm('Voulez-vous vraiment annuler cette réservation ?', async () => {
      try {
        await reservationsAPI.delete(reservationId);
        await loadWeeks();
        showToast('Réservation annulée', 'success');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        showToast(error.response?.data?.error || 'Erreur lors de l\'annulation', 'error');
      }
    });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement du calendrier...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const totalReservations = stats.reduce((sum, s) => sum + s.total_reservations, 0);
  const avgReservations = stats.length > 0 ? totalReservations / stats.length : 0;

  return (
    <div>
      {/* Tableau des statistiques */}
      {stats.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#374151' }}>
            Répartition des réservations
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280' }}>Résident</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280' }}>A venir</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280' }}>Passées</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280' }}>Équilibre</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((user) => {
                  const diff = user.total_reservations - avgReservations;
                  const isAboveAvg = diff > 0.5;
                  const isBelowAvg = diff < -0.5;

                  return (
                    <tr key={user.user_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{user.user_name}</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <span
                          style={{
                            backgroundColor: '#f3f4f6',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {user.total_reservations}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: '#2563eb' }}>
                        {user.upcoming_reservations}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280' }}>
                        {user.past_reservations}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isBelowAvg && (
                          <span
                            style={{
                              backgroundColor: '#fef3c7',
                              color: '#d97706',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                            }}
                          >
                            Devrait réserver plus
                          </span>
                        )}
                        {isAboveAvg && (
                          <span
                            style={{
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                            }}
                          >
                            Contribue beaucoup
                          </span>
                        )}
                        {!isAboveAvg && !isBelowAvg && (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Dans la moyenne</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
            Moyenne : {avgReservations.toFixed(1)} réservation(s) par résident
          </p>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h2>Calendrier des 52 prochaines semaines</h2>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Cliquez sur une semaine libre pour la réserver
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#dcfce7', borderRadius: '4px' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Libre</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#dbeafe', borderRadius: '4px' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Ma réservation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Réservé par un autre</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {weeks.map((week) => (
          <WeekCard
            key={week.week_start}
            week={week}
            onReserve={handleReserve}
            onCancel={handleCancel}
          />
        ))}
      </div>
    </div>
  );
}
