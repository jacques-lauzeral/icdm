const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Get all folders
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching all folders`);
    const session = getSession();
    try {
        const result = await session.run('MATCH (f:Folder) RETURN f');
        const folders = result.records.map(record => {
            const folder = record.get('f').properties;
            return {
                id: record.get('f').identity.toString(),
                name: folder.name,
                description: folder.description
            };
        });
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${folders.length} folders`);
        res.json(folders);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch folders - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching all folders - completed`);
    }
});

// Get a specific folder by ID
router.get('/:folderId', async (req, res) => {
    const { folderId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching folder ${folderId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (f:Folder) WHERE ID(f) = $folderId RETURN f',
            { folderId: parseInt(folderId) }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Folder ${folderId} not found`);
            return res.status(404).json({ error: 'Folder not found' });
        }
        
        const folder = result.records[0].get('f').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved folder ${folderId}`);
        res.json({
            id: folderId,
            ...folder
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching folder ${folderId} - completed`);
    }
});

// Create a new folder
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating folder "${name}"`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'CREATE (f:Folder {name: $name, description: $description}) RETURN f',
            { name, description }
        );
        const createdFolder = result.records[0].get('f').properties;
        const folderId = result.records[0].get('f').identity.toString();
        
        console.log(`[${new Date().toISOString()}] RESULT: Folder created with ID ${folderId}`);
        res.status(201).json({
            id: folderId,
            ...createdFolder
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating folder "${name}" - completed`);
    }
});

// Update a folder
router.put('/:folderId', async (req, res) => {
    const { folderId } = req.params;
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: updating folder ${folderId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (f:Folder) WHERE ID(f) = $folderId ' +
            'SET f.name = $name, f.description = $description ' +
            'RETURN f',
            { 
                folderId: parseInt(folderId),
                name, 
                description 
            }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Folder ${folderId} not found for update`);
            return res.status(404).json({ error: 'Folder not found' });
        }
        
        const updatedFolder = result.records[0].get('f').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Updated folder ${folderId}`);
        res.json({
            id: folderId,
            ...updatedFolder
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to update folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: updating folder ${folderId} - completed`);
    }
});

// Delete a folder
router.delete('/:folderId', async (req, res) => {
    const { folderId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: deleting folder ${folderId}`);
    
    const session = getSession();
    try {
        // First check if the folder is referenced by any other nodes
        const checkResult = await session.run(
            'MATCH (f:Folder)-[r]-() WHERE ID(f) = $folderId RETURN count(r) as relationCount',
            { folderId: parseInt(folderId) }
        );
        
        const relationCount = checkResult.records[0].get('relationCount').toNumber();
        
        if (relationCount > 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Cannot delete folder ${folderId} - has ${relationCount} existing relationships`);
            return res.status(400).json({ 
                error: 'Cannot delete folder with existing relationships',
                relationCount 
            });
        }
        
        // If no relationships, proceed with deletion
        const result = await session.run(
            'MATCH (f:Folder) WHERE ID(f) = $folderId DELETE f RETURN count(f) as deleted',
            { folderId: parseInt(folderId) }
        );
        
        const deletedCount = result.records[0].get('deleted').toNumber();
        
        if (deletedCount === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Folder ${folderId} not found for deletion`);
            return res.status(404).json({ error: 'Folder not found' });
        }
        
        console.log(`[${new Date().toISOString()}] RESULT: Deleted folder ${folderId}`);
        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to delete folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: deleting folder ${folderId} - completed`);
    }
});

// Create a "CONTAINS" relationship between folders
router.post('/relations', async (req, res) => {
    const { parentId, childId } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating folder-folder relation from ${parentId} to ${childId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (parent:Folder) WHERE ID(parent) = $parentId ' +
            'MATCH (child:Folder) WHERE ID(child) = $childId ' +
            'CREATE (parent)-[r:CONTAINS]->(child) RETURN r',
            { parentId: parseInt(parentId), childId: parseInt(childId) }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Folder-folder relation created successfully`);
        res.status(201).json({ message: 'Relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create folder-folder relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating folder-folder relation - completed`);
    }
});

// Get folder hierarchy
router.get('/hierarchy/all', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching folder hierarchy`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (parent:Folder)-[:CONTAINS]->(child:Folder) ' +
            'RETURN parent.name as parentName, ID(parent) as parentId, ' +
            'child.name as childName, ID(child) as childId'
        );
        const relations = result.records.map(record => ({
            parentName: record.get('parentName'),
            parentId: record.get('parentId').toString(),
            childName: record.get('childName'),
            childId: record.get('childId').toString()
        }));
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${relations.length} folder hierarchy relationships`);
        res.json(relations);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch folder hierarchy - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching folder hierarchy - completed`);
    }
});

// Route to create a relationship between a folder and an operational need
router.post('/:folderId/needs/:needId', async (req, res) => {
    const { folderId, needId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: creating folder-need relation from folder ${folderId} to need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (folder:Folder) WHERE ID(folder) = $folderId ' +
            'MATCH (need:OperationalNeed) WHERE ID(need) = $needId ' +
            'CREATE (folder)-[r:CONTAINS]->(need) RETURN r',
            { folderId: parseInt(folderId), needId: parseInt(needId) }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Folder-need relation created successfully`);
        res.status(201).json({ message: 'Relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create folder-need relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating folder-need relation - completed`);
    }
});

// Route to create a relationship between a folder and an operational requirement
router.post('/:folderId/requirements/:requirementId', async (req, res) => {
    const { folderId, requirementId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: creating folder-requirement relation from folder ${folderId} to requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (folder:Folder) WHERE ID(folder) = $folderId ' +
            'MATCH (req:OperationalRequirement) WHERE ID(req) = $requirementId ' +
            'CREATE (folder)-[r:CONTAINS]->(req) RETURN r',
            { folderId: parseInt(folderId), requirementId: parseInt(requirementId) }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Folder-requirement relation created successfully`);
        res.status(201).json({ message: 'Relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create folder-requirement relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating folder-requirement relation - completed`);
    }
});

// Route to get operational needs contained in a specific folder
router.get('/:folderId/operational-needs', async (req, res) => {
    const { folderId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching operational needs in folder ${folderId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (folder:Folder)-[:CONTAINS]->(need:OperationalNeed) ' +
            'WHERE ID(folder) = $folderId ' +
            'RETURN need',
            { folderId: parseInt(folderId) }
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
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${needs.length} operational needs in folder ${folderId}`);
        res.json(needs);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational needs in folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching operational needs in folder ${folderId} - completed`);
    }
});

// Route to get operational requirements contained in a specific folder
router.get('/:folderId/operational-requirements', async (req, res) => {
    const { folderId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching operational requirements in folder ${folderId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (folder:Folder)-[:CONTAINS]->(req:OperationalRequirement) ' +
            'WHERE ID(folder) = $folderId ' +
            'RETURN req',
            { folderId: parseInt(folderId) }
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
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${requirements.length} operational requirements in folder ${folderId}`);
        res.json(requirements);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch operational requirements in folder - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching operational requirements in folder ${folderId} - completed`);
    }
});

module.exports = router;