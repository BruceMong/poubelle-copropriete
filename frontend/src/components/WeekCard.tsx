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

interface WeekCardProps {
  week: Week;
  onReserve: (weekStart: string) => void;
  onCancel: (reservationId: number) => void;
}

function formatDateRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return `${formatDate(start)} - ${formatDate(end)}`;
}

function isCurrentWeek(weekStart: string): boolean {
  const now = new Date();
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return now >= start && now <= end;
}

export default function WeekCard({ week, onReserve, onCancel }: WeekCardProps) {
  const isCurrent = isCurrentWeek(week.week_start);
  const isMine = week.reservation?.is_mine;
  const isReserved = !!week.reservation;

  let backgroundColor = '#dcfce7'; // Libre - vert clair
  let borderColor = '#86efac';

  if (isMine) {
    backgroundColor = '#dbeafe'; // Ma réservation - bleu clair
    borderColor = '#93c5fd';
  } else if (isReserved) {
    backgroundColor = '#f3f4f6'; // Réservé par autre - gris
    borderColor = '#d1d5db';
  }

  if (isCurrent) {
    borderColor = '#2563eb';
  }

  return (
    <div
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '16px',
        cursor: !isReserved ? 'pointer' : 'default',
        transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onClick={() => {
        if (!isReserved) {
          onReserve(week.week_start);
        }
      }}
      onMouseEnter={(e) => {
        if (!isReserved) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
            Semaine {week.week_number}
            {isCurrent && (
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                En cours
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {formatDateRange(week.week_start)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{week.year}</div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        {isReserved ? (
          <div>
            <div
              style={{
                fontSize: '13px',
                color: isMine ? '#2563eb' : '#6b7280',
                fontWeight: isMine ? '500' : '400',
              }}
            >
              {isMine ? 'Votre réservation' : week.reservation!.user_name}
            </div>
            {isMine && (
              <button
                className="btn btn-danger"
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(week.reservation!.id);
                }}
              >
                Annuler
              </button>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>
            Disponible - Cliquez pour réserver
          </div>
        )}
      </div>
    </div>
  );
}
