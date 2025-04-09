/**
 * SquareHero Secure Firebase Authentication
 * Uses website ID and dashboard page ID to provide secure plugin settings storage
 * Structured by site with human-readable URLs
 */

// Core Firebase Authentication Service
window.SecureFirebaseAuth = (function() {
    // Firebase service for settings storage
    const FirebaseService = {
        app: null,
        auth: null,
        db: null,
        isInitialized: false,
        websiteId: null,
        dashboardPageId: null,
        securityKey: null,
        websiteUrl: null,
        normalizedUrl: null,

        // Initialize Firebase
        initialize: async function() {
            if (this.isInitialized) return true;
            
            console.log('🔐 [SecureAuth] Initializing Firebase authentication service');

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

                console.log('🔐 [SecureAuth] Loading Firebase modules and connecting');
                
                // Initialize Firebase
                this.app = initializeApp(firebaseConfig);
                const analytics = getAnalytics(this.app);
                this.auth = getAuth(this.app);
                this.db = getDatabase(this.app);
                
                console.log('🔐 [SecureAuth] Firebase core initialized:', 
                    {app: !!this.app, auth: !!this.auth, db: !!this.db});

                // Get website info
                const info = await this.getWebsiteInfo();
                console.log('🔐 [SecureAuth] Website info loaded:', info);

                this.isInitialized = true;
                console.log('🔐 [SecureAuth] Firebase initialized successfully');
                return true;
            } catch (error) {
                console.error('🔐 [SecureAuth] Error initializing Firebase:', error);
                return false;
            }
        },

        // Get Squarespace website information with dashboard page ID
        getWebsiteInfo: async function() {
            console.log('🔐 [SecureAuth] Getting website information');
            
            try {
                // Attempt to get Squarespace site data from the current page
                const currentUrl = window.location.href;
                const formatJsonUrl = currentUrl.includes('?') 
                    ? `${currentUrl}&format=json` 
                    : `${currentUrl}?format=json`;
                    
                console.log('🔐 [SecureAuth] Fetching Squarespace data from:', formatJsonUrl);
                
                const response = await fetch(formatJsonUrl, {
                    credentials: 'include', // Important for accessing Squarespace site data
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.error('🔐 [SecureAuth] Fetch response not OK:', response.status, response.statusText);
                    throw new Error(`Failed to fetch Squarespace site data: ${response.status}`);
                }

                const data = await response.json();
                console.log('🔐 [SecureAuth] Raw Squarespace data:', data);
                
                // Extract critical identifiers
                const websiteId = data.website?.id;
                const dashboardPageId = data.collection?.id;
                
                console.log('🔐 [SecureAuth] Extracted IDs:', 
                    {websiteId: websiteId || 'MISSING', dashboardPageId: dashboardPageId || 'MISSING'});
                
                if (!websiteId) {
                    console.error('🔐 [SecureAuth] Website ID not found in data!');
                    throw new Error('Website ID not found in Squarespace data');
                }
                
                if (!dashboardPageId) {
                    console.error('🔐 [SecureAuth] Dashboard page ID not found in data!');
                    throw new Error('Dashboard page ID not found - cannot establish secure authentication');
                }
                
                // Create a combined security key using both IDs - this is our primary identifier
                const securityKey = `${websiteId}-${dashboardPageId}`;
                
                // Get and normalize the website URL for human-readable path
                this.websiteUrl = window.location.origin;
                this.normalizedUrl = this.websiteUrl
                    .replace(/^https?:\/\//, '')     // Remove protocol
                    .replace(/\/$/, '')              // Remove trailing slash
                    .replace(/\./g, '-');            // Replace dots with dashes for Firebase path safety
                    
                console.log('🔐 [SecureAuth] Security authentication established:');
                console.log('- Website ID:', websiteId);
                console.log('- Dashboard Page ID:', dashboardPageId);
                console.log('- Security Key:', securityKey);
                console.log('- Normalized URL:', this.normalizedUrl);
                
                this.websiteId = websiteId;
                this.dashboardPageId = dashboardPageId;
                this.securityKey = securityKey;
                
                return {
                    websiteId: this.websiteId,
                    dashboardPageId: this.dashboardPageId,
                    securityKey: this.securityKey,
                    websiteUrl: this.websiteUrl,
                    normalizedUrl: this.normalizedUrl
                };
            } catch (error) {
                console.error('🔐 [SecureAuth] Error getting Squarespace website info:', error);
                throw error; // No fallbacks - require proper authentication
            }
        },

        // Authenticate anonymously with Firebase
        authenticate: async function() {
            if (!this.isInitialized) await this.initialize();

            try {
                console.log('🔐 [SecureAuth] Authenticating with Firebase');
                const { signInAnonymously } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js");
                const userCredential = await signInAnonymously(this.auth);
                console.log('🔐 [SecureAuth] Authenticated with Firebase successfully', userCredential.user.uid);
                return userCredential.user;
            } catch (error) {
                console.error('🔐 [SecureAuth] Error authenticating with Firebase:', error);
                return null;
            }
        },

        // Get plugin settings from Firebase using secure key
        getPluginSettings: async function(pluginId, defaultSettings = {}) {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }

            try {
                console.log('🔐 [SecureAuth] Getting settings for plugin:', pluginId);
                console.log('🔐 [SecureAuth] Using normalized URL:', this.normalizedUrl);
                console.log('🔐 [SecureAuth] Using security key:', this.securityKey);
                
                // Verify we have a security key and normalized URL
                if (!this.securityKey || !this.normalizedUrl) {
                    console.error('🔐 [SecureAuth] Missing security key or URL! Cannot get settings.');
                    throw new Error('Missing required authentication data for Firebase');
                }

                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // The new site-centric path structure
                // /sites/{normalizedUrl}/plugins/{pluginId}/settings
                const siteRef = ref(this.db, `sites/${this.normalizedUrl}`);
                const pluginPath = `sites/${this.normalizedUrl}/plugins/${pluginId}`;
                const settingsPath = `${pluginPath}/settings`;
                
                console.log('🔐 [SecureAuth] Plugin path:', pluginPath);
                
                // First check if the site entry exists
                const siteSnapshot = await get(siteRef);
                
                if (!siteSnapshot.exists()) {
                    // Create the site entry with security key
                    console.log('🔐 [SecureAuth] Site not found, creating new site entry');
                    await set(siteRef, {
                        key: this.securityKey,
                        websiteId: this.websiteId,
                        dashboardPageId: this.dashboardPageId,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp()
                    });
                } else {
                    // Verify the security key matches
                    const siteData = siteSnapshot.val();
                    
                    if (siteData.key !== this.securityKey) {
                        console.error('🔐 [SecureAuth] Security key mismatch! Possible security issue.');
                        
                        // Log details about the mismatch
                        console.error('Stored key:', siteData.key);
                        console.error('Current key:', this.securityKey);
                        
                        throw new Error('Security key verification failed');
                    }
                    
                    // Update the lastSeen timestamp
                    await set(ref(this.db, `sites/${this.normalizedUrl}/lastSeen`), serverTimestamp());
                }
                
                // Now check if plugin settings exist
                const settingsRef = ref(this.db, settingsPath);
                const settingsSnapshot = await get(settingsRef);
                
                if (!settingsSnapshot.exists()) {
                    // First-time setup with default settings
                    console.log('🔐 [SecureAuth] First-time setup for plugin - creating default settings');
                    
                    // Create plugin directory if it doesn't exist
                    await set(ref(this.db, pluginPath), {
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp()
                    });
                    
                    // Save default settings
                    await set(settingsRef, defaultSettings);
                    console.log(`🔐 [SecureAuth] Created default settings for plugin: ${pluginId}`);
                    return defaultSettings;
                } else {
                    // Get existing settings
                    console.log('🔐 [SecureAuth] Plugin settings found, retrieving');
                    let settings = settingsSnapshot.val();
                    
                    // Ensure settings has the enabled property
                    if (!settings.hasOwnProperty('enabled') && defaultSettings.hasOwnProperty('enabled')) {
                        settings.enabled = defaultSettings.enabled;
                    }
                    
                    // Update last accessed timestamp
                    await set(ref(this.db, `${pluginPath}/lastAccessed`), serverTimestamp());

                    console.log(`🔐 [SecureAuth] Retrieved settings for plugin: ${pluginId}`, settings);
                    return settings;
                }
            } catch (error) {
                console.error(`🔐 [SecureAuth] Error getting settings for plugin ${pluginId}:`, error);
                throw error; // No fallbacks - require proper authentication
            }
        },

        // Update plugin settings in Firebase using secure key
        updatePluginSettings: async function(pluginId, settings) {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }

            try {
                console.log('🔐 [SecureAuth] Updating settings for plugin:', pluginId);
                console.log('🔐 [SecureAuth] Settings to update:', settings);
                console.log('🔐 [SecureAuth] Using normalized URL:', this.normalizedUrl);
                
                // Verify we have a normalized URL
                if (!this.normalizedUrl) {
                    console.error('🔐 [SecureAuth] No normalized URL available! Cannot update settings.');
                    throw new Error('Missing normalized URL for Firebase path');
                }

                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // The site-centric path for this plugin's settings
                const pluginPath = `sites/${this.normalizedUrl}/plugins/${pluginId}`;
                const settingsPath = `${pluginPath}/settings`;
                
                console.log('🔐 [SecureAuth] Plugin settings path:', settingsPath);
                
                // Clean settings object to remove undefined values
                const cleanSettings = JSON.parse(JSON.stringify(settings));

                // Update settings
                console.log('🔐 [SecureAuth] Writing settings to Firebase');
                const settingsRef = ref(this.db, settingsPath);
                await set(settingsRef, cleanSettings);

                // Update last updated timestamp
                console.log('🔐 [SecureAuth] Updating lastUpdated timestamp');
                await set(ref(this.db, `${pluginPath}/lastUpdated`), serverTimestamp());
                await set(ref(this.db, `sites/${this.normalizedUrl}/lastUpdated`), serverTimestamp());

                // Verify the write worked by reading it back
                console.log('🔐 [SecureAuth] Verifying write operation');
                const verifySnapshot = await get(settingsRef);
                if (!verifySnapshot.exists()) {
                    console.error("🔐 [SecureAuth] Failed to verify settings write to Firebase");
                    throw new Error("Failed to verify settings were saved to Firebase");
                }

                console.log(`🔐 [SecureAuth] Successfully updated settings for plugin: ${pluginId}`);
                return true;
            } catch (error) {
                console.error(`🔐 [SecureAuth] Error updating settings for plugin ${pluginId}:`, error);
                throw error; // No fallbacks - propagate the error
            }
        },
        
        // List all plugins for the current site
        listSitePlugins: async function() {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }
            
            try {
                console.log('🔐 [SecureAuth] Listing all plugins for site:', this.normalizedUrl);
                
                // Verify we have a normalized URL
                if (!this.normalizedUrl) {
                    console.error('🔐 [SecureAuth] No normalized URL available! Cannot list plugins.');
                    throw new Error('Missing normalized URL for Firebase path');
                }
                
                // Authenticate if needed
                await this.authenticate();
                
                // Import functions
                const { ref, get } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");
                
                // Get all plugins for this site
                const pluginsRef = ref(this.db, `sites/${this.normalizedUrl}/plugins`);
                const pluginsSnapshot = await get(pluginsRef);
                
                if (!pluginsSnapshot.exists()) {
                    console.log('🔐 [SecureAuth] No plugins found for this site');
                    return [];
                }
                
                // Process the plugins data
                const pluginsData = pluginsSnapshot.val();
                const pluginsList = Object.keys(pluginsData).map(pluginId => {
                    const pluginData = pluginsData[pluginId];
                    return {
                        id: pluginId,
                        settings: pluginData.settings || {},
                        lastUpdated: pluginData.lastUpdated || null,
                        createdAt: pluginData.createdAt || null
                    };
                });
                
                console.log('🔐 [SecureAuth] Found plugins:', pluginsList);
                return pluginsList;
            } catch (error) {
                console.error('🔐 [SecureAuth] Error listing site plugins:', error);
                throw error;
            }
        }
    };

    // Initialization
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔐 [SecureAuth] Document loaded, initializing after delay');
        // Initialize Firebase
        setTimeout(() => {
            FirebaseService.initialize()
                .then(() => {
                    console.log('🔐 [SecureAuth] Secure Firebase authentication ready');
                })
                .catch(error => {
                    console.error('🔐 [SecureAuth] Failed to initialize secure Firebase authentication:', error);
                });
        }, 1000);
    });

    // Public API
    return FirebaseService;
})();

// Add inspector utility for debugging
window.inspectSecureAuth = function() {
    console.log('🔐 [SecureAuth] Current state:', {
        initialized: window.SecureFirebaseAuth.isInitialized,
        websiteId: window.SecureFirebaseAuth.websiteId,
        dashboardPageId: window.SecureFirebaseAuth.dashboardPageId,
        securityKey: window.SecureFirebaseAuth.securityKey,
        websiteUrl: window.SecureFirebaseAuth.websiteUrl,
        normalizedUrl: window.SecureFirebaseAuth.normalizedUrl
    });
    return window.SecureFirebaseAuth;
};