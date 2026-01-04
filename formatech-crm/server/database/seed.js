const db = require('./init');
const { v4: uuidv4 } = require('uuid');

console.log('Seeding database with demo data...');

// Helper to generate dates
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Clear existing data
db.exec('DELETE FROM activities');
db.exec('DELETE FROM reminders');
db.exec('DELETE FROM deals');
db.exec('DELETE FROM contacts');
db.exec('DELETE FROM companies');
db.exec('DELETE FROM users');

// Create Users (Commerciaux)
const users = [
  { id: uuidv4(), first_name: 'Marie', last_name: 'Dupont', email: 'marie.dupont@formatech.fr', role: 'commercial' },
  { id: uuidv4(), first_name: 'Thomas', last_name: 'Bernard', email: 'thomas.bernard@formatech.fr', role: 'commercial' },
  { id: uuidv4(), first_name: 'Sophie', last_name: 'Martin', email: 'sophie.martin@formatech.fr', role: 'commercial' },
  { id: uuidv4(), first_name: 'Lucas', last_name: 'Petit', email: 'lucas.petit@formatech.fr', role: 'manager' }
];

const insertUser = db.prepare('INSERT INTO users (id, first_name, last_name, email, role) VALUES (?, ?, ?, ?, ?)');
users.forEach(u => insertUser.run(u.id, u.first_name, u.last_name, u.email, u.role));
console.log('Created 4 users');

// Create Companies
const companies = [
  { id: uuidv4(), name: 'TechVision SAS', siren: '123456789', sector: 'tech', size: 'pme', address: '15 rue de l\'Innovation', city: 'Paris', postal_code: '75008', website: 'https://techvision.fr', estimated_revenue: 5000000, opco: 'atlas' },
  { id: uuidv4(), name: 'IndustriePlus', siren: '234567890', sector: 'industrie', size: 'eti', address: '42 avenue des Usines', city: 'Lyon', postal_code: '69003', website: 'https://industrieplus.fr', estimated_revenue: 50000000, opco: 'opco2i' },
  { id: uuidv4(), name: 'Banque Centrale Régionale', siren: '345678901', sector: 'finance', size: 'ge', address: '1 place de la Bourse', city: 'Bordeaux', postal_code: '33000', website: 'https://bcr.fr', estimated_revenue: 200000000, opco: 'atlas' },
  { id: uuidv4(), name: 'Commerce Express', siren: '456789012', sector: 'commerce', size: 'pme', address: '8 rue du Commerce', city: 'Lille', postal_code: '59000', website: 'https://commerce-express.fr', estimated_revenue: 8000000, opco: 'opcommerce' },
  { id: uuidv4(), name: 'Santé Solutions', siren: '567890123', sector: 'sante', size: 'pme', address: '25 boulevard Pasteur', city: 'Marseille', postal_code: '13008', website: 'https://sante-solutions.fr', estimated_revenue: 12000000, opco: 'sante' },
  { id: uuidv4(), name: 'Services Pro Conseil', siren: '678901234', sector: 'services', size: 'tpe', address: '3 impasse des Experts', city: 'Nantes', postal_code: '44000', website: 'https://spc.fr', estimated_revenue: 800000, opco: 'akto' },
  { id: uuidv4(), name: 'Mairie de Toulouse', siren: '789012345', sector: 'public', size: 'ge', address: 'Place du Capitole', city: 'Toulouse', postal_code: '31000', website: 'https://toulouse.fr', estimated_revenue: null, opco: null },
  { id: uuidv4(), name: 'AgriTech Innovation', siren: '890123456', sector: 'industrie', size: 'pme', address: '12 chemin des Champs', city: 'Rennes', postal_code: '35000', website: 'https://agritech-innov.fr', estimated_revenue: 15000000, opco: 'ocapiat' },
  { id: uuidv4(), name: 'Digital Factory', siren: '901234567', sector: 'tech', size: 'pme', address: '88 rue du Code', city: 'Montpellier', postal_code: '34000', website: 'https://digital-factory.io', estimated_revenue: 6000000, opco: 'atlas' },
  { id: uuidv4(), name: 'Transport National', siren: '012345678', sector: 'services', size: 'eti', address: '5 zone Logistique Nord', city: 'Strasbourg', postal_code: '67000', website: 'https://transport-national.fr', estimated_revenue: 80000000, opco: 'mobilites' }
];

