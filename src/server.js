const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Import middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error');

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);

// Import routes
app.use('/api/folders', require('./routes/folders'));
app.use('/api/operational-needs', require('./routes/needs'));
app.use('/api/operational-requirements', require('./routes/requirements'));
app.use('/api/stakeholder-categories', require('./routes/stakeholders'));
app.use('/api/services', require('./routes/services'));

// Special routes that span multiple resources
app.use('/api', require('./routes/impacts'));

// Error handling
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] SERVER: iCDM Folder Manager app listening at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log(`[${new Date().toISOString()}] SERVER: Shutting down...`);
    // Close database connections
    require('./config/database').close();
    console.log(`[${new Date().toISOString()}] DATABASE: Neo4j connection closed`);
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log(`[${new Date().toISOString()}] SERVER: Received SIGINT, shutting down...`);
    // Close database connections
    require('./config/database').close();
    console.log(`[${new Date().toISOString()}] DATABASE: Neo4j connection closed`);
    process.exit(0);
});