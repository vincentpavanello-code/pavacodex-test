# Mister IA - Plateforme ABM

Plateforme de gestion Account Based Marketing pour Mister IA, société de formation en Intelligence Artificielle.

## Fonctionnalités

### CRM Entreprises & Contacts
- Gestion des entreprises cibles avec statuts et priorités
- Gestion des contacts avec scoring d'engagement
- Historique des interactions (emails, LinkedIn, appels)

### Enrichissement de données (Apollo.io)
- Recherche automatique des décideurs formation
- Récupération des emails et profils LinkedIn
- Filtrage par poste : DRH, Responsable Formation, L&D Manager...

### Génération IA de messages (Claude API)
- Messages de connexion LinkedIn personnalisés
- Messages de prospection LinkedIn
- Emails de présentation, relance, livre blanc
- Personnalisation basée sur le contact et l'entreprise

### Envoi d'emails (SendGrid)
- Envoi d'emails personnalisés
- Tracking d'ouverture et de clics
- Historique des emails envoyés

### LinkedIn Sales Navigator
- Recherche avancée de contacts
- Génération de messages prêts à copier
- Workflow semi-automatique (pas de risque de ban)

### Livres Blancs
- Gestion des ressources à partager
- Tracking des téléchargements
- Intégration avec le générateur IA

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes

1. **Cloner et installer**
```bash
cd abm-platform
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Puis éditez `.env` avec vos clés API :
```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"
SENDGRID_API_KEY="SG.xxxxx"
SENDGRID_FROM_EMAIL="contact@mister-ia.fr"
APOLLO_API_KEY="xxxxx"
```

3. **Initialiser la base de données**
```bash
npm run db:push
```

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Obtenir les clés API

| Service | URL | Coût estimé |
|---------|-----|-------------|
| Claude API | https://console.anthropic.com/ | ~20-50€/mois |
| SendGrid | https://app.sendgrid.com/settings/api_keys | ~15-20€/mois |
| Apollo.io | https://app.apollo.io/#/settings/integrations/api | ~49€/mois |
| LinkedIn Sales Navigator | https://business.linkedin.com/sales-solutions | ~80€/mois |

**Total estimé : ~165-200€/mois**

## Structure du projet

```
abm-platform/
├── prisma/
│   └── schema.prisma      # Schéma de base de données
├── src/
│   ├── app/
│   │   ├── api/           # Routes API
│   │   │   ├── companies/
│   │   │   ├── contacts/
│   │   │   ├── enrich/    # Enrichissement Apollo.io
│   │   │   ├── generate-message/  # Génération IA
│   │   │   ├── send-email/  # Envoi emails
│   │   │   └── whitepapers/
│   │   ├── companies/     # Pages entreprises
│   │   ├── contacts/      # Pages contacts
│   │   ├── campaigns/     # Pages campagnes
│   │   ├── linkedin/      # Page LinkedIn
│   │   ├── ai-generator/  # Générateur IA
│   │   ├── whitepapers/   # Livres blancs
│   │   └── settings/      # Paramètres
│   ├── components/        # Composants React
│   └── lib/               # Utilitaires
└── package.json
```

## Workflow type

1. **Ajouter une entreprise** (ex: "BNP Paribas")
2. **Enrichir avec Apollo.io** → trouve automatiquement les décideurs formation
3. **Générer un message IA** personnalisé pour chaque contact
4. **Envoyer par email** ou **copier pour LinkedIn**
5. **Suivre les interactions** dans le CRM

## Technologies

- **Frontend** : Next.js 14, React 18, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite (Prisma ORM)
- **APIs externes** : Claude (Anthropic), SendGrid, Apollo.io

## Licence

Projet propriétaire - Mister IA