const insertCompany = db.prepare(`
  INSERT INTO companies (id, name, siren, sector, size, address, city, postal_code, website, estimated_revenue, opco)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
companies.forEach(c => insertCompany.run(c.id, c.name, c.siren, c.sector, c.size, c.address, c.city, c.postal_code, c.website, c.estimated_revenue, c.opco));
console.log('Created 10 companies');

// Create Contacts (2 per company)
const contacts = [];
const contactData = [
  // TechVision
  { civility: 'M.', first_name: 'Jean', last_name: 'Laurent', function: 'Directeur Technique', email: 'j.laurent@techvision.fr', phone_mobile: '0612345678', is_decision_maker: 'oui', is_signatory: 1, company_idx: 0 },
  { civility: 'Mme', first_name: 'Claire', last_name: 'Dubois', function: 'RH', email: 'c.dubois@techvision.fr', phone_mobile: '0623456789', is_decision_maker: 'non', is_signatory: 0, company_idx: 0 },
  // IndustriePlus
  { civility: 'M.', first_name: 'Pierre', last_name: 'Moreau', function: 'DG', email: 'p.moreau@industrieplus.fr', phone_mobile: '0634567890', is_decision_maker: 'oui', is_signatory: 1, company_idx: 1 },
  { civility: 'Mme', first_name: 'Anne', last_name: 'Richard', function: 'DAF', email: 'a.richard@industrieplus.fr', phone_mobile: '0645678901', is_decision_maker: 'oui', is_signatory: 1, company_idx: 1 },
  // Banque Centrale Régionale
  { civility: 'M.', first_name: 'François', last_name: 'Leroy', function: 'Directeur Formation', email: 'f.leroy@bcr.fr', phone_mobile: '0656789012', is_decision_maker: 'oui', is_signatory: 0, company_idx: 2 },
  { civility: 'Mme', first_name: 'Isabelle', last_name: 'Simon', function: 'Responsable Digital', email: 'i.simon@bcr.fr', phone_mobile: '0667890123', is_decision_maker: 'a_confirmer', is_signatory: 0, company_idx: 2 },
  // Commerce Express
  { civility: 'M.', first_name: 'Nicolas', last_name: 'Garcia', function: 'PDG', email: 'n.garcia@commerce-express.fr', phone_mobile: '0678901234', is_decision_maker: 'oui', is_signatory: 1, company_idx: 3 },
  { civility: 'Mme', first_name: 'Marie', last_name: 'Thomas', function: 'Responsable RH', email: 'm.thomas@commerce-express.fr', phone_mobile: '0689012345', is_decision_maker: 'non', is_signatory: 0, company_idx: 3 },
  // Santé Solutions
  { civility: 'Mme', first_name: 'Caroline', last_name: 'Blanc', function: 'Directrice', email: 'c.blanc@sante-solutions.fr', phone_mobile: '0690123456', is_decision_maker: 'oui', is_signatory: 1, company_idx: 4 },
  { civility: 'M.', first_name: 'David', last_name: 'Roux', function: 'DSI', email: 'd.roux@sante-solutions.fr', phone_mobile: '0601234567', is_decision_maker: 'a_confirmer', is_signatory: 0, company_idx: 4 },
  // Services Pro Conseil
  { civility: 'M.', first_name: 'Michel', last_name: 'Faure', function: 'Gérant', email: 'm.faure@spc.fr', phone_mobile: '0612345670', is_decision_maker: 'oui', is_signatory: 1, company_idx: 5 },
  { civility: 'Mme', first_name: 'Sophie', last_name: 'Girard', function: 'Assistante', email: 's.girard@spc.fr', phone_mobile: '0623456780', is_decision_maker: 'non', is_signatory: 0, company_idx: 5 },
  // Mairie de Toulouse
  { civility: 'M.', first_name: 'Philippe', last_name: 'Mercier', function: 'DGA', email: 'p.mercier@toulouse.fr', phone_mobile: '0634567801', is_decision_maker: 'oui', is_signatory: 1, company_idx: 6 },
  { civility: 'Mme', first_name: 'Nathalie', last_name: 'Bonnet', function: 'Responsable Formation', email: 'n.bonnet@toulouse.fr', phone_mobile: '0645678012', is_decision_maker: 'non', is_signatory: 0, company_idx: 6 },
  // AgriTech Innovation
  { civility: 'M.', first_name: 'Laurent', last_name: 'Dumont', function: 'CEO', email: 'l.dumont@agritech-innov.fr', phone_mobile: '0656780123', is_decision_maker: 'oui', is_signatory: 1, company_idx: 7 },
  { civility: 'Mme', first_name: 'Emilie', last_name: 'Lemaire', function: 'COO', email: 'e.lemaire@agritech-innov.fr', phone_mobile: '0667801234', is_decision_maker: 'oui', is_signatory: 1, company_idx: 7 },
  // Digital Factory
  { civility: 'M.', first_name: 'Julien', last_name: 'Robert', function: 'CTO', email: 'j.robert@digital-factory.io', phone_mobile: '0678012345', is_decision_maker: 'oui', is_signatory: 1, company_idx: 8 },
  { civility: 'Mme', first_name: 'Camille', last_name: 'Henry', function: 'HR Manager', email: 'c.henry@digital-factory.io', phone_mobile: '0689123456', is_decision_maker: 'non', is_signatory: 0, company_idx: 8 },
  // Transport National
  { civility: 'M.', first_name: 'Eric', last_name: 'Morel', function: 'Directeur Général', email: 'e.morel@transport-national.fr', phone_mobile: '0690234567', is_decision_maker: 'oui', is_signatory: 1, company_idx: 9 },
  { civility: 'Mme', first_name: 'Valérie', last_name: 'Fournier', function: 'DRH', email: 'v.fournier@transport-national.fr', phone_mobile: '0601345678', is_decision_maker: 'oui', is_signatory: 1, company_idx: 9 }
];

const insertContact = db.prepare(`
  INSERT INTO contacts (id, civility, first_name, last_name, function, email, phone_mobile, is_decision_maker, is_signatory, company_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

contactData.forEach(c => {
  const id = uuidv4();
  const company = companies[c.company_idx];
  insertContact.run(id, c.civility, c.first_name, c.last_name, c.function, c.email, c.phone_mobile, c.is_decision_maker, c.is_signatory, company.id);
  contacts.push({ ...c, id, company_id: company.id });
});
console.log('Created 20 contacts');

// Create Deals (15 at different stages)
const insertDeal = db.prepare(`
  INSERT INTO deals (
    id, company_id, contact_id, user_id, stage, source, source_details, how_did_they_find_us, entry_date,
    qual_budget_identified, qual_decision_maker_identified, qual_timing, qual_timing_score, qual_real_need_expressed, qual_company_size, qual_company_size_score, qual_total_score,
    demo_date, demo_participants, demo_duration, demo_client_context, demo_needs_expressed, demo_objections_raised, demo_next_steps, demo_decision_maker_present,
    prop_sent_date, prop_offer_type, prop_amount, prop_participants_count, prop_proposed_dates, prop_validity_days,
    nego_entries, nego_revised_amount, nego_discount_percent, nego_discount_reason,
    won_signature_date, won_final_amount, won_payment_mode, won_payment_terms, won_purchase_order_number, won_confirmed_training_dates,
    lost_reason, lost_competitor_name, lost_recontact_in_6_months, lost_lessons_learned,
    current_amount, expected_close_date, last_activity_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertActivity = db.prepare(`
  INSERT INTO activities (id, deal_id, user_id, type, description, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Deal 1: Lead Entrant récent (TechVision)
let dealId = uuidv4();
insertDeal.run(
  dealId, companies[0].id, contacts[0].id, users[0].id, 'lead_entrant',
  'site_web', null, 'Recherche Google sur formations digitales', daysAgo(2),
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  0, daysFromNow(30), daysAgo(2)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'note', 'Lead reçu via formulaire site web', daysAgo(2));

// Deal 2: Lead Entrant ancien (Services Pro) - devrait déclencher alerte
dealId = uuidv4();
insertDeal.run(
  dealId, companies[5].id, contacts[10].id, users[1].id, 'lead_entrant',
  'linkedin', null, 'Message LinkedIn', daysAgo(8),
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  0, daysFromNow(45), daysAgo(8)
);
insertActivity.run(uuidv4(), dealId, users[1].id, 'note', 'Contact via LinkedIn', daysAgo(8));

// Deal 3: En qualification - score correct (IndustriePlus)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[1].id, contacts[2].id, users[0].id, 'qualification',
  'recommandation', 'Client TechVision', 'Recommandé par Jean Laurent', daysAgo(10),
  4, 5, 'moins_3_mois', 5, 4, 'eti', 4, 22,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  3500, daysFromNow(20), daysAgo(3)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'appel', 'Appel qualification - très bon potentiel', daysAgo(3));

// Deal 4: En qualification - score faible (Commerce Express) - alerte lead froid
dealId = uuidv4();
insertDeal.run(
  dealId, companies[3].id, contacts[6].id, users[2].id, 'qualification',
  'salon', 'Salon E-Commerce Paris', null, daysAgo(12),
  2, 2, 'flou', 1, 2, 'pme', 3, 10,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  1500, daysFromNow(60), daysAgo(5)
);
insertActivity.run(uuidv4(), dealId, users[2].id, 'rdv', 'Rencontre stand salon - intérêt modéré', daysAgo(5));

// Deal 5: Démo/RDV effectué (Banque Centrale)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[2].id, contacts[4].id, users[0].id, 'demo_rdv',
  'appel_entrant', null, 'Appel standard', daysAgo(20),
  5, 4, 'moins_3_mois', 5, 5, 'ge', 5, 24,
  daysAgo(5), 'François Leroy (Dir. Formation), Isabelle Simon (Resp. Digital)', 90,
  'Grande banque régionale en pleine transformation digitale. Besoin urgent de former les équipes.',
  'Formation complète sur outils collaboratifs et transformation digitale. Cible: 50 managers.',
  'Budget à valider en comité',
  'Envoyer proposition Enterprise sur mesure',
  1,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  12000, daysFromNow(15), daysAgo(5)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'rdv', 'RDV découverte - Excellent potentiel Enterprise', daysAgo(5));

// Deal 6: Proposition envoyée (Santé Solutions)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[4].id, contacts[8].id, users[1].id, 'proposition',
  'site_web', null, 'Formulaire contact', daysAgo(25),
  4, 5, 'moins_3_mois', 5, 4, 'pme', 3, 21,
  daysAgo(15), 'Caroline Blanc (Directrice), David Roux (DSI)', 60,
  'Entreprise de solutions santé, digitalisation en cours.',
  'Formation équipe IT + management sur agilité',
  'Timing serré, besoin avant fin de trimestre',
  'Proposition Advanced à envoyer',
  1,
  daysAgo(10), 'advanced', 3500, 10, daysFromNow(30), 30,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  3500, daysFromNow(10), daysAgo(10)
);
insertActivity.run(uuidv4(), dealId, users[1].id, 'email', 'Proposition Advanced envoyée', daysAgo(10));

// Deal 7: Proposition envoyée - vieille (AgriTech) - alerte relance
dealId = uuidv4();
insertDeal.run(
  dealId, companies[7].id, contacts[14].id, users[2].id, 'proposition',
  'linkedin', null, 'Demande LinkedIn', daysAgo(30),
  3, 4, '3_6_mois', 4, 3, 'pme', 3, 17,
  daysAgo(20), 'Laurent Dumont (CEO)', 45,
  'Startup agritech en croissance rapide.',
  'Formation équipe commerciale',
  'Hésitation sur le format',
  'Envoyer proposition Starter',
  1,
  daysAgo(12), 'starter', 1500, 8, daysFromNow(45), 30,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  1500, daysFromNow(20), daysAgo(12)
);
insertActivity.run(uuidv4(), dealId, users[2].id, 'email', 'Proposition Starter envoyée', daysAgo(12));

// Deal 8: En négociation (Digital Factory)
dealId = uuidv4();
const negoEntries1 = JSON.stringify([
  { id: uuidv4(), date: daysAgo(5), content: 'Client demande remise de 10% car concurrent propose moins cher' },
  { id: uuidv4(), date: daysAgo(3), content: 'Contre-proposition à -5% acceptée en principe' }
]);
insertDeal.run(
  dealId, companies[8].id, contacts[16].id, users[0].id, 'negociation',
  'recommandation', 'Réseau CTO', null, daysAgo(35),
  5, 5, 'moins_3_mois', 5, 5, 'pme', 3, 23,
  daysAgo(25), 'Julien Robert (CTO), Camille Henry (HR)', 75,
  'Agence web en forte croissance, équipe technique à former.',
  'Formation avancée DevOps + Cloud',
  'Prix vs concurrent local',
  'Négocier et closer rapidement',
  1,
  daysAgo(15), 'advanced', 3500, 12, daysFromNow(20), 30,
  negoEntries1, 3325, 5.0, 'concurrence',
  null, null, null, null, null, null,
  null, null, null, null,
  3325, daysFromNow(7), daysAgo(3)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'note', 'Négociation en cours - remise 5% accordée', daysAgo(3));

// Deal 9: En négociation longue (Transport National) - alerte
dealId = uuidv4();
const negoEntries2 = JSON.stringify([
  { id: uuidv4(), date: daysAgo(25), content: 'Premier échange, demande de remise volume' },
  { id: uuidv4(), date: daysAgo(18), content: 'Proposition de programme sur 3 sessions' }
]);
insertDeal.run(
  dealId, companies[9].id, contacts[18].id, users[3].id, 'negociation',
  'appel_entrant', null, 'Demande directe', daysAgo(50),
  4, 5, '3_6_mois', 4, 4, 'eti', 4, 21,
  daysAgo(40), 'Eric Morel (DG), Valérie Fournier (DRH)', 120,
  'Grand groupe de transport, transformation digitale importante.',
  'Programme complet sur 3-5 jours pour 15 managers',
  'Budget à répartir sur 2 exercices',
  'Monter programme Enterprise sur mesure',
  1,
  daysAgo(30), 'enterprise', 12000, 15, daysFromNow(60), 45,
  negoEntries2, 11000, 8.3, 'volume',
  null, null, null, null, null, null,
  null, null, null, null,
  11000, daysFromNow(30), daysAgo(25)
);
insertActivity.run(uuidv4(), dealId, users[3].id, 'appel', 'Point téléphonique - en attente validation budget', daysAgo(25));

// Deal 10: Gagné récent (TechVision - 2ème deal)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[0].id, contacts[1].id, users[0].id, 'gagne',
  'recommandation', 'Jean Laurent (interne)', null, daysAgo(60),
  5, 5, 'moins_3_mois', 5, 5, 'pme', 3, 23,
  daysAgo(50), 'Claire Dubois (RH)', 60,
  'Suite au succès de la première formation.',
  'Formation complémentaire pour nouvelles recrues',
  'Aucune',
  'Signature rapide attendue',
  0,
  daysAgo(40), 'starter', 1500, 8, daysFromNow(10), 30,
  null, null, null, null,
  daysAgo(10), 1500, 'virement', '30_jours', 'BC-2024-1234', daysFromNow(10),
  null, null, null, null,
  1500, null, daysAgo(10)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'changement_etape', 'Deal GAGNÉ! Montant: 1500€ HT', daysAgo(10));

