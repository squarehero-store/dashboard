/**
 * SquareHero Real Estate Listings Plugin - Property Manager Module
 * This file handles the property management tab functionality with optimized data storage
 */

// Use a self-executing function to avoid global variable conflicts
(function() {
    console.log("✓ PROPERTY MANAGER SCRIPT LOADED");
    
    // Create the PropertyManager object in a new scope
    const PropertyManager = {
        // Flag to track initialization state
        initialized: false,
        
        /**
         * Initialize the property manager
         * This is called by the custom component handler when the script is loaded
         */
        initialize: function(containerId) {
            console.log('Initializing property manager in container:', containerId);
            
            // Find the container element
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container element with ID ${containerId} not found!`);
                return;
            }
            
            // Prevent re-initialization
            if (this.initialized && container.getAttribute('data-initialized') === 'true') {
                console.log('Property manager already initialized, skipping initialization');
                
                // Just update the view if needed
                if (this.propertyDataManager) {
                    this.propertyDataManager.renderProperties();
                }
                
                return;
            }
            
            // Clear the loading indicator
            container.innerHTML = '';
            
            // Create the property management UI
            this.createPropertyManagerUI(container);
            
            // Load CSS for property management
            this.loadStyles();
            
            // Initialize the property data manager
            this.initPropertyDataManager(container);
            
            // Mark as initialized
            this.initialized = true;
            container.setAttribute('data-initialized', 'true');
        },
        
        /**
         * Update view without full reinitialization
         * This is called when switching back to the properties tab
         */
        updateView: function() {
            console.log('Updating property manager view');
            
            if (this.propertyDataManager) {
                // Just re-render with existing data
                this.propertyDataManager.renderProperties();
            }
        },
        
        /**
         * Create the property management UI
         */
        createPropertyManagerUI: function(container) {
            container.innerHTML = `
                <div class="property-management-container">
                    <div class="property-toolbar">
                        <div class="property-toolbar-left">
                            <div class="view-toggles">
                                <button type="button" class="button view-toggle active" data-view="grid">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M0 0h7v7H0V0zm9 0h7v7H9V0zM0 9h7v7H0V9zm9 0h7v7H9V9z"/>
                                    </svg>
                                    Grid
                                </button>
                                <button type="button" class="button view-toggle" data-view="list">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M0 1h16v2H0V1zm0 6h16v2H0V7zm0 6h16v2H0v-2z"/>
                                    </svg>
                                    List
                                </button>
                            </div>
                        </div>
                        <div class="property-toolbar-right">
                            <div class="search-filter">
                                <input type="text" placeholder="Search properties..." class="property-search">
                                <select class="property-filter">
                                    <option value="all">All Properties</option>
                                    <option value="Ready to Buy">Ready to Buy</option>
                                    <option value="Under Construction">Under Construction</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div id="properties-container" class="properties-grid">
                        <div class="loading-properties">
                            <p>Loading properties...</p>
                        </div>
                    </div>
                    
                    <div class="property-editor-panel" style="display: none;">
                        <div class="editor-header">
                            <h3>Edit Property</h3>
                            <button type="button" class="close-editor">&times;</button>
                        </div>
                        <div class="editor-content">
                            <form id="property-edit-form">
                                <!-- Form will be dynamically populated -->
                            </form>
                        </div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Load CSS styles for property management
         */
        loadStyles: function() {
            if (document.querySelector('link[href="plugins/real-estate-listings/property-manager.css"]')) {
                return;
            }
            
            console.log('Loading property manager CSS');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'plugins/real-estate-listings/property-manager.css';
            document.head.appendChild(link);
        },
        
        /**
         * Mark that there are unsaved changes
         * Uses the Dashboard's notification system API
         */
        markUnsavedChanges: function() {
            if (window.Dashboard && typeof window.Dashboard.markUnsavedChanges === 'function') {
                console.log('Marking unsaved changes via Dashboard API');
                window.Dashboard.markUnsavedChanges(true);
            } else {
                console.error('Dashboard.markUnsavedChanges method not available');
            }
        },
        
        /**
         * Initialize property data manager
         */
        initPropertyDataManager: function(container) {
            const self = this;
            
            this.propertyDataManager = {
                // DOM elements
                elements: {
                    container: container.querySelector('#properties-container'),
                    toolbar: container.querySelector('.property-toolbar'),
                    searchInput: container.querySelector('.property-search'),
                    filterSelect: container.querySelector('.property-filter'),
                    viewToggles: container.querySelectorAll('.view-toggle'),
                    editorPanel: container.querySelector('.property-editor-panel'),
                    editForm: container.querySelector('#property-edit-form'),
                    closeEditor: container.querySelector('.close-editor')
                },
                
                // Data and cache state
                properties: [],           // Full Squarespace property objects
                propertyDetails: {},      // Just the custom details indexed by property ID
                filteredProperties: [],   // Filtered view of properties
                currentView: 'grid',
                currentProperty: null,
                dataLoaded: false,        // Flag to track if data has been loaded
                lastLoadTime: 0,          // Timestamp of last data load
                cacheLifetime: 5 * 60 * 1000, // Cache lifetime in ms (5 minutes)
                
                // Helper method to mark changes
                markUnsavedChanges: function() {
                    self.markUnsavedChanges();
                },
                
                // Initialize
                init: async function() {
                    try {
                        console.log('Initializing property data manager');
                        
                        // Try to load properties
                        await this.loadProperties();
                        
                        // Bind event handlers
                        this.bindEventHandlers();
                        
                        // Render properties
                        this.renderProperties();
                        
                        console.log('Property data manager initialized successfully');
                    } catch (error) {
                        console.error('Error initializing property data manager:', error);
                    }
                },
                
                // Load properties from both Squarespace and Firebase
                loadProperties: async function() {
                    let skeletonLoader = null;
                    
                    try {
                        // Check if we have cached data that's still valid
                        const now = Date.now();
                        const cacheValid = this.dataLoaded && 
                            (now - this.lastLoadTime < this.cacheLifetime);
                        
                        // Log cache status for debugging
                        console.log('Cache status:', {
                            dataLoaded: this.dataLoaded,
                            timeSinceLastLoad: this.dataLoaded ? ((now - this.lastLoadTime) / 1000).toFixed(1) + 's' : 'n/a',
                            cacheLifetime: (this.cacheLifetime / 1000) + 's',
                            cacheValid: cacheValid
                        });
                        
                        if (cacheValid) {
                            console.log('Using cached property data, last loaded:', 
                                new Date(this.lastLoadTime).toLocaleTimeString());
                                
                            // Important: Render the properties from cache first
                            this.renderProperties();
                            
                            return this.properties;
                        }
                        
                        // Show skeleton loading only if we don't have cached data
                        if (!this.dataLoaded) {
                            if (window.SkeletonLoader) {
                                console.log('Using skeleton loader for properties');
                                skeletonLoader = window.SkeletonLoader.show('properties-container', 'propertyCard', 6);
                            } else {
                                console.log('Skeleton loader not available, using simple loading UI');
                                this.elements.container.innerHTML = '<div class="loading-properties"><p>Loading properties...</p></div>';
                            }
                        }
                        
                        // First load the base property data from Squarespace JSON
                        const jsonPath = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/plugins/real-estate-listings/properties-data.json';
                        const response = await fetch(jsonPath);
                        
                        if (!response.ok) {
                            throw new Error(`Failed to load properties JSON. Status: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        
                        if (!data || !data.items || !Array.isArray(data.items)) {
                            throw new Error('Invalid property data structure');
                        }
                        
                        // Store the full Squarespace property data
                        this.properties = data.items;
                        
                        // Then try to load custom property details from Firebase
                        let customDetails = {};
                        
                        if (window.Dashboard && window.Dashboard.FirebaseService) {
                            try {
                                // Load settings from Firebase
                                const settings = await window.Dashboard.FirebaseService.getPluginSettings('real-estate-listings');
                                
                                if (settings && settings.propertyDetails && typeof settings.propertyDetails === 'object') {
                                    console.log('Loaded property details from Firebase:', 
                                        Object.keys(settings.propertyDetails).length, 'properties');
                                    customDetails = settings.propertyDetails;
                                }
                            } catch (error) {
                                console.warn('Error loading property details from Firebase:', error);
                            }
                        }
                        
                        // Store the custom details indexed by property ID
                        this.propertyDetails = customDetails;
                        
                        // Initialize filtered properties
                        this.filteredProperties = [...this.properties];
                        
                        // Update cache metadata
                        this.dataLoaded = true;
                        this.lastLoadTime = Date.now();
                        
                        // Hide skeleton loading
                        if (skeletonLoader) {
                            skeletonLoader.hide();
                        }
                        
                        return this.properties;
                    } catch (error) {
                        console.error('Error loading properties:', error);
                        
                        // Hide skeleton loading if it was showing
                        if (skeletonLoader) {
                            skeletonLoader.hide();
                        }
                        
                        this.properties = [];
                        this.filteredProperties = [];
                        this.dataLoaded = false;
                        
                        // Show error in UI
                        if (this.elements.container) {
                            this.elements.container.innerHTML = `
                                <div class="error-message">
                                    <p>Error loading properties: ${error.message}</p>
                                </div>
                            `;
                        }
                        
                        return [];
                    }
                },
                
                // Add a method to force reload when needed
                forceReload: function() {
                    this.dataLoaded = false;
                    this.lastLoadTime = 0;
                    this.loadProperties().then(() => {
                        this.renderProperties();
                    });
                },
                
                // Bind event handlers
                bindEventHandlers: function() {
                    // View toggle buttons
                    this.elements.viewToggles.forEach(toggle => {
                        toggle.addEventListener('click', (e) => {
                            // Remove active class from all toggles
                            this.elements.viewToggles.forEach(btn => btn.classList.remove('active'));
                            
                            // Add active class to clicked toggle
                            e.currentTarget.classList.add('active');
                            
                            // Update current view
                            this.currentView = e.currentTarget.getAttribute('data-view');
                            
                            // Re-render properties
                            this.renderProperties();
                        });
                    });
                    
                    // Search input
                    this.elements.searchInput.addEventListener('input', (e) => {
                        this.searchProperties(e.target.value);
                    });
                    
                    // Filter select
                    this.elements.filterSelect.addEventListener('change', (e) => {
                        this.filterProperties(e.target.value);
                    });
                    
                    // Close editor button
                    if (this.elements.closeEditor) {
                        this.elements.closeEditor.addEventListener('click', () => {
                            this.closeEditor();
                        });
                    }
                },
                
                // Search properties by title or location
                searchProperties: function(query) {
                    if (!query) {
                        this.filteredProperties = [...this.properties];
                    } else {
                        const lowerQuery = query.toLowerCase();
                        this.filteredProperties = this.properties.filter(property => {
                            return property.title.toLowerCase().includes(lowerQuery) ||
                                (property.tags && property.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
                        });
                    }
                    
                    this.renderProperties();
                },
                
                // Filter properties by category
                filterProperties: function(filter) {
                    if (filter === 'all') {
                        this.filteredProperties = [...this.properties];
                    } else {
                        this.filteredProperties = this.properties.filter(property => {
                            return property.categories && property.categories.includes(filter);
                        });
                    }
                    
                    this.renderProperties();
                },
                
                // Get property details including any custom data
                getPropertyDetails: function(property) {
                    // Get property ID
                    const propertyId = property.id;
                    
                    // Get custom details if they exist
                    const customDetails = this.propertyDetails[propertyId] || {};
                    
                    // Get details from Squarespace if they're not in custom details
                    let bedrooms = customDetails.bedrooms;
                    let bathrooms = customDetails.bathrooms;
                    let area = customDetails.area;
                    let year = customDetails.year;
                    let price = customDetails.price;
                    
                    // If we don't have custom details, try to extract from Squarespace data
                    if (!bedrooms) bedrooms = this.extractValueFromContent(property.body, 'Bedrooms');
                    if (!bathrooms) bathrooms = this.extractValueFromContent(property.body, 'Bathrooms');
                    if (!area) area = this.extractValueFromContent(property.body, 'Area');
                    if (!year) year = this.extractValueFromContent(property.body, 'Year Built');
                    
                    // Extract price from excerpt if not in custom details
                    if (!price && property.excerpt) {
                        const priceMatch = property.excerpt.match(/\$([0-9,]+)/);
                        if (priceMatch && priceMatch[1]) {
                            price = priceMatch[1].replace(/,/g, '');
                        }
                    }
                    
                    return {
                        bedrooms,
                        bathrooms,
                        area,
                        year,
                        price
                    };
                },
                
                // Render properties based on current view
                renderProperties: function() {
                    const container = this.elements.container;
                    if (!container) {
                        console.error('Properties container not found');
                        return;
                    }
                    
                    // Clear the container
                    container.innerHTML = '';
                    
                    if (!this.filteredProperties || this.filteredProperties.length === 0) {
                        container.innerHTML = '<div class="no-properties">No properties found matching your criteria.</div>';
                        return;
                    }
                    
                    // Set the container class based on the current view
                    if (this.currentView === 'grid') {
                        container.className = 'properties-grid';
                        this.filteredProperties.forEach(property => {
                            container.appendChild(this.createGridItem(property));
                        });
                    } else {
                        container.className = 'properties-list';
                        this.filteredProperties.forEach(property => {
                            container.appendChild(this.createGridItem(property));
                        });
                    }
                    
                    console.log(`Rendered ${this.filteredProperties.length} properties in ${this.currentView} view`);
                },
                
                // Create a grid view item
                createGridItem: function(property) {
                    const item = document.createElement('div');
                    item.className = 'property-grid-item';
                    item.setAttribute('data-id', property.id);
                    
                    // Get the main image URL
                    const imageUrl = property.assetUrl || 'https://placehold.co/400x300?text=No+Image';
                    
                    // Get property details
                    const location = property.tags && property.tags.length > 0 ? property.tags[0] : '';
                    const status = property.categories && property.categories.length > 0 ? property.categories[0] : '';
                    
                    // Get property details including custom data
                    const details = this.getPropertyDetails(property);
                    
                    // Format price if available
                    let priceDisplay = 'Price TBA';
                    if (details.price) {
                        priceDisplay = '$' + parseInt(details.price).toLocaleString();
                    }
                    
                    // SVG definitions for property icons
                    const areaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="none" viewBox="0 0 18 17"><g fill="currentColor" clip-path="url(#areaClip)"><path d="M.364 3.203 0 2.839 2.202.638l2.202 2.201-.363.364a.794.794 0 0 1-1.122 0l-.717-.715-.714.715a.794.794 0 0 1-1.124 0Z"/><path d="M16.855 15.016H1.548V1.563h1.308v12.144h14v1.309Z"/><path d="m15.58 16.564-.364-.364a.794.794 0 0 1 0-1.121l.714-.715-.714-.715a.794.794 0 0 1 0-1.122l.363-.363 2.202 2.202-2.202 2.198ZM16.119 11.598h-.634a.654.654 0 0 1 0-1.308h.634c.192 0 .347-.14.347-.317v-.614a.654.654 0 1 1 1.309 0v.614c0 .896-.743 1.625-1.656 1.625ZM13.063 11.599H9.727a.654.654 0 1 1 0-1.309h3.336a.654.654 0 0 1 0 1.309ZM7.251 11.598h-.633c-.913 0-1.657-.729-1.657-1.625v-.614a.654.654 0 1 1 1.309 0v.614c0 .175.156.317.348.317h.633a.654.654 0 1 1 0 1.309ZM5.616 7.727a.654.654 0 0 1-.655-.654V5.17a.654.654 0 1 1 1.309 0v1.904a.654.654 0 0 1-.654.654ZM5.616 3.537a.654.654 0 0 1-.655-.654v-.614c0-.896.744-1.625 1.657-1.625h.633a.654.654 0 0 1 0 1.308h-.633c-.192 0-.348.14-.348.317v.614a.654.654 0 0 1-.654.654ZM13.01 1.952H9.674a.654.654 0 0 1 0-1.308h3.337a.654.654 0 0 1 0 1.308ZM17.12 3.537a.654.654 0 0 1-.654-.654v-.614c0-.175-.155-.317-.347-.317h-.634a.654.654 0 1 1 0-1.308h.634c.913 0 1.656.729 1.656 1.625v.614a.654.654 0 0 1-.654.654ZM17.12 7.727a.655.655 0 0 1-.654-.654V5.17a.654.654 0 1 1 1.309 0v1.904a.654.654 0 0 1-.654.654Z"/></g><defs><clipPath id="areaClip"><path fill="#fff" d="M0 .65h17.759v15.89H0z"/></clipPath></defs></svg>`;
                    
                    const bedsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" fill="none" viewBox="0 0 23 21"><g clip-path="url(#bedsClip)"><path fill="currentColor" d="M2.735 4.856a.907.907 0 0 0-.95-.906.923.923 0 0 0-.863.93v12.09h1.814v-3.627h4.532V9.716H2.735v-4.86Zm16.1 1.66H8.174v6.827h12.022V7.875a1.36 1.36 0 0 0-1.36-1.36Zm3.085 3.2h-.819v7.254h1.814v-6.26a.994.994 0 0 0-.995-.994ZM5.573 5.613a1.814 1.814 0 1 0-.237 3.62 1.814 1.814 0 0 0 .237-3.62Z"/></g><defs><clipPath id="bedsClip"><path fill="#fff" d="M.685.65h22.23v19.89H.685z"></path></clipPath></defs></svg>`;
                    
                    const bathsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" fill="none" viewBox="0 0 19 17"><g fill="currentColor" clip-path="url(#bathsClip)"><path d="M13.361 6.618a.389.389 0 1 0 0 .778.389.389 0 0 0 0-.778Zm-1.553-1.166a.388.388 0 1 0 .147.028.389.389 0 0 0-.15-.029l.003.001Zm-.196 1.166a.389.389 0 1 0 0 .778.389.389 0 0 0 0-.778Zm1.749-1.166a.389.389 0 1 0-.001.78.389.389 0 0 0 .001-.78Zm2.137-1.165H11.03a.389.389 0 1 0 0 .777h4.468a.39.39 0 1 0 0-.777ZM15.304.594a2.717 2.717 0 0 0-2.249 1.19 2.135 2.135 0 0 0-1.831 2.113h4.274a2.136 2.136 0 0 0-1.537-2.05 1.981 1.981 0 0 1 1.343-.524c.95 0 1.942.686 1.942 1.991v4.471h.778v-4.47a2.72 2.72 0 0 0-2.72-2.72Zm.194 6.412a.388.388 0 1 0-.777-.001.388.388 0 0 0 .777 0Zm-.194-1.166a.39.39 0 0 0-.664-.275.389.389 0 1 0 .664.275ZM1.537 11.722a3.477 3.477 0 0 0 1.75 3.018l-.889.889a.566.566 0 1 0 .8.8l1.274-1.273c.18.03.363.045.545.046h9.53c.182 0 .364-.017.545-.046l1.273 1.273a.565.565 0 1 0 .8-.8l-.889-.89a3.478 3.478 0 0 0 1.752-3.017v-1.393H1.537v1.393Zm.696-3.133h-.696a.696.696 0 0 0-.696.696v.348h17.882v-.348a.696.696 0 0 0-.696-.696H2.233Z"/></g><defs><clipPath id="bathsClip"><path fill="#fff" d="M.84.594h17.883v16H.84z"></path></clipPath></defs></svg>`;
                    
                    const yearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
                    
                    // Basic card structure with status on image and edit button
                    item.innerHTML = `
                        <div class="property-image">
                            <img src="${imageUrl}" alt="${property.title}">
                            ${status ? `<span class="property-category">${status}</span>` : ''}
                            <div class="property-actions">
                                <button type="button" class="edit-property" title="Edit Property">Edit</button>
                            </div>
                        </div>
                        <div class="listing-content">
                            <h3 class="property-title">${property.title}</h3>
                            <p class="property-location">${location}</p>
                            <p class="property-price">${priceDisplay}</p>
                            <div class="property-details">
                                ${details.area ? `<span class="details-icon">${areaSvg} <span>${details.area} sq ft</span></span>` : ''}
                                ${details.bedrooms ? `<span class="details-icon">${bedsSvg} <span>${details.bedrooms}</span></span>` : ''}
                                ${details.bathrooms ? `<span class="details-icon">${bathsSvg} <span>${details.bathrooms}</span></span>` : ''}
                                ${details.year ? `<span class="details-icon">${yearSvg} <span>${details.year}</span></span>` : ''}
                            </div>
                        </div>
                    `;
                    
                    // Add event listener to edit button
                    const editButton = item.querySelector('.edit-property');
                    editButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openEditor(property);
                    });
                    
                    // Make the entire card clickable
                    item.addEventListener('click', () => {
                        this.openEditor(property);
                    });
                    
                    return item;
                },
                
                // Extract value from content
                extractValueFromContent: function(content, fieldName) {
                    if (!content) return '';
                    
                    // Try to find the field in the content
                    const regex = new RegExp(`${fieldName}\\s*:\\s*([\\d.]+)`, 'i');
                    const match = content.match(regex);
                    
                    return match && match[1] ? match[1].trim() : '';
                },
                
                // Open property editor
                openEditor: function(property) {
                    console.log('Opening editor for property:', property.title);
                    this.currentProperty = property;
                    
                    // Get DOM elements
                    const form = this.elements.editForm;
                    
                    // Clear form
                    form.innerHTML = '';
                    
                    // Get property details including custom data
                    const details = this.getPropertyDetails(property);
                    
                    // Build form fields - using standard setting component layouts
                    form.innerHTML = `
                        <div class="form-group form-group-full">
                            <label for="property-title">Property Title</label>
                            <input type="text" id="property-title" value="${property.title || ''}" class="setting-input" readonly>
                            <p class="setting-help">Property title from Squarespace (read-only)</p>
                        </div>
                        
                        <div class="form-group form-group-half">
                            <label for="property-status">Status</label>
                            <select id="property-status" class="setting-input" disabled>
                                <option value="Ready to Buy" ${(property.categories && property.categories.includes('Ready to Buy')) ? 'selected' : ''}>Ready to Buy</option>
                                <option value="Under Construction" ${(property.categories && property.categories.includes('Under Construction')) ? 'selected' : ''}>Under Construction</option>
                                <option value="Sold" ${(property.categories && property.categories.includes('Sold')) ? 'selected' : ''}>Sold</option>
                            </select>
                            <p class="setting-help">Status from Squarespace categories (read-only)</p>
                        </div>
                        
                        <div class="form-group form-group-half">
                            <label for="property-location">Location</label>
                            <select id="property-location" class="setting-input" disabled>
                                <option value="Raleigh, NC" ${(property.tags && property.tags.includes('Raleigh, NC')) ? 'selected' : ''}>Raleigh, NC</option>
                                <option value="Wilmington, NC" ${(property.tags && property.tags.includes('Wilmington, NC')) ? 'selected' : ''}>Wilmington, NC</option>
                                <option value="Asheville, NC" ${(property.tags && property.tags.includes('Asheville, NC')) ? 'selected' : ''}>Asheville, NC</option>
                                <option value="Charlotte, NC" ${(property.tags && property.tags.includes('Charlotte, NC')) ? 'selected' : ''}>Charlotte, NC</option>
                            </select>
                            <p class="setting-help">Location from Squarespace tags (read-only)</p>
                        </div>
                        
                        <div class="form-group form-group-half">
                            <label for="property-price">Price ($)</label>
                            <input type="number" id="property-price" value="${details.price || ''}" class="setting-input" min="0" step="1000">
                        </div>
                        
                        <h3 class="settings-section-title">Property Details</h3>
                        
                        <div class="form-group form-group-quarter">
                            <label for="property-bedrooms">Bedrooms</label>
                            <div class="slider-container">
                                <input type="range" id="property-bedrooms" value="${details.bedrooms || 0}" min="0" max="10" step="1" class="slider-input">
                                <span class="slider-value">${details.bedrooms || 0}</span>
                            </div>
                        </div>
                        
                        <div class="form-group form-group-quarter">
                            <label for="property-bathrooms">Bathrooms</label>
                            <div class="slider-container">
                                <input type="range" id="property-bathrooms" value="${details.bathrooms || 0}" min="0" max="10" step="0.5" class="slider-input">
                                <span class="slider-value">${details.bathrooms || 0}</span>
                            </div>
                        </div>
                        
                        <div class="form-group form-group-quarter">
                            <label for="property-area">Area (sq ft)</label>
                            <input type="number" id="property-area" value="${details.area || ''}" class="setting-input" min="0" step="100">
                        </div>
                        
                        <div class="form-group form-group-quarter">
                            <label for="property-year">Year Built</label>
                            <input type="number" id="property-year" value="${details.year || ''}" class="setting-input" min="1900" max="2100">
                        </div>
                    `;
                    
                    // Add change handlers to inputs
                    this.bindEditorEvents(form);
                    
                    // Show the editor panel
                    this.elements.editorPanel.style.display = 'block';
                    this.elements.container.style.display = 'none';
                    this.elements.toolbar.style.display = 'none';
                },
                
                // Bind events to the editor form
                bindEditorEvents: function(form) {
                    // Add input change handlers to ALL form inputs
                    const formInputs = form.querySelectorAll('input:not([readonly]), select:not([disabled]), textarea');
                    formInputs.forEach(input => {
                        const eventType = input.type === 'range' ? 'input' : 'change';
                        
                        input.addEventListener(eventType, () => {
                            // Update slider value displays
                            if (input.type === 'range') {
                                const valueDisplay = input.nextElementSibling;
                                if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
                                    valueDisplay.textContent = input.value;
                                }
                            }
                            
                            // Mark changes in Dashboard notification system
                            this.markUnsavedChanges();
                        });
                    });
                },
                
                // Close the editor
                closeEditor: function() {
                    if (this.elements.editorPanel) {
                        this.elements.editorPanel.style.display = 'none';
                    }
                    
                    if (this.elements.container) {
                        this.elements.container.style.display = this.currentView === 'grid' ? 'grid' : 'block';
                    }
                    
                    if (this.elements.toolbar) {
                        this.elements.toolbar.style.display = 'flex';
                    }
                    
                    this.currentProperty = null;
                },
                
                // Apply property changes (called from Dashboard's save mechanism)
                applyChanges: function() {
                    if (!this.currentProperty) return false;
                    
                    // Get property ID
                    const propertyId = this.currentProperty.id;
                    
                    // Get form values
                    const form = this.elements.editForm;
                    const priceInput = form.querySelector('#property-price');
                    const bedroomsInput = form.querySelector('#property-bedrooms');
                    const bathroomsInput = form.querySelector('#property-bathrooms');
                    const areaInput = form.querySelector('#property-area');
                    const yearInput = form.querySelector('#property-year');
                    
                    // Create or update property details
                    if (!this.propertyDetails[propertyId]) {
                        this.propertyDetails[propertyId] = {};
                    }
                    
                    // Always store the title for reference
                    this.propertyDetails[propertyId].title = this.currentProperty.title;
                    
                    // Only save fields that have values to keep data size minimal
                    if (priceInput.value) this.propertyDetails[propertyId].price = priceInput.value;
                    if (bedroomsInput.value && bedroomsInput.value !== '0') this.propertyDetails[propertyId].bedrooms = bedroomsInput.value;
                    if (bathroomsInput.value && bathroomsInput.value !== '0') this.propertyDetails[propertyId].bathrooms = bathroomsInput.value;
                    if (areaInput.value) this.propertyDetails[propertyId].area = areaInput.value;
                    if (yearInput.value) this.propertyDetails[propertyId].year = yearInput.value;
                    
                    // Close editor and re-render properties
                    this.closeEditor();
                    this.renderProperties();
                    
                    // Save the property details to Firebase
                    this.savePropertyDetails();
                    
                    return true;
                },
                
                // Save property details to Firebase
                savePropertyDetails: function() {
                    if (window.Dashboard && window.Dashboard.FirebaseService) {
                        // Get current settings
                        window.Dashboard.FirebaseService.getPluginSettings('real-estate-listings')
                            .then(settings => {
                                // Create new settings object with our property details
                                const newSettings = {
                                    ...settings,
                                    propertyDetails: this.propertyDetails
                                };
                                
                                // Update Firebase settings
                                window.Dashboard.FirebaseService.updatePluginSettings(
                                    'real-estate-listings',
                                    newSettings
                                ).then(success => {
                                    if (success) {
                                        console.log('Property details saved to Firebase successfully');
                                    } else {
                                        console.error('Failed to save property details to Firebase');
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Error getting current settings:', error);
                            });
                    } else {
                        console.warn('Firebase service not available, property details stored in memory only');
                    }
                },
                
                // Register properties with Dashboard's custom component registry
                registerProperties: function() {
                    if (window.Dashboard && window.Dashboard.CustomComponentDataRegistry) {
                        window.Dashboard.CustomComponentDataRegistry.register(
                            'real-estate-listings',
                            'property-manager',
                            this.propertyDetails
                        );
                        console.log('Registered property data with dashboard registry');
                    }
                }
            };
            
            // Initialize the property data manager
            this.propertyDataManager.init();
        },
        
        /**
         * Handle saving from the Dashboard's universal save button
         * @returns {boolean} Success status
         */
        onSaveHandler: function(allSettings) {
            console.log('Property Manager onSaveHandler called');
            
            // If property editor is open, apply those changes
            if (this.propertyDataManager && this.propertyDataManager.currentProperty) {
                return this.propertyDataManager.applyChanges();
            }
            
            return true;
        },
        
        /**
         * Get all property details in a format suitable for storage
         * This is called by the Dashboard when saving all settings
         */
        getPropertyDetails: function() {
            if (this.propertyDataManager && this.propertyDataManager.propertyDetails) {
                return this.propertyDataManager.propertyDetails;
            }
            return {};
        }
    };
    
    // Expose the PropertyManager globally
    window.PropertyManager = PropertyManager;
    
    // Register with Dashboard if available
    if (typeof window.Dashboard !== 'undefined') {
        console.log("Registering property manager with Dashboard");
        
        // Register the PropertyManager with the Dashboard
        window.Dashboard.PluginRegistry.register('real-estate-listings', 'settings', PropertyManager);
    }
    
    // Add a global initialize function that can be called from dashboard.js
    window.initPropertyManager = function() {
        console.log("Manual initialization requested");
        
        const container = document.getElementById('property-manager-container') || 
                          document.querySelector('.custom-component-container[data-component-id="property-manager"]');
        
        if (container) {
            console.log("Container found:", container.id);
            PropertyManager.initialize(container.id);
            return true;
        }
        
        console.error("Container not found during manual initialization");
        return false;
    };
    
    // Add global updateView function
    window.updatePropertyManager = function() {
        console.log("Update property manager view requested");
        if (PropertyManager.updateView) {
            PropertyManager.updateView();
            return true;
        }
        return false;
    };
    
    // Expose property details to the Dashboard
    window['property-managerValues'] = {
        getDetails: function() {
            if (PropertyManager.propertyDataManager && PropertyManager.propertyDataManager.propertyDetails) {
                return PropertyManager.propertyDataManager.propertyDetails;
            }
            return {};
        }
    };
    
    // Initialize the property manager when the script is loaded
    // This is a fallback in case the Dashboard doesn't call initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Look for the container
        const container = document.getElementById('property-manager-container') || 
                          document.querySelector('.custom-component-container[data-component-id="property-manager"]');
        
        if (container) {
            console.log("Auto-initializing PropertyManager on DOM content loaded");
            PropertyManager.initialize(container.id);
        }
    });
})();