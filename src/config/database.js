const neo4j = require('neo4j-driver');

// Configuration
const NEO4J_URI = 'bolt://neo4j:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'geronimo'; // Replace with your password
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_INTERVAL_MS = 5000; // 5 seconds

// Create driver instance
const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// Initialize connection with retry logic
async function initializeConnection(attempt = 1) {
    const session = driver.session();
    try {
        console.log(`[${new Date().toISOString()}] DATABASE: Attempting to connect to Neo4j (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})...`);
        await session.run('RETURN 1');
        console.log(`[${new Date().toISOString()}] DATABASE: Successfully connected to Neo4j`);
        return true;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] DATABASE ERROR: Failed to connect to Neo4j - ${error.message}`);
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.log(`[${new Date().toISOString()}] DATABASE: Retrying in ${RETRY_INTERVAL_MS/1000} seconds...`);
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(initializeConnection(attempt + 1));
                }, RETRY_INTERVAL_MS);
            });
        } else {
            console.error(`[${new Date().toISOString()}] DATABASE ERROR: Max retry attempts reached. Could not connect to Neo4j.`);
            return false;
        }
    } finally {
        await session.close();
    }
}

// Expose an event emitter for connection status
const EventEmitter = require('events');
const connectionEmitter = new EventEmitter();

// Initialize the connection
(async () => {
    const connected = await initializeConnection();
    connectionEmitter.emit('connection-status', connected);
})();

// Export the driver and utilities
module.exports = {
    driver,
    
    // Get a new session
    getSession: () => driver.session(),
    
    // Close all connections
    close: async () => {
        await driver.close();
        console.log(`[${new Date().toISOString()}] DATABASE: Neo4j connection closed`);
    },
    
    // Connection status emitter
    connectionEmitter,
    
    // Wait for connection to be established
    waitForConnection: async () => {
        return new Promise(resolve => {
            connectionEmitter.once('connection-status', (status) => {
                resolve(status);
            });
        });
    }
};