// Deal 11: Gagné (IndustriePlus - formation Enterprise)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[1].id, contacts[3].id, users[1].id, 'gagne',
  'site_web', null, 'Demande de devis', daysAgo(90),
  5, 5, 'moins_3_mois', 5, 5, 'eti', 4, 24,
  daysAgo(75), 'Anne Richard (DAF), Pierre Moreau (DG)', 90,
  'Projet de transformation digitale groupe.',
  'Formation complète direction + managers',
  'Budget validé rapidement',
  'Monter programme Enterprise',
  1,
  daysAgo(60), 'enterprise', 15000, 15, daysAgo(20), 45,
  null, 14000, 6.7, 'fidelite',
  daysAgo(45), 14000, 'virement', '45_jours', 'BC-IND-2024-089', daysAgo(5),
  null, null, null, null,
  14000, null, daysAgo(45)
);
insertActivity.run(uuidv4(), dealId, users[1].id, 'changement_etape', 'Deal GAGNÉ! Montant: 14000€ HT', daysAgo(45));

// Deal 12: Gagné le mois dernier (Mairie Toulouse)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[6].id, contacts[12].id, users[2].id, 'gagne',
  'autre', 'Appel d\'offres', null, daysAgo(120),
  4, 5, '3_6_mois', 4, 4, 'ge', 5, 22,
  daysAgo(100), 'Philippe Mercier (DGA), Nathalie Bonnet (Resp. Formation)', 120,
  'Collectivité en modernisation.',
  'Formation agents sur outils numériques',
  'Processus achat public',
  'Répondre à l\'appel d\'offres',
  1,
  daysAgo(80), 'enterprise', 10000, 12, daysAgo(15), 60,
  null, null, null, null,
  daysAgo(35), 10000, 'virement', '60_jours', 'MP-TLS-2024-456', daysAgo(15),
  null, null, null, null,
  10000, null, daysAgo(35)
);
insertActivity.run(uuidv4(), dealId, users[2].id, 'changement_etape', 'Deal GAGNÉ! Montant: 10000€ HT', daysAgo(35));

