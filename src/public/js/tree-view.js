/**
 * Tree view functionality
 */

// Initialize the tree view with root nodes
async function initializeTreeView() {
    const treeView = document.getElementById('treeView');
    showLoading('treeView');
    
    try {
        // Create root nodes
        const stakeholderCategoriesNode = createRootNode('Stakeholder Categories', 'stakeholder-categories', '👥');
        const servicesNode = createRootNode('Services', 'services', '🔧');
        const draftingGroupsNode = createRootNode('Drafting Groups', 'drafting-groups', '📁');
        
        // Clear and append root nodes to tree view
        treeView.innerHTML = '';
        treeView.appendChild(stakeholderCategoriesNode);
        treeView.appendChild(servicesNode);
        treeView.appendChild(draftingGroupsNode);
        
        // Load initial data for each root node
        await Promise.all([
            loadStakeholderCategories(stakeholderCategoriesNode),
            loadServices(servicesNode),
            loadFolders(draftingGroupsNode)
        ]);
    } catch (error) {
        console.error('Error initializing tree view:', error);
        treeView.innerHTML = '<div class="error-message">Failed to load tree view. Please refresh the page.</div>';
    }
}

// Create a root node for the tree
function createRootNode(label, id, icon) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.setAttribute('data-id', id);
    nodeDiv.setAttribute('data-type', 'root');
    
    nodeDiv.innerHTML = `
        <div class="tree-node-content" onclick="toggleNode(this.parentNode)">
            <span class="tree-node-toggle">▶</span>
            <span class="icon">${icon}</span>
            <span class="label">${label}</span>
            <span class="count-badge">0</span>
        </div>
        <div class="tree-children" style="display: none;"></div>
    `;
    
    return nodeDiv;
}

// Create a regular tree node
function createTreeNode(item, type, icon, hasChildren = false) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.setAttribute('data-id', item.id);
    nodeDiv.setAttribute('data-type', type);
    nodeDiv.setAttribute('data-name', item.name);
    
    let toggleHtml = hasChildren ? 
        '<span class="tree-node-toggle">▶</span>' : 
        '<span class="tree-node-toggle" style="visibility:hidden">▶</span>';
    
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
        
        // Make the label also toggle when clicked
        nodeDiv.querySelector('.tree-node-content').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNode(nodeDiv);
            selectNode(nodeDiv);
        });
    }
    
    return nodeDiv;
}

// Toggle expansion of a tree node
function toggleNode(node) {
    const toggle = node.querySelector('.tree-node-toggle');
    const children = node.querySelector('.tree-children');
    
    if (!children) return;
    
    if (children.style.display === 'none') {
        children.style.display = 'block';
        toggle.textContent = '▼';
        
        // Load children if they haven't been loaded yet and container is empty
        if (children.children.length === 0) {
            const nodeType = node.getAttribute('data-type');
            const nodeId = node.getAttribute('data-id');
            
            loadNodeChildren(node, nodeType, nodeId);
        }
    } else {
        children.style.display = 'none';
        toggle.textContent = '▶';
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
        const categories = await api.stakeholders.getAll();
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '';
        
        // Update the count badge
        parentNode.querySelector('.count-badge').textContent = categories.length;
        
        if (categories.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'tree-placeholder';
            placeholder.textContent = 'No stakeholder categories';
            childrenContainer.appendChild(placeholder);
            return;
        }
        
        categories.forEach(category => {
            const categoryNode = createTreeNode(category, 'stakeholder', '👤');
            childrenContainer.appendChild(categoryNode);
        });
    } catch (error) {
        console.error('Error loading stakeholder categories:', error);
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '<div class="error-message">Failed to load stakeholder categories</div>';
    }
}

// Load services
async function loadServices(parentNode) {
    try {
        // First, get all services
        const allServices = await api.services.getAll();
        
        // Then, get service hierarchy to identify root services
        const serviceHierarchy = await api.services.getHierarchy();
        
        // Find parent-child relationships
        const childServiceIds = serviceHierarchy.map(rel => rel.childId);
        
        // Root services are those that aren't children of other services
        const rootServices = allServices.filter(service => !childServiceIds.includes(service.id));
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '';
        
        // Update the count badge
        parentNode.querySelector('.count-badge').textContent = allServices.length;
        
        if (rootServices.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'tree-placeholder';
            placeholder.textContent = 'No services';
            childrenContainer.appendChild(placeholder);
            return;
        }
        
        // Add each root service to the tree
        rootServices.forEach(service => {
            const hasChildren = serviceHierarchy.some(rel => rel.parentId === service.id);
            const serviceNode = createTreeNode(service, 'service', '🔧', hasChildren);
            childrenContainer.appendChild(serviceNode);
        });
    } catch (error) {
        console.error('Error loading services:', error);
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '<div class="error-message">Failed to load services</div>';
    }
}

// Load folders
async function loadFolders(parentNode) {
    try {
        // First, get all folders
        const allFolders = await api.folders.getAll();
        
        // Then, get folder hierarchy to identify root folders
        const folderHierarchy = await api.folders.getHierarchy();
        
        // Find parent-child relationships
        const childFolderIds = folderHierarchy.map(rel => rel.childId);
        
        // Root folders are those that aren't children of other folders
        const rootFolders = allFolders.filter(folder => !childFolderIds.includes(folder.id));
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '';
        
        // Update the count badge
        parentNode.querySelector('.count-badge').textContent = allFolders.length;
        
        if (rootFolders.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'tree-placeholder';
            placeholder.textContent = 'No folders';
            childrenContainer.appendChild(placeholder);
            return;
        }
        
        // Add each root folder to the tree
        rootFolders.forEach(folder => {
            const hasChildren = folderHierarchy.some(rel => rel.parentId === folder.id);
            const folderNode = createTreeNode(folder, 'folder', '📁', hasChildren);
            childrenContainer.appendChild(folderNode);
        });
    } catch (error) {
        console.error('Error loading folders:', error);
        
        const childrenContainer = parentNode.querySelector('.tree-children');
        childrenContainer.innerHTML = '<div class="error-message">Failed to load folders</div>';
    }
}

