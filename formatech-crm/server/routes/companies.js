const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Get all companies
router.get('/', (req, res) => {
  try {
    const { search, sector, size } = req.query;
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR siren LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (sector) {
      query += ' AND sector = ?';
      params.push(sector);
    }
    if (size) {
      query += ' AND size = ?';
      params.push(size);
    }

    query += ' ORDER BY name';
    const companies = db.prepare(query).all(...params);
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get company by ID
router.get('/:id', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Get contacts for this company
    const contacts = db.prepare('SELECT * FROM contacts WHERE company_id = ?').all(req.params.id);

    // Get deals for this company
    const deals = db.prepare(`
      SELECT d.*, u.first_name as user_first_name, u.last_name as user_last_name
      FROM deals d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.company_id = ?
      ORDER BY d.created_at DESC
    `).all(req.params.id);

    res.json({
      success: true,
      data: {
        ...company,
        contacts,
        deals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create company
router.post('/', (req, res) => {
  try {
    const {
      name, siren, sector, size, address, city, postal_code,
      website, estimated_revenue, collective_agreement, opco
    } = req.body;

    // Validate SIREN (9 digits)
    if (siren && !/^\d{9}$/.test(siren)) {
      return res.status(400).json({ success: false, error: 'SIREN must be 9 digits' });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO companies (id, name, siren, sector, size, address, city, postal_code,
        website, estimated_revenue, collective_agreement, opco)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, siren, sector, size, address, city, postal_code,
      website, estimated_revenue, collective_agreement, opco);

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: 'SIREN already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update company
router.put('/:id', (req, res) => {
  try {
    const {
      name, siren, sector, size, address, city, postal_code,
      website, estimated_revenue, collective_agreement, opco
    } = req.body;

    // Validate SIREN
    if (siren && !/^\d{9}$/.test(siren)) {
      return res.status(400).json({ success: false, error: 'SIREN must be 9 digits' });
    }

    const stmt = db.prepare(`
      UPDATE companies SET
        name = ?, siren = ?, sector = ?, size = ?, address = ?, city = ?, postal_code = ?,
        website = ?, estimated_revenue = ?, collective_agreement = ?, opco = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(name, siren, sector, size, address, city, postal_code,
      website, estimated_revenue, collective_agreement, opco, req.params.id);

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete company
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
