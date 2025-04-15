// Add this to your script.js file

// Tree view handling
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the tree view
    initializeTreeView();
    
    // Initialize splitter functionality
    initializeSplitter();
});

// Initialize the tree view with root nodes
async function initializeTreeView() {
    const treeView = document.getElementById('treeView');
    treeView.innerHTML = ''; // Clear loading indicator
    
    // Create root nodes
    const stakeholderCategoriesNode = createRootNode('Stakeholder Categories', 'stakeholder-categories', '👥');
    const servicesNode = createRootNode('Services', 'services', '🔧');
    const draftingGroupsNode = createRootNode('Drafting Groups', 'drafting-groups', '📁');
    
    // Append root nodes to tree view
    treeView.appendChild(stakeholderCategoriesNode);
    treeView.appendChild(servicesNode);
    treeView.appendChild(draftingGroupsNode);
    
    // Load data for each root node
    await Promise.all([
        loadStakeholderCategories(stakeholderCategoriesNode),
        loadServices(servicesNode),
        loadFolders(draftingGroupsNode)
    ]);
}

// Create a root node for the tree
function createRootNode(label, id, icon) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node tree-root-node';
    nodeDiv.setAttribute('data-id', id);
    nodeDiv.setAttribute('data-type', 'root');
    
    nodeDiv.innerHTML = `
        <div class="tree-node-content" onclick="toggleNode(this.parentNode)">
            <span class="tree-node-toggle">▶</span>
            <span class="icon">${icon}</span>
            <span class="label">${label}</span>
        </div>
        <div class="tree-children" style="display: none;"></div>
    `;
    
    return nodeDiv;
}

// Create a regular tree node
function createTreeNode(item, type, icon, hasChildren = false) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = `tree-node tree-node-${type}`;
    nodeDiv.setAttribute('data-id', item.id);
    nodeDiv.setAttribute('data-type', type);
    
    let toggleHtml = hasChildren ? '<span class="tree-node-toggle">▶</span>' : '<span class="tree-node-toggle" style="visibility:hidden">▶</span>';
    
    nodeDiv.innerHTML = `
        <div class="tree-node-content" onclick="selectNode(this.parentNode)">
            ${toggleHtml}
            <span class="icon">${icon}</span>
            <span class="label">${escapeHtml(item.name)}</span>
        </div>
        ${hasChildren ? '<div class="tree-children" style="display: none;"></div>' : ''}
    `;
    
    if (hasChildren) {
        nodeDiv.querySelector('.tree-node-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNode(nodeDiv);
        });
    }
    
    return nodeDiv;
}

// Toggle expansion of a tree node
function toggleNode(node) {
    const toggle = node.querySelector('.tree-node-toggle');
    const children = node.querySelector('.tree-children');
    
    if (children) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            toggle.textContent = '▼';
            
            // Load children if they haven't been loaded yet
            const nodeType = node.getAttribute('data-type');
            const nodeId = node.getAttribute('data-id');
            
            if (children.children.length === 0) {
                loadNodeChildren(node, nodeType, nodeId);
            }
        } else {
            children.style.display = 'none';
            toggle.textContent = '▶';
        }
    }
}

// Select a node in the tree view
function selectNode(node) {
    // Remove active class from all nodes
    document.querySelectorAll('.tree-node-content.active').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the selected node
    const content = node.querySelector('.tree-node-content');
    content.classList.add('active');
    
    // Show the context panel with details for the selected node
    showContextPanel(node);
}

// Load stakeholder categories
async function loadStakeholderCategories(parentNode) {
    try {
        const response = await fetch('/api/stakeholder-categories');
        const categories = await response.json();
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        
        categories.forEach(category => {
            const categoryNode = createTreeNode(category, 'stakeholder', '👤');
            childrenContainer.appendChild(categoryNode);
        });
        
        // Show children if any were added
        if (categories.length > 0) {
            toggleNode(parentNode);
        }
    } catch (error) {
        console.error('Error loading stakeholder categories:', error);
    }
}

