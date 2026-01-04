# FormaTech Pro CRM

Application CRM complète pour FormaTech Pro, entreprise de formation B2B specialisee dans la transformation digitale.

## Fonctionnalites

### Pipeline Commercial (7 etapes)
1. **Lead Entrant** - Capture des leads avec source et details
2. **Qualification** - Scorecard sur 25 points (budget, decideur, timing, besoin, taille)
3. **Demo/RDV Decouverte** - Compte-rendu structure du RDV
4. **Proposition Envoyee** - Gestion des offres (Starter/Advanced/Enterprise)
5. **Negociation** - Historique des echanges et revision des montants
6. **Gagne** - Signature avec details paiement
7. **Perdu** - Analyse de la perte

### Gestion des donnees
- Fiches entreprises completes (SIREN, OPCO, secteur, taille)
- Fiches contacts detaillees (decideur, signataire, coordonnees)
- Historique complet des activites

### Alertes automatiques
- Lead a qualifier d'urgence (>5 jours)
- Lead froid (score <12)
- Deal dormant (>10 jours sans activite)
- Relance propale (>7 jours)
- Propale expiree (<5 jours)
- Negociation longue (>20 jours)
- Alerte pre-formation (<14 jours)

### Tableau de bord
- KPIs en temps reel (pipeline, forecast, CA signe, conversion)
- Graphiques (funnel, CA mensuel, sources, performance)
- Alertes et activites recentes

### Exports
- Export CSV des deals, contacts et entreprises
- Filtres appliques aux exports

## Installation

```bash
# Cloner le projet
cd formatech-crm

# Installer les dependances
npm run install-all

# Initialiser la base de donnees avec les donnees de demo
npm run seed

# Lancer l'application
npm run dev
```

## Lancement

L'application demarre sur:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Structure du projet

```
formatech-crm/
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants reutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── api/           # Client API
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitaires (formatage)
│   └── public/            # Assets statiques
├── server/                 # Backend Express
│   ├── routes/            # Endpoints API REST
│   └── database/          # SQLite + migrations + seed
├── data/                   # Base SQLite (formatech.db)
└── package.json
```

## Donnees de demo

L'application est livree avec:
- 4 commerciaux (Marie, Thomas, Sophie, Lucas)
- 10 entreprises
- 20 contacts
- 15 deals a differentes etapes du pipeline

## Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Express.js, better-sqlite3
- **Base de donnees**: SQLite (fichier local)

## Offres FormaTech Pro

| Offre | Duree | Prix HT | Participants max |
|-------|-------|---------|------------------|
| Starter | 1 jour | 1 500 EUR | 10 |
| Advanced | 2 jours | 3 500 EUR | 12 |
| Enterprise | 3-5 jours | 8 000 - 15 000 EUR | 15 |

## Equipe commerciale

- Marie Dupont (Commercial)
- Thomas Bernard (Commercial)
- Sophie Martin (Commercial)
- Lucas Petit (Manager)
