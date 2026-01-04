const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database
const db = require('./database/init');

// Import routes
const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const contactsRoutes = require('./routes/contacts');
const dealsRoutes = require('./routes/deals');
const activitiesRoutes = require('./routes/activities');
const remindersRoutes = require('./routes/reminders');
const statsRoutes = require('./routes/stats');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(PORT, () => {
  console.log(`FormaTech CRM API running on http://localhost:${PORT}`);
});
