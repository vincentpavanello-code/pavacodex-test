const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Get all contacts
router.get('/', (req, res) => {
  try {
    const { search, company_id, is_decision_maker } = req.query;
    let query = `
      SELECT c.*, comp.name as company_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (company_id) {
      query += ' AND c.company_id = ?';
      params.push(company_id);
    }
    if (is_decision_maker) {
      query += ' AND c.is_decision_maker = ?';
      params.push(is_decision_maker);
    }

    query += ' ORDER BY c.last_name, c.first_name';
    const contacts = db.prepare(query).all(...params);
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get contact by ID
router.get('/:id', (req, res) => {
  try {
    const contact = db.prepare(`
      SELECT c.*, comp.name as company_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // Get activities involving this contact (via deals)
    const activities = db.prepare(`
      SELECT a.*, d.id as deal_id
      FROM activities a
      JOIN deals d ON a.deal_id = d.id
      WHERE d.contact_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(req.params.id);

    res.json({
      success: true,
      data: {
        ...contact,
        activities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create contact
router.post('/', (req, res) => {
  try {
    const {
      civility, first_name, last_name, function: func, email, phone_fixed,
      phone_mobile, linkedin_url, is_decision_maker, is_signatory, company_id, notes
    } = req.body;

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO contacts (id, civility, first_name, last_name, function, email, phone_fixed,
        phone_mobile, linkedin_url, is_decision_maker, is_signatory, company_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, civility, first_name, last_name, func, email, phone_fixed,
      phone_mobile, linkedin_url, is_decision_maker || 'a_confirmer',
      is_signatory ? 1 : 0, company_id, notes);

    const contact = db.prepare(`
      SELECT c.*, comp.name as company_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE c.id = ?
    `).get(id);

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update contact
router.put('/:id', (req, res) => {
  try {
    const {
      civility, first_name, last_name, function: func, email, phone_fixed,
      phone_mobile, linkedin_url, is_decision_maker, is_signatory, company_id, notes
    } = req.body;

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const stmt = db.prepare(`
      UPDATE contacts SET
        civility = ?, first_name = ?, last_name = ?, function = ?, email = ?, phone_fixed = ?,
        phone_mobile = ?, linkedin_url = ?, is_decision_maker = ?, is_signatory = ?,
        company_id = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(civility, first_name, last_name, func, email, phone_fixed,
      phone_mobile, linkedin_url, is_decision_maker, is_signatory ? 1 : 0,
      company_id, notes, req.params.id);

    const contact = db.prepare(`
      SELECT c.*, comp.name as company_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE c.id = ?
    `).get(req.params.id);

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete contact
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
