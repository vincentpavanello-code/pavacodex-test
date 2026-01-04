const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Helper to add activity
function addActivity(dealId, userId, type, description, metadata = null) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO activities (id, deal_id, user_id, type, description, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, dealId, userId, type, description, metadata ? JSON.stringify(metadata) : null);

  // Update deal's last_activity_at
  db.prepare(`UPDATE deals SET last_activity_at = datetime('now') WHERE id = ?`).run(dealId);
}

// Get all deals with filters
router.get('/', (req, res) => {
  try {
    const { stage, user_id, source, offer_type, search, start_date, end_date } = req.query;

    let query = `
      SELECT d.*,
        c.name as company_name,
        ct.first_name as contact_first_name, ct.last_name as contact_last_name,
        u.first_name as user_first_name, u.last_name as user_last_name
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (stage) {
      query += ' AND d.stage = ?';
      params.push(stage);
    }
    if (user_id) {
      query += ' AND d.user_id = ?';
      params.push(user_id);
    }
    if (source) {
      query += ' AND d.source = ?';
      params.push(source);
    }
    if (offer_type) {
      query += ' AND d.prop_offer_type = ?';
      params.push(offer_type);
    }
    if (search) {
      query += ' AND (c.name LIKE ? OR ct.first_name LIKE ? OR ct.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (start_date) {
      query += ' AND d.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND d.created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY d.last_activity_at DESC';

    const deals = db.prepare(query).all(...params);
    res.json({ success: true, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get deal by ID with full details
router.get('/:id', (req, res) => {
  try {
    const deal = db.prepare(`
      SELECT d.*,
        c.name as company_name, c.siren as company_siren, c.sector as company_sector,
        c.size as company_size, c.address as company_address, c.city as company_city,
        ct.civility as contact_civility, ct.first_name as contact_first_name,
        ct.last_name as contact_last_name, ct.function as contact_function,
        ct.email as contact_email, ct.phone_mobile as contact_phone,
        u.first_name as user_first_name, u.last_name as user_last_name
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `).get(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    // Get activities
    const activities = db.prepare(`
      SELECT a.*, u.first_name as user_first_name, u.last_name as user_last_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.deal_id = ?
      ORDER BY a.created_at DESC
    `).all(req.params.id);

    // Get all contacts from the company
    const companyContacts = db.prepare(`
      SELECT * FROM contacts WHERE company_id = ?
    `).all(deal.company_id);

    // Parse negotiation entries if they exist
    if (deal.nego_entries) {
      deal.nego_entries = JSON.parse(deal.nego_entries);
    }

    res.json({
      success: true,
      data: {
        ...deal,
        activities,
        companyContacts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new deal
router.post('/', (req, res) => {
  try {
    const {
      company_id, contact_id, user_id, source, source_details,
      how_did_they_find_us, expected_close_date
    } = req.body;

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO deals (id, company_id, contact_id, user_id, source, source_details,
        how_did_they_find_us, expected_close_date, stage, current_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'lead_entrant', 0)
    `);
    stmt.run(id, company_id, contact_id, user_id, source, source_details,
      how_did_they_find_us, expected_close_date);

    // Add creation activity
    addActivity(id, user_id, 'note', 'Deal créé');

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update deal stage
router.put('/:id/stage', (req, res) => {
  try {
    const { stage, user_id } = req.body;
    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const oldStage = deal.stage;
    db.prepare(`
      UPDATE deals SET stage = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(stage, req.params.id);

    addActivity(req.params.id, user_id, 'changement_etape',
      `Étape changée: ${oldStage} → ${stage}`);

    const updatedDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedDeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update qualification data (Stage 2)
router.put('/:id/qualification', (req, res) => {
  try {
    const {
      qual_budget_identified, qual_decision_maker_identified, qual_timing,
      qual_real_need_expressed, qual_company_size, user_id
    } = req.body;

    // Calculate timing score
    const timingScores = { moins_3_mois: 5, '3_6_mois': 4, plus_6_mois: 2, flou: 1 };
    const qual_timing_score = timingScores[qual_timing] || 1;

    // Calculate company size score
    const sizeScores = { ge: 5, eti: 4, pme: 3, tpe: 2 };
    const qual_company_size_score = sizeScores[qual_company_size] || 2;

    // Calculate total score
    const qual_total_score = (qual_budget_identified || 0) +
      (qual_decision_maker_identified || 0) +
      qual_timing_score +
      (qual_real_need_expressed || 0) +
      qual_company_size_score;

    db.prepare(`
      UPDATE deals SET
        qual_budget_identified = ?, qual_decision_maker_identified = ?,
        qual_timing = ?, qual_timing_score = ?,
        qual_real_need_expressed = ?, qual_company_size = ?,
        qual_company_size_score = ?, qual_total_score = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      qual_budget_identified, qual_decision_maker_identified,
      qual_timing, qual_timing_score, qual_real_need_expressed,
      qual_company_size, qual_company_size_score, qual_total_score,
      req.params.id
    );

    addActivity(req.params.id, user_id, 'modification',
      `Qualification mise à jour - Score: ${qual_total_score}/25`);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update demo meeting data (Stage 3)
router.put('/:id/demo', (req, res) => {
  try {
    const {
      demo_date, demo_participants, demo_duration, demo_client_context,
      demo_needs_expressed, demo_objections_raised, demo_next_steps,
      demo_decision_maker_present, user_id
    } = req.body;

    db.prepare(`
      UPDATE deals SET
        demo_date = ?, demo_participants = ?, demo_duration = ?,
        demo_client_context = ?, demo_needs_expressed = ?,
        demo_objections_raised = ?, demo_next_steps = ?,
        demo_decision_maker_present = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      demo_date, demo_participants, demo_duration, demo_client_context,
      demo_needs_expressed, demo_objections_raised, demo_next_steps,
      demo_decision_maker_present ? 1 : 0, req.params.id
    );

    addActivity(req.params.id, user_id, 'rdv',
      `RDV découverte du ${demo_date} enregistré`);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update proposal data (Stage 4)
router.put('/:id/proposal', (req, res) => {
  try {
    const {
      prop_sent_date, prop_offer_type, prop_amount, prop_participants_count,
      prop_proposed_dates, prop_validity_days, user_id
    } = req.body;

    db.prepare(`
      UPDATE deals SET
        prop_sent_date = ?, prop_offer_type = ?, prop_amount = ?,
        prop_participants_count = ?, prop_proposed_dates = ?,
        prop_validity_days = ?, current_amount = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      prop_sent_date, prop_offer_type, prop_amount, prop_participants_count,
      prop_proposed_dates, prop_validity_days || 30, prop_amount, req.params.id
    );

    addActivity(req.params.id, user_id, 'email',
      `Proposition ${prop_offer_type} envoyée: ${prop_amount}€ HT`);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add negotiation entry (Stage 5)
router.post('/:id/negotiation', (req, res) => {
  try {
    const { content, user_id } = req.body;
    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);

    let entries = deal.nego_entries ? JSON.parse(deal.nego_entries) : [];
    entries.push({
      id: uuidv4(),
      date: new Date().toISOString(),
      content
    });

    db.prepare(`
      UPDATE deals SET nego_entries = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(entries), req.params.id);

    addActivity(req.params.id, user_id, 'note', `Note négociation: ${content.substring(0, 50)}...`);

    const updatedDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedDeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update negotiation amount
router.put('/:id/negotiation', (req, res) => {
  try {
    const { nego_revised_amount, nego_discount_reason, user_id } = req.body;
    const deal = db.prepare('SELECT prop_amount FROM deals WHERE id = ?').get(req.params.id);

    // Calculate discount percent
    const nego_discount_percent = deal.prop_amount > 0
      ? Math.round(((deal.prop_amount - nego_revised_amount) / deal.prop_amount) * 100 * 10) / 10
      : 0;

    db.prepare(`
      UPDATE deals SET
        nego_revised_amount = ?, nego_discount_percent = ?,
        nego_discount_reason = ?, current_amount = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(nego_revised_amount, nego_discount_percent, nego_discount_reason,
      nego_revised_amount, req.params.id);

    addActivity(req.params.id, user_id, 'modification',
      `Montant révisé: ${nego_revised_amount}€ (-${nego_discount_percent}%)`);

    const updatedDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedDeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as won (Stage 6)
router.put('/:id/won', (req, res) => {
  try {
    const {
      won_signature_date, won_final_amount, won_payment_mode,
      won_payment_terms, won_purchase_order_number, won_confirmed_training_dates,
      user_id
    } = req.body;

    db.prepare(`
      UPDATE deals SET
        stage = 'gagne', won_signature_date = ?, won_final_amount = ?,
        won_payment_mode = ?, won_payment_terms = ?,
        won_purchase_order_number = ?, won_confirmed_training_dates = ?,
        current_amount = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      won_signature_date, won_final_amount, won_payment_mode, won_payment_terms,
      won_purchase_order_number, won_confirmed_training_dates, won_final_amount,
      req.params.id
    );

    addActivity(req.params.id, user_id, 'changement_etape',
      `Deal GAGNÉ! Montant: ${won_final_amount}€ HT`);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as lost (Stage 7)
router.put('/:id/lost', (req, res) => {
  try {
    const {
      lost_reason, lost_competitor_name, lost_other_reason,
      lost_recontact_in_6_months, lost_lessons_learned, user_id
    } = req.body;

    db.prepare(`
      UPDATE deals SET
        stage = 'perdu', lost_reason = ?, lost_competitor_name = ?,
        lost_other_reason = ?, lost_recontact_in_6_months = ?,
        lost_lessons_learned = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      lost_reason, lost_competitor_name, lost_other_reason,
      lost_recontact_in_6_months ? 1 : 0, lost_lessons_learned, req.params.id
    );

    addActivity(req.params.id, user_id, 'changement_etape',
      `Deal PERDU - Raison: ${lost_reason}`);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update general deal info
router.put('/:id', (req, res) => {
  try {
    const { company_id, contact_id, user_id, expected_close_date, source, source_details } = req.body;

    db.prepare(`
      UPDATE deals SET
        company_id = COALESCE(?, company_id),
        contact_id = COALESCE(?, contact_id),
        user_id = COALESCE(?, user_id),
        expected_close_date = COALESCE(?, expected_close_date),
        source = COALESCE(?, source),
        source_details = COALESCE(?, source_details),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(company_id, contact_id, user_id, expected_close_date, source, source_details, req.params.id);

    const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete deal
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
