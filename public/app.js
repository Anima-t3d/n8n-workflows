// Global variables
let allWorkflows = [];
let filteredWorkflows = [];
let activeFilters = new Set();
let activeCategoryFilters = new Set();
let currentSearchTerm = '';

// DOM elements
const searchInput = document.getElementById('searchInput');
const filtersContainer = document.getElementById('filtersContainer');
const resultsGrid = document.getElementById('resultsGrid');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');
const clearFiltersBtn = document.getElementById('clearFilters');
const toggleFiltersBtn = document.getElementById('toggleFilters');
const filterToggleIcon = document.getElementById('filterToggleIcon');
const resultCount = document.getElementById('resultCount');
const totalCount = document.getElementById('totalCount');
const serviceCount = document.getElementById('serviceCount');
const toggleCategoryFiltersBtn = document.getElementById('toggleCategoryFilters');
const categoryToggleIcon = document.getElementById('categoryToggleIcon');
const clearCategoryFiltersBtn = document.getElementById('clearCategoryFilters');
const categoryFiltersContainer = document.getElementById('categoryFiltersContainer');

// Initialize the application
async function init() {
    try {
        showLoading(true);
        await loadWorkflows();
        setupEventListeners();
        populateFilters();
        populateCategoryFilters();
        updateDisplay();
        showLoading(false);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load workflows. Please try again later.');
    }
}

