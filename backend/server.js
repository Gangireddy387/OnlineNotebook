const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
const db = require('./models');

// Sync database with automatic schema updates
const syncOptions = {
  alter: true,           // Modify existing tables to match model definitions
  force: false,          // Don't drop tables (safer for production)
  logging: console.log,  // Show SQL queries for debugging
  benchmark: true        // Show execution time
};

// Environment-specific sync options
if (process.env.NODE_ENV === 'development') {
  syncOptions.logging = console.log;
  console.log('🔧 Development mode: Detailed logging enabled');
} else if (process.env.NODE_ENV === 'production') {
  syncOptions.logging = false;
  console.log('🚀 Production mode: Logging disabled');
}

db.sequelize.sync(syncOptions).then(() => {
  console.log('✅ Database synced successfully');
  console.log('📊 Model changes applied automatically');
  console.log('🔗 All associations established');
}).catch(err => {
  console.error('❌ Error syncing database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/subjects', require('./routes/subjects'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

