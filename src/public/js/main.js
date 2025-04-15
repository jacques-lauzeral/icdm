/**
 * Main application entry point
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing iCDM Manager application');
    
    // Initialize the UI components
    initializeSplitter();
    initializeTreeView();
    
    // Check if database is empty
    checkDatabaseState();
});

// Check if database is empty to show appropriate UI
async function checkDatabaseState() {
    try {
        // Fetch stakeholders, services and folders
        const [stakeholders, services, folders] = await Promise.all([
            api.stakeholders.getAll(),
            api.services.getAll(),
            api.folders.getAll()
        ]);
        
        // If all are empty, show empty state
        if (stakeholders.length === 0 && services.length === 0 && folders.length === 0) {
            toggleContextPanel(false); // Show empty state guide
        } else {
            // If not empty, but nothing selected, show a welcome message
            const isNodeSelected = document.querySelector('.tree-node-content.active');
            if (!isNodeSelected) {
                welcomePanel();
            }
        }
    } catch (error) {
        console.error('Error checking database state:', error);
        // Show empty state with error message
        const emptyContext = document.getElementById('emptyContext');
        emptyContext.innerHTML = `
            <h2>Error Connecting to Database</h2>
            <p>There was a problem connecting to your database. Please check your connection and refresh the page.</p>
            <p>Error details: ${error.message}</p>
            <button onclick="location.reload()" class="primary-button">Refresh Page</button>
        `;
        toggleContextPanel(false);
    }
}

// Show welcome panel when there's data but nothing selected
function welcomePanel() {
    const contextPanel = document.getElementById('contextPanel');
    const emptyContext = document.getElementById('emptyContext');
    
    // Hide empty guide, show welcome panel
    emptyContext.style.display = 'none';
    contextPanel.style.display = 'block';
    
    // Update context panel with welcome message
    const contextTitle = document.getElementById('contextTitle');
    const contextIcon = document.getElementById('contextIcon');
    const contextSubtitle = document.getElementById('contextSubtitle');
    const contextContent = document.getElementById('contextContent');
    
    contextTitle.textContent = 'Welcome to iCDM Manager';
    contextIcon.textContent = '👋';
    contextSubtitle.textContent = 'Select an item from the tree view to see details';
    
    contextContent.innerHTML = `
        <div class="detail-section">
            <h3>Getting Started</h3>
            <p>Your database contains items. Use the tree view on the left to navigate through:</p>
            <ul>
                <li><strong>Stakeholder Categories</strong> - who is impacted by requirements</li>
                <li><strong>Services</strong> - your organization's service catalog</li>
                <li><strong>Drafting Groups</strong> - folders containing needs and requirements</li>
            </ul>
            <p>Click on any item to see its details and available actions.</p>
        </div>
        
        <div class="detail-section">
            <h3>Quick Actions</h3>
            <div class="actions-section">
                <button onclick="showFullModal('createStakeholderModal')" class="action-button">
                    <span class="icon">👥</span> New Stakeholder Category
                </button>
                <button onclick="showFullModal('createServiceModal')" class="action-button">
                    <span class="icon">🔧</span> New Service
                </button>
                <button onclick="showFullModal('createFolderModal')" class="action-button">
                    <span class="icon">📁</span> New Folder
                </button>
            </div>
        </div>
    `;
}

// Add CSS for toast notifications
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .toast {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        animation: slide-in 0.3s ease-out forwards;
        opacity: 0.9;
        max-width: 300px;
    }
    
    .toast-success {
        background-color: #2ecc71;
        color: white;
    }
    
    .toast-error {
        background-color: #e74c3c;
        color: white;
    }
    
    .toast-info {
        background-color: #3498db;
        color: white;
    }
    
    .toast-warning {
        background-color: #f39c12;
        color: white;
    }
    
    .toast-fadeout {
        animation: fade-out 0.3s forwards;
    }
    
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 0.9;
        }
    }
    
    @keyframes fade-out {
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);