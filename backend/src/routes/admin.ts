import { Router, Response } from 'express';
import { getAllUsers, deleteUser, toPublicUser } from '../models/User';
import { getReservationsInRange, deleteReservation } from '../models/Reservation';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Liste des utilisateurs
router.get('/users', (req: AuthRequest, res: Response) => {
  const users = getAllUsers().map(toPublicUser);
  return res.json({ users });
});

// Supprimer un utilisateur
router.delete('/users/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);

  // Empêcher la suppression de soi-même
  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }

  const deleted = deleteUser(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  return res.json({ success: true });
});

// Liste de toutes les réservations (52 semaines)
router.get('/reservations', (req: AuthRequest, res: Response) => {
  const today = new Date();
  const startOfWeek = getMonday(today);
  const endDate = new Date(startOfWeek);
  endDate.setDate(endDate.getDate() + 52 * 7);

  const reservations = getReservationsInRange(
    formatDate(startOfWeek),
    formatDate(endDate)
  );

  return res.json({ reservations });
});

// Supprimer une réservation (admin peut supprimer n'importe laquelle)
router.delete('/reservations/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const deleted = deleteReservation(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Réservation non trouvée' });
  }

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
  return date.toISOString().split('T')[0];
}

export default router;
