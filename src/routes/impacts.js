const express = require('express');
const router = express.Router();
const { getSession } = require('../config/database');

// Route to create an impact relationship between operational need and stakeholder category
router.post('/need-stakeholder-impact', async (req, res) => {
    const { needId, stakeholderCategoryId, impactType } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating impact relation from need ${needId} to stakeholder category ${stakeholderCategoryId}`);
    
    // Validate impact type
    const validImpactTypes = ['INFORMED', 'CONSULTED', 'RESPONSIBLE'];
    if (!validImpactTypes.includes(impactType)) {
        console.error(`[${new Date().toISOString()}] ERROR: Invalid impact type: ${impactType}`);
        return res.status(400).json({ error: `Invalid impact type. Must be one of: ${validImpactTypes.join(', ')}` });
    }
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (need:OperationalNeed) WHERE ID(need) = $needId ' +
            'MATCH (sc:StakeholderCategory) WHERE ID(sc) = $stakeholderCategoryId ' +
            'CREATE (need)-[r:IMPACTS_STAKEHOLDER {impact_type: $impactType}]->(sc) RETURN r',
            { 
                needId: parseInt(needId), 
                stakeholderCategoryId: parseInt(stakeholderCategoryId),
                impactType
            }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Need to stakeholder impact relation created successfully`);
        res.status(201).json({ 
            message: 'Need to stakeholder impact relation created successfully',
            impactType
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create need-stakeholder impact relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating need-stakeholder impact relation - completed`);
    }
});

// Route to create an impact relationship between operational requirement and stakeholder category
router.post('/requirement-stakeholder-impact', async (req, res) => {
    const { requirementId, stakeholderCategoryId, impactType } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating impact relation from requirement ${requirementId} to stakeholder category ${stakeholderCategoryId}`);
    
    // Validate impact type
    const validImpactTypes = ['INFORMED', 'CONSULTED', 'RESPONSIBLE'];
    if (!validImpactTypes.includes(impactType)) {
        console.error(`[${new Date().toISOString()}] ERROR: Invalid impact type: ${impactType}`);
        return res.status(400).json({ error: `Invalid impact type. Must be one of: ${validImpactTypes.join(', ')}` });
    }
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement) WHERE ID(req) = $requirementId ' +
            'MATCH (sc:StakeholderCategory) WHERE ID(sc) = $stakeholderCategoryId ' +
            'CREATE (req)-[r:IMPACTS_STAKEHOLDER {impact_type: $impactType}]->(sc) RETURN r',
            { 
                requirementId: parseInt(requirementId), 
                stakeholderCategoryId: parseInt(stakeholderCategoryId),
                impactType
            }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Requirement to stakeholder impact relation created successfully`);
        res.status(201).json({ 
            message: 'Requirement to stakeholder impact relation created successfully',
            impactType
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create requirement-stakeholder impact relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating requirement-stakeholder impact relation - completed`);
    }
});

// Route to create an impact relationship between operational need and service
router.post('/need-service-impact', async (req, res) => {
    const { needId, serviceId } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating impact relation from need ${needId} to service ${serviceId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (need:OperationalNeed) WHERE ID(need) = $needId ' +
            'MATCH (s:Service) WHERE ID(s) = $serviceId ' +
            'CREATE (need)-[r:IMPACTS_SERVICE]->(s) RETURN r',
            { 
                needId: parseInt(needId), 
                serviceId: parseInt(serviceId)
            }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Need to service impact relation created successfully`);
        res.status(201).json({ message: 'Need to service impact relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create need-service impact relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating need-service impact relation - completed`);
    }
});

