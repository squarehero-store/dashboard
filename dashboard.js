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
        const card = document.createElement('div');
        card.className = 'plugin-card';
        card.setAttribute('data-plugin-id', plugin.id);

        // Add default status if not defined
        const status = plugin.status || 'disabled';

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

    // Firebase service for settings storage
    const FirebaseService = {
        app: null,
        auth: null,
        db: null,
        isInitialized: false,
        websiteId: null,
        websiteUrl: null,

        // Initialize Firebase
        initialize: async function () {
            if (this.isInitialized) return;

            try {
                // Import Firebase modules
                const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js");
                const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js");
                const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js");
                const { getDatabase } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyBHbWQTlPsy46Q3aOznNI9By5G-2QU3jX8",
                    authDomain: "portfolio-summary-block.firebaseapp.com",
                    databaseURL: "https://portfolio-summary-block-default-rtdb.firebaseio.com",
                    projectId: "portfolio-summary-block",
                    storageBucket: "portfolio-summary-block.appspot.com",
                    messagingSenderId: "654906694260",
                    appId: "1:654906694260:web:a235c68efd984ea390cf21",
                    measurementId: "G-SYM66R1G98"
                };

                // Initialize Firebase
                this.app = initializeApp(firebaseConfig);
                const analytics = getAnalytics(this.app);
                this.auth = getAuth(this.app);
                this.db = getDatabase(this.app);

                // Get website info
                await this.getWebsiteInfo();

                this.isInitialized = true;
                console.log('Firebase initialized successfully');
            } catch (error) {
                console.error('Error initializing Firebase:', error);
                return false;
            }

            return true;
        },


        // Get Squarespace website information
        getWebsiteInfo: async function () {
            try {
                // Use the current site's domain to fetch configuration
                const currentDomain = window.location.hostname;
                const configUrl = `https://${currentDomain}/?format=json`;

                const response = await fetch(configUrl, {
                    credentials: 'include', // Important for accessing Squarespace site data
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch Squarespace site configuration');
                }

                const data = await response.json();

                // Extract website ID and URL
                this.websiteId = data.website.id || 'unknown-site';
                this.websiteUrl = `https://${currentDomain}`;

                console.log(`Squarespace Website ID: ${this.websiteId}`);
                console.log(`Website URL: ${this.websiteUrl}`);

                return {
                    websiteId: this.websiteId,
                    websiteUrl: this.websiteUrl
                };
            } catch (error) {
                console.error('Error getting Squarespace website info:', error);

                // Fallback to local testing configuration
                this.websiteId = 'local-test-site';
                this.websiteUrl = window.location.origin;

                return {
                    websiteId: this.websiteId,
                    websiteUrl: this.websiteUrl
                };
            }
        },

        // Authenticate anonymously with Firebase
        authenticate: async function () {
            if (!this.isInitialized) await this.initialize();

            try {
                const { signInAnonymously } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js");
                const userCredential = await signInAnonymously(this.auth);
                console.log('Authenticated anonymously with Firebase', userCredential.user.uid);
                return userCredential.user;
            } catch (error) {
                console.error('Error authenticating with Firebase:', error);
                return null;
            }
        },

        // Get plugin settings from Firebase
        getPluginSettings: async function (pluginId, defaultSettings = {}) {
            if (!this.isInitialized) await this.initialize();

            try {
                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // Create a unique installation key for this site
                const installationKey = this.websiteUrl
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '')
                    .replace(/\./g, '-');

                // Check for existing mapping
                const mappingRef = ref(this.db, `plugins/${pluginId}/websiteIdMapping/${this.websiteId}`);
                const mappingSnapshot = await get(mappingRef);

                let activeKey = installationKey;

                if (mappingSnapshot.exists()) {
                    // Use existing mapping
                    activeKey = mappingSnapshot.val();
                    console.log(`Found existing mapping for website ID ${this.websiteId}`);
                } else {
                    // Create new mapping
                    await set(mappingRef, installationKey);
                    console.log(`Created new mapping for website ID ${this.websiteId}`);
                }

                // Set up data references
                const pluginDataRef = ref(this.db, `plugins/${pluginId}/installations/${activeKey}`);
                const settingsRef = ref(this.db, `plugins/${pluginId}/installations/${activeKey}/settings`);

                // Check if installation exists
                const dataSnapshot = await get(pluginDataRef);

                if (!dataSnapshot.exists()) {
                    // First-time setup with default settings
                    const initialData = {
                        settings: defaultSettings,
                        websiteId: this.websiteId,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp()
                    };

                    // Save to Firebase
                    await set(pluginDataRef, initialData);

                    console.log(`Created default settings for plugin: ${pluginId}`);
                    return defaultSettings;
                } else {
                    // Get settings
                    const settingsSnapshot = await get(settingsRef);
                    let settings = defaultSettings;

                    if (settingsSnapshot.exists()) {
                        settings = settingsSnapshot.val();
                        // Ensure settings has the enabled property
                        if (!settings.hasOwnProperty('enabled') && defaultSettings.hasOwnProperty('enabled')) {
                            settings.enabled = defaultSettings.enabled;
                        }
                    }

                    // Update URL reference and lastSeen timestamp
                    await set(ref(this.db, `plugins/${pluginId}/installations/${activeKey}/websiteUrl`), this.websiteUrl);
                    await set(ref(this.db, `plugins/${pluginId}/installations/${activeKey}/lastSeen`), serverTimestamp());

                    console.log(`Retrieved settings for plugin: ${pluginId}`, settings);
                    return settings;
                }
            } catch (error) {
                console.error(`Error getting settings for plugin ${pluginId}:`, error);
                return defaultSettings;
            }
        },

        // Update plugin settings in Firebase
        updatePluginSettings: async function (pluginId, settings) {
            if (!this.isInitialized) await this.initialize();

            try {
                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // Get installation key
                const mappingRef = ref(this.db, `plugins/${pluginId}/websiteIdMapping/${this.websiteId}`);
                const mappingSnapshot = await get(mappingRef);

                if (!mappingSnapshot.exists()) {
                    console.error(`No installation found for website ID ${this.websiteId}`);

                    // If no mapping exists, create one
                    const installationKey = this.websiteUrl
                        .replace(/^https?:\/\//, '')
                        .replace(/^www\./, '')
                        .replace(/\/$/, '')
                        .replace(/\./g, '-');

                    await set(mappingRef, installationKey);
                    console.log(`Created new mapping: ${this.websiteId} -> ${installationKey}`);

                    // Also create the base installation record
                    const installationRef = ref(this.db, `plugins/${pluginId}/installations/${installationKey}`);
                    await set(installationRef, {
                        websiteId: this.websiteId,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp(),
                        settings: settings
                    });

                    return true;
                }

                const installationKey = mappingSnapshot.val();

                // Clean settings object to remove undefined values
                const cleanSettings = JSON.parse(JSON.stringify(settings));

                // Update settings
                const settingsRef = ref(this.db, `plugins/${pluginId}/installations/${installationKey}/settings`);
                await set(settingsRef, cleanSettings);

                // Update last updated timestamp
                const lastUpdatedRef = ref(this.db, `plugins/${pluginId}/installations/${installationKey}/lastUpdated`);
                await set(lastUpdatedRef, serverTimestamp());

                // Verify the write worked by reading it back
                const verifySnapshot = await get(settingsRef);
                if (!verifySnapshot.exists()) {
                    console.error("Failed to verify settings write to Firebase");
                    return false;
                }

                return true;
            } catch (error) {
                console.error(`Error updating settings for plugin ${pluginId}:`, error);
                return false;
            }
        },
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
                    <circle cx="12" cy="6" r="1" fill="currentColor"/>
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

    // Show Firebase sync status
    function showFirebaseStatus(message, status = 'info') {
        // Create or get the status indicator
        let statusIndicator = document.querySelector('.firebase-status');

        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.className = 'firebase-status';
            document.body.appendChild(statusIndicator);
        }

        // Clear any existing classes
        statusIndicator.className = 'firebase-status';

        // Add appropriate class based on status
        statusIndicator.classList.add(status);
        statusIndicator.classList.add('visible');

        // Set icon based on status
        let iconSvg = '';

        switch (status) {
            case 'success':
                iconSvg = '<svg class="firebase-status-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                break;
            case 'error':
                iconSvg = '<svg class="firebase-status-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
                break;
            default:
                iconSvg = '<svg class="firebase-status-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="1" fill="currentColor"/><line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        }

        // Set content
        statusIndicator.innerHTML = `
            ${iconSvg}
            <span class="firebase-status-message">${message}</span>
        `;

        // Auto-hide after a delay
        setTimeout(() => {
            statusIndicator.classList.remove('visible');
        }, 3000);
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

        // Also show Firebase status if message indicates cloud sync
        if (message.includes('cloud') || message.includes('Firebase')) {
            showFirebaseStatus(message, 'success');
        }
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
        // Check if SkeletonLoader is already available
        if (window.SkeletonLoader) {
            return;
        }

        // Load the skeleton styles
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/skeleton-loader.min.css';
        document.head.appendChild(style);

        // Load the skeleton script
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/skeleton-loader.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
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
            return data.plugins || [];
        } catch (error) {
            console.error('Error loading plugins:', error);
            return [];
        }
    }

    // Detect installed plugins based on script tags
    function detectInstalledPlugins(allPlugins) {
        // Find all script tags with our custom attribute
        const installedIds = [];
        document.querySelectorAll('script[data-squarehero-plugin]').forEach(script => {
            installedIds.push(script.getAttribute('data-squarehero-plugin'));
        });

        console.log('Detected installed plugin IDs:', installedIds);

        // Filter available plugins to only include those that are installed
        const detectedPlugins = allPlugins.filter(plugin => installedIds.includes(plugin.id));

        // For development/testing purposes only:
        // If we're in development mode, show a message but still return empty array
        if (detectedPlugins.length === 0 && window.location.hostname === 'localhost') {
            console.log('No installed plugins detected. In production, no plugins would be shown.');
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
        // Don't show any text loading indicators

        if (!installedPlugins || !installedPlugins.length) {
            elements.pluginCardsContainer.innerHTML = '<p>No plugins installed on this site. Visit the SquareHero plugin store to browse available plugins.</p>';
            return;
        }

        // Process each plugin and create its card
        Promise.all(installedPlugins.map(createPluginCard))
            .then(cards => {
                // Clear any existing content
                elements.pluginCardsContainer.innerHTML = '';

                // Add each card to the container
                cards.forEach(card => {
                    if (card) {
                        elements.pluginCardsContainer.appendChild(card);
                    }
                });

                // If no cards were added, show a message
                if (elements.pluginCardsContainer.children.length === 0) {
                    elements.pluginCardsContainer.innerHTML = '<p>No plugins available.</p>';
                }
            })
            .catch(error => {
                console.error('Error rendering plugin cards:', error);
                elements.pluginCardsContainer.innerHTML = '<p>Error loading plugins. Please try again later.</p>';
            });
    }

    // Create a plugin card
    function createPluginCard(plugin) {
        return new Promise((resolve) => {
            try {
                // Check if the module is already registered
                const cardModule = PluginRegistry.get(plugin.id, 'card');
                if (cardModule) {
                    // Use the registered module to create the card
                    const card = cardModule.createCard(plugin);
                    resolve(card);
                    return;
                }

                // If not registered, use the default card implementation
                const card = createDefaultCard(plugin);
                resolve(card);
            } catch (error) {
                console.error(`Error creating card for plugin ${plugin.id}:`, error);
                resolve(null);
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

            // Simulate loading delay (remove in production)
            setTimeout(() => {
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
                        // Extract categories if they exist
                        const categories = schema.filter(item => item.type === 'category');
                        const defaultCategory = categories.find(cat => cat.isDefault) || categories[0];

                        // Add tabs in a container at the top
                        let tabsHTML = '';
                        if (categories.length > 0) {
                            tabsHTML = `
                        <div class="settings-tabs">
                            ${categories.map(category =>
                                `<button type="button" class="tab-button ${category.id === defaultCategory.id ? 'active' : ''}" 
                                       data-tab="${category.id}">${category.label}</button>`
                            ).join('')}
                        </div>
                    `;
                        }

                        // Create a wrapper for the settings - tabs and content are siblings
                        panelHTML = `
                    <div class="plugin-settings">
                        ${tabsHTML}
                        ${SettingsComponents.generateForm(schema, plugin.settings || {})}
                    </div>
                `;
                    } else if (customModule) {
                        // Use the custom module
                        panelHTML = customModule.createSettingsPanel(plugin);
                    } else {
                        // No settings available
                        panelHTML = `
                    <div class="plugin-settings">
                        <h3>${plugin.name} Settings</h3>
                        <p>Settings for this plugin are not available.</p>
                        <div class="form-actions">
                            <button class="button cancel-button">Close</button>
                        </div>
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
                            let settings = {};

                            if (schema) {
                                // Use the new function to collect settings from all forms and tabs
                                settings = collectSettingsFromForms(pluginId, schema);
                            } else if (customModule && customModule.saveSettings) {
                                // Use module's custom saving
                                settings = customModule.saveSettings(elements.panelContent);
                            } else {
                                // Basic settings
                                const enabledCheckbox = elements.panelContent.querySelector('#plugin-enabled');
                                settings = { enabled: enabledCheckbox ? enabledCheckbox.checked : false };
                            }

                            // Save settings
                            console.log(`Saving collected settings:`, settings);
                            savePluginSettings(pluginId, settings);
                            hasUnsavedChanges = false; // Reset after saving
                            updateNotificationState();
                        });
                    }

                    // Bind tab switching functionality
                    const tabButtons = elements.panelContent.querySelectorAll('.settings-tabs .tab-button');
                    if (tabButtons.length > 0) {
                        tabButtons.forEach(button => {
                            button.addEventListener('click', function () {
                                // Remove active class from all tabs and contents
                                elements.panelContent.querySelectorAll('.tab-button').forEach(btn =>
                                    btn.classList.remove('active'));
                                elements.panelContent.querySelectorAll('.tab-content').forEach(content =>
                                    content.classList.remove('active'));

                                // Add active class to current tab and content
                                button.classList.add('active');
                                const tabId = button.getAttribute('data-tab');
                                const tabContent = elements.panelContent.querySelector(`.tab-content[data-tab-content="${tabId}"]`);
                                tabContent.classList.add('active');

                                // Handle any custom components in the active tab
                                const customComponents = tabContent.querySelectorAll('.custom-component-container');
                                if (customComponents.length > 0) {
                                    customComponents.forEach(container => {
                                        const componentId = container.getAttribute('data-component-id');

                                        // Check if the component is already initialized
                                        const isInitialized = container.getAttribute('data-initialized') === 'true';

                                        if (!isInitialized) {
                                            console.log(`Initializing custom component: ${componentId}`);
                                            // Look for an init function for this component
                                            const initFunction = window[`init${componentId.charAt(0).toUpperCase() + componentId.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`];
                                            if (typeof initFunction === 'function') {
                                                initFunction();
                                                container.setAttribute('data-initialized', 'true');
                                            }
                                        } else {
                                            // Component already initialized, check if it has an update function
                                            console.log(`Custom component already initialized: ${componentId}, looking for update function`);
                                            // Try to find an update function for this component
                                            const updateFunction = window[`update${componentId.charAt(0).toUpperCase() + componentId.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`];
                                            if (typeof updateFunction === 'function') {
                                                updateFunction();
                                            }

                                            // Also look for a component object with an updateView method
                                            const componentObject = window[`${componentId.charAt(0).toUpperCase() + componentId.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`];
                                            if (componentObject && typeof componentObject.updateView === 'function') {
                                                componentObject.updateView();
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    }

                    // Bind change handlers to all forms
                    if (schema && forms.length > 0) {
                        const handlers = PluginSettingsRegistry.getHandlers(pluginId);

                        forms.forEach(form => {
                            // Get the tab ID and corresponding category
                            const tabId = form.closest('.tab-content')?.getAttribute('data-tab-content');
                            const category = schema.find(item =>
                                item.type === 'category' && item.id === tabId);

                            // Get components from the category
                            const tabSchema = category ? (category.components || []) : schema;

                            // Bind toggle warning handlers first
                            tabSchema.forEach(setting => {
                                if (setting.type === 'toggle' && setting.warning) {
                                    const toggleElement = form.querySelector(`#${setting.id}`);
                                    if (toggleElement) {
                                        toggleElement.addEventListener('change', function (e) {
                                            // If there's a warning message, show it
                                            if (setting.warning) {
                                                if (!confirm("Are you sure you want to change this setting?")) {
                                                    // Revert the change if user cancels
                                                    e.target.checked = !e.target.checked;
                                                    return;
                                                }
                                            }

                                            // Mark as having unsaved changes
                                            hasUnsavedChanges = true;
                                            updateNotificationState();
                                        });
                                    }
                                }
                            });

                            // Bind normal change events for tracking unsaved changes
                            SettingsComponents.bindEventHandlers(form, tabSchema, (settingId, value) => {
                                console.log(`Setting changed: ${settingId} = ${value}`); // Debug log
                                hasUnsavedChanges = true;
                                updateNotificationState();
                                if (handlers.onChange) {
                                    handlers.onChange(settingId, value);
                                }
                            });
                        });
                    }

                    // Initialize any plugin-specific event handlers
                    if (customModule && customModule.bindEvents) {
                        customModule.bindEvents(elements.panelContent);
                    }

                    // Load saved settings if available
                    if (plugin.settings && customModule && customModule.loadSettings) {
                        customModule.loadSettings(elements.panelContent, plugin.settings);
                    }
                }
            }, 300);
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
                const statusBadge = card.querySelector('.plugin-status');
                if (statusBadge) {
                    statusBadge.className = `plugin-status status-${settings.enabled ? 'enabled' : 'disabled'}`;
                    statusBadge.textContent = settings.enabled ? 'ENABLED' : 'DISABLED';
                }
            }
        }

        // Check for custom component data
        const customData = CustomComponentDataRegistry.data[pluginId];
        if (customData) {
            // Include custom component data in settings
            for (const componentId in customData) {
                settings[componentId] = customData[componentId];
            }
        }

        // Save settings in the plugin object
        installedPlugins[pluginIndex].settings = {
            ...installedPlugins[pluginIndex].settings || {},
            ...settings
        };

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
                showSuccessNotification('Settings saved successfully!');
            } else {
                showSuccessNotification('Settings saved locally only.');
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
    }

    // Load news items from Firebase
    async function loadNewsItems() {
        // Don't show any text loading indicators here
        // The skeleton should already be showing from the init function

        try {
            // Authenticate if needed (though it might not be strictly necessary for read-only)
            await Dashboard.FirebaseService.authenticate();

            // Import functions (exactly as in getPluginSettings)
            const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

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

        if (!availablePlugins || !availablePlugins.length) {
            discoverPluginsContainer.innerHTML = '<p>No plugins available to discover.</p>';
            return;
        }

        // Create a grid for discover plugins
        const pluginGrid = document.createElement('div');
        pluginGrid.id = 'discover-plugins-grid';
        pluginGrid.className = 'discover-plugins-grid';

        // Process each available plugin
        availablePlugins.forEach(plugin => {
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
                    <button class="sh-button free-trial">Start Free Trial</button>
                    <p class="fine-print">14 day free trial. No credit card required.</p>
                </div>
            </div>
        `;

            pluginGrid.appendChild(card);
        });

        discoverPluginsContainer.innerHTML = '';
        discoverPluginsContainer.appendChild(pluginGrid);
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
        try {
            // First load the skeleton loader
            await loadSkeletonLoader();

            // Set up event listeners
            initEventListeners();

            // Initialize tab event listeners <--- HERE'S THE FIX
            initTabEventListeners();

            // Show skeleton loaders BEFORE loading any data
            if (window.SkeletonLoader) {
                loadingStates.plugins = window.SkeletonLoader.show('plugin-cards-container', 'pluginCard', 3);
                loadingStates.news = window.SkeletonLoader.show('news-items-container', 'newsItem', 4);
            }

            // Initialize Firebase
            await FirebaseService.initialize();
            console.log('Firebase initialized');

            // Load all available plugins from JSON
            availablePlugins = await loadPlugins();
            console.log('Available plugins:', availablePlugins);

            // Render discover plugins grid
            renderDiscoverPluginCards();

            // Detect which plugins are actually installed on this site
            installedPlugins = detectInstalledPlugins(availablePlugins);
            console.log('Installed plugins:', installedPlugins);

            // Make installedPlugins globally available (PATCH)
            window.installedPlugins = installedPlugins;

            // If no plugins are installed, hide skeletons and show message
            if (installedPlugins.length === 0) {
                // Hide plugin skeletons
                if (loadingStates.plugins) {
                    loadingStates.plugins.hide();
                }

                elements.pluginCardsContainer.innerHTML = '<p>No plugins installed on this site. Visit the SquareHero plugin store to browse available plugins.</p>';

                // Still load news items
                await loadNewsItems();
                return;
            }

            // Load saved settings for each plugin from Firebase
            await Promise.all(installedPlugins.map(async (plugin) => {
                try {
                    // Set default plugin settings if none exist
                    const defaultSettings = {
                        enabled: true
                    };

                    // Get settings from Firebase
                    const savedSettings = await FirebaseService.getPluginSettings(plugin.id, defaultSettings);

                    // Update plugin object with retrieved settings
                    plugin.settings = savedSettings;

                    // Update status based on enabled setting
                    if (savedSettings.hasOwnProperty('enabled')) {
                        plugin.status = savedSettings.enabled ? 'enabled' : 'disabled';
                    }

                    console.log(`Loaded settings for ${plugin.id}:`, savedSettings);
                } catch (error) {
                    console.error(`Error loading settings for ${plugin.id}:`, error);
                    // Continue with next plugin - don't break the initialization
                }
            }));

            // Load scripts for installed plugins
            await Promise.all(installedPlugins.map(loadPluginScripts));
            console.log('Plugin scripts loaded');

            // Render plugin cards and hide skeletons
            renderPluginCards();
            if (loadingStates.plugins) {
                loadingStates.plugins.hide();
            }

            // Load and render news items (skeletons are handled inside this function)
            await loadNewsItems();

            console.log('Dashboard initialized successfully!');
        } catch (error) {
            console.error('Error initializing dashboard:', error);

            // Hide all skeletons in case of error
            if (loadingStates.plugins) {
                loadingStates.plugins.hide();
            }
            if (loadingStates.news) {
                loadingStates.news.hide();
            }

            elements.pluginCardsContainer.innerHTML = `
            <div class="error-message">
                <p>Error initializing dashboard: ${error.message}</p>
            </div>
        `;
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
            script.onerror = (err) => {
                console.error(`Failed to load wizard script for ${plugin.id}:`, err);
                reject(err);
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
            styleLink.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/wizard-component.css';
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