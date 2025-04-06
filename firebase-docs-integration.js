/**
 * SquareHero Dashboard - Help Documentation Integration
 * This module connects to Firestore to provide plugin-specific help documentation
 */

// Only define HelpDocsManager if it doesn't already exist
if (!window.HelpDocsManager) {
    // Firebase Firestore Help Docs Integration
    window.HelpDocsManager = (function () {
        // Private variables
        let initialized = false;
        let db = null;

        // Initialize Firestore
        async function initialize() {
            if (initialized) return true;

            try {
                // Check if Firebase is already initialized through Dashboard
                if (!Dashboard.FirebaseService || !Dashboard.FirebaseService.isInitialized) {
                    console.error('Firebase service not initialized');
                    return false;
                }

                // Import Firestore
                const { getFirestore, collection, getDocs, query, orderBy, where } =
                    await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js");

                // Initialize Firestore with the existing Firebase app
                db = getFirestore(Dashboard.FirebaseService.app);

                console.log('Help Docs Manager initialized with Firestore');
                initialized = true;
                return true;
            } catch (error) {
                console.error('Error initializing Firestore:', error);
                return false;
            }
        }

        /**
         * Get all help docs for a specific plugin
         * @param {string} pluginId - The plugin ID
         * @returns {Promise<Array>} Array of help doc objects
         */
        async function getHelpDocs(pluginId) {
            if (!initialized) {
                const initResult = await initialize();
                if (!initResult) {
                    throw new Error('Failed to initialize Firestore');
                }
            }

            try {
                const { collection, getDocs, query, orderBy, where } =
                    await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js");

                // Query help docs for this plugin, ordered by creation date
                const docsRef = collection(db, 'plugins', pluginId, 'helpDocs');
                const q = query(docsRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                // Convert to array of objects
                const docs = [];
                querySnapshot.forEach((doc) => {
                    // Convert Firebase timestamp to JS date for easier handling
                    const data = doc.data();

                    // Format timestamp fields
                    if (data.createdAt) {
                        const createdDate = data.createdAt.toDate ?
                            data.createdAt.toDate() :
                            new Date(data.createdAt.seconds * 1000);
                        data.createdAtFormatted = createdDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }

                    docs.push({
                        id: doc.id,
                        ...data
                    });
                });

                console.log(`Retrieved ${docs.length} help docs for plugin ${pluginId}`);
                return docs;
            } catch (error) {
                console.error('Error getting help docs:', error);
                throw error;
            }
        }

        /**
         * Get all help docs across all plugins (for testing)
         * @returns {Promise<Array>} Array of help doc objects
         */
        async function getAllHelpDocs() {
            if (!initialized) {
                const initResult = await initialize();
                if (!initResult) {
                    throw new Error('Failed to initialize Firestore');
                }
            }

            try {
                const { collection, getDocs, collectionGroup, query, orderBy } =
                    await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js");

                // Use a collection group query to get all helpDocs across plugins
                const docsRef = collectionGroup(db, 'helpDocs');
                const q = query(docsRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                // Convert to array of objects
                const docs = [];
                querySnapshot.forEach((doc) => {
                    // Get the plugin ID from the reference path
                    const pathSegments = doc.ref.path.split('/');
                    const pluginId = pathSegments[1]; // plugins/{pluginId}/helpDocs/{docId}

                    // Convert Firebase timestamp to JS date
                    const data = doc.data();

                    // Format timestamp fields
                    if (data.createdAt) {
                        const createdDate = data.createdAt.toDate ?
                            data.createdAt.toDate() :
                            new Date(data.createdAt.seconds * 1000);
                        data.createdAtFormatted = createdDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }

                    docs.push({
                        id: doc.id,
                        pluginId,
                        ...data
                    });
                });

                console.log(`Retrieved ${docs.length} help docs across all plugins`);
                return docs;
            } catch (error) {
                console.error('Error getting all help docs:', error);
                throw error;
            }
        }

        // Return public API
        return {
            initialize,
            getHelpDocs,
            getAllHelpDocs
        };
    })();
}

// Only define HelpDocsUI if it doesn't already exist
if (!window.HelpDocsUI) {
    /**
     * Help Docs UI Manager - Handles the rendering and UI logic for help docs
     */
    window.HelpDocsUI = (function () {
        // Cached DOM elements
        let elements = {};

        // Initialize the UI manager
        function initialize() {
            // Cache DOM elements
            elements = {
                helpTabContent: document.createElement('div') // Will be created dynamically
            };

            return true;
        }

        /**
         * Create help documentation tab content
         * @param {Array} helpDocs - Array of help documentation objects
         * @returns {HTMLElement} The tab content element
         */
        function createHelpTabContent(helpDocs) {
            const container = document.createElement('div');
            container.className = 'help-docs-container';

            if (!helpDocs || helpDocs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                            <path d="M12 8v4"></path>
                            <path d="M12 16h.01"></path>
                        </svg>
                        <h3>No Help Documentation Found</h3>
                        <p>There are no help documents available for this plugin yet.</p>
                    </div>
                `;
                return container;
            }

            // Create search and filter elements
            const searchBar = document.createElement('div');
            searchBar.className = 'help-docs-search';
            searchBar.innerHTML = `
                <input type="text" placeholder="Search documentation..." class="help-search-input">
                <select class="help-category-filter">
                    <option value="all">All Categories</option>
                    <option value="getting-started">Getting Started</option>
                    <option value="installation">Installation</option>
                    <option value="configuration">Configuration</option>
                    <option value="customization">Customization</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="faq">FAQ</option>
                </select>
            `;
            container.appendChild(searchBar);

            // Create help docs list
            const docsList = document.createElement('div');
            docsList.className = 'help-docs-list';

            // Add each help doc
            helpDocs.forEach(doc => {
                const docItem = document.createElement('div');
                docItem.className = 'help-doc-item';
                docItem.dataset.docId = doc.id;
                docItem.dataset.category = doc.category || 'uncategorized';

                // Get the category label
                const categoryMap = {
                    'getting-started': 'Getting Started',
                    'installation': 'Installation',
                    'configuration': 'Configuration',
                    'customization': 'Customization',
                    'troubleshooting': 'Troubleshooting',
                    'faq': 'FAQ',
                    'uncategorized': 'General'
                };

                const categoryLabel = categoryMap[doc.category] || 'General';

                docItem.innerHTML = `
                    <div class="doc-header">
                        <span class="doc-category">${categoryLabel}</span>
                        <span class="doc-date">${doc.createdAtFormatted || 'Unknown date'}</span>
                    </div>
                    <h3 class="doc-title">${doc.title}</h3>
                    <div class="doc-excerpt">${doc.excerpt || ''}</div>
                    <div class="doc-actions">
                        <button class="view-doc-btn">Read Article</button>
                    </div>
                `;

                // Add click event to open the document
                docItem.querySelector('.view-doc-btn').addEventListener('click', () => {
                    viewHelpDoc(doc);
                });

                docsList.appendChild(docItem);
            });

            container.appendChild(docsList);

            // Add event listeners for search and filtering
            const searchInput = searchBar.querySelector('.help-search-input');
            searchInput.addEventListener('input', () => {
                filterDocs(docsList, searchInput.value, 'all');
            });

            const categoryFilter = searchBar.querySelector('.help-category-filter');
            categoryFilter.addEventListener('change', () => {
                filterDocs(docsList, searchInput.value, categoryFilter.value);
            });

            return container;
        }

        /**
         * Filter docs based on search term and category
         */
        function filterDocs(docsContainer, searchTerm, category) {
            const docs = docsContainer.querySelectorAll('.help-doc-item');

            searchTerm = searchTerm.toLowerCase();

            docs.forEach(doc => {
                const title = doc.querySelector('.doc-title').textContent.toLowerCase();
                const excerpt = doc.querySelector('.doc-excerpt').textContent.toLowerCase();
                const docCategory = doc.dataset.category;

                // Show/hide based on search term and category
                const matchesSearch = searchTerm === '' ||
                    title.includes(searchTerm) ||
                    excerpt.includes(searchTerm);

                const matchesCategory = category === 'all' || docCategory === category;

                doc.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
            });
        }

        /**
         * Display a help document in a modal
         */
        function viewHelpDoc(doc) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('help-doc-modal');

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'help-doc-modal';
                modal.className = 'help-doc-modal';

                modal.innerHTML = `
                    <div class="help-doc-modal-content">
                        <div class="help-doc-modal-header">
                            <h2 class="help-doc-modal-title"></h2>
                            <button class="help-doc-modal-close" title="Close">&times;</button>
                        </div>
                        <div class="help-doc-modal-body"></div>
                    </div>
                `;

                document.body.appendChild(modal);

                // Add close button event
                modal.querySelector('.help-doc-modal-close').addEventListener('click', () => {
                    modal.classList.remove('visible');
                });

                // Add close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modal.classList.contains('visible')) {
                        modal.classList.remove('visible');
                    }
                });

                // Add close on click outside modal
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('visible');
                    }
                });
            }

            // Update modal content
            modal.querySelector('.help-doc-modal-title').textContent = doc.title;
            modal.querySelector('.help-doc-modal-body').innerHTML = doc.content || '';

            // Show modal
            modal.classList.add('visible');
        }

        /**
         * Create a tab for Help & Guides in the settings panel
         */
        function addHelpTab(pluginId, schema) {
            // Check if schema already has a guides category
            const hasGuidesCategory = schema.some(item =>
                item.type === 'category' && item.id === 'guides');

            // If it already has a guides category, don't add another one
            if (hasGuidesCategory) {
                return schema;
            }

            // Add the guides category to the schema
            schema.push({
                type: 'category',
                id: 'guides',
                label: 'Help & Guides',
                components: [
                    {
                        type: 'custom',
                        id: 'help-docs-container',
                        label: 'Help Documentation'
                    }
                ]
            });

            return schema;
        }

        // Return public API
        return {
            initialize,
            createHelpTabContent,
            viewHelpDoc,
            addHelpTab
        };
    })();
}

// Extension for Dashboard plugin settings to add help docs tab
(function () {
    // Don't run if already initialized
    if (window.helpDocsIntegrationInitialized) {
        return;
    }

    // Original function reference
    const originalRegister = Dashboard.PluginSettingsRegistry.register;

    // Override the register function to add the help docs tab
    Dashboard.PluginSettingsRegistry.register = function (pluginId, schema, handlers = {}) {
        // Add Help & Guides tab
        const extendedSchema = window.HelpDocsUI.addHelpTab(pluginId, schema);

        // Call the original function with the extended schema
        originalRegister.call(this, pluginId, extendedSchema, handlers);
    };

    // Fix for the loadPluginSettingsModule function to expose the active panel globally
    if (Dashboard && Dashboard.loadPluginSettingsModule) {
        const originalLoadPluginSettingsModule = Dashboard.loadPluginSettingsModule;
        
        Dashboard.loadPluginSettingsModule = function(pluginId) {
            // Call the original function
            originalLoadPluginSettingsModule.call(this, pluginId);
            
            // Explicitly set and expose the active panel ID globally
            window.activePanel = pluginId;
            console.log('Active panel ID globally exposed:', window.activePanel);
        };
    }

    // Add an initialization function for the help docs container
    window.initHelpDocsContainer = async function () {
        try {
            const container = document.querySelector('.custom-component-container[data-component-id="help-docs-container"]');
            if (!container) {
                console.error('Help docs container not found');
                return;
            }

            // Show loading state
            container.innerHTML = `
                <div class="loading-indicator">
                    <div class="loading-spinner"></div>
                    <p>Loading help documentation...</p>
                </div>
            `;

            // Get the active plugin ID using multiple methods for better reliability
            let pluginId = window.activePanel; // First check our new global variable
            
            if (!pluginId) {
                // Try the Dashboard's activePanel property
                pluginId = window.Dashboard?.activePanel;
            }
            
            if (!pluginId) {
                // Clear error message and show debugging info
                container.innerHTML = '<p>Trying to detect active plugin...</p>';
                console.log('Active panel not found in window.activePanel or window.Dashboard.activePanel');

                // Try getting from the settings panel element
                const settingsPanel = document.querySelector('.settings-panel.visible');
                if (settingsPanel) {
                    // Check for data attribute
                    if (settingsPanel.hasAttribute('data-plugin-id')) {
                        pluginId = settingsPanel.getAttribute('data-plugin-id');
                        console.log('Found plugin ID from panel attribute:', pluginId);
                    } else {
                        // Since we don't have the ID in the DOM, look for it in the title
                        const panelTitle = document.getElementById('plugin-settings-title');
                        if (panelTitle) {
                            const title = panelTitle.textContent.trim();
                            // Find the matching plugin by title
                            const matchingPlugin = window.installedPlugins?.find(p => p.name === title);
                            if (matchingPlugin) {
                                pluginId = matchingPlugin.id;
                                console.log('Found plugin ID from title:', pluginId);
                            }
                        }
                    }
                }
            }

            if (!pluginId) {
                // Last resort: try to find an activePanel variable in the global scope or in Dashboard
                for (let key in window) {
                    if (key.toLowerCase().includes('panel') && typeof window[key] === 'string') {
                        console.log('Potential panel ID found in window.' + key + ':', window[key]);
                        pluginId = window[key];
                        break;
                    }
                }
                
                // If still no plugin ID, check URL or any other possible sources
                const urlParams = new URLSearchParams(window.location.search);
                const pluginFromUrl = urlParams.get('plugin');
                if (pluginFromUrl) {
                    pluginId = pluginFromUrl;
                    console.log('Found plugin ID from URL:', pluginId);
                }
            }

            if (!pluginId) {
                // If we still can't determine the plugin, show an error message with detailed debug info
                container.innerHTML = `
                    <div class="error-message">
                        <p>Cannot determine which plugin is active.</p>
                        <div style="font-size: 12px; margin-top: 10px;">
                            <p>Debug info: window.activePanel = ${window.activePanel}, 
                               Dashboard.activePanel = ${window.Dashboard?.activePanel}</p>
                            <p>Settings panel title: ${document.getElementById('plugin-settings-title')?.textContent || 'Not found'}</p>
                            <button id="debug-help-docs" style="margin-top: 10px; padding: 5px 10px;">Debug Details</button>
                        </div>
                    </div>
                `;
                
                // Add debug button functionality
                const debugButton = container.querySelector('#debug-help-docs');
                if (debugButton) {
                    debugButton.addEventListener('click', function() {
                        console.log('Settings panel:', document.querySelector('.settings-panel.visible'));
                        console.log('Panel title:', document.getElementById('plugin-settings-title')?.textContent);
                        console.log('All panel and plugin related variables:');
                        for (let key in window) {
                            if (key.toLowerCase().includes('plugin') || key.toLowerCase().includes('panel')) {
                                console.log(`window.${key} =`, window[key]);
                            }
                        }
                        alert('Debug info logged to console. Press F12 to view.');
                    });
                }
                
                return;
            }

            // Initialize Help Docs Manager
            await window.HelpDocsManager.initialize();

            // Get help docs for this plugin
            const helpDocs = await window.HelpDocsManager.getHelpDocs(pluginId);

            // Create the help tab content
            const content = window.HelpDocsUI.createHelpTabContent(helpDocs);

            // Clear container and append content
            container.innerHTML = '';
            container.appendChild(content);
        } catch (error) {
            console.error('Error initializing help docs container:', error);
            const container = document.querySelector('.custom-component-container[data-component-id="help-docs-container"]');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <p>Error loading help documentation: ${error.message}</p>
                    </div>
                `;
            }
        }
    };

    // Mark as initialized
    window.helpDocsIntegrationInitialized = true;

    // Initialize the Help Docs UI
    window.HelpDocsUI.initialize();

    console.log('Help Documentation integration initialized with enhanced plugin detection');
})();

// Test function to display docs for a single plugin
window.testDisplaySinglePluginDocs = async function (pluginId = 'food-menu') {
    try {
        // First initialize the Help Docs Manager
        await window.HelpDocsManager.initialize();

        // Get docs for just this one plugin
        const docs = await window.HelpDocsManager.getHelpDocs(pluginId);

        console.log(`Loaded ${docs.length} help docs for ${pluginId}`);

        // Create a container for the docs
        const container = document.createElement('div');
        container.className = 'test-help-docs-container';

        // Add a heading
        const heading = document.createElement('h2');
        heading.textContent = `Help Documentation for ${pluginId}`;
        container.appendChild(heading);

        // Create content using the UI manager
        if (docs.length === 0) {
            container.innerHTML += `
                <div style="padding: 20px; text-align: center;">
                    <p>No help documents found for this plugin.</p>
                </div>
            `;
        } else {
            const docsContent = window.HelpDocsUI.createHelpTabContent(docs);
            container.appendChild(docsContent);
        }

        // Find a good place to add the container
        const targetElement = document.querySelector('.plugins-column');
        if (targetElement) {
            targetElement.appendChild(container);
        }

        return {success: true, docsCount: docs.length};
    } catch (error) {
        console.error('Error in single plugin test display:', error);
        return {success: false, error: error.message};
    }
};

// Debug utility for the help docs
window.debugHelpDocs = function() {
    console.log('Active panel ID:', window.activePanel);
    console.log('Dashboard.activePanel:', window.Dashboard?.activePanel);
    console.log('Settings panel attributes:', document.querySelector('.settings-panel.visible')?.attributes);
    console.log('Plugin title:', document.getElementById('plugin-settings-title')?.textContent);
    console.log('Available plugins:', window.installedPlugins);
    
    // Try to determine active plugin
    const panelTitle = document.getElementById('plugin-settings-title')?.textContent.trim();
    const matchingPlugin = window.installedPlugins?.find(p => p.name === panelTitle);
    console.log('Found matching plugin:', matchingPlugin);
    
    return "Debug info logged to console";
};

// Dashboard module override to ensure active panel is properly exposed
(function enhanceDashboard() {
    if (!window.Dashboard) {
        console.warn('Dashboard not available yet, waiting before applying enhancements');
        setTimeout(enhanceDashboard, 100);
        return;
    }
    
    // Ensure the Dashboard's active panel is exposed globally
    Object.defineProperty(window.Dashboard, 'activePanel', {
        get: function() {
            return window.activePanel;
        },
        set: function(value) {
            window.activePanel = value;
            console.log(`Active panel updated: ${value}`);
        },
        enumerable: true
    });
    
    console.log('Dashboard enhanced to properly expose active panel ID globally');
})();

// For testing
window.testDisplayAllHelpDocs = window.testDisplaySinglePluginDocs;