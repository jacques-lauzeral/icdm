/**
 * Form handling and validation
 */

// Initialize all form handling
document.addEventListener('DOMContentLoaded', () => {
    // Set up main form event listeners
    document.getElementById('createStakeholderForm').addEventListener('submit', handleStakeholderFormSubmit);
    document.getElementById('createServiceForm').addEventListener('submit', handleServiceFormSubmit);
    document.getElementById('createFolderForm').addEventListener('submit', handleFolderFormSubmit);
	document.getElementById('createNeedForm').addEventListener('submit', handleNeedFormSubmit);
	document.getElementById('createRequirementForm').addEventListener('submit', handleRequirementFormSubmit);
    
    // Set up quick form event listeners for the empty state
    document.getElementById('quickStakeholderForm').addEventListener('submit', handleQuickStakeholderFormSubmit);
    document.getElementById('quickServiceForm').addEventListener('submit', handleQuickServiceFormSubmit);
    document.getElementById('quickFolderForm').addEventListener('submit', handleQuickFolderFormSubmit);
});

// Handle stakeholder category form submission
async function handleStakeholderFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('stakeholderName').value;
    const description = document.getElementById('stakeholderDescription').value;
    
    if (!name || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const data = { name, description };
        await api.stakeholders.create(data);
        
        // Reset form and close modal
        event.target.reset();
        closeModal('createStakeholderModal');
        
        // Refresh the tree view
        const stakeholderNode = document.querySelector('.tree-node[data-id="stakeholder-categories"]');
        if (stakeholderNode) {
            loadStakeholderCategories(stakeholderNode);
            toggleNode(stakeholderNode); // Expand to show new item
        }
        
        showToast('Stakeholder category created successfully', 'success');
    } catch (error) {
        console.error('Error creating stakeholder category:', error);
        showToast('Error creating stakeholder category: ' + error.message, 'error');
    }
}

// Handle quick stakeholder form submission
async function handleQuickStakeholderFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('quickStakeholderName').value;
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    try {
        const data = { 
            name, 
            description: `${name} stakeholder category` 
        };
        await api.stakeholders.create(data);
        
        // Reset form
        event.target.reset();
        
        // Refresh the tree view
        const stakeholderNode = document.querySelector('.tree-node[data-id="stakeholder-categories"]');
        if (stakeholderNode) {
            loadStakeholderCategories(stakeholderNode);
            toggleNode(stakeholderNode); // Expand to show new item
        }
        
        showToast('Stakeholder category created successfully', 'success');
    } catch (error) {
        console.error('Error creating stakeholder category:', error);
        showToast('Error creating stakeholder category: ' + error.message, 'error');
    }
}

// Handle service form submission
async function handleServiceFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('serviceName').value;
    const description = document.getElementById('serviceDescription').value;
    const parentId = document.getElementById('parentServiceId').value;
    
    if (!name || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Create the service
        const data = { name, description };
        const newService = await api.services.create(data);
        
        // If a parent is selected, create the hierarchy relationship
        if (parentId) {
            await api.services.createHierarchy(parentId, newService.id);
        }
        
        // Reset form and close modal
        event.target.reset();
        closeModal('createServiceModal');
        
        // Refresh the tree view
        const servicesNode = document.querySelector('.tree-node[data-id="services"]');
        if (servicesNode) {
            loadServices(servicesNode);
            toggleNode(servicesNode); // Expand to show new item
            
            // If created as a child, refresh the parent node too
            if (parentId) {
                const parentNode = document.querySelector(`.tree-node[data-id="${parentId}"]`);
                if (parentNode) {
                    loadServiceChildren(parentNode, parentId, parentNode.querySelector('.tree-children'));
                }
            }
        }
        
        showToast('Service created successfully', 'success');
    } catch (error) {
        console.error('Error creating service:', error);
        showToast('Error creating service: ' + error.message, 'error');
    }
}

// Handle quick service form submission
async function handleQuickServiceFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('quickServiceName').value;
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    try {
        const data = { 
            name, 
            description: `${name} service` 
        };
        await api.services.create(data);
        
        // Reset form
        event.target.reset();
        
        // Refresh the tree view
        const servicesNode = document.querySelector('.tree-node[data-id="services"]');
        if (servicesNode) {
            loadServices(servicesNode);
            toggleNode(servicesNode); // Expand to show new item
        }
        
        showToast('Service created successfully', 'success');
    } catch (error) {
        console.error('Error creating service:', error);
        showToast('Error creating service: ' + error.message, 'error');
    }
}

