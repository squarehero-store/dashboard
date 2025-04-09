/**
 * SquareHero Secure Firebase Authentication
 * Uses website ID and dashboard page ID to provide secure plugin settings storage
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
                    
                console.log('🔐 [SecureAuth] Security authentication established:');
                console.log('- Website ID:', websiteId);
                console.log('- Dashboard Page ID:', dashboardPageId);
                console.log('- Security Key:', securityKey);
                
                this.websiteId = websiteId;
                this.dashboardPageId = dashboardPageId;
                this.securityKey = securityKey;
                this.websiteUrl = window.location.origin;
                
                return {
                    websiteId: this.websiteId,
                    dashboardPageId: this.dashboardPageId,
                    securityKey: this.securityKey,
                    websiteUrl: this.websiteUrl
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
                console.log('🔐 [SecureAuth] Using security key:', this.securityKey);
                
                // Verify we have a security key
                if (!this.securityKey) {
                    console.error('🔐 [SecureAuth] No security key available! Cannot get settings.');
                    throw new Error('No security key available for Firebase authentication');
                }

                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // We now use the security key directly as the installation key for Firebase
                // This simplifies our approach and provides better security
                const installationPath = `plugins/${pluginId}/installations/${this.securityKey}`;
                console.log('🔐 [SecureAuth] Firebase path:', installationPath);
                
                // Set up data references
                const pluginDataRef = ref(this.db, installationPath);
                const settingsRef = ref(this.db, `${installationPath}/settings`);

                // Check if installation exists
                console.log('🔐 [SecureAuth] Checking if installation exists');
                const dataSnapshot = await get(pluginDataRef);
                console.log('🔐 [SecureAuth] Installation exists:', dataSnapshot.exists());

                if (!dataSnapshot.exists()) {
                    // First-time setup with default settings
                    console.log('🔐 [SecureAuth] First-time setup - creating default settings');
                    
                    const initialData = {
                        settings: defaultSettings,
                        websiteId: this.websiteId,
                        dashboardPageId: this.dashboardPageId,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp(),
                        lastSeen: serverTimestamp()
                    };
                    
                    console.log('🔐 [SecureAuth] Initial data:', initialData);

                    // Save to Firebase
                    console.log('🔐 [SecureAuth] Writing initial data to Firebase');
                    await set(pluginDataRef, initialData);

                    console.log(`🔐 [SecureAuth] Created default settings for plugin: ${pluginId}`);
                    return defaultSettings;
                } else {
                    // Get settings
                    console.log('🔐 [SecureAuth] Installation found, retrieving settings');
                    const settingsSnapshot = await get(settingsRef);
                    let settings = defaultSettings;

                    if (settingsSnapshot.exists()) {
                        settings = settingsSnapshot.val();
                        console.log('🔐 [SecureAuth] Retrieved settings:', settings);
                        
                        // Ensure settings has the enabled property
                        if (!settings.hasOwnProperty('enabled') && defaultSettings.hasOwnProperty('enabled')) {
                            settings.enabled = defaultSettings.enabled;
                        }
                    } else {
                        console.log('🔐 [SecureAuth] No settings found, using defaults:', defaultSettings);
                    }

                    // Update URL reference and lastSeen timestamp
                    console.log('🔐 [SecureAuth] Updating lastSeen timestamp');
                    await set(ref(this.db, `${installationPath}/websiteUrl`), this.websiteUrl);
                    await set(ref(this.db, `${installationPath}/lastSeen`), serverTimestamp());

                    console.log(`🔐 [SecureAuth] Retrieved settings for plugin: ${pluginId}`);
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
                console.log('🔐 [SecureAuth] Using security key:', this.securityKey);
                
                // Verify we have a security key
                if (!this.securityKey) {
                    console.error('🔐 [SecureAuth] No security key available! Cannot update settings.');
                    throw new Error('No security key available for Firebase authentication');
                }

                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // We use the security key directly as the installation path
                const installationPath = `plugins/${pluginId}/installations/${this.securityKey}`;
                console.log('🔐 [SecureAuth] Firebase path:', installationPath);
                
                // Clean settings object to remove undefined values
                const cleanSettings = JSON.parse(JSON.stringify(settings));

                // Update settings
                console.log('🔐 [SecureAuth] Writing settings to Firebase');
                const settingsRef = ref(this.db, `${installationPath}/settings`);
                await set(settingsRef, cleanSettings);

                // Update last updated timestamp
                console.log('🔐 [SecureAuth] Updating lastUpdated timestamp');
                const lastUpdatedRef = ref(this.db, `${installationPath}/lastUpdated`);
                await set(lastUpdatedRef, serverTimestamp());

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
        websiteUrl: window.SecureFirebaseAuth.websiteUrl
    });
    return window.SecureFirebaseAuth;
};