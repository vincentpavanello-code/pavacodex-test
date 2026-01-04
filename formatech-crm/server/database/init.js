const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/formatech.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users (Commerciaux)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'commercial' CHECK(role IN ('commercial', 'manager')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Companies (Entreprises)
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    siren TEXT UNIQUE,
    sector TEXT CHECK(sector IN ('industrie', 'services', 'commerce', 'tech', 'finance', 'sante', 'public', 'autre')),
    size TEXT CHECK(size IN ('tpe', 'pme', 'eti', 'ge')),
    address TEXT,
    city TEXT,
    postal_code TEXT,
    website TEXT,
    estimated_revenue INTEGER,
    collective_agreement TEXT,
    opco TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Contacts
  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    civility TEXT CHECK(civility IN ('M.', 'Mme')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    function TEXT,
    email TEXT,
    phone_fixed TEXT,
    phone_mobile TEXT,
    linkedin_url TEXT,
    is_decision_maker TEXT DEFAULT 'a_confirmer' CHECK(is_decision_maker IN ('oui', 'non', 'a_confirmer')),
    is_signatory INTEGER DEFAULT 0,
    company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Deals
  CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage TEXT DEFAULT 'lead_entrant' CHECK(stage IN ('lead_entrant', 'qualification', 'demo_rdv', 'proposition', 'negociation', 'gagne', 'perdu')),

    -- Stage 1: Lead entrant
    source TEXT CHECK(source IN ('site_web', 'linkedin', 'recommandation', 'salon', 'appel_entrant', 'autre')),
    source_details TEXT,
    how_did_they_find_us TEXT,
    entry_date TEXT DEFAULT (datetime('now')),

    -- Stage 2: Qualification
    qual_budget_identified INTEGER DEFAULT 0,
    qual_decision_maker_identified INTEGER DEFAULT 0,
    qual_timing TEXT,
    qual_timing_score INTEGER DEFAULT 0,
    qual_real_need_expressed INTEGER DEFAULT 0,
    qual_company_size TEXT,
    qual_company_size_score INTEGER DEFAULT 0,
    qual_total_score INTEGER DEFAULT 0,

    -- Stage 3: Demo/RDV
    demo_date TEXT,
    demo_participants TEXT,
    demo_duration INTEGER,
    demo_client_context TEXT,
    demo_needs_expressed TEXT,
    demo_objections_raised TEXT,
    demo_next_steps TEXT,
    demo_decision_maker_present INTEGER DEFAULT 0,

    -- Stage 4: Proposition
    prop_sent_date TEXT,
    prop_offer_type TEXT CHECK(prop_offer_type IN ('starter', 'advanced', 'enterprise')),
    prop_amount INTEGER,
    prop_participants_count INTEGER,
    prop_proposed_dates TEXT,
    prop_validity_days INTEGER DEFAULT 30,
    prop_pdf_path TEXT,

    -- Stage 5: Negociation
    nego_entries TEXT, -- JSON array
    nego_revised_amount INTEGER,
    nego_discount_percent REAL,
    nego_discount_reason TEXT,

    -- Stage 6: Gagne
    won_signature_date TEXT,
    won_final_amount INTEGER,
    won_payment_mode TEXT,
    won_payment_terms TEXT,
    won_purchase_order_number TEXT,
    won_confirmed_training_dates TEXT,

    -- Stage 7: Perdu
    lost_reason TEXT,
    lost_competitor_name TEXT,
    lost_other_reason TEXT,
    lost_recontact_in_6_months INTEGER DEFAULT 0,
    lost_lessons_learned TEXT,

    -- Computed/Metadata
    current_amount INTEGER DEFAULT 0,
    expected_close_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_activity_at TEXT DEFAULT (datetime('now'))
  );

  -- Activities
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    type TEXT CHECK(type IN ('appel', 'email', 'rdv', 'note', 'changement_etape', 'modification')),
    description TEXT NOT NULL,
    metadata TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Reminders (auto-generated alerts)
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    type TEXT CHECK(type IN ('lead_a_qualifier', 'lead_froid', 'deal_dormant', 'relance_propale', 'propale_expiree', 'nego_longue', 'alerte_formation')),
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
  CREATE INDEX IF NOT EXISTS idx_deals_user ON deals(user_id);
  CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
  CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id);
  CREATE INDEX IF NOT EXISTS idx_reminders_deal ON reminders(deal_id);
  CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
`);

console.log('Database initialized successfully');

module.exports = db;
