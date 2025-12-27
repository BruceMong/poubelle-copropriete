# Poubelle Copropriété - Mémo Projet

## Accès VPS

| Propriété | Valeur |
|-----------|--------|
| **IP** | 82.25.116.190 |
| **SSH** | `ssh root@82.25.116.190` |
| **OS** | Ubuntu 24.04 |
| **Hébergeur** | Hostinger |

## URLs

- **Application** : http://82.25.116.190:8080
- **GitHub** : https://github.com/BruceMong/poubelle-copropriete.git

## Localisation du projet

- **Local (Windows)** : `C:\Users\Bruce\Documents\GitHub\poubelle-copropriete`
- **VPS** : `/root/poubelle-copropriete`

## Stack technique

- **Frontend** : React + TypeScript + Vite
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : SQLite (volume Docker persistant)
- **Déploiement** : Docker Compose

## Mise à jour du projet

### Depuis le PC local :

```bash
# 1. Faire les modifications localement
# 2. Commit et push
cd "C:\Users\Bruce\Documents\GitHub\poubelle-copropriete"
git add .
git commit -m "Description des changements"
git push

# 3. Mettre à jour sur le VPS
ssh root@82.25.116.190 "cd ~/poubelle-copropriete && git pull && docker compose up -d --build"
```

### Commande rapide (tout en un) :

```bash
git add . && git commit -m "Update" && git push && ssh root@82.25.116.190 "cd ~/poubelle-copropriete && git pull && docker compose up -d --build"
```

## Commandes utiles VPS

```bash
# Voir les logs
ssh root@82.25.116.190 "docker compose -f ~/poubelle-copropriete/docker-compose.yml logs -f"

# Voir les logs backend uniquement
ssh root@82.25.116.190 "docker logs -f poubelle-backend"

# Redémarrer les containers
ssh root@82.25.116.190 "cd ~/poubelle-copropriete && docker compose restart"

# Arrêter l'application
ssh root@82.25.116.190 "cd ~/poubelle-copropriete && docker compose down"

# Vérifier le statut
ssh root@82.25.116.190 "docker compose -f ~/poubelle-copropriete/docker-compose.yml ps"
```

## Configuration

### Variables d'environnement (.env sur le VPS)

```env
JWT_SECRET=1cf4ed1b2ea3984403210cd17ff7c037516827aa87575e563c4d4379be3ec318
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=copropriete.rappel@gmail.com
SMTP_PASS=nzqj cytv izft ursy
ADMIN_EMAIL=copropriete.rappel@gmail.com
```

### Modifier le .env sur le VPS :

```bash
ssh root@82.25.116.190 "nano ~/poubelle-copropriete/.env"
```

## Ports utilisés

| Service | Port interne | Port externe |
|---------|--------------|--------------|
| Frontend (Nginx) | 80 | 8080 |
| Backend (Node) | 3000 | - (interne) |

## Base de données

- **Type** : SQLite
- **Emplacement** : Volume Docker `poubelle-copropriete_sqlite-data`
- **Backup** :
  ```bash
  ssh root@82.25.116.190 "docker cp poubelle-backend:/app/data/poubelle.db ~/backup-poubelle.db"
  ```

## Contact développeur

- **Email** : brucemongthe13@gmail.com
