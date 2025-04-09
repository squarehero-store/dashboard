/**
 * SquareHero Secure Firebase Authentication
 * 
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
                console.log('Firebase initialized successfully with secure authentication');
                return true;
            } catch (error) {
                console.error('Error initializing Firebase:', error);
                return false;
            }
        },

        // Get Squarespace website information with dashboard page ID
        getWebsiteInfo: async function() {
            try {
                // Attempt to get Squarespace site data from the current page
                const currentUrl = window.location.href;
                const formatJsonUrl = currentUrl.includes('?') 
                    ? `${currentUrl}&format=json` 
                    : `${currentUrl}?format=json`;
                    
                console.log('Fetching Squarespace data from:', formatJsonUrl);
                
                const response = await fetch(formatJsonUrl, {
                    credentials: 'include', // Important for accessing Squarespace site data
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch Squarespace site data: ${response.status}`);
                }

                const data = await response.json();
                
                // Extract critical identifiers
                const websiteId = data.website?.id;
                const dashboardPageId = data.collection?.id;
                
                if (!websiteId) {
                    throw new Error('Website ID not found in Squarespace data');
                }
                
                if (!dashboardPageId) {
                    throw new Error('Dashboard page ID not found - cannot establish secure authentication');
                }
                
                // Create a combined security key using both IDs - this is our primary identifier
                const securityKey = `${websiteId}-${dashboardPageId}`;
                    
                console.log('Security authentication established:');
                console.log('- Website ID:', websiteId);
                console.log('- Dashboard Page ID:', dashboardPageId);
                
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
                console.error('Error getting Squarespace website info:', error);
                throw error; // No fallbacks - require proper authentication
            }
        },

        // Authenticate anonymously with Firebase
        authenticate: async function() {
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

        // Get plugin settings from Firebase using secure key
        getPluginSettings: async function(pluginId, defaultSettings = {}) {
            if (!this.isInitialized) await this.initialize();

            try {
                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // We now use the security key directly as the installation key for Firebase
                // This simplifies our approach and provides better security
                const installationPath = `plugins/${pluginId}/installations/${this.securityKey}`;
                
                // Set up data references
                const pluginDataRef = ref(this.db, installationPath);
                const settingsRef = ref(this.db, `${installationPath}/settings`);

                // Check if installation exists
                const dataSnapshot = await get(pluginDataRef);

                if (!dataSnapshot.exists()) {
                    // First-time setup with default settings
                    const initialData = {
                        settings: defaultSettings,
                        websiteId: this.websiteId,
                        dashboardPageId: this.dashboardPageId,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp(),
                        lastSeen: serverTimestamp()
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
                    await set(ref(this.db, `${installationPath}/websiteUrl`), this.websiteUrl);
                    await set(ref(this.db, `${installationPath}/lastSeen`), serverTimestamp());

                    console.log(`Retrieved settings for plugin: ${pluginId}`);
                    return settings;
                }
            } catch (error) {
                console.error(`Error getting settings for plugin ${pluginId}:`, error);
                throw error; // No fallbacks - require proper authentication
            }
        },

        // Update plugin settings in Firebase using secure key
        updatePluginSettings: async function(pluginId, settings) {
            if (!this.isInitialized) await this.initialize();

            try {
                // Authenticate if needed
                await this.authenticate();

                // Import functions
                const { ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // We use the security key directly as the installation path
                const installationPath = `plugins/${pluginId}/installations/${this.securityKey}`;
                
                // Clean settings object to remove undefined values
                const cleanSettings = JSON.parse(JSON.stringify(settings));

                // Update settings
                const settingsRef = ref(this.db, `${installationPath}/settings`);
                await set(settingsRef, cleanSettings);

                // Update last updated timestamp
                const lastUpdatedRef = ref(this.db, `${installationPath}/lastUpdated`);
                await set(lastUpdatedRef, serverTimestamp());

                // Verify the write worked by reading it back
                const verifySnapshot = await get(settingsRef);
                if (!verifySnapshot.exists()) {
                    console.error("Failed to verify settings write to Firebase");
                    throw new Error("Failed to verify settings were saved to Firebase");
                }

                console.log(`Successfully updated settings for plugin: ${pluginId}`);
                return true;
            } catch (error) {
                console.error(`Error updating settings for plugin ${pluginId}:`, error);
                throw error; // No fallbacks - propagate the error
            }
        }
    };

    // Initialization
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Firebase
        setTimeout(() => {
            FirebaseService.initialize()
                .then(() => {
                    console.log('Secure Firebase authentication ready');
                })
                .catch(error => {
                    console.error('Failed to initialize secure Firebase authentication:', error);
                });
        }, 1000);
    });

    // Public API
    return FirebaseService;
})();