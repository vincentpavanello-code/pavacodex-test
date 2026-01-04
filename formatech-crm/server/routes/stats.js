const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Get dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    // Total pipeline (stages 2-5)
    const pipeline = db.prepare(`
      SELECT COALESCE(SUM(current_amount), 0) as total
      FROM deals
      WHERE stage IN ('qualification', 'demo_rdv', 'proposition', 'negociation')
    `).get();

    // Deals by stage
    const dealsByStage = db.prepare(`
      SELECT stage, COUNT(*) as count, COALESCE(SUM(current_amount), 0) as amount
      FROM deals
      GROUP BY stage
    `).all();

    const stageMap = {};
    dealsByStage.forEach(s => {
      stageMap[s.stage] = { count: s.count, amount: s.amount };
    });

    // Forecast this month (stages 4-5 with expected close this month)
    const forecast = db.prepare(`
      SELECT COALESCE(SUM(current_amount), 0) as total
      FROM deals
      WHERE stage IN ('proposition', 'negociation')
      AND strftime('%Y-%m', expected_close_date) = strftime('%Y-%m', 'now')
    `).get();

    // Signed this month
    const signedThisMonth = db.prepare(`
      SELECT COALESCE(SUM(won_final_amount), 0) as total
      FROM deals
      WHERE stage = 'gagne'
      AND strftime('%Y-%m', won_signature_date) = strftime('%Y-%m', 'now')
    `).get();

    // Signed last month
    const signedLastMonth = db.prepare(`
      SELECT COALESCE(SUM(won_final_amount), 0) as total
      FROM deals
      WHERE stage = 'gagne'
      AND strftime('%Y-%m', won_signature_date) = strftime('%Y-%m', 'now', '-1 month')
    `).get();

    // Conversion rate (90 days)
    const conversion = db.prepare(`
      SELECT
        SUM(CASE WHEN stage = 'gagne' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN stage IN ('gagne', 'perdu') THEN 1 ELSE 0 END) as total
      FROM deals
      WHERE created_at >= date('now', '-90 days')
    `).get();

    const conversionRate = conversion.total > 0
      ? Math.round((conversion.won / conversion.total) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalPipeline: pipeline.total,
        dealsByStage: stageMap,
        forecastThisMonth: forecast.total,
        signedThisMonth: signedThisMonth.total,
        signedLastMonth: signedLastMonth.total,
        conversionRate90Days: conversionRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Monthly revenue for chart (last 12 months)
router.get('/monthly-revenue', (req, res) => {
  try {
    const monthlyRevenue = db.prepare(`
      SELECT
        strftime('%Y-%m', won_signature_date) as month,
        COALESCE(SUM(won_final_amount), 0) as amount
      FROM deals
      WHERE stage = 'gagne'
      AND won_signature_date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', won_signature_date)
      ORDER BY month
    `).all();

    res.json({ success: true, data: monthlyRevenue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lead sources distribution
router.get('/sources', (req, res) => {
  try {
    const sources = db.prepare(`
      SELECT source, COUNT(*) as count
      FROM deals
      WHERE source IS NOT NULL
      GROUP BY source
      ORDER BY count DESC
    `).all();

    res.json({ success: true, data: sources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Performance by user
router.get('/user-performance', (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT
        u.id as user_id,
        u.first_name || ' ' || u.last_name as user_name,
        COUNT(d.id) as deals_count,
        COALESCE(SUM(CASE WHEN d.stage NOT IN ('gagne', 'perdu') THEN d.current_amount ELSE 0 END), 0) as pipeline_amount,
        COALESCE(SUM(CASE WHEN d.stage = 'gagne' THEN d.won_final_amount ELSE 0 END), 0) as signed_amount,
        CASE
          WHEN SUM(CASE WHEN d.stage IN ('gagne', 'perdu') THEN 1 ELSE 0 END) > 0
          THEN ROUND(
            SUM(CASE WHEN d.stage = 'gagne' THEN 1.0 ELSE 0 END) /
            SUM(CASE WHEN d.stage IN ('gagne', 'perdu') THEN 1 ELSE 0 END) * 100
          )
          ELSE 0
        END as conversion_rate
      FROM users u
      LEFT JOIN deals d ON u.id = d.user_id
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY signed_amount DESC
    `).all();

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Next deals to close
router.get('/next-to-close', (req, res) => {
  try {
    const deals = db.prepare(`
      SELECT d.*,
        c.name as company_name,
        u.first_name as user_first_name, u.last_name as user_last_name
      FROM deals d
      JOIN companies c ON d.company_id = c.id
      JOIN users u ON d.user_id = u.id
      WHERE d.stage IN ('proposition', 'negociation')
      AND d.expected_close_date IS NOT NULL
      ORDER BY d.expected_close_date ASC
      LIMIT 5
    `).all();

    res.json({ success: true, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Funnel data
router.get('/funnel', (req, res) => {
  try {
    const stages = ['lead_entrant', 'qualification', 'demo_rdv', 'proposition', 'negociation', 'gagne'];
    const funnel = stages.map(stage => {
      const result = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(current_amount), 0) as amount
        FROM deals WHERE stage = ?
      `).get(stage);
      return { stage, count: result.count, amount: result.amount };
    });

    res.json({ success: true, data: funnel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
