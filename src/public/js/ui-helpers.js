/**
 * UI helper functions
 */

// Show a modal
function showModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById(modalId).style.display = 'flex';
}

// Close a modal
function closeModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById(modalId).style.display = 'none';
}

// Show a modal with pre-filled data
function showFullModal(modalId) {
    // If it's a service or folder modal, load parent dropdowns
    if (modalId === 'createServiceModal') {
        loadServiceDropdown();
    } else if (modalId === 'createFolderModal') {
        loadFolderDropdown();
    }
    
    showModal(modalId);
}

// Load services into the parent service dropdown
async function loadServiceDropdown() {
    try {
        const services = await api.services.getAll();
        const dropdown = document.getElementById('parentServiceId');
        
        // Keep only the default option
        dropdown.innerHTML = '<option value="">None (Root Service)</option>';
        
        // Add each service
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading services dropdown:', error);
    }
}

// Load folders into the parent folder dropdown
async function loadFolderDropdown() {
    try {
        const folders = await api.folders.getAll();
        const dropdown = document.getElementById('parentFolderId');
        
        // Keep only the default option
        dropdown.innerHTML = '<option value="">None (Root Folder)</option>';
        
        // Add each folder
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading folders dropdown:', error);
    }
}

// Show a toast notification
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Format a date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        
        // Set minimum and maximum width
        if (newWidth < 250) {
            leftPanel.style.width = '250px';
        } else if (newWidth > 400) {
            leftPanel.style.width = '400px';
        } else {
            leftPanel.style.width = newWidth + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
    });
}

// Toggle between empty state and context panel
function toggleContextPanel(show) {
    const emptyContext = document.getElementById('emptyContext');
    const contextPanel = document.getElementById('contextPanel');
    
    if (show) {
        emptyContext.style.display = 'none';
        contextPanel.style.display = 'block';
    } else {
        emptyContext.style.display = 'block';
        contextPanel.style.display = 'none';
    }
}

// Update the breadcrumbs in the context panel
function updateBreadcrumbs(path) {
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    breadcrumbsContainer.innerHTML = '';
    
    // Add home
    const homeItem = document.createElement('span');
    homeItem.className = 'breadcrumb-item';
    homeItem.textContent = 'Home';
    breadcrumbsContainer.appendChild(homeItem);
    
    // Add separator
    breadcrumbsContainer.appendChild(createBreadcrumbSeparator());
    
    // Add each path item
    path.forEach((item, index) => {
        const itemElement = document.createElement('span');
        itemElement.className = 'breadcrumb-item';
        itemElement.textContent = item.label;
        
        // If not the last item, make it clickable
        if (index < path.length - 1) {
            itemElement.classList.add('breadcrumb-link');
            itemElement.setAttribute('data-id', item.id);
            itemElement.setAttribute('data-type', item.type);
            itemElement.addEventListener('click', () => {
                const node = document.querySelector(`.tree-node[data-id="${item.id}"]`);
                if (node) {
                    selectNode(node);
                }
            });
        }
        
        breadcrumbsContainer.appendChild(itemElement);
        
        // Add separator if not the last item
        if (index < path.length - 1) {
            breadcrumbsContainer.appendChild(createBreadcrumbSeparator());
        }
    });
}

// Create a breadcrumb separator
function createBreadcrumbSeparator() {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = '›';
    return separator;
}

// Show a loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    const loading = document.createElement('div');
    loading.className = 'loading-indicator';
    loading.textContent = 'Loading...';
    
    // Clear the element
    element.innerHTML = '';
    element.appendChild(loading);
}

// Remove the loading indicator
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    const loading = element.querySelector('.loading-indicator');
    if (loading) {
        loading.remove();
    }
}