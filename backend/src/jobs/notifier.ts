import cron from 'node-cron';
import { getReservationsForNotification } from '../models/Reservation';
import { sendWeekReminderEmail, verifyEmailConfig } from '../services/email';

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

async function sendNotifications(): Promise<void> {
  console.log('Vérification des notifications à envoyer...');

  // Obtenir le lundi de la semaine actuelle
  const today = new Date();
  const monday = getMonday(today);
  const weekStart = formatDate(monday);

  // Trouver les réservations pour cette semaine
  const reservations = getReservationsForNotification(weekStart);

  if (reservations.length === 0) {
    console.log('Aucune notification à envoyer pour cette semaine');
    return;
  }

  for (const reservation of reservations) {
    await sendWeekReminderEmail(
      reservation.user_email,
      reservation.user_name,
      reservation.week_start
    );
  }

  console.log(`${reservations.length} notification(s) envoyée(s)`);
}

export function startNotificationJob(): void {
  // Vérifier la configuration SMTP au démarrage
  verifyEmailConfig();

  // Exécuter tous les lundis à 8h00
  cron.schedule('0 8 * * 1', () => {
    console.log('Exécution du job de notification hebdomadaire');
    sendNotifications();
  });

  console.log('Job de notification programmé (tous les lundis à 8h00)');

  // En développement, envoyer aussi une notification au démarrage si on est lundi
  if (process.env.NODE_ENV !== 'production') {
    const today = new Date();
    if (today.getDay() === 1) {
      console.log('Lundi détecté en dev, envoi des notifications...');
      sendNotifications();
    }
  }
}
