const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Helper to convert to CSV
function toCSV(data, columns) {
  if (!data.length) return '';

  const headers = columns.map(c => c.label).join(';');
  const rows = data.map(row => {
    return columns.map(c => {
      let val = row[c.key];
      if (val === null || val === undefined) val = '';
      // Escape quotes and wrap in quotes if contains special chars
      val = String(val).replace(/"/g, '""');
      if (val.includes(';') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    }).join(';');
  });

  return [headers, ...rows].join('\n');
}

// Export deals to CSV
router.get('/deals', (req, res) => {
  try {
    const { stage, user_id, source, start_date, end_date } = req.query;

    let query = `
      SELECT d.*,
        c.name as company_name, c.siren as company_siren,
        ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
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
    if (start_date) {
      query += ' AND d.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND d.created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY d.created_at DESC';

    const deals = db.prepare(query).all(...params);

    const columns = [
      { key: 'company_name', label: 'Entreprise' },
      { key: 'company_siren', label: 'SIREN' },
      { key: 'contact_first_name', label: 'Prénom Contact' },
      { key: 'contact_last_name', label: 'Nom Contact' },
      { key: 'contact_email', label: 'Email Contact' },
      { key: 'stage', label: 'Étape' },
      { key: 'source', label: 'Source' },
      { key: 'prop_offer_type', label: 'Offre' },
      { key: 'current_amount', label: 'Montant HT' },
      { key: 'user_first_name', label: 'Commercial (Prénom)' },
      { key: 'user_last_name', label: 'Commercial (Nom)' },
      { key: 'created_at', label: 'Date création' },
      { key: 'expected_close_date', label: 'Closing prévu' },
      { key: 'qual_total_score', label: 'Score Qualification' },
      { key: 'won_final_amount', label: 'Montant Signé' },
      { key: 'won_signature_date', label: 'Date Signature' }
    ];

    const csv = toCSV(deals, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="deals_export.csv"');
    res.send('\ufeff' + csv); // BOM for Excel
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export contacts to CSV
router.get('/contacts', (req, res) => {
  try {
    const contacts = db.prepare(`
      SELECT c.*, comp.name as company_name, comp.siren as company_siren
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      ORDER BY c.last_name, c.first_name
    `).all();

    const columns = [
      { key: 'civility', label: 'Civilité' },
      { key: 'first_name', label: 'Prénom' },
      { key: 'last_name', label: 'Nom' },
      { key: 'function', label: 'Fonction' },
      { key: 'email', label: 'Email' },
      { key: 'phone_fixed', label: 'Téléphone Fixe' },
      { key: 'phone_mobile', label: 'Téléphone Mobile' },
      { key: 'linkedin_url', label: 'LinkedIn' },
      { key: 'is_decision_maker', label: 'Décideur' },
      { key: 'is_signatory', label: 'Signataire' },
      { key: 'company_name', label: 'Entreprise' },
      { key: 'company_siren', label: 'SIREN Entreprise' },
      { key: 'notes', label: 'Notes' }
    ];

    const csv = toCSV(contacts, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts_export.csv"');
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export companies to CSV
router.get('/companies', (req, res) => {
  try {
    const companies = db.prepare(`
      SELECT * FROM companies ORDER BY name
    `).all();

    const columns = [
      { key: 'name', label: 'Raison Sociale' },
      { key: 'siren', label: 'SIREN' },
      { key: 'sector', label: 'Secteur' },
      { key: 'size', label: 'Taille' },
      { key: 'address', label: 'Adresse' },
      { key: 'city', label: 'Ville' },
      { key: 'postal_code', label: 'Code Postal' },
      { key: 'website', label: 'Site Web' },
      { key: 'estimated_revenue', label: 'CA Estimé' },
      { key: 'collective_agreement', label: 'Convention Collective' },
      { key: 'opco', label: 'OPCO' }
    ];

    const csv = toCSV(companies, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="companies_export.csv"');
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import contacts from CSV
router.post('/import/contacts', (req, res) => {
  try {
    const { data, mapping } = req.body;
    // data: array of rows
    // mapping: { csvColumn: dbColumn }

    let imported = 0;
    let duplicates = 0;
    const { v4: uuidv4 } = require('uuid');

    data.forEach(row => {
      const mappedRow = {};
      Object.entries(mapping).forEach(([csvCol, dbCol]) => {
        mappedRow[dbCol] = row[csvCol];
      });

      // Check for duplicate by email
      if (mappedRow.email) {
        const existing = db.prepare('SELECT id FROM contacts WHERE email = ?').get(mappedRow.email);
        if (existing) {
          duplicates++;
          return;
        }
      }

      const id = uuidv4();
      db.prepare(`
        INSERT INTO contacts (id, civility, first_name, last_name, function, email,
          phone_fixed, phone_mobile, linkedin_url, is_decision_maker, company_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        mappedRow.civility || null,
        mappedRow.first_name || '',
        mappedRow.last_name || '',
        mappedRow.function || null,
        mappedRow.email || null,
        mappedRow.phone_fixed || null,
        mappedRow.phone_mobile || null,
        mappedRow.linkedin_url || null,
        mappedRow.is_decision_maker || 'a_confirmer',
        mappedRow.company_id || null
      );
      imported++;
    });

    res.json({
      success: true,
      data: { imported, duplicates }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