// Load services
async function loadServices(parentNode) {
    try {
        // First, get all services
        const servicesResponse = await fetch('/api/services');
        const allServices = await servicesResponse.json();
        
        // Then, get service hierarchy to identify root services
        const hierarchyResponse = await fetch('/api/service-hierarchy');
        const serviceHierarchy = await hierarchyResponse.json();
        
        // Find parent-child relationships
        const childServiceIds = serviceHierarchy.map(rel => rel.childId);
        
        // Root services are those that aren't children of other services
        const rootServices = allServices.filter(service => !childServiceIds.includes(service.id));
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        
        // Add each root service to the tree
        rootServices.forEach(service => {
            const hasChildren = serviceHierarchy.some(rel => rel.parentId === service.id);
            const serviceNode = createTreeNode(service, 'service', '🔧', hasChildren);
            childrenContainer.appendChild(serviceNode);
        });
        
        // Show children if any were added
        if (rootServices.length > 0) {
            toggleNode(parentNode);
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load folders
async function loadFolders(parentNode) {
    try {
        // First, get all folders
        const foldersResponse = await fetch('/api/folders');
        const allFolders = await foldersResponse.json();
        
        // Then, get folder hierarchy to identify root folders
        const hierarchyResponse = await fetch('/api/hierarchy');
        const folderHierarchy = await hierarchyResponse.json();
        
        // Find parent-child relationships
        const childFolderIds = folderHierarchy.map(rel => rel.childId);
        
        // Root folders are those that aren't children of other folders
        const rootFolders = allFolders.filter(folder => !childFolderIds.includes(folder.id));
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        
        // Add each root folder to the tree
        rootFolders.forEach(folder => {
            const hasChildren = folderHierarchy.some(rel => rel.parentId === folder.id);
            const folderNode = createTreeNode(folder, 'folder', '📁', hasChildren);
            childrenContainer.appendChild(folderNode);
        });
        
        // Show children if any were added
        if (rootFolders.length > 0) {
            toggleNode(parentNode);
        }
    } catch (error) {
        console.error('Error loading folders:', error);
    }
}

// Load children for a specific node
async function loadNodeChildren(node, nodeType, nodeId) {
    const childrenContainer = node.querySelector('.tree-children');
    
    try {
        switch (nodeType) {
            case 'folder':
                // Load subfolders
                const folderHierarchyResponse = await fetch('/api/hierarchy');
                const folderHierarchy = await folderHierarchyResponse.json();
                
                // Find child folders of the current folder
                const childFolderRelations = folderHierarchy.filter(rel => rel.parentId === nodeId);
                
                // Get details for each child folder
                const foldersResponse = await fetch('/api/folders');
                const allFolders = await foldersResponse.json();
                
                // Add child folders to the tree
                childFolderRelations.forEach(relation => {
                    const childFolder = allFolders.find(f => f.id === relation.childId);
                    if (childFolder) {
                        const hasChildren = folderHierarchy.some(rel => rel.parentId === childFolder.id);
                        const folderNode = createTreeNode(childFolder, 'folder', '📁', hasChildren);
                        childrenContainer.appendChild(folderNode);
                    }
                });
                
                // Load operational needs in this folder
                const needsResponse = await fetch(`/api/folders/${nodeId}/operational-needs`);
                const operationalNeeds = await needsResponse.json();
                
                // Add operational needs to the tree
                operationalNeeds.forEach(need => {
                    const needNode = createTreeNode(need, 'need', '📋', true);
                    childrenContainer.appendChild(needNode);
                });
                break;
                
            case 'service':
                // Load child services
                const serviceHierarchyResponse = await fetch('/api/service-hierarchy');
                const serviceHierarchy = await serviceHierarchyResponse.json();
                
                // Find child services of the current service
                const childServiceRelations = serviceHierarchy.filter(rel => rel.parentId === nodeId);
                
                // Get details for each child service
                const servicesResponse = await fetch('/api/services');
                const allServices = await servicesResponse.json();
                
                // Add child services to the tree
                childServiceRelations.forEach(relation => {
                    const childService = allServices.find(s => s.id === relation.childId);
                    if (childService) {
                        const hasChildren = serviceHierarchy.some(rel => rel.parentId === childService.id);
                        const serviceNode = createTreeNode(childService, 'service', '🔧', hasChildren);
                        childrenContainer.appendChild(serviceNode);
                    }
                });
                break;
                
            case 'need':
                // Load implementing requirements
                const requirementsResponse = await fetch(`/api/needs/${nodeId}/implementing-requirements`);
                const implementingRequirements = await requirementsResponse.json();
                
                // Add requirements to the tree
                implementingRequirements.forEach(requirement => {
                    const requirementNode = createTreeNode(requirement, 'requirement', '📝', false);
                    childrenContainer.appendChild(requirementNode);
                });
                break;
                
            default:
                break;
        }
    } catch (error) {
        console.error(`Error loading children for node type ${nodeType}:`, error);
        childrenContainer.innerHTML = '<div class="tree-node-error">Error loading data</div>';
    }
}

// Show the context panel with details for the selected node
async function showContextPanel(node) {
    const nodeType = node.getAttribute('data-type');
    const nodeId = node.getAttribute('data-id');
    const nodeName = node.querySelector('.label').textContent;
    
    const contextPanel = document.getElementById('contextPanel');
    const emptyContext = document.getElementById('emptyContext');
    const contextTitle = document.getElementById('contextTitle');
    const contextIcon = document.getElementById('contextIcon');
    const contextContent = document.getElementById('contextContent');
    
    // Show the context panel, hide the empty state
    contextPanel.style.display = 'block';
    emptyContext.style.display = 'none';
    
    // Set the title and icon
    contextTitle.textContent = nodeName;
    
    // Set icon based on node type
    switch (nodeType) {
        case 'stakeholder':
            contextIcon.textContent = '👤';
            break;
        case 'service':
            contextIcon.textContent = '🔧';
            break;
        case 'folder':
            contextIcon.textContent = '📁';
            break;
        case 'need':
            contextIcon.textContent = '📋';
            break;
        case 'requirement':
            contextIcon.textContent = '📝';
            break;
        default:
            contextIcon.textContent = '📄';
    }
    
    // Load and display content based on node type
    contextContent.innerHTML = '<div class="loading">Loading details...</div>';
    
    try {
        await loadContextContent(nodeType, nodeId, contextContent);
    } catch (error) {
        console.error(`Error loading context content for ${nodeType}:`, error);
        contextContent.innerHTML = '<div class="error">Error loading details. Please try again.</div>';
    }
}

// Load context content based on node type
async function loadContextContent(nodeType, nodeId, contextContainer) {
    let html = '';
    
    switch (nodeType) {
        case 'stakeholder':
            const stakeholderResponse = await fetch(`/api/stakeholder-categories/${nodeId}`);
            const stakeholder = await stakeholderResponse.json();
            
            html = `
                <div class="detail-section">
                    <h3>Stakeholder Category Details</h3>
                    <div class="detail-item">
                        <strong>Name:</strong> ${escapeHtml(stakeholder.name)}
                    </div>
                    <div class="detail-item">
                        <strong>Description:</strong> ${escapeHtml(stakeholder.description)}
                    </div>
                </div>
            `;
            break;
            
        case 'service':
            const serviceResponse = await fetch(`/api/services/${nodeId}`);
            const service = await serviceResponse.json();
            
            html = `
                <div class="detail-section">
                    <h3>Service Details</h3>
                    <div class="detail-item">
                        <strong>Name:</strong> ${escapeHtml(service.name)}
                    </div>
                    <div class="detail-item">
                        <strong>Description:</strong> ${escapeHtml(service.description)}
                    </div>
                </div>
            `;
            break;
            
        case 'folder':
            const folderResponse = await fetch(`/api/folders/${nodeId}`);
            const folder = await folderResponse.json();
            
            html = `
                <div class="detail-section">
                    <h3>Folder Details</h3>
                    <div class="detail-item">
                        <strong>Name:</strong> ${escapeHtml(folder.name)}
                    </div>
                    <div class="detail-item">
                        <strong>Description:</strong> ${escapeHtml(folder.description)}
                    </div>
                </div>
                
                <div class="actions-section">
                    <button onclick="showCreateNeedForm('${nodeId}')">Add Operational Need</button>
                    <button onclick="showCreateRequirementForm('${nodeId}')">Add Operational Requirement</button>
                </div>
            `;
            break;
            
        case 'need':
            const needResponse = await fetch(`/api/operational-needs/${nodeId}`);
            const need = await needResponse.json();
            
            // Get impacted stakeholders
            const impactedStakeholdersResponse = await fetch(`/api/needs/${nodeId}/impacted-stakeholders`);
            const impactedStakeholders = await impactedStakeholdersResponse.json();
            
            // Get impacted services
            const impactedServicesResponse = await fetch(`/api/needs/${nodeId}/impacted-services`);
            const impactedServices = await impactedServicesResponse.json();
            
            // Create stakeholder impact list
            let stakeholderHtml = '';
            if (impactedStakeholders.length > 0) {
                stakeholderHtml = '<ul>';
                impactedStakeholders.forEach(stakeholder => {
                    stakeholderHtml += `<li><strong>${escapeHtml(stakeholder.name)}</strong> (${stakeholder.impactType})</li>`;
                });
                stakeholderHtml += '</ul>';
            } else {
                stakeholderHtml = '<p>No stakeholders impacted</p>';
            }
            
            // Create service impact list
            let serviceHtml = '';
            if (impactedServices.length > 0) {
                serviceHtml = '<ul>';
                impactedServices.forEach(service => {
                    serviceHtml += `<li><strong>${escapeHtml(service.name)}</strong></li>`;
                });
                serviceHtml += '</ul>';
            } else {
                serviceHtml = '<p>No services impacted</p>';
            }
            
            html = `
                <div class="detail-section">
                    <h3>Operational Need Details</h3>
                    <div class="detail-item">
                        <strong>Name:</strong> ${escapeHtml(need.name)}
                    </div>
                    <div class="detail-item">
                        <strong>Description:</strong> ${escapeHtml(need.description)}
                    </div>
                    <div class="detail-item">
                        <strong>Last Updated:</strong> ${new Date(need.last_updated_at).toLocaleString()}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Impacted Stakeholders</h3>
                    ${stakeholderHtml}
                </div>
                
                <div class="detail-section">
                    <h3>Impacted Services</h3>
                    ${serviceHtml}
                </div>
                
                <div class="actions-section">
                    <button onclick="showAddStakeholderImpactForm('need', '${nodeId}')">Add Stakeholder Impact</button>
                    <button onclick="showAddServiceImpactForm('need', '${nodeId}')">Add Service Impact</button>
                </div>
            `;
            break;
            
        case 'requirement':
            const requirementResponse = await fetch(`/api/operational-requirements/${nodeId}`);
            const requirement = await requirementResponse.json();
            
            // Get impacted stakeholders
            const reqImpactedStakeholdersResponse = await fetch(`/api/requirements/${nodeId}/impacted-stakeholders`);
            const reqImpactedStakeholders = await reqImpactedStakeholdersResponse.json();
            
            // Get impacted services
            const reqImpactedServicesResponse = await fetch(`/api/requirements/${nodeId}/impacted-services`);
            const reqImpactedServices = await reqImpactedServicesResponse.json();
            
            // Create stakeholder impact list
            let reqStakeholderHtml = '';
            if (reqImpactedStakeholders.length > 0) {
                reqStakeholderHtml = '<ul>';
                reqImpactedStakeholders.forEach(stakeholder => {
                    reqStakeholderHtml += `<li><strong>${escapeHtml(stakeholder.name)}</strong> (${stakeholder.impactType})</li>`;
                });
                reqStakeholderHtml += '</ul>';
            } else {
                reqStakeholderHtml = '<p>No stakeholders impacted</p>';
            }
            
            // Create service impact list
            let reqServiceHtml = '';
            if (reqImpactedServices.length > 0) {
                reqServiceHtml = '<ul>';
                reqImpactedServices.forEach(service => {
                    reqServiceHtml += `<li><strong>${escapeHtml(service.name)}</strong></li>`;
                });
                reqServiceHtml += '</ul>';
            } else {
                reqServiceHtml = '<p>No services impacted</p>';
            }
            
            html = `
                <div class="detail-section">
                    <h3>Operational Requirement Details</h3>
                    <div class="detail-item">
                        <strong>Name:</strong> ${escapeHtml(requirement.name)}
                    </div>
                    <div class="detail-item">
                        <strong>Description:</strong> ${escapeHtml(requirement.description)}
                    </div>
                    <div class="detail-item">
                        <strong>Last Updated:</strong> ${new Date(requirement.last_updated_at).toLocaleString()}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Impacted Stakeholders</h3>
                    ${reqStakeholderHtml}
                </div>
                
                <div class="detail-section">
                    <h3>Impacted Services</h3>
                    ${reqServiceHtml}
                </div>
                
                <div class="actions-section">
                    <button onclick="showAddStakeholderImpactForm('requirement', '${nodeId}')">Add Stakeholder Impact</button>
                    <button onclick="showAddServiceImpactForm('requirement', '${nodeId}')">Add Service Impact</button>
                </div>
            `;
            break;
            
        default:
            html = '<div class="detail-section"><p>Select an item to view details</p></div>';
    }
    
    contextContainer.innerHTML = html;
}

// Initialize the splitter for resizing panels
function initializeSplitter() {
    const splitter = document.getElementById('splitter');
    const leftPanel = document.getElementById('leftPanel');
    
    let isResizing = false;
    
    splitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const newWidth = e.clientX;
        leftPanel.style.width = newWidth + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add these functions to your script.js file

// Form handling functions
document.addEventListener('DOMContentLoaded', () => {
    // Set up form event listeners
    document.getElementById('createNeedForm').addEventListener('submit', createOperationalNeed);
    document.getElementById('createRequirementForm').addEventListener('submit', createOperationalRequirement);
    document.getElementById('stakeholderImpactForm').addEventListener('submit', addStakeholderImpact);
    document.getElementById('serviceImpactForm').addEventListener('submit', addServiceImpact);
});

// Modal handling functions
function openModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById(modalId).style.display = 'none';
}

// Show create operational need form
async function showCreateNeedForm(folderId) {
    // Set the folder ID
    document.getElementById('needFolderId').value = folderId;
    
    // Clear form fields
    document.getElementById('needName').value = '';
    document.getElementById('needDescription').value = '';
    
    // Open the modal
    openModal('createNeedModal');
}

// Show create operational requirement form
async function showCreateRequirementForm(folderId) {
    // Set the folder ID
    document.getElementById('requirementFolderId').value = folderId;
    
    // Clear form fields
    document.getElementById('requirementName').value = '';
    document.getElementById('requirementDescription').value = '';
    
    // Load operational needs for the dropdown
    try {
        const response = await fetch('/api/operational-needs');
        const needs = await response.json();
        
        const needSelect = document.getElementById('implementedNeedId');
        needSelect.innerHTML = '<option value="">None</option>';
        
        needs.forEach(need => {
            const option = document.createElement('option');
            option.value = need.id;
            option.textContent = need.name;
            needSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading operational needs:', error);
    }
    
    // Open the modal
    openModal('createRequirementModal');
}

// Show add stakeholder impact form
async function showAddStakeholderImpactForm(itemType, itemId) {
    // Set the item ID and type
    document.getElementById('impactItemId').value = itemId;
    document.getElementById('impactItemType').value = itemType;
    
    // Clear previous selection
    document.getElementById('impactType').value = '';
    
    // Load stakeholder categories for the dropdown
    try {
        const response = await fetch('/api/stakeholder-categories');
        const categories = await response.json();
        
        const categorySelect = document.getElementById('stakeholderCategoryId');
        categorySelect.innerHTML = '<option value="">Select a stakeholder category</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading stakeholder categories:', error);
    }
    
    // Open the modal
    openModal('stakeholderImpactModal');
}

// Show add service impact form
async function showAddServiceImpactForm(itemType, itemId) {
    // Set the item ID and type
    document.getElementById('serviceImpactItemId').value = itemId;
    document.getElementById('serviceImpactItemType').value = itemType;
    
    // Load services for the dropdown
    try {
        const response = await fetch('/api/services');
        const services = await response.json();
        
        const serviceSelect = document.getElementById('serviceId');
        serviceSelect.innerHTML = '<option value="">Select a service</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
    
    // Open the modal
    openModal('serviceImpactModal');
}

// Create operational need
async function createOperationalNeed(event) {
    event.preventDefault();
    
    const folderId = document.getElementById('needFolderId').value;
    const name = document.getElementById('needName').value;
    const description = document.getElementById('needDescription').value;
    
    try {
        // First create the need
        const needResponse = await fetch('/api/operational-needs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        
        if (!needResponse.ok) {
            throw new Error('Failed to create operational need');
        }
        
        const need = await needResponse.json();
        
        // Then create the relationship to the folder
        const relationResponse = await fetch('/api/folder-needs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folderId, needId: need.id })
        });
        
        if (!relationResponse.ok) {
            throw new Error('Failed to associate need with folder');
        }
        
        // Close the modal
        closeModal('createNeedModal');
        
        // Reload the tree view
        const folderNode = document.querySelector(`.tree-node[data-type="folder"][data-id="${folderId}"]`);
        if (folderNode) {
            // Refresh the folder node
            const childrenContainer = folderNode.querySelector('.tree-children');
            if (childrenContainer) {
                childrenContainer.innerHTML = '';
                loadNodeChildren(folderNode, 'folder', folderId);
            }
        }
        
        // Show success message
        alert('Operational need created successfully');
        
    } catch (error) {
        console.error('Error creating operational need:', error);
        alert('Error creating operational need: ' + error.message);
    }
}

// Create operational requirement
async function createOperationalRequirement(event) {
    event.preventDefault();
    
    const folderId = document.getElementById('requirementFolderId').value;
    const name = document.getElementById('requirementName').value;
    const description = document.getElementById('requirementDescription').value;
    const implementedNeedId = document.getElementById('implementedNeedId').value;
    
    try {
        // First create the requirement
        const requirementResponse = await fetch('/api/operational-requirements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        
        if (!requirementResponse.ok) {
            throw new Error('Failed to create operational requirement');
        }
        
        const requirement = await requirementResponse.json();
        
        // Then create the relationship to the folder
        const folderRelationResponse = await fetch('/api/folder-requirements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folderId, requirementId: requirement.id })
        });
        
        if (!folderRelationResponse.ok) {
            throw new Error('Failed to associate requirement with folder');
        }
        
        // If an implemented need was selected, create that relationship too
        if (implementedNeedId) {
            const implementsResponse = await fetch('/api/requirement-implements-need', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requirementId: requirement.id, needId: implementedNeedId })
            });
            
            if (!implementsResponse.ok) {
                throw new Error('Failed to create implements relationship');
            }
        }
        
        // Close the modal
        closeModal('createRequirementModal');
        
        // Reload the tree view
        const folderNode = document.querySelector(`.tree-node[data-type="folder"][data-id="${folderId}"]`);
        if (folderNode) {
            // Refresh the folder node
            const childrenContainer = folderNode.querySelector('.tree-children');
            if (childrenContainer) {
                childrenContainer.innerHTML = '';
                loadNodeChildren(folderNode, 'folder', folderId);
            }
        }
        
        // Show success message
        alert('Operational requirement created successfully');
        
    } catch (error) {
        console.error('Error creating operational requirement:', error);
        alert('Error creating operational requirement: ' + error.message);
    }
}

// Add stakeholder impact
async function addStakeholderImpact(event) {
    event.preventDefault();
    
    const itemId = document.getElementById('impactItemId').value;
    const itemType = document.getElementById('impactItemType').value;
    const stakeholderCategoryId = document.getElementById('stakeholderCategoryId').value;
    const impactType = document.getElementById('impactType').value;
    
    let endpoint;
    let requestBody;
    
    if (itemType === 'need') {
        endpoint = '/api/need-stakeholder-impact';
        requestBody = {
            needId: itemId,
            stakeholderCategoryId,
            impactType
        };
    } else if (itemType === 'requirement') {
        endpoint = '/api/requirement-stakeholder-impact';
        requestBody = {
            requirementId: itemId,
            stakeholderCategoryId,
            impactType
        };
    } else {
        alert('Invalid item type');
        return;
    }
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add stakeholder impact');
        }
        
        // Close the modal
        closeModal('stakeholderImpactModal');
        
        // Reload the context panel
        const selectedNode = document.querySelector(`.tree-node[data-type="${itemType}"][data-id="${itemId}"]`);
        if (selectedNode) {
            showContextPanel(selectedNode);
        }
        
        // Show success message
        alert('Stakeholder impact added successfully');
        
    } catch (error) {
        console.error('Error adding stakeholder impact:', error);
        alert('Error adding stakeholder impact: ' + error.message);
    }
}

// Add service impact
async function addServiceImpact(event) {
    event.preventDefault();
    
    const itemId = document.getElementById('serviceImpactItemId').value;
    const itemType = document.getElementById('serviceImpactItemType').value;
    const serviceId = document.getElementById('serviceId').value;
    
    let endpoint;
    let requestBody;
    
    if (itemType === 'need') {
        endpoint = '/api/need-service-impact';
        requestBody = {
            needId: itemId,
            serviceId
        };
    } else if (itemType === 'requirement') {
        endpoint = '/api/requirement-service-impact';
        requestBody = {
            requirementId: itemId,
            serviceId
        };
    } else {
        alert('Invalid item type');
        return;
    }
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add service impact');
        }
        
        // Close the modal
        closeModal('serviceImpactModal');
        
        // Reload the context panel
        const selectedNode = document.querySelector(`.tree-node[data-type="${itemType}"][data-id="${itemId}"]`);
        if (selectedNode) {
            showContextPanel(selectedNode);
        }
        
        // Show success message
        alert('Service impact added successfully');
        
    } catch (error) {
        console.error('Error adding service impact:', error);
        alert('Error adding service impact: ' + error.message);
    }
}