// Load workflows data from JSON file
async function loadWorkflows() {
    const response = await fetch('workflows.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    allWorkflows = await response.json();
    filteredWorkflows = [...allWorkflows];
    
    console.log(`Loaded ${allWorkflows.length} workflows`);
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Clear filters button
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Toggle filters button
    toggleFiltersBtn.addEventListener('click', toggleFiltersVisibility);
    
    // Toggle category filters button
    toggleCategoryFiltersBtn.addEventListener('click', toggleCategoryFiltersVisibility);
    
    // Clear category filters button
    clearCategoryFiltersBtn.addEventListener('click', clearAllCategoryFilters);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearAllFilters();
            clearAllCategoryFilters();
            searchInput.value = '';
            handleSearch();
        }
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// Debounce function to limit search frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search input
function handleSearch() {
    currentSearchTerm = searchInput.value.toLowerCase().trim();
    applyFilters();
}

// Create filter buttons from unique services
function populateFilters() {
    const allServices = new Set();
    
    allWorkflows.forEach(workflow => {
        workflow.nodes.forEach(node => allServices.add(node));
    });
    
    const sortedServices = Array.from(allServices).sort();
    
    filtersContainer.innerHTML = '';
    
    sortedServices.forEach(service => {
        const count = countWorkflowsWithService(service);
        const button = createFilterButton(service, count);
        filtersContainer.appendChild(button);
    });
    
    // Update service count
    serviceCount.textContent = sortedServices.length;
}

// Create category filter buttons from unique categories
function populateCategoryFilters() {
    const allCategories = new Set();
    
    allWorkflows.forEach(workflow => {
        allCategories.add(workflow.category);
    });
    
    const sortedCategories = Array.from(allCategories).sort();
    
    categoryFiltersContainer.innerHTML = '';
    
    sortedCategories.forEach(category => {
        const count = countWorkflowsWithCategory(category);
        const button = createCategoryFilterButton(category, count);
        categoryFiltersContainer.appendChild(button);
    });
}

// Count workflows that use a specific category
function countWorkflowsWithCategory(category) {
    return allWorkflows.filter(workflow => 
        workflow.category === category
    ).length;
}

// Create a category filter button element
function createCategoryFilterButton(category, count) {
    const button = document.createElement('button');
    const isActive = activeCategoryFilters.has(category);
    const buttonClass = isActive ? 'filter-btn-active' : 'filter-btn';
    const displayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    button.className = `${buttonClass} px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200`;
    button.innerHTML = `${displayName} <span class=\"text-xs opacity-75\">(${count})</span>`;
    button.addEventListener('click', () => toggleCategoryFilter(category, button));
    return button;
}

// Toggle category filter state
function toggleCategoryFilter(category, button) {
    if (activeCategoryFilters.has(category)) {
        activeCategoryFilters.delete(category);
        button.className = button.className.replace('filter-btn-active', 'filter-btn');
    } else {
        activeCategoryFilters.add(category);
        button.className = button.className.replace('filter-btn', 'filter-btn-active');
    }
    
    applyFilters();
}

// Count workflows that use a specific service
function countWorkflowsWithService(service) {
    return allWorkflows.filter(workflow => 
        workflow.nodes.includes(service)
    ).length;
}

// Create a filter button element
function createFilterButton(service, count) {
    const button = document.createElement('button');
    const isActive = activeFilters.has(service);
    const buttonClass = isActive ? 'filter-btn-active' : 'filter-btn';
    button.className = `${buttonClass} px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200`;
    button.innerHTML = `${service} <span class="text-xs opacity-75">(${count})</span>`;
    button.addEventListener('click', () => toggleFilter(service, button));
    return button;
}

// Toggle filter state
function toggleFilter(service, button) {
    if (activeFilters.has(service)) {
        activeFilters.delete(service);
        button.className = button.className.replace('filter-btn-active', 'filter-btn');
    } else {
        activeFilters.add(service);
        button.className = button.className.replace('filter-btn', 'filter-btn-active');
    }
    
    applyFilters();
}

// Clear all active filters
function clearAllFilters() {
    activeFilters.clear();
    currentSearchTerm = '';
    searchInput.value = '';
    
    // Regenerate filter buttons to show correct active states
    populateFilters();
    
    applyFilters();
}

// Clear all active category filters
function clearAllCategoryFilters() {
    activeCategoryFilters.clear();
    
    // Regenerate category filter buttons to show correct active states
    populateCategoryFilters();
    
    applyFilters();
}

// Toggle filters visibility
function toggleFiltersVisibility() {
    const isHidden = filtersContainer.classList.contains('hidden');
    
    if (isHidden) {
        filtersContainer.classList.remove('hidden');
        filtersContainer.classList.add('flex');
        filterToggleIcon.style.transform = 'rotate(180deg)';
    } else {
        filtersContainer.classList.add('hidden');
        filtersContainer.classList.remove('flex');
        filterToggleIcon.style.transform = 'rotate(0deg)';
    }
}

// Toggle category filters visibility
function toggleCategoryFiltersVisibility() {
    const isHidden = categoryFiltersContainer.classList.contains('hidden');
    
    if (isHidden) {
        categoryFiltersContainer.classList.remove('hidden');
        categoryFiltersContainer.classList.add('flex');
        categoryToggleIcon.style.transform = 'rotate(180deg)';
    } else {
        categoryFiltersContainer.classList.add('hidden');
        categoryFiltersContainer.classList.remove('flex');
        categoryToggleIcon.style.transform = 'rotate(0deg)';
    }
}

// Apply search and filter logic
function applyFilters() {
    filteredWorkflows = allWorkflows.filter(workflow => {
        // Search filter
        const matchesSearch = !currentSearchTerm || 
            workflow.name.toLowerCase().includes(currentSearchTerm) ||
            workflow.nodes.some(node => node.toLowerCase().includes(currentSearchTerm)) ||
            workflow.category.toLowerCase().includes(currentSearchTerm);
        
        // Service filter - workflow must include ALL active filters
        const matchesFilters = activeFilters.size === 0 || 
            Array.from(activeFilters).every(filter => workflow.nodes.includes(filter));
        
        // Category filter - workflow must include ALL active category filters
        const matchesCategoryFilters = activeCategoryFilters.size === 0 || 
            activeCategoryFilters.has(workflow.category);
        
        return matchesSearch && matchesFilters && matchesCategoryFilters;
    });
    
    updateDisplay();
}

// Update the display with filtered results
function updateDisplay() {
    resultCount.textContent = filteredWorkflows.length;
    totalCount.textContent = allWorkflows.length;
    
    if (filteredWorkflows.length === 0) {
        showNoResults();
    } else {
        renderWorkflows();
    }
}

// Render workflow cards
function renderWorkflows() {
    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    
    filteredWorkflows.forEach(workflow => {
        const card = createWorkflowCard(workflow);
        resultsGrid.appendChild(card);
    });
    
    // Add event listeners to service and category tag buttons
    setupServiceTagClickHandlers();
    setupCategoryTagClickHandlers();
}

// Setup click handlers for service tags in workflow cards
function setupServiceTagClickHandlers() {
    const serviceTags = resultsGrid.querySelectorAll('[data-service]');
    serviceTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = tag.getAttribute('data-service');
            toggleServiceFilter(serviceName);
        });
    });
}

// Setup click handlers for category tags in workflow cards
function setupCategoryTagClickHandlers() {
    const categoryTags = resultsGrid.querySelectorAll('[data-category]');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryName = tag.getAttribute('data-category');
            toggleCategoryFilterFromCard(categoryName);
        });
    });
}

// Toggle a service filter (add if not present, remove if present)
function toggleServiceFilter(serviceName) {
    // Expand filters if collapsed
    if (filtersContainer.classList.contains('hidden')) {
        toggleFiltersVisibility();
    }
    
    if (activeFilters.has(serviceName)) {
        // Remove filter if already active
        activeFilters.delete(serviceName);
        
        // Find and deactivate the corresponding filter button
        const filterButtons = filtersContainer.querySelectorAll('button');
        filterButtons.forEach(button => {
            if (button.textContent.includes(serviceName)) {
                button.className = button.className.replace('filter-btn-active', 'filter-btn');
            }
        });
    } else {
        // Add filter if not present
        activeFilters.add(serviceName);
        
        // Find and activate the corresponding filter button
        const filterButtons = filtersContainer.querySelectorAll('button');
        filterButtons.forEach(button => {
            if (button.textContent.includes(serviceName)) {
                button.className = button.className.replace('filter-btn', 'filter-btn-active');
            }
        });
    }
    
    // Regenerate filter buttons to show correct active states
    populateFilters();
    
    // Apply the filters and re-render to update tag states
    applyFilters();
}

