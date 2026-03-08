const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// load env
dotenv.config();

const app = express();

// middleware - configure CORS to allow GitHub Pages frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://sarveshstd.github.io'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve client public assets (for development)
app.use('/assets', express.static(path.join(__dirname, '..', 'client', 'public', 'assets')));

// connect to mongodb
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photography_event';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/media', require('./routes/media'));
app.use('/api/vote', require('./routes/vote'));
app.use('/api/student', require('./routes/student'));

// serve client build ONLY in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
