require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

initDatabase()
  .then(() => console.log('✅ Database connection established'))
  .catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  });

app.get('/api/verify', (req, res) => {
  res.json({
    app: 'mygarage',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});