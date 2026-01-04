const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Generate automatic reminders based on business rules
function generateReminders() {
  const now = new Date().toISOString();

  // Clear old reminders first
  db.prepare('DELETE FROM reminders WHERE is_read = 0').run();

  // Rule 1: Lead in stage 1 for >5 days without activity
  const leadsToQualify = db.prepare(`
    SELECT d.id, c.name as company_name
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'lead_entrant'
    AND date(d.entry_date) <= date('now', '-5 days')
  `).all();

  leadsToQualify.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'lead_a_qualifier', ?)
    `).run(uuidv4(), deal.id, `Lead à qualifier d'urgence: ${deal.company_name}`);
  });

  // Rule 2: Lead with score <12 in qualification for >3 days
  const coldLeads = db.prepare(`
    SELECT d.id, c.name as company_name, d.qual_total_score
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'qualification'
    AND d.qual_total_score < 12
    AND date(d.updated_at) <= date('now', '-3 days')
  `).all();

  coldLeads.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'lead_froid', ?)
    `).run(uuidv4(), deal.id, `Lead froid à traiter: ${deal.company_name} (score: ${deal.qual_total_score}/25)`);
  });

  // Rule 3: No activity for >10 days
  const dormantDeals = db.prepare(`
    SELECT d.id, c.name as company_name
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage NOT IN ('gagne', 'perdu')
    AND date(d.last_activity_at) <= date('now', '-10 days')
  `).all();

  dormantDeals.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'deal_dormant', ?)
    `).run(uuidv4(), deal.id, `Deal dormant: ${deal.company_name}`);
  });

  // Rule 4: Proposal sent >7 days ago without response
  const propalsToRelance = db.prepare(`
    SELECT d.id, c.name as company_name
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'proposition'
    AND date(d.prop_sent_date) <= date('now', '-7 days')
  `).all();

  propalsToRelance.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'relance_propale', ?)
    `).run(uuidv4(), deal.id, `Relance propale: ${deal.company_name}`);
  });

  // Rule 5: Proposal validity expires in <5 days
  const expiringPropals = db.prepare(`
    SELECT d.id, c.name as company_name,
      date(d.prop_sent_date, '+' || d.prop_validity_days || ' days') as expiry_date
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'proposition'
    AND date(d.prop_sent_date, '+' || d.prop_validity_days || ' days') <= date('now', '+5 days')
    AND date(d.prop_sent_date, '+' || d.prop_validity_days || ' days') >= date('now')
  `).all();

  expiringPropals.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'propale_expiree', ?)
    `).run(uuidv4(), deal.id, `Propale bientôt expirée: ${deal.company_name}`);
  });

  // Rule 6: Deal in negotiation for >20 days
  const longNegotiations = db.prepare(`
    SELECT d.id, c.name as company_name
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'negociation'
    AND date(d.updated_at) <= date('now', '-20 days')
  `).all();

  longNegotiations.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'nego_longue', ?)
    `).run(uuidv4(), deal.id, `Négo qui traîne: ${deal.company_name}`);
  });

  // Rule 7: Training date <14 days and conditions not settled
  const upcomingTrainings = db.prepare(`
    SELECT d.id, c.name as company_name
    FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.stage = 'gagne'
    AND d.won_confirmed_training_dates IS NOT NULL
    AND date(d.won_confirmed_training_dates) <= date('now', '+14 days')
    AND date(d.won_confirmed_training_dates) >= date('now')
  `).all();

  upcomingTrainings.forEach(deal => {
    db.prepare(`
      INSERT INTO reminders (id, deal_id, type, message)
      VALUES (?, ?, 'alerte_formation', ?)
    `).run(uuidv4(), deal.id, `Alerte pré-formation: ${deal.company_name}`);
  });
}

// Get all reminders
router.get('/', (req, res) => {
  try {
    // Regenerate reminders
    generateReminders();

    const { is_read } = req.query;
    let query = `
      SELECT r.*,
        d.company_id, c.name as company_name,
        d.stage, d.current_amount
      FROM reminders r
      JOIN deals d ON r.deal_id = d.id
      JOIN companies c ON d.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (is_read !== undefined) {
      query += ' AND r.is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ' ORDER BY r.created_at DESC';

    const reminders = db.prepare(query).all(...params);
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unread count
router.get('/count', (req, res) => {
  try {
    generateReminders();
    const result = db.prepare('SELECT COUNT(*) as count FROM reminders WHERE is_read = 0').get();
    res.json({ success: true, data: { count: result.count } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark reminder as read
router.put('/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE reminders SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all as read
router.put('/read-all', (req, res) => {
  try {
    db.prepare('UPDATE reminders SET is_read = 1').run();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
