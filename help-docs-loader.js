/**
 * Help Docs Component - Manages the initialization and loading of help documentation
 * Designed to be included in the help-docs-component.js file
 */

(function() {
    // Flag to prevent double initialization
    if (window.helpDocsComponentInitialized) {
        return;
    }
    
    /**
     * HelpDocsComponent - Manages the help documentation component
     */
    window.HelpDocsComponent = {
        // Reference to the container element
        container: null,
        
        // Properties to track state
        pluginId: null,
        isInitialized: false,
        isLoading: false,
        
        /**
         * Initialize the help docs component
         * @param {string} containerId - ID of the container element
         */
        initialize: function(containerId) {
            console.log('Initializing help docs component in container:', containerId);
            
            // Find the container element
            const container = document.getElementById(containerId) || 
                             document.querySelector(`.custom-component-container[data-component-id="help-docs-container"]`);
            
            if (!container) {
                console.error('Help docs container not found with ID:', containerId);
                return false;
            }
            
            this.container = container;
            
            // Show loading state
            this.showLoading();
            
            // Get the active plugin ID
            this.detectActivePlugin()
                .then(pluginId => {
                    if (!pluginId) {
                        this.showError('Cannot determine which plugin is active. Please try again or reload the page.');
                        return;
                    }
                    
                    this.pluginId = pluginId;
                    console.log('Detected active plugin ID:', pluginId);
                    
                    // Load the help docs for this plugin
                    this.loadHelpDocs(pluginId);
                })
                .catch(error => {
                    console.error('Error detecting active plugin:', error);
                    this.showError('Error detecting active plugin: ' + error.message);
                });
            
            this.isInitialized = true;
            return true;
        },
        
        /**
         * Detect the active plugin using multiple methods
         * @returns {Promise<string>} Promise resolving to the plugin ID
         */
        detectActivePlugin: async function() {
            // Try multiple methods to determine the active plugin ID
            
            // Method 1: Check global activePanel variable
            if (window.activePanel) {
                console.log('Found active plugin ID from window.activePanel:', window.activePanel);
                return window.activePanel;
            }
            
            // Method 2: Check Dashboard.activePanel
            if (window.Dashboard && window.Dashboard.activePanel) {
                console.log('Found active plugin ID from Dashboard.activePanel:', window.Dashboard.activePanel);
                return window.Dashboard.activePanel;
            }
            
            // Method 3: Check data attribute on settings panel
            const settingsPanel = document.querySelector('.settings-panel.visible');
            if (settingsPanel && settingsPanel.hasAttribute('data-plugin-id')) {
                const pluginId = settingsPanel.getAttribute('data-plugin-id');
                console.log('Found active plugin ID from settings panel data attribute:', pluginId);
                return pluginId;
            }
            
            // Method 4: Try to get plugin ID from panel title
            const panelTitle = document.getElementById('plugin-settings-title');
            if (panelTitle) {
                const title = panelTitle.textContent.trim();
                console.log('Found panel title:', title);
                
                // Try to match with installedPlugins
                if (window.installedPlugins) {
                    const matchingPlugin = window.installedPlugins.find(p => p.name === title);
                    if (matchingPlugin) {
                        console.log('Found matching plugin from title:', matchingPlugin.id);
                        return matchingPlugin.id;
                    }
                }
                
                // If no match in installedPlugins, use a hardcoded mapping as fallback
                const pluginTitleMap = {
                    'Real Estate Listings': 'real-estate-listings',
                    'Food & Drink Menu Manager': 'food-menu',
                    'Scroll to Top Button': 'scroll-to-top'
                };
                
                if (pluginTitleMap[title]) {
                    console.log('Found plugin ID from title mapping:', pluginTitleMap[title]);
                    return pluginTitleMap[title];
                }
            }
            
            // Method 5: As a last resort, try to find plugin ID in URL
            const urlParams = new URLSearchParams(window.location.search);
            const pluginFromUrl = urlParams.get('plugin');
            if (pluginFromUrl) {
                console.log('Found plugin ID from URL:', pluginFromUrl);
                return pluginFromUrl;
            }
            
            // No plugin ID found
            console.error('Could not determine active plugin ID');
            return null;
        },
        
        /**
         * Load help docs for the specified plugin
         * @param {string} pluginId - The plugin ID
         */
        loadHelpDocs: async function(pluginId) {
            if (!pluginId) {
                this.showError('No plugin ID provided');
                return;
            }
            
            try {
                this.isLoading = true;
                
                // Make sure HelpDocsManager is initialized
                if (!window.HelpDocsManager) {
                    console.error('HelpDocsManager not available');
                    this.showError('Help documentation system not available');
                    return;
                }
                
                // Initialize the HelpDocsManager
                await window.HelpDocsManager.initialize();
                
                // Get help docs for this plugin
                const helpDocs = await window.HelpDocsManager.getHelpDocs(pluginId);
                console.log(`Loaded ${helpDocs.length} help docs for plugin ${pluginId}`);
                
                // Render the help docs
                this.renderHelpDocs(helpDocs);
                
            } catch (error) {
                console.error('Error loading help docs:', error);
                this.showError('Error loading help documentation: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        },
        
        /**
         * Render help docs in the container
         * @param {Array} helpDocs - Array of help doc objects
         */
        renderHelpDocs: function(helpDocs) {
            if (!this.container) return;
            
            // Make sure HelpDocsUI is available
            if (!window.HelpDocsUI) {
                console.error('HelpDocsUI not available');
                this.showError('Help documentation UI system not available');
                return;
            }
            
            // Create help docs content
            const content = window.HelpDocsUI.createHelpTabContent(helpDocs);
            
            // Clear container and add content
            this.container.innerHTML = '';
            this.container.appendChild(content);
            
            console.log('Help docs rendered successfully');
        },
        
        /**
         * Show loading indicator
         */
        showLoading: function() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="loading-indicator">
                    <div class="loading-spinner"></div>
                    <p>Loading help documentation...</p>
                </div>
            `;
            
            this.isLoading = true;
        },
        
        /**
         * Show error message
         * @param {string} message - Error message to display
         */
        showError: function(message) {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button id="retry-help-docs" class="button secondary-button" style="margin-top: 15px;">
                        Retry
                    </button>
                    <button id="debug-help-docs" class="button cancel-button" style="margin-top: 15px; margin-left: 10px;">
                        Debug Info
                    </button>
                </div>
            `;
            
            // Add retry button handler
            const retryButton = this.container.querySelector('#retry-help-docs');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    // Try to re-detect the active plugin and load help docs
                    this.initialize(this.container.id);
                });
            }
            
            // Add debug button handler
            const debugButton = this.container.querySelector('#debug-help-docs');
            if (debugButton) {
                debugButton.addEventListener('click', () => {
                    // Call debug function if available
                    if (typeof window.debugHelpDocs === 'function') {
                        window.debugHelpDocs();
                    }
                    
                    // Show debug info in an alert
                    const debugInfo = `
                        window.activePanel: ${window.activePanel || 'not set'}
                        Dashboard.activePanel: ${window.Dashboard?.activePanel || 'not set'}
                        Panel title: ${document.getElementById('plugin-settings-title')?.textContent || 'not found'}
                        Settings panel visible: ${!!document.querySelector('.settings-panel.visible')}
                        Container ID: ${this.container.id || 'no id'}
                        Data component ID: ${this.container.getAttribute('data-component-id') || 'none'}
                    `;
                    
                    alert('Debug info:\n' + debugInfo);
                    console.log('Debug info:', debugInfo);
                });
            }
            
            this.isLoading = false;
        }
    };
    
    // Automatically initialize the help docs component when loaded as a script
    window.initHelpDocsContainer = function() {
        return window.HelpDocsComponent.initialize('help-docs-container');
    };
    
    // Mark as initialized
    window.helpDocsComponentInitialized = true;
    
    console.log('Help Docs Component script loaded successfully');
})();