// Handle folder form submission
async function handleFolderFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('folderName').value;
    const description = document.getElementById('folderDescription').value;
    const parentId = document.getElementById('parentFolderId').value;
    
    if (!name || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Create the folder
        const data = { name, description };
        const newFolder = await api.folders.create(data);
        
        // If a parent is selected, create the hierarchy relationship
        if (parentId) {
            await api.folders.createHierarchy(parentId, newFolder.id);
        }
        
        // Reset form and close modal
        event.target.reset();
        closeModal('createFolderModal');
        
        // Refresh the tree view
        const foldersNode = document.querySelector('.tree-node[data-id="drafting-groups"]');
        if (foldersNode) {
            loadFolders(foldersNode);
            toggleNode(foldersNode); // Expand to show new item
            
            // If created as a child, refresh the parent node too
            if (parentId) {
                const parentNode = document.querySelector(`.tree-node[data-id="${parentId}"]`);
                if (parentNode) {
                    loadFolderChildren(parentNode, parentId, parentNode.querySelector('.tree-children'));
                }
            }
        }
        
        showToast('Folder created successfully', 'success');
    } catch (error) {
        console.error('Error creating folder:', error);
        showToast('Error creating folder: ' + error.message, 'error');
    }
}

// Handle quick folder form submission
async function handleQuickFolderFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('quickFolderName').value;
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    try {
        const data = { 
            name, 
            description: `${name} folder` 
        };
        await api.folders.create(data);
        
        // Reset form
        event.target.reset();
        
        // Refresh the tree view
        const foldersNode = document.querySelector('.tree-node[data-id="drafting-groups"]');
        if (foldersNode) {
            loadFolders(foldersNode);
            toggleNode(foldersNode); // Expand to show new item
        }
        
        showToast('Folder created successfully', 'success');
    } catch (error) {
        console.error('Error creating folder:', error);
        showToast('Error creating folder: ' + error.message, 'error');
    }
}