// Load children for a specific node
async function loadNodeChildren(node, nodeType, nodeId) {
    const childrenContainer = node.querySelector('.tree-children');
    
    // Add a loading placeholder
    const loadingPlaceholder = document.createElement('div');
    loadingPlaceholder.className = 'loading-indicator';
    loadingPlaceholder.textContent = 'Loading...';
    childrenContainer.appendChild(loadingPlaceholder);
    
    try {
        switch (nodeType) {
            case 'folder':
                await loadFolderChildren(node, nodeId, childrenContainer);
                break;
                
            case 'service':
                await loadServiceChildren(node, nodeId, childrenContainer);
                break;
                
            case 'need':
                await loadNeedChildren(node, nodeId, childrenContainer);
                break;
                
            case 'root':
                // Root nodes handled elsewhere
                break;
                
            default:
                childrenContainer.innerHTML = '<div class="tree-placeholder">No children available</div>';
                break;
        }
    } catch (error) {
        console.error(`Error loading children for node type ${nodeType}:`, error);
        childrenContainer.innerHTML = '<div class="error-message">Error loading data</div>';
    }
}

// Load folder children (subfolders, needs, requirements)
async function loadFolderChildren(node, folderId, childrenContainer) {
    // Clear the container
    childrenContainer.innerHTML = '';
    
    // Get the folder hierarchy for subfolders
    const folderHierarchy = await api.folders.getHierarchy();
    const childFolderRelations = folderHierarchy.filter(rel => rel.parentId === folderId);
    
    // Get all folders
    const allFolders = await api.folders.getAll();
    
    // Get operational needs in this folder
    const operationalNeeds = await api.folders.getNeeds(folderId);
    
    // Get operational requirements in this folder
    const operationalRequirements = await api.folders.getRequirements(folderId);
    
    // Add subfolders
    if (childFolderRelations.length > 0) {
        childFolderRelations.forEach(relation => {
            const childFolder = allFolders.find(f => f.id === relation.childId);
            if (childFolder) {
                const hasChildren = folderHierarchy.some(rel => rel.parentId === childFolder.id);
                const folderNode = createTreeNode(childFolder, 'folder', '📁', hasChildren);
                childrenContainer.appendChild(folderNode);
            }
        });
    }
    
    // Add operational needs
    if (operationalNeeds.length > 0) {
        operationalNeeds.forEach(need => {
            // Needs can have requirements that implement them
            const needNode = createTreeNode(need, 'need', '📋', true);
            childrenContainer.appendChild(needNode);
        });
    }
    
    // Add operational requirements 
    if (operationalRequirements.length > 0) {
        operationalRequirements.forEach(requirement => {
            const requirementNode = createTreeNode(requirement, 'requirement', '📝');
            childrenContainer.appendChild(requirementNode);
        });
    }
    
    // If no children found, add a placeholder
    if (childrenContainer.children.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'tree-placeholder';
        placeholder.textContent = 'This folder is empty';
        childrenContainer.appendChild(placeholder);
    }
}

// Load service children
async function loadServiceChildren(node, serviceId, childrenContainer) {
    // Clear the container
    childrenContainer.innerHTML = '';
    
    // Get the service hierarchy
    const serviceHierarchy = await api.services.getHierarchy();
    const childServiceRelations = serviceHierarchy.filter(rel => rel.parentId === serviceId);
    
    // Get all services
    const allServices = await api.services.getAll();
    
    // Add child services
    if (childServiceRelations.length > 0) {
        childServiceRelations.forEach(relation => {
            const childService = allServices.find(s => s.id === relation.childId);
            if (childService) {
                const hasChildren = serviceHierarchy.some(rel => rel.parentId === childService.id);
                const serviceNode = createTreeNode(childService, 'service', '🔧', hasChildren);
                childrenContainer.appendChild(serviceNode);
            }
        });
    } else {
        // If no children found, add a placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'tree-placeholder';
        placeholder.textContent = 'No sub-services';
        childrenContainer.appendChild(placeholder);
    }
}

// Load need children (implementing requirements)
async function loadNeedChildren(node, needId, childrenContainer) {
    // Clear the container
    childrenContainer.innerHTML = '';
    
    try {
        // Get implementing requirements for this need
        const implementingRequirements = await api.fetch(`${api.baseUrl}/needs/${needId}/implementing-requirements`);
        
        if (implementingRequirements.length > 0) {
            implementingRequirements.forEach(requirement => {
                const requirementNode = createTreeNode(requirement, 'requirement', '📝');
                childrenContainer.appendChild(requirementNode);
            });
        } else {
            // If no requirements found, add a placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'tree-placeholder';
            placeholder.textContent = 'No implementing requirements';
            childrenContainer.appendChild(placeholder);
        }
    } catch (error) {
        console.error('Error loading implementing requirements:', error);
        childrenContainer.innerHTML = '<div class="error-message">Error loading requirements</div>';
    }
}