// Route to create an impact relationship between operational requirement and service
router.post('/requirement-service-impact', async (req, res) => {
    const { requirementId, serviceId } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating impact relation from requirement ${requirementId} to service ${serviceId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement) WHERE ID(req) = $requirementId ' +
            'MATCH (s:Service) WHERE ID(s) = $serviceId ' +
            'CREATE (req)-[r:IMPACTS_SERVICE]->(s) RETURN r',
            { 
                requirementId: parseInt(requirementId), 
                serviceId: parseInt(serviceId)
            }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Requirement to service impact relation created successfully`);
        res.status(201).json({ message: 'Requirement to service impact relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create requirement-service impact relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating requirement-service impact relation - completed`);
    }
});

// Route to create an "IMPLEMENTS" relationship between requirement and need
router.post('/requirement-implements-need', async (req, res) => {
    const { requirementId, needId } = req.body;
    console.log(`[${new Date().toISOString()}] OPERATION: creating implements relation from requirement ${requirementId} to need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement) WHERE ID(req) = $requirementId ' +
            'MATCH (need:OperationalNeed) WHERE ID(need) = $needId ' +
            'CREATE (req)-[r:IMPLEMENTS]->(need) RETURN r',
            { requirementId: parseInt(requirementId), needId: parseInt(needId) }
        );
        
        console.log(`[${new Date().toISOString()}] RESULT: Implementation relation created successfully`);
        res.status(201).json({ message: 'Implementation relation created successfully' });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to create implements relation - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: creating implements relation - completed`);
    }
});

// Route to get stakeholder categories impacted by a specific need
router.get('/needs/:needId/impacted-stakeholders', async (req, res) => {
    const { needId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholders impacted by need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (need:OperationalNeed)-[r:IMPACTS_STAKEHOLDER]->(sc:StakeholderCategory) ' +
            'WHERE ID(need) = $needId ' +
            'RETURN sc, r.impact_type as impactType',
            { needId: parseInt(needId) }
        );
        const stakeholders = result.records.map(record => {
            const sc = record.get('sc').properties;
            return {
                id: record.get('sc').identity.toString(),
                name: sc.name,
                description: sc.description,
                impactType: record.get('impactType')
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${stakeholders.length} stakeholders impacted by need ${needId}`);
        res.json(stakeholders);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch impacted stakeholders - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholders impacted by need ${needId} - completed`);
    }
});

// Route to get stakeholder categories impacted by a specific requirement
router.get('/requirements/:requirementId/impacted-stakeholders', async (req, res) => {
    const { requirementId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholders impacted by requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement)-[r:IMPACTS_STAKEHOLDER]->(sc:StakeholderCategory) ' +
            'WHERE ID(req) = $requirementId ' +
            'RETURN sc, r.impact_type as impactType',
            { requirementId: parseInt(requirementId) }
        );
        const stakeholders = result.records.map(record => {
            const sc = record.get('sc').properties;
            return {
                id: record.get('sc').identity.toString(),
                name: sc.name,
                description: sc.description,
                impactType: record.get('impactType')
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${stakeholders.length} stakeholders impacted by requirement ${requirementId}`);
        res.json(stakeholders);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch impacted stakeholders - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching stakeholders impacted by requirement ${requirementId} - completed`);
    }
});

// Route to get services impacted by a specific need
router.get('/needs/:needId/impacted-services', async (req, res) => {
    const { needId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching services impacted by need ${needId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (need:OperationalNeed)-[:IMPACTS_SERVICE]->(s:Service) ' +
            'WHERE ID(need) = $needId ' +
            'RETURN s',
            { needId: parseInt(needId) }
        );
        const services = result.records.map(record => {
            const s = record.get('s').properties;
            return {
                id: record.get('s').identity.toString(),
                name: s.name,
                description: s.description
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${services.length} services impacted by need ${needId}`);
        res.json(services);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch impacted services - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching services impacted by need ${needId} - completed`);
    }
});

// Route to get services impacted by a specific requirement
router.get('/requirements/:requirementId/impacted-services', async (req, res) => {
    const { requirementId } = req.params;
    console.log(`[${new Date().toISOString()}] OPERATION: fetching services impacted by requirement ${requirementId}`);
    
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (req:OperationalRequirement)-[:IMPACTS_SERVICE]->(s:Service) ' +
            'WHERE ID(req) = $requirementId ' +
            'RETURN s',
            { requirementId: parseInt(requirementId) }
        );
        const services = result.records.map(record => {
            const s = record.get('s').properties;
            return {
                id: record.get('s').identity.toString(),
                name: s.name,
                description: s.description
            };
        });
        
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${services.length} services impacted by requirement ${requirementId}`);
        res.json(services);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch impacted services - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching services impacted by requirement ${requirementId} - completed`);
    }
});

