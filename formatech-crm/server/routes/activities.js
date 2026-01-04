const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Get all activities (with optional filters)
router.get('/', (req, res) => {
  try {
    const { deal_id, user_id, type, limit = 50 } = req.query;

    let query = `
      SELECT a.*,
        u.first_name as user_first_name, u.last_name as user_last_name,
        d.company_id, c.name as company_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (deal_id) {
      query += ' AND a.deal_id = ?';
      params.push(deal_id);
    }
    if (user_id) {
      query += ' AND a.user_id = ?';
      params.push(user_id);
    }
    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const activities = db.prepare(query).all(...params);

    // Parse metadata JSON
    activities.forEach(a => {
      if (a.metadata) {
        a.metadata = JSON.parse(a.metadata);
      }
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent activities for dashboard
router.get('/recent', (req, res) => {
  try {
    const activities = db.prepare(`
      SELECT a.*,
        u.first_name as user_first_name, u.last_name as user_last_name,
        c.name as company_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies c ON d.company_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all();

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add activity manually
router.post('/', (req, res) => {
  try {
    const { deal_id, user_id, type, description, metadata } = req.body;

    const id = uuidv4();
    db.prepare(`
      INSERT INTO activities (id, deal_id, user_id, type, description, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, deal_id, user_id, type, description, metadata ? JSON.stringify(metadata) : null);

    // Update deal's last_activity_at
    db.prepare(`UPDATE deals SET last_activity_at = datetime('now') WHERE id = ?`).run(deal_id);

    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
