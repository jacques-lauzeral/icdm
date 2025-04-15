const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Get all services
router.get('/', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching all services`);
    
    const session = getSession();
    try {
        const result = await session.run('MATCH (s:Service) RETURN s');
        const services = result.records.map(record => {
            const service = record.get('s').properties;
            return {
                id: record.get('s').identity.toString(),
                name: service.name,
                description: service.description
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${services.length} services`);
        res.json(services);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch services - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching all services - completed`);
    }
});

// Get a specific service
router.get('/:serviceId', async (req, res) => {
    const { serviceId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching service ${serviceId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (s:Service) WHERE ID(s) = $serviceId RETURN s',
            { serviceId: parseInt(serviceId) }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Service ${serviceId} not found`);
            return res.status(404).json({ error: 'Service not found' });
        }
        
        const service = result.records[0].get('s').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved service ${serviceId}`);
        res.json({
            id: serviceId,
            ...service
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch service - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching service ${serviceId} - completed`);
    }
});

// Create a new service
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating service "${name}"`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'CREATE (s:Service {name: $name, description: $description}) RETURN s',
            { name, description }
        );
        const createdService = result.records[0].get('s').properties;
        const serviceId = result.records[0].get('s').identity.toString();
        
        console.log(`[${new Date().toISOString()}] RESULT: Service created with ID ${serviceId}`);
        res.status(201).json({
            id: serviceId,
            ...createdService
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create service - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating service "${name}" - completed`);
    }
});

// Update a service
router.put('/:serviceId', async (req, res) => {
    const { serviceId } = req.params;
    const { name, description } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: updating service ${serviceId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (s:Service) WHERE ID(s) = $serviceId ' +
            'SET s.name = $name, s.description = $description ' +
            'RETURN s',
            { 
                serviceId: parseInt(serviceId),
                name, 
                description 
            }
        );
        
        if (result.records.length === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Service ${serviceId} not found for update`);
            return res.status(404).json({ error: 'Service not found' });
        }
        
        const updatedService = result.records[0].get('s').properties;
        
        console.log(`[${new Date().toISOString()}] RESULT: Updated service ${serviceId}`);
        res.json({
            id: serviceId,
            ...updatedService
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to update service - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: updating service ${serviceId} - completed`);
    }
});

// Delete a service
router.delete('/:serviceId', async (req, res) => {
    const { serviceId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: deleting service ${serviceId}`);
    
    const session = getSession();
    try {
        // First check if the service is referenced by any other nodes
        const checkResult = await session.run(
            'MATCH (s:Service)<-[r]-() WHERE ID(s) = $serviceId RETURN count(r) as relationCount',
            { serviceId: parseInt(serviceId) }
        );
        
        const relationCount = checkResult.records[0].get('relationCount').toNumber();
        
        if (relationCount > 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Cannot delete service ${serviceId} - has ${relationCount} existing relationships`);
            return res.status(400).json({ 
                error: 'Cannot delete service with existing relationships',
                relationCount 
            });
        }
        
        // If no relationships, proceed with deletion
        const result = await session.run(
            'MATCH (s:Service) WHERE ID(s) = $serviceId DELETE s RETURN count(s) as deleted',
            { serviceId: parseInt(serviceId) }
        );
        
        const deletedCount = result.records[0].get('deleted').toNumber();
        
        if (deletedCount === 0) {
            console.log(`[${new Date().toISOString()}] RESULT: Service ${serviceId} not found for deletion`);
            return res.status(404).json({ error: 'Service not found' });
        }
        
        console.log(`[${new Date().toISOString()}] RESULT: Deleted service ${serviceId}`);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to delete service - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: deleting service ${serviceId} - completed`);
    }
});

// Create a hierarchical relationship between services
router.post('/hierarchy', async (req, res) => {
    const { parentId, childId } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating service hierarchy from parent ${parentId} to child ${childId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (parent:Service) WHERE ID(parent) = $parentId ' +
            'MATCH (child:Service) WHERE ID(child) = $childId ' +
            'CREATE (parent)-[r:CONTAINS]->(child) RETURN r',
            { parentId: parseInt(parentId), childId: parseInt(childId) }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Service hierarchy created successfully`);
        res.status(201).json({ message: 'Service hierarchy created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create service hierarchy - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating service hierarchy - completed`);
    }
});

// Get service hierarchy
router.get('/hierarchy/all', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching service hierarchy`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (parent:Service)-[:CONTAINS]->(child:Service) ' +
            'RETURN parent.name as parentName, ID(parent) as parentId, ' +
            'child.name as childName, ID(child) as childId'
        );
        const relations = result.records.map(record => ({
            parentName: record.get('parentName'),
            parentId: record.get('parentId').toString(),
            childName: record.get('childName'),
            childId: record.get('childId').toString()
        }));
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${relations.length} service hierarchy relationships`);
        res.json(relations);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch service hierarchy - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching service hierarchy - completed`);
    }
});

module.exports = router;