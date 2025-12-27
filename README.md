# Gestion Poubelles - Copropriété

Application web permettant aux résidents d'une copropriété de réserver des semaines pour la gestion des poubelles.

## Fonctionnalités

- Inscription et connexion par email/mot de passe
- Calendrier sur 52 semaines
- Réservation libre d'une semaine disponible
- Notification email automatique au début de la semaine réservée
- Interface d'administration pour gérer les utilisateurs et réservations

## Prérequis

- Docker et Docker Compose
- Un compte SMTP pour l'envoi d'emails (Gmail, OVH, etc.)

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd poubelle-copropriete
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
# Clé secrète pour les tokens JWT (générez une clé aléatoire)
JWT_SECRET=votre-cle-secrete-tres-longue-et-aleatoire

# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# Email de l'administrateur (créé automatiquement)
ADMIN_EMAIL=admin@votrecopropriete.fr
```

> **Note Gmail** : Utilisez un "mot de passe d'application" et non votre mot de passe Gmail. Créez-en un dans les paramètres de sécurité de votre compte Google.

### 3. Lancer l'application

```bash
docker-compose up -d --build
```

L'application sera accessible sur `http://localhost`.

### 4. Premier accès

Un compte administrateur est créé automatiquement avec :
- Email : celui défini dans `ADMIN_EMAIL`
- Mot de passe : `admin123`

**Changez ce mot de passe immédiatement après la première connexion !**

## Développement local

### Backend

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`.

## Structure du projet

```
poubelle-copropriete/
├── docker-compose.yml      # Configuration Docker
├── .env.example            # Template des variables d'environnement
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts        # Point d'entrée
│   │   ├── config/         # Configuration DB
│   │   ├── middleware/     # Auth JWT
│   │   ├── models/         # User, Reservation
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Email
│   │   └── jobs/           # Cron notifications
│   └── data/               # Base SQLite (dev)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/            # Client Axios
        ├── components/     # Calendar, WeekCard
        ├── context/        # AuthContext
        └── pages/          # Home, Login, Admin
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Réservations
- `GET /api/reservations` - Liste des 52 semaines
- `POST /api/reservations` - Créer une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur
- `GET /api/admin/reservations` - Liste des réservations
- `DELETE /api/admin/reservations/:id` - Supprimer une réservation

## Notifications

Un email de rappel est envoyé automatiquement chaque lundi à 8h00 aux utilisateurs dont c'est la semaine.

## Sauvegarde

La base de données SQLite est stockée dans un volume Docker. Pour sauvegarder :

```bash
docker cp poubelle-backend:/app/data/poubelle.db ./backup.db
```

## Licence

MIT
