import { Router, Response } from 'express';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  toPublicUser,
} from '../models/User';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Inscription
router.post('/register', (req, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }

  try {
    const user = createUser(email, password, name);
    const token = generateToken(user.id);
    return res.status(201).json({
      user: toPublicUser(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Connexion
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  if (!verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = generateToken(user.id);
  return res.json({
    user: toPublicUser(user),
    token,
  });
});

// Profil utilisateur connecté
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
