/**
 * API Client for backend communication
 */
const api = {
    // Base URL for API requests
    baseUrl: '/api',
    
    // Generic fetch wrapper with error handling
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error: ${error.message}`);
            throw error;
        }
    },
    
    // Stakeholder Categories
    stakeholders: {
        getAll: () => api.fetch(`${api.baseUrl}/stakeholder-categories`),
        get: (id) => api.fetch(`${api.baseUrl}/stakeholder-categories/${id}`),
        create: (data) => api.fetch(`${api.baseUrl}/stakeholder-categories`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`${api.baseUrl}/stakeholder-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`${api.baseUrl}/stakeholder-categories/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Services
    services: {
        getAll: () => api.fetch(`${api.baseUrl}/services`),
        get: (id) => api.fetch(`${api.baseUrl}/services/${id}`),
        create: (data) => api.fetch(`${api.baseUrl}/services`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`${api.baseUrl}/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`${api.baseUrl}/services/${id}`, {
            method: 'DELETE'
        }),
        getHierarchy: () => api.fetch(`${api.baseUrl}/services/hierarchy/all`),
        createHierarchy: (parentId, childId) => api.fetch(`${api.baseUrl}/services/hierarchy`, {
            method: 'POST',
            body: JSON.stringify({ parentId, childId })
        })
    },
    
    // Folders
    folders: {
        getAll: () => api.fetch(`${api.baseUrl}/folders`),
        get: (id) => api.fetch(`${api.baseUrl}/folders/${id}`),
        create: (data) => api.fetch(`${api.baseUrl}/folders`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`${api.baseUrl}/folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`${api.baseUrl}/folders/${id}`, {
            method: 'DELETE'
        }),
        getHierarchy: () => api.fetch(`${api.baseUrl}/folders/hierarchy/all`),
        createHierarchy: (parentId, childId) => api.fetch(`${api.baseUrl}/folders/relations`, {
            method: 'POST',
            body: JSON.stringify({ parentId, childId })
        }),
        getNeeds: (folderId) => api.fetch(`${api.baseUrl}/folders/${folderId}/operational-needs`),
        getRequirements: (folderId) => api.fetch(`${api.baseUrl}/folders/${folderId}/operational-requirements`)
    },

	needs: {
		getAll: () => api.fetch(`${api.baseUrl}/operational-needs`),
		get: (id) => api.fetch(`${api.baseUrl}/operational-needs/${id}`),
		create: (data) => api.fetch(`${api.baseUrl}/operational-needs`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),
		update: (id, data) => api.fetch(`${api.baseUrl}/operational-needs/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),
		getImplementingRequirements: (needId) => api.fetch(`${api.baseUrl}/needs/${needId}/implementing-requirements`)
	},

	requirements: {
		getAll: () => api.fetch(`${api.baseUrl}/operational-requirements`),
		get: (id) => api.fetch(`${api.baseUrl}/operational-requirements/${id}`),
		create: (data) => api.fetch(`${api.baseUrl}/operational-requirements`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),
		update: (id, data) => api.fetch(`${api.baseUrl}/operational-requirements/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),
		getImplementedNeeds: (requirementId) => api.fetch(`${api.baseUrl}/requirements/${requirementId}/implemented-needs`),
		implementNeed: (requirementId, needId) => api.fetch(`${api.baseUrl}/requirement-implements-need`, {
			method: 'POST',
			body: JSON.stringify({ requirementId, needId })
		})
	},
    
    // General data
    getExtendedHierarchy: () => api.fetch(`${api.baseUrl}/extended-hierarchy`)
};