// Route to get the extended hierarchy (folders, needs, requirements)
router.get('/extended-hierarchy', async (req, res) => {
    console.log(`[${new Date().toISOString()}] OPERATION: fetching extended hierarchy`);
    
    const session = getSession();
    try {
        // Get folder-folder relationships
        const folderResult = await session.run(
            'MATCH (parent:Folder)-[:CONTAINS]->(child:Folder) ' +
            'RETURN parent.name as parentName, ID(parent) as parentId, ' +
            'child.name as childName, ID(child) as childId, "folder" as childType'
        );
        
        // Get folder-operationalNeed relationships
        const needResult = await session.run(
            'MATCH (folder:Folder)-[:CONTAINS]->(need:OperationalNeed) ' +
            'RETURN folder.name as parentName, ID(folder) as parentId, ' +
            'need.name as childName, ID(need) as childId, "operationalNeed" as childType'
        );
        
        // Get folder-operationalRequirement relationships
        const reqResult = await session.run(
            'MATCH (folder:Folder)-[:CONTAINS]->(req:OperationalRequirement) ' +
            'RETURN folder.name as parentName, ID(folder) as parentId, ' +
            'req.name as childName, ID(req) as childId, "operationalRequirement" as childType'
        );
        
        // Get requirement-need implementation relationships
        const implResult = await session.run(
            'MATCH (req:OperationalRequirement)-[:IMPLEMENTS]->(need:OperationalNeed) ' +
            'RETURN req.name as reqName, ID(req) as reqId, ' +
            'need.name as needName, ID(need) as needId'
        );
        
        // Map folder containment results
        const folderRelations = folderResult.records.map(record => ({
            parentName: record.get('parentName'),
            parentId: record.get('parentId').toString(),
            childName: record.get('childName'),
            childId: record.get('childId').toString(),
            childType: record.get('childType'),
            relationType: "CONTAINS"
        }));
        
        const needRelations = needResult.records.map(record => ({
            parentName: record.get('parentName'),
            parentId: record.get('parentId').toString(),
            childName: record.get('childName'),
            childId: record.get('childId').toString(),
            childType: record.get('childType'),
            relationType: "CONTAINS"
        }));
        
        const reqRelations = reqResult.records.map(record => ({
            parentName: record.get('parentName'),
            parentId: record.get('parentId').toString(),
            childName: record.get('childName'),
            childId: record.get('childId').toString(),
            childType: record.get('childType'),
            relationType: "CONTAINS"
        }));
        
        // Map implementation relationships
        const implRelations = implResult.records.map(record => ({
            parentName: record.get('reqName'),
            parentId: record.get('reqId').toString(),
            childName: record.get('needName'),
            childId: record.get('needId').toString(),
            parentType: "operationalRequirement",
            childType: "operationalNeed",
            relationType: "IMPLEMENTS"
        }));
        
        const allRelations = [...folderRelations, ...needRelations, ...reqRelations, ...implRelations];
        console.log(`[${new Date().toISOString()}] RESULT: Retrieved ${allRelations.length} total relationships in extended hierarchy`);
        
        res.json(allRelations);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to fetch extended hierarchy - ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
        console.log(`[${new Date().toISOString()}] OPERATION: fetching extended hierarchy - completed`);
    }
});

module.exports = router;