// Toggle a category filter from workflow card (add if not present, remove if present)
function toggleCategoryFilterFromCard(categoryName) {
    // Expand category filters if collapsed
    if (categoryFiltersContainer.classList.contains('hidden')) {
        toggleCategoryFiltersVisibility();
    }
    
    if (activeCategoryFilters.has(categoryName)) {
        // Remove filter if already active
        activeCategoryFilters.delete(categoryName);
        
        // Find and deactivate the corresponding filter button
        const filterButtons = categoryFiltersContainer.querySelectorAll('button');
        filterButtons.forEach(button => {
            if (button.textContent.includes(categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))) {
                button.className = button.className.replace('filter-btn-active', 'filter-btn');
            }
        });
    } else {
        // Add filter if not present
        activeCategoryFilters.add(categoryName);
        
        // Find and activate the corresponding filter button
        const filterButtons = categoryFiltersContainer.querySelectorAll('button');
        filterButtons.forEach(button => {
            if (button.textContent.includes(categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))) {
                button.className = button.className.replace('filter-btn', 'filter-btn-active');
            }
        });
    }
    
    // Regenerate category filter buttons to show correct active states
    populateCategoryFilters();
    
    // Apply the filters and re-render to update tag states
    applyFilters();
}

// Add a service filter programmatically (used internally)
function addServiceFilter(serviceName) {
    if (!activeFilters.has(serviceName)) {
        toggleServiceFilter(serviceName);
    }
}

// Create a workflow card element
function createWorkflowCard(workflow) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200';
    
    const categoryBadge = createCategoryBadge(workflow.category);
    const nodeBadges = workflow.nodes.map(node => createNodeBadge(node)).join('');
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 leading-tight">${escapeHtml(workflow.name)}</h3>
            ${categoryBadge}
        </div>
        
        <div class="mb-4">
            <div class="flex flex-wrap gap-1">
                ${nodeBadges}
            </div>
        </div>
        
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">${workflow.nodes.length} services</span>
            <a 
                href="${workflow.fileUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-n8n-red text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                View on GitHub
            </a>
        </div>
    `;
    
    return card;
}

// Create category badge
function createCategoryBadge(category) {
    const categoryColors = {
        'analytics': 'bg-blue-100 text-blue-800',
        'api-webhooks': 'bg-green-100 text-green-800',
        'automation': 'bg-purple-100 text-purple-800',
        'communication': 'bg-yellow-100 text-yellow-800',
        'data-integration': 'bg-indigo-100 text-indigo-800',
        'data-transformation': 'bg-pink-100 text-pink-800',
        'document-processing': 'bg-gray-100 text-gray-800'
    };
    
    const isActive = activeCategoryFilters.has(category);
    const baseColorClass = categoryColors[category] || 'bg-gray-100 text-gray-800';
    const activeClass = isActive ? 'bg-n8n-red text-white' : baseColorClass;
    const displayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `<button class="px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200 cursor-pointer hover:bg-n8n-red hover:text-white ${activeClass}" data-category="${escapeHtml(category)}">${displayName}</button>`;
}

// Create node/service badge
function createNodeBadge(node) {
    const isActive = activeFilters.has(node);
    const baseClasses = "inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 mb-1 transition-colors duration-200 cursor-pointer";
    const activeClasses = isActive ? "bg-n8n-red text-white" : "bg-gray-100 text-gray-700 hover:bg-n8n-red hover:text-white";
    
    return `<button class="${baseClasses} ${activeClasses}" data-service="${escapeHtml(node)}">${escapeHtml(node)}</button>`;
}

// Show no results message
function showNoResults() {
    resultsGrid.innerHTML = '';
    noResults.classList.remove('hidden');
}

// Show/hide loading state
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
        resultsGrid.classList.add('hidden');
        noResults.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        resultsGrid.classList.remove('hidden');
    }
}

// Show error message
function showError(message) {
    showLoading(false);
    resultsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-red-500 text-lg font-medium">${message}</div>
        </div>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some keyboard shortcuts info
function addKeyboardShortcuts() {
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.className = 'fixed bottom-4 right-4 bg-gray-800 text-white text-xs p-2 rounded opacity-75 hover:opacity-100 transition-opacity';
    shortcutsInfo.innerHTML = `
        <div class="font-medium mb-1">Keyboard shortcuts:</div>
        <div>/ - Focus search</div>
        <div>Esc - Clear all</div>
    `;
    document.body.appendChild(shortcutsInfo);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    addKeyboardShortcuts();
});