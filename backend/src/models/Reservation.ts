import { db } from '../config/database';

export interface Reservation {
  id: number;
  user_id: number;
  week_start: string;
  created_at: string;
}

export interface ReservationWithUser extends Reservation {
  user_name: string;
  user_email: string;
}

export function createReservation(userId: number, weekStart: string): Reservation {
  const stmt = db.prepare(
    'INSERT INTO reservations (user_id, week_start) VALUES (?, ?)'
  );
  const result = stmt.run(userId, weekStart);
  return getReservationById(result.lastInsertRowid as number)!;
}

export function getReservationById(id: number): Reservation | undefined {
  const stmt = db.prepare('SELECT * FROM reservations WHERE id = ?');
  return stmt.get(id) as Reservation | undefined;
}

export function getReservationByWeek(weekStart: string): ReservationWithUser | undefined {
  const stmt = db.prepare(`
    SELECT r.*, u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.week_start = ?
  `);
  return stmt.get(weekStart) as ReservationWithUser | undefined;
}

export function getReservationsInRange(startDate: string, endDate: string): ReservationWithUser[] {
  const stmt = db.prepare(`
    SELECT r.*, u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.week_start >= ? AND r.week_start <= ?
    ORDER BY r.week_start ASC
  `);
  return stmt.all(startDate, endDate) as ReservationWithUser[];
}

export function getUserReservations(userId: number): Reservation[] {
  const stmt = db.prepare(
    'SELECT * FROM reservations WHERE user_id = ? ORDER BY week_start ASC'
  );
  return stmt.all(userId) as Reservation[];
}

export function deleteReservation(id: number): boolean {
  const stmt = db.prepare('DELETE FROM reservations WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getReservationsForNotification(weekStart: string): ReservationWithUser[] {
  const stmt = db.prepare(`
    SELECT r.*, u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.week_start = ?
  `);
  return stmt.all(weekStart) as ReservationWithUser[];
}

export interface UserStats {
  user_id: number;
  user_name: string;
  total_reservations: number;
  upcoming_reservations: number;
  past_reservations: number;
}

export function getReservationStats(): UserStats[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const stmt = db.prepare(`
    SELECT
      u.id as user_id,
      u.name as user_name,
      COUNT(r.id) as total_reservations,
      SUM(CASE WHEN r.week_start >= ? THEN 1 ELSE 0 END) as upcoming_reservations,
      SUM(CASE WHEN r.week_start < ? THEN 1 ELSE 0 END) as past_reservations
    FROM users u
    LEFT JOIN reservations r ON u.id = r.user_id
    WHERE u.is_admin = 0
    GROUP BY u.id, u.name
    ORDER BY total_reservations DESC, u.name ASC
  `);
  return stmt.all(todayStr, todayStr) as UserStats[];
}
