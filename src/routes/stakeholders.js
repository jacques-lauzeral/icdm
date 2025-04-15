const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Get all stakeholder categories
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching all stakeholder categories`);
    
    const session = getSession();
    try {
        const result = await session.run('MATCH (sc:StakeholderCategory) RETURN sc');
        const stakeholderCategories = result.records.map(record => {
            const category = record.get('sc').properties;
            return {
                id: record.get('sc').identity.toString(),
                name: category.name,
                description: category.description
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${stakeholderCategories.length} stakeholder categories`);
        res.json(stakeholderCategories);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch stakeholder categories - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching all stakeholder categories - completed`);
    }
});

// Get a specific stakeholder category
router.get('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholder category ${categoryId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (sc:StakeholderCategory) WHERE ID(sc) = $categoryId RETURN sc',
            { categoryId: parseInt(categoryId) }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Stakeholder category ${categoryId} not found`);
            return res.status(404).json({ error: 'Stakeholder category not found' });
        }
        
        const category = result.records[0].get('sc').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved stakeholder category ${categoryId}`);
        res.json({
            id: categoryId,
            ...category
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch stakeholder category - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholder category ${categoryId} - completed`);
    }
});

// Create a new stakeholder category
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating stakeholder category "${name}"`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'CREATE (sc:StakeholderCategory {name: $name, description: $description}) RETURN sc',
            { name, description }
        );
        const createdCategory = result.records[0].get('sc').properties;
        const categoryId = result.records[0].get('sc').identity.toString();
        
        console.log(`[${new Date().toISOString()}] RESULT: Stakeholder category created with ID ${categoryId}`);
        res.status(201).json({
            id: categoryId,
            ...createdCategory
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create stakeholder category - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating stakeholder category "${name}" - completed`);
    }
});

// Update a stakeholder category
router.put('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: updating stakeholder category ${categoryId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (sc:StakeholderCategory) WHERE ID(sc) = $categoryId ' +
            'SET sc.name = $name, sc.description = $description ' +
            'RETURN sc',
            { 
                categoryId: parseInt(categoryId),
                name, 
                description 
            }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Stakeholder category ${categoryId} not found for update`);
            return res.status(404).json({ error: 'Stakeholder category not found' });
        }
        
        const updatedCategory = result.records[0].get('sc').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Updated stakeholder category ${categoryId}`);
        res.json({
            id: categoryId,
            ...updatedCategory
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to update stakeholder category - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: updating stakeholder category ${categoryId} - completed`);
    }
});

// Delete a stakeholder category
router.delete('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: deleting stakeholder category ${categoryId}`);
    
    const session = getSession();
    try {
        // First check if the category is referenced by any other nodes
        const checkResult = await session.run(
            'MATCH (sc:StakeholderCategory)<-[r]-() WHERE ID(sc) = $categoryId RETURN count(r) as relationCount',
            { categoryId: parseInt(categoryId) }
        );
        
        const relationCount = checkResult.records[0].get('relationCount').toNumber();
        
        if (relationCount > 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Cannot delete stakeholder category ${categoryId} - has ${relationCount} existing relationships`);
            return res.status(400).json({ 
                error: 'Cannot delete stakeholder category with existing relationships',
                relationCount 
            });
        }
        
        // If no relationships, proceed with deletion
        const result = await session.run(
            'MATCH (sc:StakeholderCategory) WHERE ID(sc) = $categoryId DELETE sc RETURN count(sc) as deleted',
            { categoryId: parseInt(categoryId) }
        );
        
        const deletedCount = result.records[0].get('deleted').toNumber();
        
        if (deletedCount === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Stakeholder category ${categoryId} not found for deletion`);
            return res.status(404).json({ error: 'Stakeholder category not found' });
        }
        
        console.log(`[${new Date().toISOString()}] RESULT: Deleted stakeholder category ${categoryId}`);
        res.json({ message: 'Stakeholder category deleted successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to delete stakeholder category - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: deleting stakeholder category ${categoryId} - completed`);
    }
});

module.exports = router;