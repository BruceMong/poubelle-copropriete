import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database';
import { ensureAdminExists } from './models/User';
import authRoutes from './routes/auth';
import reservationRoutes from './routes/reservations';
import adminRoutes from './routes/admin';
import { startNotificationJob } from './jobs/notifier';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser la base de données et créer l'admin
initDatabase();
ensureAdminExists();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Démarrer le job de notification
startNotificationJob();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