// Deal 13: Perdu récent (Commerce Express - 2ème tentative)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[3].id, contacts[7].id, users[2].id, 'perdu',
  'salon', 'Salon E-Commerce', null, daysAgo(45),
  3, 3, '3_6_mois', 4, 3, 'pme', 3, 16,
  daysAgo(35), 'Marie Thomas (RH)', 45,
  'PME e-commerce en croissance.',
  'Formation équipe support client',
  'Prix élevé pour leur budget',
  'Proposer Starter',
  0,
  daysAgo(25), 'starter', 1500, 6, null, 30,
  null, null, null, null,
  null, null, null, null, null, null,
  'prix_eleve', null, 1, 'Proposer offre plus accessible la prochaine fois',
  0, null, daysAgo(5)
);
insertActivity.run(uuidv4(), dealId, users[2].id, 'changement_etape', 'Deal PERDU - Raison: prix_eleve', daysAgo(5));

// Deal 14: Perdu - concurrent (Services Pro)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[5].id, contacts[11].id, users[3].id, 'perdu',
  'linkedin', null, 'Contact via LinkedIn', daysAgo(80),
  2, 3, 'plus_6_mois', 2, 2, 'tpe', 2, 11,
  daysAgo(70), 'Sophie Girard (Assistante)', 30,
  'Petite structure conseil.',
  'Formation basique outils',
  'Budget très limité',
  'Petit budget, voir Starter',
  0,
  daysAgo(55), 'starter', 1500, 4, null, 30,
  null, null, null, null,
  null, null, null, null, null, null,
  'concurrent', 'FormaPro Local', 0, 'TPE très sensible au prix, concurrent local moins cher',
  0, null, daysAgo(40)
);
insertActivity.run(uuidv4(), dealId, users[3].id, 'changement_etape', 'Deal PERDU - Concurrent: FormaPro Local', daysAgo(40));

// Deal 15: Lead récent qualifié (Banque - 2ème projet)
dealId = uuidv4();
insertDeal.run(
  dealId, companies[2].id, contacts[5].id, users[0].id, 'qualification',
  'recommandation', 'François Leroy (interne)', 'Suite formation précédente', daysAgo(5),
  5, 4, 'moins_3_mois', 5, 5, 'ge', 5, 24,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null,
  8000, daysFromNow(30), daysAgo(2)
);
insertActivity.run(uuidv4(), dealId, users[0].id, 'appel', 'Nouveau projet formation équipe digital - Excellent potentiel', daysAgo(2));

console.log('Created 15 deals with activities');
console.log('\nDatabase seeded successfully!');
console.log('\nSummary:');
console.log('- 4 commerciaux (Marie, Thomas, Sophie, Lucas)');
console.log('- 10 entreprises');
console.log('- 20 contacts');
console.log('- 15 deals à différentes étapes');
