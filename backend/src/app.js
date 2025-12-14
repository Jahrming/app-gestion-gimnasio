const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Gym App API is running',
        timestamp: new Date()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
});

module.exports = app;
