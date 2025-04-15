const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Get all operational needs
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching all operational needs`);
    
    const session = getSession();
    try {
        const result = await session.run('MATCH (n:OperationalNeed) RETURN n');
        const operationalNeeds = result.records.map(record => {
            const opNeed = record.get('n').properties;
            return {
                id: record.get('n').identity.toString(),
                name: opNeed.name,
                description: opNeed.description,
                last_updated_at: opNeed.last_updated_at
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${operationalNeeds.length} operational needs`);
        res.json(operationalNeeds);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational needs - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching all operational needs - completed`);
    }
});

// Get a specific operational need by ID
router.get('/:needId', async (req, res) => {
    const { needId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching operational need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (n:OperationalNeed) WHERE ID(n) = $needId RETURN n',
            { needId: parseInt(needId) }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Operational need ${needId} not found`);
            return res.status(404).json({ error: 'Operational need not found' });
        }
        
        const need = result.records[0].get('n').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved operational need ${needId}`);
        res.json({
            id: needId,
            ...need
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational need - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching operational need ${needId} - completed`);
    }
});

// Create a new operational need
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    const last_updated_at = new Date().toISOString();
    console.log(`[${new Date().toISOString()}] OPERATION: creating operational need "${name}"`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'CREATE (n:OperationalNeed {name: $name, description: $description, last_updated_at: $last_updated_at}) RETURN n',
            { name, description, last_updated_at }
        );
        const createdNeed = result.records[0].get('n').properties;
        const needId = result.records[0].get('n').identity.toString();
        
        console.log(`[${new Date().toISOString()}] RESULT: Operational need created with ID ${needId}`);
        res.status(201).json({
            id: needId,
            ...createdNeed
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create operational need - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating operational need "${name}" - completed`);
    }
});

// Update an operational need
router.put('/:needId', async (req, res) => {
    const { needId } = req.params;
    const { name, description } = req.body;
    const last_updated_at = new Date().toISOString();
    console.log(`[${new Date().toISOString()}] OPERATION: updating operational need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (n:OperationalNeed) WHERE ID(n) = $needId ' +
            'SET n.name = $name, n.description = $description, n.last_updated_at = $last_updated_at ' +
            'RETURN n',
            { needId: parseInt(needId), name, description, last_updated_at }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Operational need ${needId} not found for update`);
            return res.status(404).json({ error: 'Operational need not found' });
        }
        
        const updatedNeed = result.records[0].get('n').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Updated operational need ${needId}`);
        res.json({
            id: needId,
            ...updatedNeed
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to update operational need - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: updating operational need ${needId} - completed`);
    }
});

// Get requirements implementing a specific need
router.get('/:needId/implementing-requirements', async (req, res) => {
    const { needId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching requirements implementing need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement)-[:IMPLEMENTS]->(need:OperationalNeed) ' +
            'WHERE ID(need) = $needId ' +
            'RETURN req',
            { needId: parseInt(needId) }
        );
        const requirements = result.records.map(record => {
            const req = record.get('req').properties;
            return {
                id: record.get('req').identity.toString(),
                name: req.name,
                description: req.description,
                last_updated_at: req.last_updated_at
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${requirements.length} requirements implementing need ${needId}`);
        res.json(requirements);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch implementing requirements - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching requirements implementing need ${needId} - completed`);
    }
});

module.exports = router;