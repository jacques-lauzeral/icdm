const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Get all operational requirements
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching all operational requirements`);
    
    const session = getSession();
    try {
        const result = await session.run('MATCH (r:OperationalRequirement) RETURN r');
        const operationalRequirements = result.records.map(record => {
            const opReq = record.get('r').properties;
            return {
                id: record.get('r').identity.toString(),
                name: opReq.name,
                description: opReq.description,
                last_updated_at: opReq.last_updated_at
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${operationalRequirements.length} operational requirements`);
        res.json(operationalRequirements);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational requirements - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching all operational requirements - completed`);
    }
});

// Get a specific operational requirement by ID
router.get('/:requirementId', async (req, res) => {
    const { requirementId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching operational requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (r:OperationalRequirement) WHERE ID(r) = $requirementId RETURN r',
            { requirementId: parseInt(requirementId) }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Operational requirement ${requirementId} not found`);
            return res.status(404).json({ error: 'Operational requirement not found' });
        }
        
        const requirement = result.records[0].get('r').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved operational requirement ${requirementId}`);
        res.json({
            id: requirementId,
            ...requirement
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational requirement - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching operational requirement ${requirementId} - completed`);
    }
});

// Create a new operational requirement
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    const last_updated_at = new Date().toISOString();
    console.log(`[${new Date().toISOString()}] OPERATION: creating operational requirement "${name}"`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'CREATE (r:OperationalRequirement {name: $name, description: $description, last_updated_at: $last_updated_at}) RETURN r',
            { name, description, last_updated_at }
        );
        const createdRequirement = result.records[0].get('r').properties;
        const requirementId = result.records[0].get('r').identity.toString();
        
        console.log(`[${new Date().toISOString()}] RESULT: Operational requirement created with ID ${requirementId}`);
        res.status(201).json({
            id: requirementId,
            ...createdRequirement
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create operational requirement - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating operational requirement "${name}" - completed`);
    }
});

// Update an operational requirement
router.put('/:requirementId', async (req, res) => {
    const { requirementId } = req.params;
    const { name, description } = req.body;
    const last_updated_at = new Date().toISOString();
    console.log(`[${new Date().toISOString()}] OPERATION: updating operational requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (r:OperationalRequirement) WHERE ID(r) = $requirementId ' +
            'SET r.name = $name, r.description = $description, r.last_updated_at = $last_updated_at ' +
            'RETURN r',
            { requirementId: parseInt(requirementId), name, description, last_updated_at }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Operational requirement ${requirementId} not found for update`);
            return res.status(404).json({ error: 'Operational requirement not found' });
        }
        
        const updatedRequirement = result.records[0].get('r').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Updated operational requirement ${requirementId}`);
        res.json({
            id: requirementId,
            ...updatedRequirement
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to update operational requirement - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: updating operational requirement ${requirementId} - completed`);
    }
});

// Get needs implemented by a specific requirement
router.get('/:requirementId/implemented-needs', async (req, res) => {
    const { requirementId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching needs implemented by requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement)-[:IMPLEMENTS]->(need:OperationalNeed) ' +
            'WHERE ID(req) = $requirementId ' +
            'RETURN need',
            { requirementId: parseInt(requirementId) }
        );
        const needs = result.records.map(record => {
            const need = record.get('need').properties;
            return {
                id: record.get('need').identity.toString(),
                name: need.name,
                description: need.description,
                last_updated_at: need.last_updated_at
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${needs.length} needs implemented by requirement ${requirementId}`);
        res.json(needs);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch implemented needs - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching needs implemented by requirement ${requirementId} - completed`);
    }
});

module.exports = router;