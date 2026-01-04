const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// Get all users
router.get('/', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY last_name, first_name').all();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create user
router.post('/', (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO users (id, first_name, last_name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, first_name, last_name, email, role || 'commercial');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user
router.put('/:id', (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const stmt = db.prepare(`
      UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?
      WHERE id = ?
    `);
    stmt.run(first_name, last_name, email, role, req.params.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user stats
router.get('/:id/stats', (req, res) => {
  try {
    const userId = req.params.id;

    // Count deals by stage
    const dealsCount = db.prepare(`
      SELECT COUNT(*) as count FROM deals WHERE user_id = ? AND stage NOT IN ('gagne', 'perdu')
    `).get(userId);

    // Pipeline amount
    const pipeline = db.prepare(`
      SELECT COALESCE(SUM(current_amount), 0) as amount
      FROM deals WHERE user_id = ? AND stage IN ('qualification', 'demo_rdv', 'proposition', 'negociation')
    `).get(userId);

    // Signed amount this year
    const signed = db.prepare(`
      SELECT COALESCE(SUM(won_final_amount), 0) as amount
      FROM deals WHERE user_id = ? AND stage = 'gagne'
      AND strftime('%Y', won_signature_date) = strftime('%Y', 'now')
    `).get(userId);

    // Conversion rate (last 90 days)
    const closedDeals = db.prepare(`
      SELECT
        SUM(CASE WHEN stage = 'gagne' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN stage IN ('gagne', 'perdu') THEN 1 ELSE 0 END) as total
      FROM deals
      WHERE user_id = ?
      AND (won_signature_date >= date('now', '-90 days') OR lost_reason IS NOT NULL)
    `).get(userId);

    const conversionRate = closedDeals.total > 0
      ? Math.round((closedDeals.won / closedDeals.total) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        dealsCount: dealsCount.count,
        pipelineAmount: pipeline.amount,
        signedAmount: signed.amount,
        conversionRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
