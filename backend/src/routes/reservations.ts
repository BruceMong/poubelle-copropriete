import { Router, Response } from 'express';
import {
  createReservation,
  getReservationById,
  getReservationByWeek,
  getReservationsInRange,
  getReservationStats,
  deleteReservation,
} from '../models/Reservation';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Obtenir les réservations pour les 52 prochaines semaines
router.get('/', (req: AuthRequest, res: Response) => {
  const today = new Date();
  const startOfWeek = getMonday(today);
  const endDate = new Date(startOfWeek);
  endDate.setDate(endDate.getDate() + 52 * 7);

  const reservations = getReservationsInRange(
    formatDate(startOfWeek),
    formatDate(endDate)
  );

  // Générer les 52 semaines avec leur statut
  const weeks = [];
  const currentWeek = new Date(startOfWeek);

  for (let i = 0; i < 52; i++) {
    const weekStart = formatDate(currentWeek);
    const reservation = reservations.find((r) => r.week_start === weekStart);

    weeks.push({
      week_start: weekStart,
      week_number: getWeekNumber(currentWeek),
      year: currentWeek.getFullYear(),
      reservation: reservation
        ? {
            id: reservation.id,
            user_id: reservation.user_id,
            user_name: reservation.user_name,
            is_mine: reservation.user_id === req.user!.id,
          }
        : null,
    });

    currentWeek.setDate(currentWeek.getDate() + 7);
  }

  const stats = getReservationStats();

  return res.json({ weeks, stats });
});

// Créer une réservation
router.post('/', (req: AuthRequest, res: Response) => {
  const { week_start } = req.body;

  if (!week_start) {
    return res.status(400).json({ error: 'Date de début de semaine requise' });
  }

  // Parser la date sans problème de timezone (format YYYY-MM-DD)
  const [year, month, day] = week_start.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Vérifier que la date est un lundi (1 = lundi)
  if (date.getDay() !== 1) {
    return res.status(400).json({ error: 'La date doit être un lundi' });
  }

  // Vérifier que la semaine n'est pas dans le passé
  const today = new Date();
  const startOfCurrentWeek = getMonday(today);
  if (date < startOfCurrentWeek) {
    return res.status(400).json({ error: 'Impossible de réserver une semaine passée' });
  }

  // Vérifier que la semaine n'est pas déjà réservée
  const existing = getReservationByWeek(week_start);
  if (existing) {
    return res.status(400).json({ error: 'Cette semaine est déjà réservée' });
  }

  try {
    const reservation = createReservation(req.user!.id, week_start);
    return res.status(201).json({ reservation });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
});

// Annuler une réservation
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const reservation = getReservationById(id);

  if (!reservation) {
    return res.status(404).json({ error: 'Réservation non trouvée' });
  }

  // Seul le propriétaire ou un admin peut annuler
  if (reservation.user_id !== req.user!.id && !req.user!.is_admin) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  // Vérifier que la semaine n'est pas en cours ou passée
  const weekStart = new Date(reservation.week_start);
  const today = new Date();
  const startOfCurrentWeek = getMonday(today);
  if (weekStart <= startOfCurrentWeek && !req.user!.is_admin) {
    return res.status(400).json({ error: 'Impossible d\'annuler une semaine en cours ou passée' });
  }

  deleteReservation(id);
  return res.json({ success: true });
});

// Utilitaires
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default router;