async function loadNeedsDropdown() {
    try {
        const needs = await api.needs.getAll();
        const dropdown = document.getElementById('implementedNeedId');
        
        // Keep only the default option
        dropdown.innerHTML = '<option value="">None</option>';
        
        // Add each need
        needs.forEach(need => {
            const option = document.createElement('option');
            option.value = need.id;
            option.textContent = need.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading needs dropdown:', error);
    }
}

// Handle operational need form submission
async function handleNeedFormSubmit(event) {
    event.preventDefault();
    
    const folderId = document.getElementById('needFolderId').value;
    const name = document.getElementById('needName').value;
    const description = document.getElementById('needDescription').value;
    
    if (!name || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Create the need
        const data = { name, description };
        const newNeed = await api.needs.create(data);
        
        // Create the relationship to the folder
        await api.fetch(`${api.baseUrl}/folder-needs`, {
            method: 'POST',
            body: JSON.stringify({ folderId, needId: newNeed.id })
        });
        
        // Reset form and close modal
        event.target.reset();
        closeModal('createNeedModal');
        
        // Refresh the folder node to show the new need
        const folderNode = document.querySelector(`.tree-node[data-id="${folderId}"]`);
        if (folderNode) {
            loadFolderChildren(folderNode, folderId, folderNode.querySelector('.tree-children'));
        }
        
        showToast('Operational need created successfully', 'success');
    } catch (error) {
        console.error('Error creating operational need:', error);
        showToast('Error creating operational need: ' + error.message, 'error');
    }
}

// Handle operational requirement form submission
async function handleRequirementFormSubmit(event) {
    event.preventDefault();
    
    const folderId = document.getElementById('requirementFolderId').value;
    const name = document.getElementById('requirementName').value;
    const description = document.getElementById('requirementDescription').value;
    const implementedNeedId = document.getElementById('implementedNeedId').value;
    
    if (!name || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Create the requirement
        const data = { name, description };
        const newRequirement = await api.requirements.create(data);
        
        // Create the relationship to the folder
        await api.fetch(`${api.baseUrl}/folder-requirements`, {
            method: 'POST',
            body: JSON.stringify({ folderId, requirementId: newRequirement.id })
        });
        
        // If an implemented need was selected, create that relationship too
        if (implementedNeedId) {
            await api.requirements.implementNeed(newRequirement.id, implementedNeedId);
        }
        
        // Reset form and close modal
        event.target.reset();
        closeModal('createRequirementModal');
        
        // Refresh the folder node to show the new requirement
        const folderNode = document.querySelector(`.tree-node[data-id="${folderId}"]`);
        if (folderNode) {
            loadFolderChildren(folderNode, folderId, folderNode.querySelector('.tree-children'));
        }
        
        showToast('Operational requirement created successfully', 'success');
    } catch (error) {
        console.error('Error creating operational requirement:', error);
        showToast('Error creating operational requirement: ' + error.message, 'error');
    }
}

// Show context panel with entity details
async function showContextPanel(node) {
    const nodeType = node.getAttribute('data-type');
    const nodeId = node.getAttribute('data-id');
    const nodeName = node.getAttribute('data-name') || node.querySelector('.label').textContent;
    
    const contextPanel = document.getElementById('contextPanel');
    const emptyContext = document.getElementById('emptyContext');
    const contextTitle = document.getElementById('contextTitle');
    const contextIcon = document.getElementById('contextIcon');
    const contextSubtitle = document.getElementById('contextSubtitle');
    const contextContent = document.getElementById('contextContent');
    
    // Don't proceed for root nodes
    if (nodeType === 'root') {
        return;
    }
    
    // Show the context panel, hide the empty state
    contextPanel.style.display = 'block';
    emptyContext.style.display = 'none';
    
    // Set the title and icon
    contextTitle.textContent = nodeName;
    
    // Set icon based on node type
    switch (nodeType) {
        case 'stakeholder':
            contextIcon.textContent = '👤';
            contextSubtitle.textContent = 'Stakeholder Category';
            break;
        case 'service':
            contextIcon.textContent = '🔧';
            contextSubtitle.textContent = 'Service';
            break;
        case 'folder':
            contextIcon.textContent = '📁';
            contextSubtitle.textContent = 'Folder';
            break;
        case 'need':
            contextIcon.textContent = '📋';
            contextSubtitle.textContent = 'Operational Need';
            break;
        case 'requirement':
            contextIcon.textContent = '📝';
            contextSubtitle.textContent = 'Operational Requirement';
            break;
        default:
            contextIcon.textContent = '📄';
            contextSubtitle.textContent = 'Item';
    }
    
    // Load and display content based on node type
    contextContent.innerHTML = '<div class="loading-indicator">Loading details...</div>';
    
    try {
        await loadContextContent(nodeType, nodeId, contextContent);
    } catch (error) {
        console.error(`Error loading context content for ${nodeType}:`, error);
        contextContent.innerHTML = '<div class="error-message">Error loading details. Please try again.</div>';
    }
}

// Load context content based on node type
async function loadContextContent(nodeType, nodeId, contextContainer) {
    let html = '';
    
    switch (nodeType) {
        case 'stakeholder':
            const stakeholder = await api.stakeholders.get(nodeId);
            
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
                
                <div class="actions-section">
                    <button class="edit-button" onclick="editStakeholderCategory('${nodeId}')">
                        <span class="icon">✏️</span> Edit
                    </button>
                    <button class="delete-button" onclick="deleteStakeholderCategory('${nodeId}')">
                        <span class="icon">🗑️</span> Delete
                    </button>
                </div>
            `;
            break;
            
        case 'service':
            const service = await api.services.get(nodeId);
            
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
                
                <div class="actions-section">
                    <button class="primary-button" onclick="showAddSubserviceForm('${nodeId}')">
                        <span class="icon">➕</span> Add Sub-Service
                    </button>
                    <button class="edit-button" onclick="editService('${nodeId}')">
                        <span class="icon">✏️</span> Edit
                    </button>
                    <button class="delete-button" onclick="deleteService('${nodeId}')">
                        <span class="icon">🗑️</span> Delete
                    </button>
                </div>
            `;
            break;
            
        case 'folder':
            const folder = await api.folders.get(nodeId);
            
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
                    <button class="primary-button" onclick="showCreateNeedForm('${nodeId}')">
                        <span class="icon">➕</span> Add Operational Need
                    </button>
                    <button class="primary-button" onclick="showCreateRequirementForm('${nodeId}')">
                        <span class="icon">➕</span> Add Operational Requirement
                    </button>
                    <button class="primary-button" onclick="showAddSubfolderForm('${nodeId}')">
                        <span class="icon">➕</span> Add Subfolder
                    </button>
                    <button class="edit-button" onclick="editFolder('${nodeId}')">
                        <span class="icon">✏️</span> Edit
                    </button>
                    <button class="delete-button" onclick="deleteFolder('${nodeId}')">
                        <span class="icon">🗑️</span> Delete
                    </button>
                </div>
            `;
            break;
            
        case 'need':
            try {
                const need = await api.needs.get(nodeId);
                
                // Get implementing requirements
                const implementingRequirements = await api.needs.getImplementingRequirements(nodeId);
                
                let requirementsHtml = '<p>No implementing requirements.</p>';
                if (implementingRequirements.length > 0) {
                    requirementsHtml = '<ul>';
                    implementingRequirements.forEach(req => {
                        requirementsHtml += `<li>${escapeHtml(req.name)}</li>`;
                    });
                    requirementsHtml += '</ul>';
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
                            <strong>Last Updated:</strong> ${formatDate(need.last_updated_at)}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Implementing Requirements</h3>
                        ${requirementsHtml}
                    </div>
                    
                    <div class="actions-section">
                        <button class="edit-button" onclick="editNeed('${nodeId}')">
                            <span class="icon">✏️</span> Edit
                        </button>
                        <button class="primary-button" onclick="showAddImpactForm('need', '${nodeId}')">
                            <span class="icon">➕</span> Add Impact
                        </button>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading need details:', error);
                html = `<div class="error-message">Error loading operational need details: ${error.message}</div>`;
            }
            break;
            
        case 'requirement':
            try {
                const requirement = await api.requirements.get(nodeId);
                
                // Get implemented needs
                const implementedNeeds = await api.requirements.getImplementedNeeds(nodeId);
                
                let needsHtml = '<p>No implemented needs.</p>';
                if (implementedNeeds.length > 0) {
                    needsHtml = '<ul>';
                    implementedNeeds.forEach(need => {
                        needsHtml += `<li>${escapeHtml(need.name)}</li>`;
                    });
                    needsHtml += '</ul>';
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
                            <strong>Last Updated:</strong> ${formatDate(requirement.last_updated_at)}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Implemented Needs</h3>
                        ${needsHtml}
                    </div>
                    
                    <div class="actions-section">
                        <button class="edit-button" onclick="editRequirement('${nodeId}')">
                            <span class="icon">✏️</span> Edit
                        </button>
                        <button class="primary-button" onclick="showImplementNeedForm('${nodeId}')">
                            <span class="icon">➕</span> Implement Need
                        </button>
                        <button class="primary-button" onclick="showAddImpactForm('requirement', '${nodeId}')">
                            <span class="icon">➕</span> Add Impact
                        </button>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading requirement details:', error);
                html = `<div class="error-message">Error loading operational requirement details: ${error.message}</div>`;
            }
            break;
            
        default:
            html = '<div class="detail-section"><p>Select an item to view details</p></div>';
    }
    
    contextContainer.innerHTML = html;
}

// Placeholder functions for edit/delete actions
// These will be implemented in future phases
function editStakeholderCategory(id) {
    alert(`Edit stakeholder category ${id} - functionality coming soon`);
}

function deleteStakeholderCategory(id) {
    alert(`Delete stakeholder category ${id} - functionality coming soon`);
}

function editService(id) {
    alert(`Edit service ${id} - functionality coming soon`);
}

function deleteService(id) {
    alert(`Delete service ${id} - functionality coming soon`);
}

function editFolder(id) {
    alert(`Edit folder ${id} - functionality coming soon`);
}

function deleteFolder(id) {
    alert(`Delete folder ${id} - functionality coming soon`);
}

function showAddSubserviceForm(parentId) {
    // Set the parent service in the form and open modal
    document.getElementById('parentServiceId').value = parentId;
    showFullModal('createServiceModal');
}

function showAddSubfolderForm(parentId) {
    // Set the parent folder in the form and open modal
    document.getElementById('parentFolderId').value = parentId;
    showFullModal('createFolderModal');
}

function showCreateNeedForm(folderId) {
    // Set the folder ID
    document.getElementById('needFolderId').value = folderId;
    
    // Clear form fields
    document.getElementById('needName').value = '';
    document.getElementById('needDescription').value = '';
    
    // Open the modal
    showModal('createNeedModal');
}

function showCreateRequirementForm(folderId) {
    // Set the folder ID
    document.getElementById('requirementFolderId').value = folderId;
    
    // Clear form fields
    document.getElementById('requirementName').value = '';
    document.getElementById('requirementDescription').value = '';
    
    // Load operational needs for the dropdown
    loadNeedsDropdown();
    
    // Open the modal
    showModal('createRequirementModal');
}