/**
 * SquareHero Plugin Dashboard - Core Functionality
 * With integrated skeleton loading system and Firebase
 * Includes active panel ID patch
 */

// Dashboard Module
const Dashboard = (function () {
    // Plugin Settings Registry
    const PluginSettingsRegistry = {
        schemas: {},
        handlers: {},

        register: function (pluginId, schema, handlers = {}) {
            this.schemas[pluginId] = schema;
            this.handlers[pluginId] = handlers;
            console.log(`Registered settings schema for plugin: ${pluginId}`);
        },

        getSchema: function (pluginId) {
            return this.schemas[pluginId] || null;
        },

        getHandlers: function (pluginId) {
            return this.handlers[pluginId] || {};
        }
    };

    // Default cards
    function createDefaultCard(plugin) {
        console.log(`🔍 [DEBUG-CARD] Creating default card for plugin: ${plugin.id}`);
        console.log(`🔍 [DEBUG-CARD] Plugin status from data:`, plugin.status);
        console.log(`🔍 [DEBUG-CARD] Plugin settings:`, plugin.settings);
        
        const card = document.createElement('div');
        card.className = 'plugin-card';
        card.setAttribute('data-plugin-id', plugin.id);

        // Add default status if not defined
        const status = plugin.status || 'disabled';
        console.log(`🔍 [DEBUG-CARD] Using status:`, status);

        card.innerHTML = `
            <div class="top-wrapper">
            <div class="plugin-icon">
                <img src="${plugin.icon}" alt="${plugin.name} icon">
            </div>
            <div class="status-wrapper">
            <span class="plugin-status status-${status}">${status.toUpperCase()}</span>
            </div>
            </div>
            <div class="plugin-content">
                <div class="plugin-header">
                    <h3 class="plugin-title">${plugin.name}</h3>
                </div>
                <p class="plugin-description">${plugin.description}</p>
            </div>
        `;

        // Add click event listener to open settings panel
        card.addEventListener('click', function () {
            loadPluginSettingsModule(plugin.id);
        });

        return card;
    }

    // Private properties
    let availablePlugins = []; // All plugins from JSON
    let installedPlugins = []; // Plugins currently installed on the site
    let activePanel = null;
    let hasUnsavedChanges = false; // Track if there are unsaved changes
    let notificationBar = null; // Reference to notification bar element
    let notificationTimeout = null; // Reference to timeout for auto-hiding notifications
    let attentionTimeout = null; // Reference to timeout for removing attention class
    let loadingStates = {}; // Track skeleton loaders
    let isInitializationInProgress = false; // Flag to prevent double initialization

    // Firebase service for settings storage
    const FirebaseService = {
        isInitialized: false,
        
        // Initialize by delegating to the secure service
        initialize: async function() {
            if (this.isInitialized) return true;
            
            // Check if SecureFirebaseAuth is available
            if (!window.SecureFirebaseAuth) {
                console.error('Secure Firebase Authentication service not found');
                // Look for auth.js and try to load it dynamically if not already loaded
                if (!document.querySelector('script[src*="auth.js"]')) {
                    console.log('Attempting to load auth.js dynamically');
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'auth.js';
                        script.onload = async () => {
                            console.log('auth.js loaded dynamically');
                            // Wait for initialization
                            if (window.SecureFirebaseAuth) {
                                const result = await window.SecureFirebaseAuth.initialize();
                                this.isInitialized = result;
                                resolve(result);
                            } else {
                                console.error('SecureFirebaseAuth still not available after loading auth.js');
                                reject(new Error('Failed to load SecureFirebaseAuth'));
                            }
                        };
                        script.onerror = () => {
                            console.error('Failed to load auth.js dynamically');
                            reject(new Error('Failed to load auth.js'));
                        };
                        document.head.appendChild(script);
                    });
                }
                return false;
            }
            
            // Initialize using the secure service
            try {
                const result = await window.SecureFirebaseAuth.initialize();
                this.isInitialized = result;
                console.log('Firebase service initialized:', result);
                return result;
            } catch (error) {
                console.error('Error initializing Firebase service:', error);
                return false;
            }
        },
        
        // Get plugin settings by delegating to the secure service
        getPluginSettings: async function(pluginId, defaultSettings = {}) {
            if (!this.isInitialized) {
                console.log('Firebase service not initialized, initializing now');
                await this.initialize();
            }
            
            if (!window.SecureFirebaseAuth) {
                console.error('Secure Firebase Authentication service not found after initialization');
                return defaultSettings;
            }
            
            try {
                return await window.SecureFirebaseAuth.getPluginSettings(pluginId, defaultSettings);
            } catch (error) {
                console.error(`Error getting settings for plugin ${pluginId}:`, error);
                return defaultSettings;
            }
        },
        
        // Update plugin settings by delegating to the secure service
        updatePluginSettings: async function(pluginId, settings) {
            if (!this.isInitialized) {
                console.log('Firebase service not initialized, initializing now');
                await this.initialize();
            }
            
            if (!window.SecureFirebaseAuth) {
                console.error('Secure Firebase Authentication service not found after initialization');
                return false;
            }
            
            try {
                const result = await window.SecureFirebaseAuth.updatePluginSettings(pluginId, settings);
                console.log(`Settings update for ${pluginId} result:`, result);
                return result;
            } catch (error) {
                console.error(`Error updating settings for plugin ${pluginId}:`, error);
                return false;
            }
        },
        
        // Check if a user is authenticated
        isAuthenticated: function() {
            if (!window.SecureFirebaseAuth) return false;
            return window.SecureFirebaseAuth.isAuthenticated();
        },
        
        // Get current user information
        getCurrentUser: function() {
            if (!window.SecureFirebaseAuth) return null;
            return window.SecureFirebaseAuth.getCurrentUser();
        }
    };

    // Plugin Registry for module system
    const PluginRegistry = {
        modules: {},
        register: function (pluginId, moduleType, module) {
            if (!this.modules[pluginId]) {
                this.modules[pluginId] = {};
            }
            this.modules[pluginId][moduleType] = module;
            console.log(`Registered ${moduleType} module for ${pluginId}`);
        },
        get: function (pluginId, moduleType) {
            if (!this.modules[pluginId] || !this.modules[pluginId][moduleType]) {
                return null;
            }
            return this.modules[pluginId][moduleType];
        }
    };

    // Cache DOM elements
    const elements = {
        pluginCardsContainer: document.getElementById('plugin-cards-container'),
        newsItemsContainer: document.getElementById('news-items-container'),
        settingsPanel: document.getElementById('settings-panel'),
        panelContent: document.getElementById('panel-content'),
        closeButton: document.getElementById('close-panel'),
        overlay: document.getElementById('overlay'),
        dashboardTabs: document.querySelector('.dashboard-tabs'), // New
        dashboardTabContents: document.querySelectorAll('.dashboard-tab-content') // New
    };

    console.log("dashboardTabs:", elements.dashboardTabs);
    console.log("dashboardTabContents:", elements.dashboardTabContents);

    // Create and get notification bar - updated to avoid recreation
    function getNotificationBar() {
        // First check if notification bar already exists
        const existingBar = document.querySelector('.notification-bar');

        if (existingBar) {
            console.log("Using existing notification bar");
            return existingBar;
        }

        console.log("Creating new notification bar");
        notificationBar = document.createElement('div');
        notificationBar.className = 'notification-bar';

        // Add to settings panel
        elements.settingsPanel.appendChild(notificationBar);

        return notificationBar;
    }

    // Show unsaved changes notification
    function showUnsavedChangesNotification() {
        const bar = getNotificationBar();

        // Remove any existing classes that might interfere
        bar.classList.remove('success', 'attention');

        // Add visible class
        bar.classList.add('visible');

        bar.innerHTML = `
            <div class="notification-message">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" y1="6" r="1" fill="currentColor"/>
                </svg>
                <span>Unsaved changes</span>
            </div>
            <div class="notification-actions">
                <button class="discard-button">Discard</button>
                <button class="save-button">Save</button>
            </div>
        `;

        // Add event listeners
        const discardButton = bar.querySelector('.discard-button');
        const saveButton = bar.querySelector('.save-button');

        discardButton.addEventListener('click', function () {
            hasUnsavedChanges = false;
            closeSettingsPanel();
        });

        saveButton.addEventListener('click', function () {
            // Need to collect and save the settings from ALL forms
            const forms = elements.panelContent.querySelectorAll('.settings-form');
            if (!forms || forms.length === 0) return;

            const pluginId = activePanel;
            const plugin = installedPlugins.find(p => p.id === pluginId);
            if (!plugin) return;

            const schema = PluginSettingsRegistry.getSchema(pluginId);
            if (!schema) return;

            // Collect settings from all forms and merge them
            let settings = {};
            forms.forEach(form => {
                const formSettings = SettingsComponents.collectFormValues(form, schema);
                settings = { ...settings, ...formSettings };
            });

            // Save settings
            savePluginSettings(pluginId, settings);
            hasUnsavedChanges = false; // Reset after saving
            updateNotificationState();
        });

        console.log("Notification bar created and shown");
    }

    // Helper function to apply animation
    function applyAttentionAnimation(bar) {
        if (!bar) return;

        // Clear any existing timeout
        if (attentionTimeout) {
            clearTimeout(attentionTimeout);
        }

        // Remove animation class first (to allow restart)
        bar.classList.remove('attention');

        // Force a browser reflow to restart animation
        void bar.offsetWidth;

        // Add animation class
        bar.classList.add('attention');

        // Remove animation class after it completes
        attentionTimeout = setTimeout(function () {
            if (bar) {
                bar.classList.remove('attention');
            }
        }, 800); // Animation duration
    }

    // Show attention animation on notification bar
    function showAttention() {
        console.log("showAttention called");

        // First check if we already have a notification bar
        let bar = document.querySelector('.notification-bar');

        if (!bar || !bar.classList.contains('visible')) {
            // If no visible notification bar, create one
            console.log("No visible notification bar, creating one");
            showUnsavedChangesNotification();

            // Get the new bar
            bar = document.querySelector('.notification-bar');

            // Wait a brief moment for the bar to be fully visible
            setTimeout(() => {
                applyAttentionAnimation(bar);
            }, 50);
        } else {
            // Bar exists and is visible, apply animation directly
            console.log("Notification bar already visible, applying animation");
            applyAttentionAnimation(bar);
        }
    }

    // Show success notification
    function showSuccessNotification(message) {
        const bar = getNotificationBar();

        // Remove any existing classes
        bar.classList.remove('attention');

        bar.className = 'notification-bar success visible';
        bar.innerHTML = `
            <div class="notification-message">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${message || 'Settings saved successfully!'}</span>
            </div>
            <div class="notification-actions">
                <button class="discard-button">Close</button>
            </div>
        `;

        // Add event listener to close button
        const closeButton = bar.querySelector('.discard-button');
        closeButton.addEventListener('click', function () {
            hideNotification();
        });

        // Auto-hide after 3 seconds
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }

        notificationTimeout = setTimeout(function () {
            hideNotification();
        }, 3000);

    }

    // Hide notification bar
    function hideNotification() {
        if (notificationBar) {
            notificationBar.classList.remove('visible');
        }

        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
    }

    // Update notification state based on changes
    function updateNotificationState() {
        console.log('updateNotificationState called, hasUnsavedChanges =', hasUnsavedChanges);

        if (hasUnsavedChanges) {
            showUnsavedChangesNotification();
        } else {
            hideNotification();
        }
    }

    // Load the skeleton loader library if not already loaded
    async function loadSkeletonLoader() {
        console.log('🎯 [Dashboard] Loading skeleton loader');
        
        // Check if SkeletonLoader is already available
        if (window.SkeletonLoader) {
            console.log('🎯 [Dashboard] SkeletonLoader already loaded');
            return;
        }

        // Load both CSS and JS
        return new Promise((resolve, reject) => {
            // Load the skeleton styles first
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = 'skeleton-loader.css';
            
            // If local CSS fails, try CDN
            style.onerror = () => {
                console.log('🎯 [Dashboard] Local skeleton CSS failed, trying CDN');
                style.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/skeleton-loader.min.css';
            };

            // Once CSS is loaded, load the script
            style.onload = () => {
                console.log('🎯 [Dashboard] Skeleton CSS loaded');
                
                // Now load the script
                const script = document.createElement('script');
                script.src = 'skeleton-loader.js';
                script.onerror = reject;
                script.onload = () => {
                    console.log('🎯 [Dashboard] Skeleton script loaded');
                    // Wait a brief moment for script to initialize
                    setTimeout(() => {
                        if (window.SkeletonLoader) {
                            console.log('🎯 [Dashboard] SkeletonLoader ready');
                            resolve();
                        } else {
                            reject(new Error('SkeletonLoader not initialized'));
                        }
                    }, 100);
                };
                document.body.appendChild(script);
            };

            document.head.appendChild(style);
        });
    }

    // Check authentication status directly and wait if needed
    async function ensureAuthenticated(maxRetries = 3) {
        console.log('🔒 [Auth-Check] Checking authentication status...');
        
        // First check if already authenticated
        if (FirebaseService.isAuthenticated()) {
            console.log('🔒 [Auth-Check] Already authenticated ✓');
            return true;
        }
        
        console.log('🔒 [Auth-Check] Not currently authenticated, checking Firebase auth directly');
        
        // Try to get authentication status directly from Firebase
        if (window.SecureFirebaseAuth && window.SecureFirebaseAuth.auth) {
            const currentUser = window.SecureFirebaseAuth.auth.currentUser;
            if (currentUser) {
                console.log('🔒 [Auth-Check] Found authenticated user in Firebase:', currentUser.email);
                window.SecureFirebaseAuth.currentUser = currentUser;
                return true;
            }
        }
        
        // Wait and retry a few times - auth might be in progress
        for (let i = 0; i < maxRetries; i++) {
            console.log(`🔒 [Auth-Check] Waiting for authentication (attempt ${i + 1}/${maxRetries})...`);
            
            // Wait a short time for auth to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check again
            if (FirebaseService.isAuthenticated()) {
                console.log('🔒 [Auth-Check] Successfully authenticated after retry ✓');
                return true;
            }
            
            // Try one more direct check with Firebase auth
            if (window.SecureFirebaseAuth && window.SecureFirebaseAuth.auth && 
                window.SecureFirebaseAuth.auth.currentUser) {
                console.log('🔒 [Auth-Check] Found authenticated user after retry:', 
                           window.SecureFirebaseAuth.auth.currentUser.email);
                window.SecureFirebaseAuth.currentUser = window.SecureFirebaseAuth.auth.currentUser;
                return true;
            }
        }
        
        console.log('🔒 [Auth-Check] Authentication check failed after retries ✗');
        return false;
    }

    // Generate licensing UI for settings panel
    function generateLicensingUI(plugin) {
        // Default to inactive if not set
        const licenseStatus = plugin.licenseStatus || 'inactive';
        let trialData = plugin.trialData || null;
        
        // Create the container
        const licensingUI = document.createElement('div');
        licensingUI.className = 'settings-section licensing-section';
        
        // Different UI based on license status
        switch (licenseStatus) {
            case 'authorized':
                licensingUI.innerHTML = `
                    <div class="license-status-container">
                        <div class="license-status-icon active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="M7.5 12l3 3 6-6"/>
                            </svg>
                        </div>
                        <div class="license-status-info">
                            <h3 class="license-status-title">Licensed</h3>
                            <p class="license-status-description">This plugin is licensed and active.</p>
                        </div>
                    </div>
                    <div class="license-details">
                        <div class="license-detail-item">
                            <span class="license-detail-label">License Key:</span>
                            <span class="license-detail-value">•••••••••${plugin.settings?.license_key?.substring(plugin.settings.license_key.length - 4) || '••••'}</span>
                        </div>
                        <div class="license-detail-item">
                            <span class="license-detail-label">Activated On:</span>
                            <span class="license-detail-value">${new Date(plugin.settings?.activated_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="license-actions">
                        <button class="button secondary-button" id="deactivate-license">Deactivate License</button>
                    </div>
                `;
                break;
                
            case 'trial':
                // Calculate days remaining
                const daysRemaining = trialData?.daysRemaining || 14;
                const trialEnds = trialData?.trialEnd ? new Date(trialData.trialEnd).toLocaleDateString() : 'Unknown';
                
                licensingUI.innerHTML = `
                    <div class="license-status-container">
                        <div class="license-status-icon trial">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="license-status-info">
                            <h3 class="license-status-title">Trial Mode</h3>
                            <p class="license-status-description">This plugin is currently in trial mode.</p>
                        </div>
                    </div>
                    <div class="license-details">
                        <div class="license-detail-item">
                            <span class="license-detail-label">Days Remaining:</span>
                            <span class="license-detail-value">${daysRemaining}</span>
                        </div>
                        <div class="license-detail-item">
                            <span class="license-detail-label">Trial Ends:</span>
                            <span class="license-detail-value">${trialEnds}</span>
                        </div>
                    </div>
                    <div class="license-activation">
                        <h4 class="license-activation-title">Have a License Key?</h4>
                        <div class="license-activation-form">
                            <input type="text" class="license-key-input" placeholder="Enter your license key" id="license-key-input">
                            <button class="button primary-button" id="activate-license">Activate License</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'unauthorized':
                licensingUI.innerHTML = `
                    <div class="license-status-container">
                        <div class="license-status-icon expired">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <div class="license-status-info">
                            <h3 class="license-status-title">License Required</h3>
                            <p class="license-status-description">Your trial has expired or is invalid.</p>
                        </div>
                    </div>
                    <div class="license-activation">
                        <h4 class="license-activation-title">Enter Your License Key</h4>
                        <div class="license-activation-form">
                            <input type="text" class="license-key-input" placeholder="Enter your license key" id="license-key-input">
                            <button class="button primary-button" id="activate-license">Activate License</button>
                        </div>
                    </div>
                    <div class="license-purchase">
                        <a href="https://squarehero.store/products/${plugin.id}" target="_blank" class="button secondary-button purchase-button">Purchase License</a>
                    </div>
                `;
                break;
                
            case 'inactive':
            default:
                licensingUI.innerHTML = `
                    <div class="license-status-container">
                        <div class="license-status-icon inactive">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div class="license-status-info">
                            <h3 class="license-status-title">Not Activated</h3>
                            <p class="license-status-description">This plugin is not activated.</p>
                        </div>
                    </div>
                    <div class="license-actions">
                        <button class="button primary-button" id="start-trial">Start Free Trial</button>
                        <p class="trial-info">Start a 14-day free trial with full features.</p>
                    </div>
                    <div class="license-activation">
                        <h4 class="license-activation-title">Already have a License?</h4>
                        <div class="license-activation-form">
                            <input type="text" class="license-key-input" placeholder="Enter your license key" id="license-key-input">
                            <button class="button secondary-button" id="activate-license">Activate License</button>
                        </div>
                    </div>
                `;
                break;
        }
        
        return licensingUI;
    }

    // Load plugins from JSON
    async function loadPlugins() {
        try {
            // Don't show any text loading indicators at all
            // Just return the data and let the caller handle the loading UI
            const response = await fetch('https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/plugins.json');
            if (!response.ok) {
                throw new Error('Failed to load plugins.json');
            }

            const data = await response.json();
            const plugins = data.plugins || [];
            
            // If licensing system is available, check license status for each plugin
            if (window.SquareHeroLicensing && window.SquareHeroLicensing._initialized) {
                console.log('🔑 [Licensing] Checking license status for plugins');
                
                for (const plugin of plugins) {
                    try {
                        // Get licensing data
                        const licenseData = await window.SquareHeroLicensing.getPluginData(plugin.id);
                        plugin.licenseStatus = licenseData.status || 'inactive';
                        
                        // If in trial mode, get trial details
                        if (plugin.licenseStatus === 'trial') {
                            const trialStatus = await window.SquareHeroLicensing.checkTrialStatus(plugin.id);
                            plugin.trialData = trialStatus;
                            
                            // If trial has expired, update status
                            if (trialStatus.expired) {
                                plugin.licenseStatus = 'unauthorized';
                            }
                        }
                        
                        console.log(`🔑 [Licensing] License status for ${plugin.id}: ${plugin.licenseStatus}`);
                    } catch (error) {
                        console.error(`🔑 [Licensing] Error checking license for ${plugin.id}:`, error);
                        plugin.licenseStatus = 'inactive';
                    }
                }
            } else {
                console.log('🔑 [Licensing] Licensing system not initialized, skipping license checks');
                // Set default license status
                for (const plugin of plugins) {
                    plugin.licenseStatus = 'inactive';
                }
            }
            
            return plugins;
        } catch (error) {
            console.error('Error loading plugins:', error);
            return [];
        }
    }

    // Detect installed plugins based on script tags
    function detectInstalledPlugins(allPlugins) {
        // Find all script tags with our custom attribute
        const installedIds = [];
        console.log('🔍 [DEBUG-INSTALLED] Looking for script tags with data-squarehero-plugin attribute');
        document.querySelectorAll('script[data-squarehero-plugin]').forEach(script => {
            const pluginId = script.getAttribute('data-squarehero-plugin');
            installedIds.push(pluginId);
            console.log(`🔍 [DEBUG-INSTALLED] Found installed plugin: ${pluginId}`);
        });

        console.log('🔍 [DEBUG-INSTALLED] All detected installed plugin IDs:', installedIds);

        // Filter available plugins to only include those that are installed
        const detectedPlugins = allPlugins.filter(plugin => installedIds.includes(plugin.id));
        console.log('🔍 [DEBUG-INSTALLED] Matched installed plugins from available plugins:', detectedPlugins.map(p => p.id));

        // For development/testing purposes only:
        // If we're in development mode, show a message but still return empty array
        if (detectedPlugins.length === 0 && window.location.hostname === 'localhost') {
            console.log('🔍 [DEBUG-INSTALLED] No installed plugins detected. In production, no plugins would be shown.');
            // Uncomment the next line during development to see all plugins anyway
            return allPlugins; // For testing, show all plugins
        }

        return detectedPlugins;
    }

    // Load plugin scripts dynamically
    function loadPluginScripts(plugin) {
        return new Promise((resolve) => {
            if (!plugin.moduleScripts || plugin.moduleScripts.length === 0) {
                resolve();
                return;
            }

            let loaded = 0;
            const totalScripts = plugin.moduleScripts.length;

            plugin.moduleScripts.forEach(scriptPath => {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.onload = () => {
                    loaded++;
                    if (loaded === totalScripts) {
                        resolve();
                    }
                };
                script.onerror = (error) => {
                    console.error(`Error loading script ${scriptPath}:`, error);
                    loaded++;
                    if (loaded === totalScripts) {
                        resolve(); // Still resolve to continue with other plugins
                    }
                };
                document.body.appendChild(script);
            });
        });
    }

    // Render plugin cards
    function renderPluginCards() {
        // Don't show any text loading indicators or hide skeleton loader here
        // The skeleton loader will be hidden after all settings are loaded
        console.log('🔍 [DEBUG-RENDER] Rendering plugin cards with installedPlugins:', installedPlugins?.length);
        console.log('🔍 [DEBUG-RENDER] Plugin data being rendered:', JSON.stringify(installedPlugins.map(p => ({
            id: p.id,
            status: p.status,
            settings: p.settings?.enabled
        }))));
        
        if (!installedPlugins || !installedPlugins.length) {
            elements.pluginCardsContainer.innerHTML = '<p>No plugins installed on this site. Visit the SquareHero plugin store to browse available plugins.</p>';
            
            // Hide skeleton loader if no plugins are installed
            if (loadingStates.plugins) {
                console.log('🎯 [Dashboard] Hiding plugin card skeletons (no plugins)');
                loadingStates.plugins.hide();
            }
            return;
        }

        // Process each plugin and create its card
        return Promise.all(installedPlugins.map(createPluginCard))
            .then(cards => {
                console.log('🔍 [DEBUG-RENDER] Card creation promises resolved, about to update DOM');
                
                // Clear any existing content
                const existingContent = elements.pluginCardsContainer.innerHTML;
                console.log('🔍 [DEBUG-RENDER] Clearing container with existing content length:', existingContent.length);
                elements.pluginCardsContainer.innerHTML = '';

                // Add each card to the container
                cards.forEach(card => {
                    if (card) {
                        const pluginId = card.getAttribute('data-plugin-id');
                        const plugin = installedPlugins.find(p => p.id === pluginId);
                        const status = plugin?.status || 'unknown';
                        console.log(`🔍 [DEBUG-RENDER] Adding card for ${pluginId} with status: ${status}`);
                        elements.pluginCardsContainer.appendChild(card);
                    }
                });

                // If no cards were added, show a message
                if (elements.pluginCardsContainer.children.length === 0) {
                    elements.pluginCardsContainer.innerHTML = '<p>No plugins available.</p>';
                    console.log('🔍 [DEBUG-RENDER] No cards were created, showing "No plugins available" message');
                } else {
                    console.log('🔍 [DEBUG-RENDER] Added cards to DOM, total count:', elements.pluginCardsContainer.children.length);
                }
                
                // Hide skeleton loader after cards are rendered
                if (loadingStates.plugins) {
                    console.log('🔍 [DEBUG-RENDER] Hiding plugin card skeletons after rendering cards');
                    loadingStates.plugins.hide();
                }
            })
            .catch(error => {
                console.error('Error rendering plugin cards:', error);
                elements.pluginCardsContainer.innerHTML = '<p>Error loading plugins. Please try again later.</p>';
                
                // Hide skeleton loader on error
                if (loadingStates.plugins) {
                    loadingStates.plugins.hide();
                }
            });
    }

    // Create a plugin card
    function createPluginCard(plugin) {
        return new Promise((resolve) => {
            try {
                // IMPORTANT: Only consider it an error if settings are completely missing
                // Some plugins can legitimately just have {enabled: true} as their only setting
                if (!plugin.settings) {
                    console.error(`⛔ [ERROR] No settings found for plugin ${plugin.id}. Showing error card.`);
                    
                    // Create error card instead
                    const errorCard = document.createElement('div');
                    errorCard.className = 'plugin-card error-card';
                    errorCard.setAttribute('data-plugin-id', plugin.id);
                    errorCard.innerHTML = `
                        <div class="top-wrapper">
                            <div class="plugin-icon">
                                <img src="${plugin.icon}" alt="${plugin.name} icon">
                            </div>
                            <div class="status-wrapper">
                                <span class="plugin-status status-error">ERROR</span>
                            </div>
                        </div>
                        <div class="plugin-content">
                            <div class="plugin-header">
                                <h3 class="plugin-title">${plugin.name}</h3>
                            </div>
                            <p class="plugin-description">Settings could not be loaded for this plugin.</p>
                            <button class="reload-settings-button">Reload Settings</button>
                        </div>
                    `;
                    
                    // Add click event to reload settings
                    const reloadButton = errorCard.querySelector('.reload-settings-button');
                    if (reloadButton) {
                        reloadButton.addEventListener('click', async function(e) {
                            e.stopPropagation(); // Don't trigger the card's main click event
                            
                            // Try to fix settings for this plugin
                            if (window.inspectAndFixPluginSettings) {
                                try {
                                    const result = await window.inspectAndFixPluginSettings(plugin.id);
                                    if (result && !result.error) {
                                        alert(`Settings repair attempted for ${plugin.name}. Please refresh the page.`);
                                    } else {
                                        alert(`Could not repair settings: ${result.error || 'Unknown error'}`);
                                    }
                                } catch (err) {
                                    console.error(`Error repairing settings:`, err);
                                    alert(`Failed to repair settings: ${err.message}`);
                                }
                            }
                        });
                    }
                    
                    // Return the error card
                    resolve(errorCard);
                    return;
                }
                
                // Check if the module is already registered
                const cardModule = PluginRegistry.get(plugin.id, 'card');
                if (cardModule) {
                    // Use the registered module to create the card
                    const card = cardModule.createCard(plugin);
                    resolve(card);
                    return;
                }

                // If not registered, use the default card implementation with license status
                console.log(`🔍 [DEBUG-CARD] Creating default card for plugin: ${plugin.id}`);
                console.log(`🔍 [DEBUG-CARD] Plugin status from data:`, plugin.status);
                console.log(`🔍 [DEBUG-CARD] Plugin settings:`, plugin.settings);
                console.log(`🔍 [DEBUG-CARD] License status:`, plugin.licenseStatus);
                
                const card = document.createElement('div');
                card.className = 'plugin-card';
                card.setAttribute('data-plugin-id', plugin.id);

                // Get license status info
                const licenseStatus = plugin.licenseStatus || 'inactive';
                let licenseClass = '';
                let licenseDisplay = '';
                let licenseDetails = '';
                
                // Map license status to display and classes
                switch (licenseStatus) {
                    case 'authorized':
                        licenseClass = 'license-active';
                        licenseDisplay = 'LICENSED';
                        break;
                    case 'trial':
                        licenseClass = 'license-trial';
                        licenseDisplay = 'TRIAL';
                        // Add trial days remaining if available
                        if (plugin.trialData && plugin.trialData.daysRemaining !== undefined) {
                            licenseDetails = `<div class="license-details">Trial: ${plugin.trialData.daysRemaining} days left</div>`;
                        }
                        break;
                    case 'unauthorized':
                        licenseClass = 'license-expired';
                        licenseDisplay = 'EXPIRED';
                        break;
                    case 'inactive':
                    default:
                        licenseClass = 'license-inactive';
                        licenseDisplay = 'ACTIVATE';
                        break;
                }
                
                // Determine what status display to use
                // For unlicensed plugins (inactive, unauthorized), use UNLICENSED
                // For other license statuses, use the plugin's enabled/disabled status
                let statusDisplay;
                let statusClass;
                
                if (licenseStatus === 'inactive' || licenseStatus === 'unauthorized') {
                    statusDisplay = 'UNLICENSED';
                    statusClass = 'status-unlicensed';
                } else {
                    // Add default status if not defined - only for licensed or trial
                    const status = plugin.status || 'disabled';
                    statusDisplay = status.toUpperCase();
                    statusClass = `status-${status}`;
                }

                card.innerHTML = `
                    <div class="top-wrapper">
                    <div class="plugin-icon">
                        <img src="${plugin.icon}" alt="${plugin.name} icon">
                    </div>
                    <div class="status-wrapper">
                    <span class="plugin-status ${statusClass}">${statusDisplay}</span>
                    ${licenseDetails}
                    </div>
                    </div>
                    <div class="plugin-content">
                        <div class="plugin-header">
                            <h3 class="plugin-title">${plugin.name}</h3>
                        </div>
                        <p class="plugin-description">${plugin.description}</p>
                    </div>
                `;

                // Add click event listener to open settings panel
                card.addEventListener('click', function () {
                    loadPluginSettingsModule(plugin.id);
                });

                resolve(card);
            } catch (error) {
                console.error(`Error creating card for plugin ${plugin.id}:`, error);
                
                // Create error card on exception
                const errorCard = document.createElement('div');
                errorCard.className = 'plugin-card error-card';
                errorCard.setAttribute('data-plugin-id', plugin.id);
                errorCard.innerHTML = `
                    <div class="top-wrapper">
                        <div class="plugin-icon">
                            <img src="${plugin.icon || 'sqs-placeholder.jpg'}" alt="${plugin.name || 'Plugin'} icon">
                        </div>
                        <div class="status-wrapper">
                            <span class="plugin-status status-error">ERROR</span>
                        </div>
                        <div class="plugin-content">
                            <div class="plugin-header">
                                <h3 class="plugin-title">${plugin.name || 'Unknown Plugin'}</h3>
                            </div>
                            <p class="plugin-description">Error: ${error.message}</p>
                        </div>
                    </div>
                `;
                resolve(errorCard);
            }
        });
    }

    // Function to check if wizards are enabled globally
    function areWizardsEnabled() {
        // First check the data attribute on the dashboard wrapper
        const dashboardWrapper = document.querySelector('.dashboard-wrapper');
        if (dashboardWrapper && dashboardWrapper.getAttribute('data-wizard-enabled') === 'false') {
            console.log('Wizards disabled via data-wizard-enabled attribute');
            return false;
        }

        // Fallback to window variable if no data attribute is found or if it's not 'false'
        return window.WIZARDS_ENABLED !== false;
    }

    // Add the toggle function too
    function toggleWizards(enabled) {
        const dashboardWrapper = document.querySelector('.dashboard-wrapper');
        if (dashboardWrapper) {
            dashboardWrapper.setAttribute('data-wizard-enabled', enabled ? 'true' : 'false');
            console.log(`Wizards ${enabled ? 'enabled' : 'disabled'} via API call`);
            return true;
        }
        return false;
    }

    // Collect settings from all forms
    function collectSettingsFromForms(pluginId, schema) {
        console.log(`🔍 [DEBUG-SETTINGS] Collecting settings from forms for plugin: ${pluginId}`);
        
        const forms = elements.panelContent.querySelectorAll('.settings-form');
        if (!forms || forms.length === 0) {
            console.log(`🔍 [DEBUG-SETTINGS] No forms found for plugin: ${pluginId}`);
            return { enabled: true }; // Default setting
        }

        // Extract categories if they exist
        const categories = schema.filter(item => item.type === 'category');
        let allSettings = {};

        // If using categories/tabs
        if (categories.length > 0) {
            console.log(`🔍 [DEBUG-SETTINGS] Plugin has ${categories.length} categories/tabs`);
            
            // Process each form (one per tab)
            forms.forEach(form => {
                // Get the tab ID and corresponding category
                const tabContent = form.closest('.tab-content');
                if (!tabContent) {
                    console.log(`🔍 [DEBUG-SETTINGS] Form not in a tab container, skipping`);
                    return;
                }
                
                const tabId = tabContent.getAttribute('data-tab-content');
                console.log(`🔍 [DEBUG-SETTINGS] Processing form in tab: ${tabId}`);
                
                const category = categories.find(item => item.id === tabId);
                if (!category) {
                    console.log(`🔍 [DEBUG-SETTINGS] No category found for tabId: ${tabId}`);
                    return;
                }

                // Get components from the category
                const tabSchema = category.components || [];
                const formSettings = SettingsComponents.collectFormValues(form, tabSchema);
                console.log(`🔍 [DEBUG-SETTINGS] Collected settings from tab ${tabId}:`, formSettings);
                
                // Merge with allSettings
                allSettings = { ...allSettings, ...formSettings };
            });
        } else {
            // Single form, no tabs
            console.log(`🔍 [DEBUG-SETTINGS] Plugin has a single form without tabs`);
            allSettings = SettingsComponents.collectFormValues(forms[0], schema);
        }

        // Ensure the enabled property exists
        if (!allSettings.hasOwnProperty('enabled')) {
            console.log(`🔍 [DEBUG-SETTINGS] Adding default enabled=true property`);
            allSettings.enabled = true;
        }
        
        console.log(`🔍 [DEBUG-SETTINGS] Final collected settings:`, allSettings);
        return allSettings;
    }

    // Load a plugin's settings module and open the panel
    function loadPluginSettingsModule(pluginId) {
        try {
            // Get the plugin data
            const plugin = installedPlugins.find(p => p.id === pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Reset unsaved changes flag for new panel
            hasUnsavedChanges = false;
            hideNotification();

            // Show panel immediately with loading state
            elements.settingsPanel.classList.add('visible');

            // Add panel width class based on plugin setting
            elements.settingsPanel.classList.remove('panel-width-half', 'panel-width-full');
            const panelWidth = plugin.panelWidth || 'half';
            elements.settingsPanel.classList.add(`panel-width-${panelWidth}`);

            elements.overlay.classList.add('visible');
            elements.settingsPanel.setAttribute('aria-hidden', 'false');

            const pluginSettingsTitle = document.getElementById('plugin-settings-title');
            if (pluginSettingsTitle) {
                pluginSettingsTitle.textContent = `${plugin.name}`;
            }

            // Show skeleton loading for settings panel
            if (window.SkeletonLoader) {
                loadingStates.settings = window.SkeletonLoader.show('panel-content', 'settingsPanel');
            } else {
                // Show a simple loading indicator if skeleton loader is not available
                elements.panelContent.innerHTML = '<div class="loading-indicator"><p>Loading settings...</p></div>';
            }

            // Set active panel
            activePanel = pluginId;

            // Explicitly set and expose the active panel ID globally (PATCH)
            window.activePanel = pluginId;
            console.log('Active panel ID globally exposed:', window.activePanel);

            // Also set data attribute on the panel for easier detection (PATCH)
            if (elements.settingsPanel) {
                elements.settingsPanel.setAttribute('data-plugin-id', pluginId);
                console.log('Added data-plugin-id attribute to settings panel');
            }

                // Check if this plugin has a wizard and should show it
                const hasWizard = plugin.hasWizard === true;

                // Simple check - are wizards enabled?
                if (hasWizard && areWizardsEnabled()) {
                    console.log(`Plugin ${pluginId} has a wizard and wizards are enabled`);

                    // Load the wizard module if needed
                    Dashboard.loadWizardScript(plugin)
                        .then(wizardModule => {
                            if (wizardModule && wizardModule.shouldShowWizard && wizardModule.shouldShowWizard()) {
                                console.log(`Showing wizard for ${pluginId}`);

                                // Hide skeleton loader
                                if (loadingStates.settings) {
                                    loadingStates.settings.hide();
                                }

                                // Show the wizard
                                return Dashboard.showWizard(pluginId);
                            } else {
                                console.log(`Wizard not needed for ${pluginId}, showing regular settings`);
                                // Continue with normal settings loading
                                renderPluginSettings();
                            }
                        })
                        .catch(err => {
                            console.error(`Error loading wizard for ${pluginId}:`, err);
                            // Fall back to normal settings
                            renderPluginSettings();
                        });
                } else {
                    // If wizard is disabled or plugin doesn't have a wizard
                    if (hasWizard) {
                        console.log(`Wizard for ${pluginId} is disabled globally`);
                    }
                    // No wizard, just render the regular settings
                    renderPluginSettings();
                }

                // Function to render the regular plugin settings
                function renderPluginSettings() {
                    // Check if the plugin has a registered settings schema
                    const schema = PluginSettingsRegistry.getSchema(pluginId);
                    const customModule = PluginRegistry.get(pluginId, 'settings');

                    // Generate settings panel content
                    let panelHTML = '';

                    if (schema) {
                        const categories = schema.filter(item => item.type === 'category');
                        
                        if (categories.length > 0) {
                            console.log(`🔍 [DEBUG-SETTINGS] Plugin has ${categories.length} categories/tabs`);
                            
                            // Create tabbed interface with categories plus licensing tab at the end
                            panelHTML = `
                                <div class="settings-tabs">
                                    ${categories.map(cat => `<button class="tab-button" data-tab-target="${cat.id}">${cat.title ? cat.title.charAt(0).toUpperCase() + cat.title.slice(1) : cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}</button>`).join('')}
                                    <button class="tab-button" data-tab-target="licensing">Licensing</button>
                                </div>
                                <div class="settings-content">
                                    ${categories.map((cat, index) => `
                                        <div class="tab-content ${index === 0 ? 'active' : ''}" data-tab-content="${cat.id}">
                                            <form class="settings-form" data-category="${cat.id}">
                                                ${SettingsComponents ? cat.components.map(component => SettingsComponents.renderSetting(component, plugin.settings || {})).join('') : ''}
                                            </form>
                                        </div>
                                    `).join('')}
                                    <div class="tab-content ${categories.length === 0 ? 'active' : ''}" data-tab-content="licensing">
                                        <div class="settings-form">
                                            ${generateLicensingUI(plugin).outerHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="button cancel-button">Cancel</button>
                                    <button type="button" class="button save-button">Save</button>
                                </div>
                            `;
                        } else {
                            console.log(`🔍 [DEBUG-SETTINGS] Plugin has a simple settings panel without tabs`);
                            
                            // Simple settings panel with just main settings and licensing tab
                            panelHTML = `
                                <div class="settings-tabs">
                                    <button class="tab-button active" data-tab-target="settings">Settings</button>
                                    <button class="tab-button" data-tab-target="licensing">Licensing</button>
                                </div>
                                <div class="settings-content">
                                    <div class="tab-content active" data-tab-content="settings">
                                        <form class="settings-form">
                                            <div class="settings-section">
                                                <div class="setting-group toggle-group">
                                                    <label class="toggle-switch">
                                                        <input type="checkbox" id="enabled" name="enabled" ${plugin.settings?.enabled !== false ? 'checked' : ''}>
                                                        <span class="toggle-slider"></span>
                                                    </label>
                                                    <div class="toggle-labels">
                                                        <span class="toggle-title">Plugin Enabled</span>
                                                        <span class="toggle-status">${plugin.settings?.enabled !== false ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            ${SettingsComponents ? schema.map(setting => SettingsComponents.renderSetting(setting, plugin.settings || {})).join('') : ''}
                                        </form>
                                    </div>
                                    <div class="tab-content" data-tab-content="licensing">
                                        <div class="settings-form">
                                            ${generateLicensingUI(plugin).outerHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="button cancel-button">Cancel</button>
                                    <button type="button" class="button save-button">Save</button>
                                </div>
                            `;
                        }
                    } else {
                        // Fallback for plugins with no registered settings schema
                        console.log(`🔍 [DEBUG-SETTINGS] Plugin ${plugin.id} has no registered schema`);
                        
                        // Simple toggle and licensing UI
                        panelHTML = `
                            <div class="settings-tabs">
                                <button class="tab-button active" data-tab-target="settings">Settings</button>
                                <button class="tab-button" data-tab-target="licensing">Licensing</button>
                            </div>
                            <div class="settings-content">
                                <div class="tab-content active" data-tab-content="settings">
                                    <form class="settings-form">
                                        <div class="settings-section">
                                            <div class="setting-group toggle-group">
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="enabled" name="enabled" ${plugin.settings?.enabled !== false ? 'checked' : ''}>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                                <div class="toggle-labels">
                                                    <span class="toggle-title">Plugin Enabled</span>
                                                    <span class="toggle-status">${plugin.settings?.enabled !== false ? 'Enabled' : 'Disabled'}</span>
                                                </div>
                                            </div>
                                            <p class="no-settings-message">This plugin has no additional settings.</p>
                                        </div>
                                    </form>
                                </div>
                                <div class="tab-content" data-tab-content="licensing">
                                    <div class="settings-form">
                                        ${generateLicensingUI(plugin).outerHTML}
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="button cancel-button">Cancel</button>
                                <button type="button" class="button save-button">Save</button>
                            </div>
                        `;
                    }

                    // Hide skeleton loading and update panel content
                    if (loadingStates.settings) {
                        loadingStates.settings.hide();
                    }
                    elements.panelContent.innerHTML = panelHTML;

                    // Add event listeners
                    const forms = elements.panelContent.querySelectorAll('.settings-form');
                    const cancelButton = elements.panelContent.querySelector('.cancel-button');
                    const saveButton = elements.panelContent.querySelector('.save-button');

                    if (cancelButton) {
                        cancelButton.addEventListener('click', handleClosePanel);
                    }

                    if (saveButton && forms.length > 0) {
                        saveButton.addEventListener('click', function () {
                            // Collect settings from all forms and save them
                            const settings = collectSettingsFromForms(pluginId, schema);
                            savePluginSettings(pluginId, settings);
                            hasUnsavedChanges = false;
                            updateNotificationState();
                        });
                    }

                    // Ensure the first tab is active by default
                    const tabButtons = elements.panelContent.querySelectorAll('.settings-tabs .tab-button');
                    if (tabButtons.length > 0) {
                        // Set the first tab as active
                        tabButtons[0].classList.add('active');
                        
                        // Bind tab switching functionality
                        tabButtons.forEach(button => {
                            button.addEventListener('click', function () {
                                // Update active tab button
                                tabButtons.forEach(btn => btn.classList.remove('active'));
                                button.classList.add('active');

                                // Update active tab content
                                const targetTabId = button.getAttribute('data-tab-target');
                                const tabContents = elements.panelContent.querySelectorAll('.tab-content');
                                tabContents.forEach(content => content.classList.remove('active'));
                                elements.panelContent.querySelector(`.tab-content[data-tab-content="${targetTabId}"]`).classList.add('active');
                            });
                        });
                    }

                    // Bind change handlers to all forms
                    if (schema && forms.length > 0) {
                        forms.forEach(form => {
                            // Find all form elements - inputs, selects, textareas
                            const formElements = form.querySelectorAll('input, select, textarea');
                            formElements.forEach(element => {
                                // Checkboxes and radios use change event, others use input event
                                const eventType = (element.type === 'checkbox' || element.type === 'radio') ? 'change' : 'input';
                                
                                // For toggle switches, update the toggle status text
                                if (element.type === 'checkbox' && element.closest('.toggle-switch')) {
                                    element.addEventListener(eventType, function(e) {
                                        const toggleGroup = element.closest('.toggle-group');
                                        if (toggleGroup) {
                                            const statusEl = toggleGroup.querySelector('.toggle-status');
                                            if (statusEl) {
                                                statusEl.textContent = element.checked ? 'Enabled' : 'Disabled';
                                            }
                                        }
                                        
                                        // Mark as having unsaved changes
                                        hasUnsavedChanges = true;
                                        updateNotificationState();
                                    });
                                } else {
                                    // Regular form element change handler
                                    element.addEventListener(eventType, function(e) {
                                        hasUnsavedChanges = true;
                                        updateNotificationState();
                                    });
                                }
                            });
                            
                            // Specifically handle sliders which need special handling for value display
                            const sliders = form.querySelectorAll('input[type="range"]');
                            sliders.forEach(slider => {
                                const valueDisplay = slider.parentElement.querySelector('.slider-value');
                                if (valueDisplay) {
                                    slider.addEventListener('input', function() {
                                        valueDisplay.textContent = this.value;
                                        hasUnsavedChanges = true;
                                        updateNotificationState();
                                    });
                                }
                            });
                            
                            // Handle color pickers - this is critical for expanding/collapsing and tab switching
                            const colorPickers = form.querySelectorAll('.color-picker-compact');
                            
                            // Function to close all color pickers
                            const closeAllColorPickers = () => {
                                colorPickers.forEach(picker => {
                                    const expanded = picker.querySelector('.color-picker-expanded');
                                    if (expanded) {
                                        expanded.style.display = 'none';
                                    }
                                });
                            };
                            
                            colorPickers.forEach(pickerContainer => {
                                // Toggle expanded state when clicking the color display
                                const colorDisplay = pickerContainer.querySelector('.current-color-display');
                                if (colorDisplay) {
                                    colorDisplay.addEventListener('click', function(e) {
                                        e.stopPropagation(); // Prevent event bubbling
                                        
                                        const expanded = pickerContainer.querySelector('.color-picker-expanded');
                                        if (!expanded) return;
                                        
                                        const isCurrentlyHidden = expanded.style.display === 'none' || !expanded.style.display;
                                        
                                        // Close all other color pickers first
                                        closeAllColorPickers();
                                        
                                        // Then open this one if it was closed
                                        if (isCurrentlyHidden) {
                                            expanded.style.display = 'block';
                                        }
                                    });
                                }
                                
                                // Tab switching in color picker
                                const tabButtons = pickerContainer.querySelectorAll('.color-picker-tab-buttons .tab-button');
                                tabButtons.forEach(button => {
                                    button.addEventListener('click', function(e) {
                                        e.stopPropagation(); // Prevent event bubbling
                                        
                                        const targetTab = this.getAttribute('data-tab');
                                        
                                        // Update active state on tabs
                                        pickerContainer.querySelectorAll('.tab-button').forEach(btn => {
                                            btn.classList.remove('active');
                                        });
                                        this.classList.add('active');
                                        
                                        // Show the correct panel
                                        const panels = pickerContainer.querySelectorAll('.tab-panel');
                                        panels.forEach(panel => {
                                            panel.classList.toggle('active', panel.getAttribute('data-panel') === targetTab);
                                        });
                                    });
                                });
                                
                                // Palette color swatch selection
                                const swatches = pickerContainer.querySelectorAll('.color-swatch');
                                swatches.forEach(swatch => {
                                    swatch.addEventListener('click', function(e) {
                                        e.stopPropagation(); // Prevent event bubbling
                                        
                                        const colorVar = this.getAttribute('data-color-var');
                                        const settingId = this.getAttribute('data-for');
                                        const colorInput = pickerContainer.querySelector('input[type="color"]');
                                        
                                        if (colorInput) {
                                            // Set the used var attribute
                                            colorInput.setAttribute('data-used-var', colorVar);
                                            
                                            // Remove selection from all swatches
                                            pickerContainer.querySelectorAll('.color-swatch').forEach(s => {
                                                s.classList.remove('selected');
                                            });
                                            
                                            // Add selection to this swatch
                                            this.classList.add('selected');
                                            
                                            // Update the display color
                                            const colorDisplay = pickerContainer.querySelector('.current-color-display');
                                            if (colorDisplay) {
                                                colorDisplay.style.backgroundColor = this.style.backgroundColor;
                                            }
                                            
                                            // Close color picker after selection
                                            const expanded = pickerContainer.querySelector('.color-picker-expanded');
                                            if (expanded) {
                                                expanded.style.display = 'none';
                                            }
                                            
                                            // Mark as having unsaved changes
                                            hasUnsavedChanges = true;
                                            updateNotificationState();
                                        }
                                    });
                                });
                                
                                // Color input handling
                                const colorInput = pickerContainer.querySelector('input[type="color"]');
                                const hexInput = pickerContainer.querySelector('.color-hex-input');
                                
                                if (colorInput) {
                                    colorInput.addEventListener('input', function(e) {
                                        e.stopPropagation(); // Prevent event bubbling
                                        
                                        // Clear any used var
                                        this.setAttribute('data-used-var', '');
                                        
                                        // Update hex input
                                        if (hexInput) {
                                            hexInput.value = this.value;
                                        }
                                        
                                        // Remove selection from all swatches
                                        pickerContainer.querySelectorAll('.color-swatch').forEach(s => {
                                            s.classList.remove('selected');
                                        });
                                        
                                        // Update display color
                                        const colorDisplay = pickerContainer.querySelector('.current-color-display');
                                        if (colorDisplay) {
                                            colorDisplay.style.backgroundColor = this.value;
                                        }
                                        
                                        // Mark as having unsaved changes
                                        hasUnsavedChanges = true;
                                        updateNotificationState();
                                    });
                                }
                                
                                if (hexInput) {
                                    hexInput.addEventListener('input', function(e) {
                                        e.stopPropagation(); // Prevent event bubbling
                                        
                                        // Only update if valid hex
                                        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                                            if (colorInput) {
                                                colorInput.value = this.value;
                                                colorInput.setAttribute('data-used-var', '');
                                            }
                                            
                                            // Remove selection from all swatches
                                            pickerContainer.querySelectorAll('.color-swatch').forEach(s => {
                                                s.classList.remove('selected');
                                            });
                                            
                                            // Update display color
                                            const colorDisplay = pickerContainer.querySelector('.current-color-display');
                                            if (colorDisplay) {
                                                colorDisplay.style.backgroundColor = this.value;
                                            }
                                            
                                            // Mark as having unsaved changes
                                            hasUnsavedChanges = true;
                                            updateNotificationState();
                                        }
                                    });
                                }
                            });
                            
                            // Close color pickers when clicking outside
                            document.addEventListener('click', function(e) {
                                // Don't close if clicking inside a color picker
                                if (e.target.closest('.color-picker-compact')) {
                                    return;
                                }
                                
                                // Close all color pickers
                                colorPickers.forEach(picker => {
                                    const expanded = picker.querySelector('.color-picker-expanded');
                                    if (expanded) {
                                        expanded.style.display = 'none';
                                    }
                                });
                            });
                            
                            // Specifically handle custom components if any
                            if (customModule && customModule.initializeCustomComponents) {
                                try {
                                    customModule.initializeCustomComponents(elements.panelContent);
                                    console.log(`📍 [Settings] Custom components initialized for ${pluginId}`);
                                } catch (error) {
                                    console.error(`📍 [Settings] Error initializing custom components for ${pluginId}:`, error);
                                }
                            }
                            
                            // Use SettingsComponents.bindEventHandlers if available
                            if (SettingsComponents && SettingsComponents.bindEventHandlers) {
                                forms.forEach(form => {
                                    try {
                                        // Use the actual schema for the specific form
                                        const formCategory = form.getAttribute('data-category');
                                        let formSchema = schema;
                                        
                                        if (formCategory) {
                                            const category = schema.find(item => item.type === 'category' && item.id === formCategory);
                                            if (category && category.components) {
                                                formSchema = category.components;
                                            }
                                        }
                                        
                                        SettingsComponents.bindEventHandlers(form, formSchema, function(settingId, value) {
                                            hasUnsavedChanges = true;
                                            updateNotificationState();
                                        });
                                        
                                        console.log(`📍 [Settings] SettingsComponents event handlers bound for form ${formCategory || 'default'}`);
                                    } catch (error) {
                                        console.error(`📍 [Settings] Error binding SettingsComponents event handlers:`, error);
                                    }
                                });
                            }
                        });
                        
                        // Specifically handle custom components if any
                        if (customModule && customModule.initializeCustomComponents) {
                            try {
                                customModule.initializeCustomComponents(elements.panelContent);
                                console.log(`📍 [Settings] Custom components initialized for ${pluginId}`);
                            } catch (error) {
                                console.error(`📍 [Settings] Error initializing custom components for ${pluginId}:`, error);
                            }
                        }
                        
                        // Use SettingsComponents.bindEventHandlers if available
                        if (SettingsComponents && SettingsComponents.bindEventHandlers) {
                            forms.forEach(form => {
                                try {
                                    // Use the actual schema for the specific form
                                    const formCategory = form.getAttribute('data-category');
                                    let formSchema = schema;
                                    
                                    if (formCategory) {
                                        const category = schema.find(item => item.type === 'category' && item.id === formCategory);
                                        if (category && category.components) {
                                            formSchema = category.components;
                                        }
                                    }
                                    
                                    SettingsComponents.bindEventHandlers(form, formSchema, function(settingId, value) {
                                        hasUnsavedChanges = true;
                                        updateNotificationState();
                                    });
                                    
                                    console.log(`📍 [Settings] SettingsComponents event handlers bound for form ${formCategory || 'default'}`);
                                } catch (error) {
                                    console.error(`📍 [Settings] Error binding SettingsComponents event handlers:`, error);
                                }
                            });
                        }
                    }
                }
        } catch (error) {
            console.error(`Error loading settings for plugin ${pluginId}:`, error);

            // Hide skeleton loading if it was shown
            if (loadingStates.settings) {
                loadingStates.settings.hide();
            }

            elements.panelContent.innerHTML = `
            <div class="error-message">
                <p>Error loading settings for this plugin.</p>
                <button class="button cancel-button">Close</button>
            </div>
        `;

            const cancelButton = elements.panelContent.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', handleClosePanel);
            }
        }
    }

    // Handle close panel event with attention animation
    function handleClosePanel() {
        console.log("handleClosePanel called, hasUnsavedChanges =", hasUnsavedChanges);

        // If there are unsaved changes, show attention animation instead of closing
        if (hasUnsavedChanges) {
            console.log("Showing attention animation");
            showAttention();
            return;
        }

        // If no unsaved changes, close the panel
        console.log("Closing panel - no unsaved changes");
        closeSettingsPanel();
    }

    // Close settings panel
    function closeSettingsPanel() {
        elements.settingsPanel.classList.remove('visible');
        elements.overlay.classList.remove('visible');

        // For accessibility
        elements.settingsPanel.setAttribute('aria-hidden', 'true');

        // Clear active panel
        activePanel = null;

        // Clear the window.activePanel global variable (PATCH)
        window.activePanel = null;
        console.log('Active panel ID cleared on panel close');

        // Remove the data attribute (PATCH)
        if (elements.settingsPanel) {
            elements.settingsPanel.removeAttribute('data-plugin-id');
        }

        hasUnsavedChanges = false;
        hideNotification();

        // Clear content after animation (300ms)
        setTimeout(() => {
            elements.panelContent.innerHTML = '';
        }, 300);
    }

    // Custom component data registry
    const CustomComponentDataRegistry = {
        data: {},

        register: function (pluginId, componentId, data) {
            if (!this.data[pluginId]) {
                this.data[pluginId] = {};
            }
            this.data[pluginId][componentId] = data;
            console.log(`Registered data for custom component ${componentId} in plugin ${pluginId}`);
        },

        get: function (pluginId, componentId) {
            if (!this.data[pluginId] || !this.data[pluginId][componentId]) {
                return null;
            }
            return this.data[pluginId][componentId];
        }
    };

    // Save plugin settings
    async function savePluginSettings(pluginId, settings = {}) {
        // Get the plugin
        const pluginIndex = installedPlugins.findIndex(p => p.id === pluginId);
        if (pluginIndex === -1) return;

        console.log(`Saving settings for ${pluginId}:`, settings);

        // Update plugin status if enabled setting is present
        if ('enabled' in settings) {
            installedPlugins[pluginIndex].status = settings.enabled ? 'enabled' : 'disabled';

            // Update UI
            const card = document.querySelector(`.plugin-card[data-plugin-id="${pluginId}"]`);
            if (card) {
                const statusElement = card.querySelector('.plugin-status');
                if (statusElement) {
                    statusElement.className = `plugin-status status-${settings.enabled ? 'enabled' : 'disabled'}`;
                    statusElement.textContent = settings.enabled ? 'ENABLED' : 'DISABLED';
                }
            }
        }

        // Check for custom component data
        const customData = CustomComponentDataRegistry.data[pluginId];
        if (customData) {
            // Include custom component data in settings
            for (const componentId in customData) {
                if (typeof settings[componentId] === 'object') {
                    settings[componentId] = {
                        ...settings[componentId],
                        ...customData[componentId]
                    };
                } else {
                    settings[componentId] = customData[componentId];
                }
            }
        }

        // Save settings in the plugin object
        installedPlugins[pluginIndex].settings = {
            ...installedPlugins[pluginIndex].settings || {},
            ...settings
        };

        // Also save licensing information if present
        if (settings.license_key || settings.trial_start || installedPlugins[pluginIndex].licenseStatus) {
            // Update licensing data if we have it, either from newly saved settings or existing plugin data
            try {
                if (window.SquareHeroLicensing) {
                    const licenseData = await window.SquareHeroLicensing.getPluginData(pluginId);
                    
                    // Update license data with settings
                    if (settings.license_key && !licenseData.license_key) {
                        licenseData.license_key = settings.license_key;
                    }
                    
                    if (settings.activated_at && !licenseData.activated_at) {
                        licenseData.activated_at = settings.activated_at;
                    }
                    
                    // Update status if needed
                    const currentStatus = licenseData.status || 'inactive';
                    const pluginLicenseStatus = installedPlugins[pluginIndex].licenseStatus || currentStatus;
                    
                    // Only update if different to avoid unnecessary writes
                    if (currentStatus !== pluginLicenseStatus) {
                        licenseData.status = pluginLicenseStatus;
                    }
                    
                    // Save updates back to licensing system
                    await window.SquareHeroLicensing.savePluginData(pluginId, licenseData);
                    console.log(`Updated licensing data for ${pluginId}:`, licenseData);
                }
            } catch (licenseError) {
                console.error(`Error updating licensing data for ${pluginId}:`, licenseError);
                // Continue with saving other settings even if licensing update fails
            }
        }

        // Call onSave handler if registered
        const handlers = PluginSettingsRegistry.getHandlers(pluginId);
        if (handlers.onSave) {
            // Make sure we pass a copy to avoid reference issues
            const settingsCopy = JSON.parse(JSON.stringify(installedPlugins[pluginIndex].settings));
            handlers.onSave(settingsCopy);
        }

        // Save to Firebase
        try {
            // Make a clean copy of settings for Firebase
            const settingsForFirebase = JSON.parse(JSON.stringify(installedPlugins[pluginIndex].settings));

            const savedToFirebase = await FirebaseService.updatePluginSettings(
                pluginId,
                settingsForFirebase
            );

            if (savedToFirebase) {
                showSuccessNotification('Settings saved to cloud.');
            } else {
                showSuccessNotification('Settings saved locally.');
            }
        } catch (error) {
            console.error(`Error saving settings to Firebase: ${error.message}`);
            showSuccessNotification('Settings saved locally only.');
        }

        return true;
    }

    // Initialize event listeners
    function initEventListeners() {
        // Close panel button
        elements.closeButton.addEventListener('click', handleClosePanel);

        // Overlay click
        elements.overlay.addEventListener('click', handleClosePanel);

        // Handle escape key
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && activePanel) {
                handleClosePanel();
            }
        });

        // Handle logout button click
        document.getElementById('logout-button').addEventListener('click', async () => {
            try {
                // Import required Firebase auth functions
                const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js");
                const auth = getAuth();
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }

    // Load news items from Firebase
    async function loadNewsItems() {
        try {
            // Logging for debugging
            console.log("loadNewsItems() - Dashboard.FirebaseService.db:", Dashboard.FirebaseService.db);
            console.log("loadNewsItems() - typeof Dashboard.FirebaseService.db:", typeof Dashboard.FirebaseService.db);
            console.log("loadNewsItems() - Dashboard.FirebaseService.ref:", Dashboard.FirebaseService.ref);
            console.log("loadNewsItems() - typeof Dashboard.FirebaseService.ref:", typeof Dashboard.FirebaseService.ref);

            // Use ref and get (again, exactly as in getPluginSettings)
            const newsRef = ref(Dashboard.FirebaseService.db, 'news');
            const snapshot = await get(newsRef);
            const newsData = snapshot.val();

            if (newsData) {
                // Convert news data to an array and sort by timestamp (latest first)
                const newsItems = Object.entries(newsData)
                    .map(([key, value]) => ({
                        ...value,
                        id: key, // Include the key if you need it later
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending

                // Format timestamp into a human-readable date
                const formattedNewsItems = newsItems.map(item => ({
                    date: new Date(item.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    title: item.title,
                    content: item.content, // Include content if you want to display it
                }));

                // Render the news items
                renderNewsItems(formattedNewsItems);
            } else {
                // No news items found
                renderNewsItems([]); // Pass an empty array
            }

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 400));

            // Hide the skeleton loader
            if (loadingStates.news) {
                loadingStates.news.hide();
            }
        } catch (error) {
            console.error('Error loading news items from Firebase:', error);
            // Handle the error appropriately (e.g., display an error message)
            elements.newsItemsContainer.innerHTML = '<p>Error loading news items.</p>';
            if (loadingStates.news) {
                loadingStates.news.hide();
            }
        }
    }

    // Render news items
    function renderNewsItems(newsItems) {
        if (!newsItems || !newsItems.length) {
            elements.newsItemsContainer.innerHTML = '<p>No news items available.</p>';
            return;
        }

        // Create HTML for news items
        const newsHTML = newsItems.map(item => `
    <div class="news-item">
        <p class="news-date">${item.date}</p>
        <h3 class="news-title">${item.title}</h3>
        <p class="news-content">${item.content || ''}</p>
    </div>
`).join('');

        // Update container
        elements.newsItemsContainer.innerHTML = newsHTML;
    }

    // Render all available plugins for discovery
    function renderDiscoverPluginCards() {
        const discoverPluginsContainer = document.getElementById('discover-plugins-content');
        
        console.log('🔍 [DEBUG-DISCOVER] Starting renderDiscoverPluginCards');
        console.log('🔍 [DEBUG-DISCOVER] Available plugins count:', availablePlugins?.length);
        console.log('🔍 [DEBUG-DISCOVER] Installed plugins count:', installedPlugins?.length);

        if (!availablePlugins || !availablePlugins.length) {
            console.log('🔍 [DEBUG-DISCOVER] No available plugins found');
            discoverPluginsContainer.innerHTML = '<p>No plugins available to discover.</p>';
            return;
        }

        // Create a grid for discover plugins
        const pluginGrid = document.createElement('div');
        pluginGrid.id = 'discover-plugins-grid';
        pluginGrid.className = 'discover-plugins-grid';

        console.log('🔍 [DEBUG-DISCOVER] Installed plugin IDs:', installedPlugins.map(p => p.id));

        // Filter available plugins to only include those that aren't already installed
        const pluginsToDiscover = availablePlugins.filter(plugin => {
            const isInstalled = installedPlugins.some(p => p.id === plugin.id);
            console.log(`🔍 [DEBUG-DISCOVER] Plugin ${plugin.id}: installed=${isInstalled}`);
            return !isInstalled; // Only include plugins that are NOT installed
        });

        // If no plugins to discover, show a message
        if (pluginsToDiscover.length === 0) {
            console.log('🔍 [DEBUG-DISCOVER] No plugins to discover after filtering out installed plugins');
            discoverPluginsContainer.innerHTML = '<p>You have installed all available plugins. Check back soon for new additions!</p>';
            return;
        }

        // Process each plugin to discover
        pluginsToDiscover.forEach(plugin => {
            const card = document.createElement('div');
            card.className = 'discover-plugin-card';

            card.innerHTML = `
            <div class="discover-plugin-icon">
                <img src="${plugin.icon}" alt="${plugin.name} icon">
            </div>
            <div class="discover-plugin-content">
                <h3 class="discover-plugin-title">${plugin.name}</h3>
                <p class="discover-plugin-description">${plugin.description}</p>
                <div class="discover-plugin-actions">
                    <button class="sh-button activate-license" data-plugin-id="${plugin.id}">
                        Activate License
                    </button>
                    <button class="sh-primary-button install-plugin" data-plugin-id="${plugin.id}">
                        Get Started
                    </button>
                    <p class="fine-print">14 day free trial. No credit card required.</p>
                </div>
            </div>
        `;

            pluginGrid.appendChild(card);
        });

        discoverPluginsContainer.innerHTML = '';
        discoverPluginsContainer.appendChild(pluginGrid);
        console.log('🔍 [DEBUG-DISCOVER] Finished rendering discover plugins');
    }

    // Function to switch tabs
    function switchTab(tabId) {
        // Remove 'active' class from all tabs and tab contents
        elements.dashboardTabs.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        elements.dashboardTabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Add 'active' class to the clicked tab and corresponding content
        document.querySelector(`.dashboard-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    // Initialize tab event listeners
    function initTabEventListeners() {
        console.log("initTabEventListeners called");
        elements.dashboardTabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('dashboard-tab')) {
                const tabId = event.target.getAttribute('data-tab');
                switchTab(tabId);
            }
        });
    }

    // Initialize the dashboard
    async function init() {
        // Prevent double initialization with a global flag that persists
        if (isInitializationInProgress || window.dashboardInitialized) {
            console.log('🎯 [Dashboard] Initialization already in progress or completed, skipping');
            return;
        }
        
        // Set both flags to prevent any further initialization attempts
        isInitializationInProgress = true;
        window.dashboardInitialized = true;
        
        try {
            console.log('🎯 [Dashboard] Starting initialization');
            
            // First initialize the licensing system
            console.log('🎯 [Dashboard] Initializing licensing system');
            if (window.SquareHeroLicensing) {
                try {
                    await window.SquareHeroLicensing.initialize({
                        debug: true,
                        autoSyncWithFirebase: true
                    });
                    console.log('🎯 [Dashboard] Licensing system initialized');
                } catch (licenseError) {
                    console.error('🎯 [Dashboard] Error initializing licensing system:', licenseError);
                    // Continue with initialization even if licensing fails
                }
            } else {
                console.warn('🎯 [Dashboard] Licensing system not available');
            }
            
            // Then load the skeleton loader
            await loadSkeletonLoader();
            console.log('🎯 [Dashboard] Skeleton loader loaded');

            // Set up event listeners
            initEventListeners();
            console.log('🎯 [Dashboard] Event listeners initialized');

            // Initialize tab event listeners
            initTabEventListeners();

            // Show skeleton loaders BEFORE loading any data
            if (window.SkeletonLoader) {
                console.log('🎯 [Dashboard] Creating skeleton loaders');
                loadingStates.plugins = window.SkeletonLoader.show('plugin-cards-container', 'pluginCard', 3);
                loadingStates.news = window.SkeletonLoader.show('news-items-container', 'newsItem', 4);
                console.log('🎯 [Dashboard] Skeleton loaders created:', loadingStates);
            } else {
                console.error('🎯 [Dashboard] SkeletonLoader not available');
            }

            // Initialize Firebase
            await FirebaseService.initialize();
            console.log('🎯 [Dashboard] Firebase initialized');

            // Wait for authentication to be ready
            console.log('🎯 [Dashboard] Checking authentication status');
            if (!window.SecureFirebaseAuth || !window.SecureFirebaseAuth.isInitialized) {
                console.warn('🎯 [Dashboard] Firebase authentication not initialized, attempting to initialize');
                // Try to manually initialize authentication
                if (window.SecureFirebaseAuth && typeof window.SecureFirebaseAuth.initialize === 'function') {
                    await window.SecureFirebaseAuth.initialize();
                }
            }

            // If user isn't authenticated yet, prompt them to authenticate first
            const isAuthenticated = await ensureAuthenticated();
            console.log(`🎯 [Dashboard] Authentication status: ${isAuthenticated ? 'Authenticated ✓' : 'Not authenticated ✗'}`);

            // Load all available plugins from JSON
            availablePlugins = await loadPlugins();
            console.log('🎯 [Dashboard] Available plugins loaded:', availablePlugins);

            // Detect which plugins are actually installed on this site - DO THIS FIRST
            installedPlugins = detectInstalledPlugins(availablePlugins);
            console.log('🎯 [Dashboard] Installed plugins detected:', installedPlugins);

            // Make installedPlugins globally available
            window.installedPlugins = installedPlugins;

            // Now render discover plugins grid AFTER detecting installed plugins
            console.log('🎯 [Dashboard] Rendering discover plugins with detected installed plugins');
            renderDiscoverPluginCards();

            // Only proceed with loading settings if we have installed plugins
            if (installedPlugins.length > 0) {
                console.log('🎯 [Dashboard] Loading settings for installed plugins');
                try {
                    // Load saved settings for each plugin from Firebase
                    await Promise.all(installedPlugins.map(async (plugin) => {
                        try {
                            // Set proper default settings for each plugin only as a fallback
                            console.log(`🎯 [Dashboard] Loading settings for ${plugin.id}`);
                            
                            // Always include enabled: true in default settings as a minimum fallback
                            const defaultSettings = { enabled: true };
                            
                            // IMPORTANT: Get existing settings from Firebase
                            // getPluginSettings will only use defaults if nothing is found in Firebase
                            const savedSettings = await FirebaseService.getPluginSettings(plugin.id, defaultSettings);
                            
                            // Apply settings to the plugin object
                            plugin.settings = savedSettings;
                            
                            // Set plugin status based on the enabled property
                            plugin.status = savedSettings.enabled === false ? 'disabled' : 'enabled';
                            
                            // Get licensing status
                            if (window.SquareHeroLicensing) {
                                try {
                                    // Check licensing status
                                    const licenseData = await window.SquareHeroLicensing.getPluginData(plugin.id);
                                    plugin.licenseStatus = licenseData.status || 'inactive';
                                    
                                    // If in trial mode, get trial details
                                    if (plugin.licenseStatus === 'trial') {
                                        const trialStatus = await window.SquareHeroLicensing.checkTrialStatus(plugin.id);
                                        plugin.trialData = trialStatus;
                                        
                                        // If trial has expired, update status
                                        if (trialStatus.expired) {
                                            plugin.licenseStatus = 'unauthorized';
                                        }
                                    }
                                    
                                    console.log(`🎯 [Dashboard] License status for ${plugin.id}: ${plugin.licenseStatus}`);
                                } catch (licError) {
                                    console.error(`🎯 [Dashboard] Error getting license data for ${plugin.id}:`, licError);
                                    plugin.licenseStatus = 'inactive';
                                }
                            }
                            
                            console.log(`🎯 [Dashboard] Settings loaded for ${plugin.id}:`, plugin.settings);
                            console.log(`🎯 [Dashboard] Plugin status set to: ${plugin.status} based on enabled=${plugin.settings.enabled}`);
                        } catch (error) {
                            console.error(`🎯 [Dashboard] Error loading settings for ${plugin.id}:`, error);
                            // For error recovery, set some default values
                            plugin.settings = { enabled: true };
                            plugin.status = 'enabled';
                            plugin.licenseStatus = 'inactive';
                        }
                    }));

                    // Load scripts for installed plugins
                    console.log('🎯 [Dashboard] Loading plugin scripts');
                    await Promise.all(installedPlugins.map(loadPluginScripts));
                    console.log('🎯 [Dashboard] Plugin scripts loaded');

                    // Now render plugin cards - this will hide the skeleton loader when finished
                    console.log('🎯 [Dashboard] Rendering plugin cards');
                    await renderPluginCards();
                    console.log('🎯 [Dashboard] Plugin cards rendered');
                } catch (error) {
                    console.error('🎯 [Dashboard] Error loading plugin settings:', error);
                    if (loadingStates.plugins) {
                        loadingStates.plugins.hide();
                    }
                    elements.pluginCardsContainer.innerHTML = '<p>Error loading plugin settings. Please try again later.</p>';
                }
            } else {
                // No plugins installed, hide skeletons and show message
                console.log('🎯 [Dashboard] No plugins installed');
                if (loadingStates.plugins) {
                    console.log('🎯 [Dashboard] Hiding plugin card skeletons (no plugins)');
                    loadingStates.plugins.hide();
                }
                elements.pluginCardsContainer.innerHTML = '<p>No plugins installed on this site. Visit the SquareHero plugin store to browse available plugins.</p>';
            }

            // Load and render news items
            await loadNewsItems();

            console.log('🎯 [Dashboard] Dashboard initialized successfully!');
            isInitializationInProgress = false;
            
        } catch (error) {
            console.error('🎯 [Dashboard] Error initializing dashboard:', error);
            isInitializationInProgress = false;
            
            // Hide all skeletons in case of error
            if (loadingStates.plugins) {
                console.log('🎯 [Dashboard] Hiding plugin card skeletons (error)');
                loadingStates.plugins.hide();
            }
            if (loadingStates.news) {
                console.log('🎯 [Dashboard] Hiding news skeletons (error)');
                loadingStates.news.hide();
            }

            elements.pluginCardsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error initializing dashboard: ${error.message}</p>
                    <button class="button" id="retry-auth-button">Retry Authentication</button>
                </div>
            `;
            
            // Add a retry button event listener
            setTimeout(() => {
                const retryButton = document.getElementById('retry-auth-button');
                if (retryButton) {
                    retryButton.addEventListener('click', async () => {
                        console.log('🎯 [Dashboard] Retrying authentication...');
                        elements.pluginCardsContainer.innerHTML = '<div class="loading-indicator"><p>Authenticating...</p></div>';
                        
                        // Reset initialization flags
                        isInitializationInProgress = false;
                        window.dashboardInitialized = false;
                        
                        // Try to initialize again
                        Dashboard.init();
                    });
                }
            }, 0);
        }
    }

    // Wizard support
    const wizardRegistry = {};
    let activeWizard = null;
    let wizardStylesLoaded = false;

    /**
     * Register a wizard schema for a plugin
     */
    function registerWizardSchema(pluginId, schema) {
        wizardRegistry[pluginId] = schema;
        console.log(`Registered wizard schema for plugin: ${pluginId}`);
    }

    /**
     * Get wizard schema for a plugin
     */
    function getWizardSchema(pluginId) {
        return wizardRegistry[pluginId] || null;
    }

    /**
     * Check if a plugin has a wizard
     */
    function hasWizard(pluginId) {
        const plugin = availablePlugins.find(p => p.id === pluginId);
        return plugin && plugin.hasWizard === true;
    }

    /**
     * Load a plugin's wizard script
     */
    function loadWizardScript(plugin) {
        return new Promise((resolve, reject) => {
            // Check if plugin is valid
            if (!plugin || typeof plugin !== 'object') {
                console.error('Invalid plugin object provided to loadWizardScript');
                reject(new Error('Invalid plugin object'));
                return;
            }

            // Check if plugin has an id
            if (!plugin.id) {
                console.error('Plugin object is missing id property');
                reject(new Error('Plugin missing id property'));
                return;
            }

            // Check if already has the wizard object registered
            const wizardModule = PluginRegistry.get(plugin.id, 'wizard');
            if (wizardModule) {
                console.log(`Wizard module for ${plugin.id} already loaded`);
                resolve(wizardModule);
                return;
            }

            // Check for wizard script path
            const scriptPaths = plugin.moduleScripts || [];
            const wizardScriptPath = scriptPaths.find(path => path.includes('/wizard.js'));

            if (!wizardScriptPath) {
                console.error(`No wizard script found for plugin ${plugin.id}`);
                reject(new Error(`No wizard script found for plugin ${plugin.id}`));
                return;
            }

            // Load the wizard script
            const script = document.createElement('script');
            script.src = wizardScriptPath;
            script.onload = () => {
                console.log(`Wizard script loaded for ${plugin.id}`);

                // Give a moment for script to initialize and register itself
                setTimeout(() => {
                    const wizardModule = PluginRegistry.get(plugin.id, 'wizard');
                    if (wizardModule) {
                        resolve(wizardModule);
                    } else {
                        console.warn(`Wizard script loaded but no module registered for ${plugin.id}`);
                        resolve(null);
                    }
                }, 100);
            };
            script.onerror = (error) => {
                console.error(`Error loading wizard script for ${plugin.id}:`, error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Show wizard for a plugin
     */
    function showWizard(pluginId) {
        // Find the plugin by ID
        const plugin = installedPlugins.find(p => p.id === pluginId);
        if (!plugin) {
            console.error(`Plugin ${pluginId} not found`);
            return Promise.reject(new Error(`Plugin ${pluginId} not found`));
        }

        // Load wizard styles first if needed
        if (!wizardStylesLoaded) {
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = 'wizard-component.css';
            document.head.appendChild(styleLink);
            wizardStylesLoaded = true;
        }

        // Load the wizard script
        return loadWizardScript(plugin)
            .then(wizardModule => {
                if (!wizardModule) {
                    throw new Error(`Wizard module not found for ${pluginId}`);
                }

                activeWizard = pluginId;

                // Get wizard schema
                const schema = getWizardSchema(pluginId);
                if (!schema) {
                    throw new Error(`Wizard schema not found for ${pluginId}`);
                }

                // Clear the panel content and show the wizard
                const panelContent = document.getElementById('panel-content');
                if (!panelContent) {
                    throw new Error('Panel content element not found');
                }

                // Use the ComponentSystem to render the wizard
                if (window.ComponentSystem) {
                    panelContent.innerHTML = window.ComponentSystem.renderComponents(schema, {});
                    window.ComponentSystem.bindEvents(panelContent, schema, (settingId, value) => {
                        console.log(`Wizard setting changed: ${settingId} = ${value}`);
                    });
                } else {
                    throw new Error('ComponentSystem not available');
                }

                return wizardModule;
            })
            .catch(err => {
                console.error('Error showing wizard:', err);
                return Promise.reject(err);
            });
    }

    /**
     * Refresh the current panel content
     * Useful after wizard completion
     */
    function refreshCurrentPanel() {
        if (!activePanel) return;

        // Close and reopen the current panel
        const currentPluginId = activePanel;
        closeSettingsPanel();

        // Wait for panel to close, then reopen
        setTimeout(() => {
            loadPluginSettingsModule(currentPluginId);
        }, 500);
    }

    // Helper function to get the current active plugin ID using various methods (PATCH)
    function getActivePluginId() {
        // First check direct global variable
        if (window.activePanel) {
            return window.activePanel;
        }

        // Then check Dashboard property
        if (activePanel) {
            return activePanel;
        }

        // Then check DOM for data attribute
        const settingsPanel = document.querySelector('.settings-panel.visible');
        if (settingsPanel && settingsPanel.hasAttribute('data-plugin-id')) {
            return settingsPanel.getAttribute('data-plugin-id');
        }

        // Then try to determine from panel title
        const panelTitle = document.getElementById('plugin-settings-title')?.textContent.trim();
        if (panelTitle && window.installedPlugins) {
            const matchingPlugin = window.installedPlugins.find(p => p.name === panelTitle);
            if (matchingPlugin) {
                return matchingPlugin.id;
            }
        }

        // No plugin ID could be determined
        return null;
    }

    // Debug utility
    window.testNotificationBar = function () {
        hasUnsavedChanges = true;
        updateNotificationState();
        setTimeout(() => {
            showAttention();
        }, 100);
        console.log("Test notification triggered");
    };

    // Create a MutationObserver to detect when the settings panel becomes visible (PATCH)
    function initPanelObserver() {
        const panelObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('visible')) {

                    // Panel has become visible, check if we need to update activePanel
                    if (!window.activePanel) {
                        const pluginId = getActivePluginId();
                        if (pluginId) {
                            window.activePanel = pluginId;
                            console.log('Active panel ID updated via observer:', pluginId);

                            // Update the data attribute if needed
                            if (!mutation.target.hasAttribute('data-plugin-id')) {
                                mutation.target.setAttribute('data-plugin-id', pluginId);
                            }
                        }
                    }
                }
            });
        });

        // Start observing the settings panel
        if (elements.settingsPanel) {
            panelObserver.observe(elements.settingsPanel, { attributes: true });
            console.log('Panel observer initialized');
        }
    }

    // Add a global accessor for the active panel (PATCH)
    Object.defineProperty(window, 'dashboardActivePanel', {
        get: function () {
            return getActivePluginId();
        },
        enumerable: true
    });

    // Debug utility to inspect and fix plugin settings in Firebase
    window.inspectAndFixPluginSettings = async function(pluginId) {
        if (!pluginId) {
            console.error('🔧 [SETTINGS-FIX] No pluginId provided');
            return { error: 'No pluginId provided' };
        }
        
        console.log(`🔧 [SETTINGS-FIX] Inspecting settings for plugin: ${pluginId}`);
        
        try {
            if (!window.SecureFirebaseAuth || !window.SecureFirebaseAuth.isInitialized) {
                console.error('🔧 [SETTINGS-FIX] SecureFirebaseAuth not initialized');
                return { error: 'SecureFirebaseAuth not initialized' };
            }
            
            if (!window.SecureFirebaseAuth.isAuthenticated()) {
                console.error('🔧 [SETTINGS-FIX] Not authenticated');
                return { error: 'Not authenticated' };
            }
            
            // Get current plugin data from Dashboard
            const installedPlugin = window.installedPlugins.find(p => p.id === pluginId);
            if (!installedPlugin) {
                console.error(`🔧 [SETTINGS-FIX] Plugin ${pluginId} not found in installedPlugins`);
                return { error: 'Plugin not found' };
            }
            
            const currentSettings = installedPlugin.settings;
            console.log(`🔧 [SETTINGS-FIX] Current settings in memory:`, currentSettings);
            
            // Get Firebase paths
            const auth = window.SecureFirebaseAuth;
            const userEmail = auth.currentUser.email;
            const safeName = auth.getSafeFirebaseKey(userEmail);
            const siteUrl = auth.internalUrl || window.location.hostname;
            const safeSiteUrl = auth.getSafeFirebaseKey(siteUrl);
            
            console.log(`🔧 [SETTINGS-FIX] User: ${userEmail} → ${safeName}`);
            console.log(`🔧 [SETTINGS-FIX] Site URL: ${siteUrl} → ${safeSiteUrl}`);
            
            // Path structure
            const pluginPath = `users/${safeName}/sites/${safeSiteUrl}/plugins/${pluginId}`;
            const settingsPath = `${pluginPath}/settings`;
            
            console.log(`🔧 [SETTINGS-FIX] Settings path: ${settingsPath}`);
            
            // Get existing settings from Firebase
            const { ref, get, set } = auth.dbFunctions;
            const settingsRef = ref(auth.db, settingsPath);
            const snapshot = await get(settingsRef);
            
            let existingSettings = null;
            if (snapshot.exists()) {
                existingSettings = snapshot.val();
                console.log(`🔧 [SETTINGS-FIX] Existing settings found in Firebase:`, existingSettings);
            } else {
                console.log(`🔧 [SETTINGS-FIX] No settings found in Firebase path`);
            }
            
            // Compare and fix if needed
            if (!existingSettings && currentSettings) {
                console.log(`🔧 [SETTINGS-FIX] Saving current memory settings to Firebase`);
                await set(settingsRef, currentSettings);
                console.log(`🔧 [SETTINGS-FIX] ✅ Settings saved successfully to Firebase`);
                return { 
                    action: 'created', 
                    settings: currentSettings, 
                    path: settingsPath 
                };
            }
            else if (existingSettings && JSON.stringify(existingSettings) !== JSON.stringify(currentSettings)) {
                console.log(`🔧 [SETTINGS-FIX] Settings in Firebase differ from memory, updating memory with Firebase values`);
                
                // Update plugin object with Firebase settings
                installedPlugin.settings = existingSettings;
                
                // Verify all settings were copied
                console.log(`🔧 [SETTINGS-FIX] ✅ Updated memory settings:`, installedPlugin.settings);
                
                return { 
                    action: 'updated_memory', 
                    settings: existingSettings, 
                    path: settingsPath 
                };
            }
            else {
                console.log(`🔧 [SETTINGS-FIX] ✓ Settings are synchronized between memory and Firebase`);
                return { 
                    action: 'none', 
                    settings: existingSettings || currentSettings, 
                    path: settingsPath 
                };
            }
        } catch (error) {
            console.error(`🔧 [SETTINGS-FIX] Error:`, error);
            return { 
                error: error.message,
                stack: error.stack
            };
        }
    };

    // Public API
    return {
        init,
        PluginRegistry,
        PluginSettingsRegistry,
        loadPluginSettingsModule,
        closeSettingsPanel,
        createDefaultCard,
        markUnsavedChanges: function (value) {
            hasUnsavedChanges = value;
            updateNotificationState();
        },
        updateNotificationState: updateNotificationState,
        CustomComponentDataRegistry,
        FirebaseService: FirebaseService,
        registerWizardSchema,
        getWizardSchema,
        hasWizard,
        loadWizardScript,
        showWizard,
        refreshCurrentPanel,
        getActivePluginId // PATCH: Expose the helper function
    };
})();

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Dashboard.init();

    // Initialize panel observer after DOM is loaded (PATCH)
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
        const panelObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('visible')) {

                    // Panel has become visible, check if we need to update activePanel
                    if (!window.activePanel) {
                        const pluginId = Dashboard.getActivePluginId();
                        if (pluginId) {
                            window.activePanel = pluginId;
                            console.log('Active panel ID updated via observer:', pluginId);

                            // Update the data attribute if needed
                            if (!mutation.target.hasAttribute('data-plugin-id')) {
                                mutation.target.setAttribute('data-plugin-id', pluginId);
                            }
                        }
                    }
                }
            });
        });

        panelObserver.observe(settingsPanel, { attributes: true });
        console.log('Panel observer initialized');
    }
});

// Helper function to get the current active plugin ID - global version (PATCH)
window.getActivePluginId = function () {
    if (Dashboard && Dashboard.getActivePluginId) {
        return Dashboard.getActivePluginId();
    }

    // Fallbacks in case Dashboard function isn't available

    // First check direct global variable
    if (window.activePanel) {
        return window.activePanel;
    }

    // Then check DOM for data attribute
    const settingsPanel = document.querySelector('.settings-panel.visible');
    if (settingsPanel && settingsPanel.hasAttribute('data-plugin-id')) {
        return settingsPanel.getAttribute('data-plugin-id');
    }

    // Then try to determine from panel title
    const panelTitle = document.getElementById('plugin-settings-title')?.textContent.trim();
    if (panelTitle && window.installedPlugins) {
        const matchingPlugin = window.installedPlugins.find(p => p.name === panelTitle);
        if (matchingPlugin) {
            return matchingPlugin.id;
        }
    }

    // No plugin ID could be determined
    return null;
};

// Mark that the dashboard patch has been applied (PATCH)
window.dashboardPatchApplied = true;

// For testing in console
window.Dashboard = Dashboard;