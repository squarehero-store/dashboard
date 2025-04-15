/**
 * SquareHero Secure Firebase Authentication
 * Uses website ID and dashboard page ID to provide secure plugin settings storage
 * Structured by site with human-readable URLs
 */

// Core Firebase Authentication Service
/**
 * SquareHero Secure Firebase Authentication
 * Uses email authentication and organizes data by user ID → site ID → plugins
 */

// Core Firebase Authentication Service
/**
 * SquareHero Secure Firebase Authentication
 * Uses email authentication and organizes data by user email → website URL → plugins
 * While maintaining internal identification via website ID and user UID
 */

// Core Firebase Authentication Service
/**
 * SquareHero Secure Firebase Authentication
 * Uses email authentication and organizes data by user email → website URL → plugins
 * While maintaining internal identification via website ID and user UID
 */

// Core Firebase Authentication Service
window.SecureFirebaseAuth = (function () {
    // Firebase service for settings storage
    const FirebaseService = {
        app: null,
        auth: null,
        db: null,
        isInitialized: false,
        currentUser: null,
        websiteId: null,
        websiteUrl: null,
        
        // Set the current user from login page authentication
        setCurrentUser: function (user) {
            this.currentUser = user;
            console.log('🔐 [SecureAuth] Current user set:', user.email);
            
            // After setting the user, get website info and register site
            this.getWebsiteInfo().then(info => {
                console.log('🔐 [SecureAuth] Website info loaded after setting user:', info);
                this.registerSiteWithUser(info);
            });
        },
        
        // Initialize Firebase
        initialize: async function () {
            if (this.isInitialized) return true;

            console.log('🔐 [SecureAuth] Initializing Firebase authentication service');

            try {
                // Import Firebase modules
                const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js");
                const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js");
                const { getDatabase, ref, get, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js");

                // Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyBEmTwE1DWjj4rGEV6UDGIhxVy4oZ5lqNg",
                    authDomain: "my-squarehero-hub.firebaseapp.com",
                    databaseURL: "https://my-squarehero-hub-default-rtdb.firebaseio.com",
                    projectId: "my-squarehero-hub",
                    storageBucket: "my-squarehero-hub.firebasestorage.app",
                    messagingSenderId: "233555790724",
                    appId: "1:233555790724:web:062d5a4b5d38f7445b2bd1",
                    measurementId: "G-YEMQV45TPL"
                };

                console.log('🔐 [SecureAuth] Loading Firebase modules and connecting');

                // Initialize Firebase
                this.app = initializeApp(firebaseConfig);
                this.auth = getAuth(this.app);
                this.db = getDatabase(this.app);

                // Store these functions for later use
                this.dbFunctions = { ref, get, set, serverTimestamp };

                // Add auth state listener to maintain current user
                onAuthStateChanged(this.auth, (user) => {
                    if (user) {
                        this.currentUser = user;
                        console.log('🔐 [SecureAuth] User authenticated via onAuthStateChanged:', user.email);
                        
                        // Get website info now that we have a user
                        this.getWebsiteInfo().then(info => {
                            console.log('🔐 [SecureAuth] Website info loaded after authentication:', info);
                            
                            // Register site with the current user if needed
                            this.registerSiteWithUser(info);
                            
                            // If we're on the dashboard page, trigger a refresh of plugin data
                            if (window.location.pathname.includes('dashboard.html')) {
                                console.log('🔐 [SecureAuth] On dashboard page, checking if dashboard needs initialization');
                                
                                // Check if Dashboard exists and has an init function
                                if (window.Dashboard && typeof window.Dashboard.init === 'function') {
                                    // Only reinitialize if not already initialized
                                    if (!window.dashboardInitialized) {
                                        console.log('🔐 [SecureAuth] Dashboard not initialized yet, initializing now');
                                        window.Dashboard.init();
                                    } else {
                                        console.log('🔐 [SecureAuth] Dashboard already initialized, skipping reinitialization');
                                    }
                                }
                            }
                        });
                    } else {
                        this.currentUser = null;
                        console.log('🔐 [SecureAuth] No user authenticated, redirecting to login');
                        
                        // Check if we're on dashboard page and redirect to login if not authenticated
                        if (window.location.pathname.includes('dashboard.html')) {
                            window.location.href = 'login.html';
                        }
                    }
                });

                console.log('🔐 [SecureAuth] Firebase core initialized:',
                    { app: !!this.app, auth: !!this.auth, db: !!this.db });

                // Get website info even if not logged in yet
                const info = await this.getWebsiteInfo();
                console.log('🔐 [SecureAuth] Website info loaded during initialization:', info);
                
                // For local development, explicitly set the internal URL to the standardized value
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    this.internalUrl = 'local-development-site';
                    console.log('🔐 [SecureAuth] Local development detected, standardizing internal URL to:', this.internalUrl);
                }

                this.isInitialized = true;
                console.log('🔐 [SecureAuth] Firebase initialized successfully');
                return true;
            } catch (error) {
                console.error('🔐 [SecureAuth] Error initializing Firebase:', error);
                return false;
            }
        },

        // Get Squarespace website information
        getWebsiteInfo: async function () {
            console.log('🔐 [SecureAuth] Getting website information');

            try {
                // Check if we're in a local development environment
                const isLocalDevelopment = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

                // Use local test file if in development mode
                if (isLocalDevelopment) {
                    console.log('🔐 [SecureAuth] Local development detected, using local test file');
                    try {
                        // Try to load the local squarespace.json file
                        const response = await fetch('/squarespace.json');

                        if (!response.ok) {
                            throw new Error(`Failed to load local test file: ${response.status}`);
                        }

                        const data = await response.json();
                        console.log('🔐 [SecureAuth] Loaded data from local test file:', data);

                        // Extract IDs from local test data
                        const websiteId = data.website?.id || 'local-dev-site';
                        const internalUrl = 'local-development-site';

                        // Save IDs to localStorage for fallback use
                        localStorage.setItem('squarehero_website_id', websiteId);
                        localStorage.setItem('squarehero_internal_url', internalUrl);

                        // Set properties
                        this.websiteId = websiteId;
                        this.websiteUrl = window.location.origin;
                        this.internalUrl = internalUrl;

                        console.log('🔐 [SecureAuth] Using local development site info:');
                        console.log('- Website ID:', websiteId);
                        console.log('- Internal URL:', this.internalUrl);

                        return {
                            websiteId: this.websiteId,
                            websiteUrl: this.websiteUrl,
                            internalUrl: this.internalUrl
                        };

                    } catch (localError) {
                        console.warn('🔐 [SecureAuth] Error loading local test file:', localError);
                        console.log('🔐 [SecureAuth] Falling back to development defaults');

                        // Create default development values
                        this.websiteId = 'local-dev-site';
                        this.websiteUrl = window.location.origin;
                        this.internalUrl = 'local-development-site';

                        return {
                            websiteId: this.websiteId,
                            websiteUrl: this.websiteUrl,
                            internalUrl: this.internalUrl
                        };
                    }
                }

                // Production mode - attempt to get Squarespace site data from the current page
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

                // Check if response is likely JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.warn('🔐 [SecureAuth] Response is not JSON:', contentType);
                    throw new Error('Invalid response format - expected JSON but got: ' + contentType);
                }

                if (!response.ok) {
                    console.error('🔐 [SecureAuth] Fetch response not OK:', response.status, response.statusText);
                    throw new Error(`Failed to fetch Squarespace site data: ${response.status}`);
                }

                const data = await response.json();
                console.log('🔐 [SecureAuth] Raw Squarespace data:', data);

                // Extract critical identifiers
                const websiteId = data.website?.id;
                const internalUrl = data.website?.internalUrl || window.location.hostname;

                console.log('🔐 [SecureAuth] Extracted IDs:',
                    { 
                        websiteId: websiteId || 'MISSING', 
                        internalUrl: internalUrl || 'MISSING'
                    });

                if (!websiteId) {
                    console.error('🔐 [SecureAuth] Website ID not found in data!');
                    throw new Error('Website ID not found in Squarespace data');
                }

                // Save IDs to localStorage for fallback use
                localStorage.setItem('squarehero_website_id', websiteId);
                localStorage.setItem('squarehero_internal_url', internalUrl);

                // Set properties
                this.websiteId = websiteId;
                this.websiteUrl = window.location.origin;
                this.internalUrl = internalUrl;

                console.log('🔐 [SecureAuth] Website information established:');
                console.log('- Website ID:', websiteId);
                console.log('- Internal URL:', internalUrl);

                return {
                    websiteId: this.websiteId,
                    websiteUrl: this.websiteUrl,
                    internalUrl: this.internalUrl
                };
            } catch (error) {
                console.error('🔐 [SecureAuth] Error getting Squarespace website info:', error);

                // Try to get from localStorage first
                const storedWebsiteId = localStorage.getItem('squarehero_website_id');
                const storedInternalUrl = localStorage.getItem('squarehero_internal_url');

                if (storedWebsiteId) {
                    console.log('🔐 [SecureAuth] Using stored website info from localStorage');
                    this.websiteId = storedWebsiteId;
                    this.websiteUrl = window.location.origin;
                    this.internalUrl = storedInternalUrl || window.location.hostname;

                    console.log('🔐 [SecureAuth] Using stored website info:', {
                        websiteId: this.websiteId,
                        internalUrl: this.internalUrl
                    });

                    return {
                        websiteId: this.websiteId,
                        websiteUrl: this.websiteUrl,
                        internalUrl: this.internalUrl
                    };
                }

                // If nothing in localStorage, use graceful fallback
                console.log('🔐 [SecureAuth] Using fallback site information after error');
                this.websiteId = 'error-recovery-site';
                this.websiteUrl = window.location.origin;
                this.internalUrl = 'error-recovery-site';

                return {
                    websiteId: this.websiteId,
                    websiteUrl: this.websiteUrl,
                    internalUrl: this.internalUrl
                };
            }
        },
        
        // Get a valid Firebase key from a string (replace invalid characters)
        getSafeFirebaseKey: function(str) {
            // Firebase doesn't allow ., #, $, /, [, or ] in keys
            return str.replace(/[\\.#$\/\[\]]/g, '-');
        },
        
        // Register site with the current user if it's not already registered
        registerSiteWithUser: async function(siteInfo) {
            if (!this.currentUser) {
                console.warn('🔐 [SecureAuth] Cannot register site - no authenticated user');
                return false;
            }
            
            if (!this.websiteId) {
                console.warn('🔐 [SecureAuth] Cannot register site - no website ID');
                return false;
            }
            
            try {
                const { ref, get, set, serverTimestamp } = this.dbFunctions;
                
                // Use email as the key for the user, cleaning it for Firebase
                const userEmail = this.currentUser.email;
                const safeName = this.getSafeFirebaseKey(userEmail);
                
                // Use website URL as the key for the site, cleaning it for Firebase
                const siteUrl = this.internalUrl || window.location.hostname;
                const safeSiteUrl = this.getSafeFirebaseKey(siteUrl);
                
                // Check if this site is already registered with this user
                const siteRef = ref(this.db, `users/${safeName}/sites/${safeSiteUrl}`);
                const siteSnapshot = await get(siteRef);
                
                if (!siteSnapshot.exists()) {
                    // Register the site
                    console.log('🔐 [SecureAuth] Registering site with current user:', this.websiteId);
                    
                    await set(siteRef, {
                        websiteId: this.websiteId,
                        internalUrl: this.internalUrl,
                        websiteUrl: this.websiteUrl,
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp(),
                        owner: this.currentUser.email
                    });
                    
                    console.log('🔐 [SecureAuth] Site registered successfully');
                    return true;
                } else {
                    // Site already registered, update last access time
                    console.log('🔐 [SecureAuth] Site already registered with user, updating last access');
                    
                    await set(ref(this.db, `users/${safeName}/sites/${safeSiteUrl}/lastAccessed`), serverTimestamp());
                    return true;
                }
            } catch (error) {
                console.error('🔐 [SecureAuth] Error registering site:', error);
                return false;
            }
        },

        // Check if user is authenticated
        isAuthenticated: function () {
            return !!this.currentUser;
        },

        // Get the current authenticated user
        getCurrentUser: function () {
            return this.currentUser;
        },
        
        // Authenticate user (respect existing authentication)
        authenticate: async function() {
            console.log('🔐 [SecureAuth] Authenticate method called');
            
            // Already logged in, return current user
            if (this.currentUser) {
                console.log('🔐 [SecureAuth] Already authenticated as:', this.currentUser.email);
                return this.currentUser;
            }
            
            // Check if auth instance has a current user
            if (this.auth && this.auth.currentUser) {
                console.log('🔐 [SecureAuth] Found existing Firebase auth user:', this.auth.currentUser.email);
                this.currentUser = this.auth.currentUser;
                return this.currentUser;
            }
            
            // Not authenticated and no way to authenticate here
            // This should redirect to the login page in onAuthStateChanged
            console.log('🔐 [SecureAuth] Not authenticated and no way to authenticate here');
            return null;
        },

        // Get plugin settings from Firebase for current user and site
        getPluginSettings: async function (pluginId, defaultSettings = {}) {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }

            try {
                console.log(`🐶 FETCHING SETTINGS for plugin "${pluginId}"`);
                
                // Check if we're authenticated
                if (!this.isAuthenticated()) {
                    console.warn('🔐 [SecureAuth] Not authenticated, using default settings');
                    return ensureEnabledProperty(defaultSettings);
                }

                const { ref, get, set, serverTimestamp } = this.dbFunctions;
                
                // Build the path to check for existing plugin settings
                const userEmail = this.currentUser.email;
                const safeName = this.getSafeFirebaseKey(userEmail);
                const siteUrl = this.internalUrl || window.location.hostname;
                const safeSiteUrl = this.getSafeFirebaseKey(siteUrl);
                
                // Path structure: users/{userEmail}/sites/{siteUrl}/plugins/{pluginId}/settings
                const pluginPath = `users/${safeName}/sites/${safeSiteUrl}/plugins/${pluginId}`;
                const settingsPath = `${pluginPath}/settings`;
                const licensePath = `${pluginPath}/license`;
                
                console.log(`🐶 CHECKING PATH: "${settingsPath}"`);

                // Check if plugin settings exist in Firebase
                const settingsRef = ref(this.db, settingsPath);
                const settingsSnapshot = await get(settingsRef);
                
                // Also check for license data
                const licenseRef = ref(this.db, licensePath);
                const licenseSnapshot = await get(licenseRef);
                
                const settingsExist = settingsSnapshot.exists();
                const licenseExists = licenseSnapshot.exists();
                
                console.log(`🐶 SETTINGS EXISTS: ${settingsExist ? 'YES ✅' : 'NO ❌'}`);
                console.log(`🐶 LICENSE EXISTS: ${licenseExists ? 'YES ✅' : 'NO ❌'}`);
                
                // Get settings and license data
                let settings = settingsExist ? settingsSnapshot.val() : null;
                let license = licenseExists ? licenseSnapshot.val() : null;
                
                // If settings exist in Firebase, use them
                if (settingsExist) {
                    // Get existing settings
                    console.log(`🐶 FIREBASE DATA:`, JSON.stringify(settings));

                    // Only check if settings is valid and not empty
                    if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
                        console.log(`🐶 VALID SETTINGS FOUND! Using Firebase settings.`);
                        
                        // Add enabled property only if it doesn't exist
                        if (!settings.hasOwnProperty('enabled')) {
                            console.log(`🐶 Adding missing 'enabled' property to existing settings`);
                            settings.enabled = defaultSettings.hasOwnProperty('enabled') ? defaultSettings.enabled : true;
                        }
                        
                        // Update last accessed timestamp silently (don't wait for this)
                        set(ref(this.db, `${pluginPath}/lastAccessed`), serverTimestamp())
                            .catch(e => console.error(`Failed to update lastAccessed timestamp: ${e.message}`));

                    } else {
                        console.log(`🐶 EMPTY/INVALID SETTINGS found in Firebase.`);
                        settings = null;
                    }
                } else {
                    console.log(`🐶 NO SETTINGS found in Firebase.`);
                    settings = null;
                }
                
                // If license data exists, merge it with settings for backward compatibility
                if (licenseExists && license && typeof license === 'object') {
                    console.log(`🐶 LICENSE DATA FOUND:`, license);
                    
                    // Ensure we have settings object to add license to
                    settings = settings || {};
                    
                    // For backward compatibility, keep license_key and activated_at in settings
                    if (license.license_key) settings.license_key = license.license_key;
                    if (license.activated_at) settings.activated_at = license.activated_at;
                }

                // If we reach here and have valid settings, return them
                if (settings) {
                    console.log(`🐶 RETURNING COMBINED SETTINGS AND LICENSE DATA`);
                    // Add license info to the return object for backward compatibility
                    return settings;
                }

                // If we reach here, settings don't exist or are invalid, so create them
                console.log(`🐶 CREATING NEW SETTINGS using defaults`);
                
                try {
                    // Create plugin directory if it doesn't exist
                    console.log(`🐶 Creating plugin directory at: "${pluginPath}"`);
                    await set(ref(this.db, pluginPath), {
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp()
                    });

                    // Ensure defaultSettings has enabled property
                    const newSettings = ensureEnabledProperty(defaultSettings);
                    console.log(`🐶 New settings to save:`, JSON.stringify(newSettings));

                    // Save settings to Firebase
                    await set(settingsRef, newSettings);
                    console.log(`🐶 SAVED NEW SETTINGS to Firebase ✅`);
                    
                    // Create empty license object
                    await set(licenseRef, {
                        lastUpdated: serverTimestamp()
                    });
                    console.log(`🐶 CREATED LICENSE STRUCTURE in Firebase ✅`);
                    
                    return newSettings;
                } catch (error) {
                    console.error(`🐶 ERROR creating settings:`, error);
                    console.log(`🐶 FALLING BACK to defaults`);
                    return ensureEnabledProperty(defaultSettings);
                }
            } catch (error) {
                console.error(`🐶 ERROR retrieving settings:`, error);
                console.log(`🐶 FALLING BACK to defaults`);
                return ensureEnabledProperty(defaultSettings); 
            }
            
            // Helper function to ensure the enabled property exists
            function ensureEnabledProperty(settings) {
                if (!settings.hasOwnProperty('enabled')) {
                    settings = { ...settings, enabled: true };
                }
                return settings;
            }
        },

        // Update plugin settings in Firebase for current user and site
        updatePluginSettings: async function (pluginId, settings) {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }

            try {
                console.log('🔐 [SecureAuth] Updating settings for plugin:', pluginId);
                console.log('🔐 [SecureAuth] Settings to update:', settings);
                
                // Check if we're authenticated
                if (!this.isAuthenticated()) {
                    console.warn('🔐 [SecureAuth] Not authenticated, settings will be saved locally only');
                    return false;
                }
                
                // Check if we have website ID
                if (!this.websiteId) {
                    console.warn('🔐 [SecureAuth] No website ID available, cannot update settings');
                    return false;
                }

                const { ref, get, set, serverTimestamp } = this.dbFunctions;
                
                // Use email as the key for the user, cleaning it for Firebase
                const userEmail = this.currentUser.email;
                const safeName = this.getSafeFirebaseKey(userEmail);
                
                // Use website URL as the key for the site, cleaning it for Firebase
                const siteUrl = this.internalUrl || window.location.hostname;
                const safeSiteUrl = this.getSafeFirebaseKey(siteUrl);
                
                // Path structure: users/{userEmail}/sites/{siteUrl}/plugins/{pluginId}
                const pluginPath = `users/${safeName}/sites/${safeSiteUrl}/plugins/${pluginId}`;
                const settingsPath = `${pluginPath}/settings`;
                const licensePath = `${pluginPath}/license`;
                
                console.log('🔐 [SecureAuth] Plugin settings path:', settingsPath);
                
                // Extract license data from settings to store separately
                const cleanSettings = JSON.parse(JSON.stringify(settings));
                
                // Create license object with license data if present
                const license = {};
                
                // Check for and move license-related fields to license object
                if ('license_key' in cleanSettings) {
                    license.license_key = cleanSettings.license_key;
                    delete cleanSettings.license_key;
                }
                
                if ('activated_at' in cleanSettings) {
                    license.activated_at = cleanSettings.activated_at;
                    delete cleanSettings.activated_at;
                }

                // Update settings
                console.log('🔐 [SecureAuth] Writing settings to Firebase');
                const settingsRef = ref(this.db, settingsPath);
                await set(settingsRef, cleanSettings);

                // Update license data if we have any license info to save
                if (Object.keys(license).length > 0) {
                    console.log('🔐 [SecureAuth] Writing license data to Firebase');
                    const licenseRef = ref(this.db, licensePath);
                    
                    // First check if license path exists
                    const licenseSnapshot = await get(licenseRef);
                    
                    if (licenseSnapshot.exists()) {
                        // Update existing license data
                        const existingLicense = licenseSnapshot.val();
                        const updatedLicense = { ...existingLicense, ...license, lastUpdated: serverTimestamp() };
                        await set(licenseRef, updatedLicense);
                    } else {
                        // Create new license data
                        license.lastUpdated = serverTimestamp();
                        await set(licenseRef, license);
                    }
                }

                // Update last updated timestamp
                console.log('🔐 [SecureAuth] Updating lastUpdated timestamp');
                await set(ref(this.db, `${pluginPath}/lastUpdated`), serverTimestamp());
                
                // Also update lastAccessed
                await set(ref(this.db, `${pluginPath}/lastAccessed`), serverTimestamp());
                
                // Update site timestamps
                await set(ref(this.db, `users/${safeName}/sites/${safeSiteUrl}/lastUpdated`), serverTimestamp());

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
                return false; // Return false on error for graceful degradation
            }
        },

        // List all plugins registered for the current user and site
        listSitePlugins: async function () {
            if (!this.isInitialized) {
                console.log('🔐 [SecureAuth] Service not initialized, initializing now');
                await this.initialize();
            }

            try {
                // Check if we're authenticated
                if (!this.isAuthenticated()) {
                    console.warn('🔐 [SecureAuth] Not authenticated, cannot list plugins');
                    return [];
                }
                
                // Check if we have website ID
                if (!this.websiteId) {
                    console.warn('🔐 [SecureAuth] No website ID available, cannot list plugins');
                    return [];
                }

                const { ref, get } = this.dbFunctions;
                
                // Use email as the key for the user, cleaning it for Firebase
                const userEmail = this.currentUser.email;
                const safeName = this.getSafeFirebaseKey(userEmail);
                
                // Use website URL as the key for the site, cleaning it for Firebase
                const siteUrl = this.internalUrl || window.location.hostname;
                const safeSiteUrl = this.getSafeFirebaseKey(siteUrl);
                
                // Path structure: users/{userEmail}/sites/{siteUrl}/plugins
                const pluginsPath = `users/${safeName}/sites/${safeSiteUrl}/plugins`;
                console.log('🔐 [SecureAuth] Listing plugins at path:', pluginsPath);
                
                // Get all plugins for this site
                const pluginsRef = ref(this.db, pluginsPath);
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
                return [];
            }
        }
    };

    // Initialize when document is ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('🔐 [SecureAuth] Document loaded, initializing after delay');
        // Initialize Firebase with a slight delay to ensure document is fully loaded
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
window.inspectSecureAuth = function () {
    console.log('🔐 [SecureAuth] Current state:', {
        initialized: window.SecureFirebaseAuth.isInitialized,
        authenticated: window.SecureFirebaseAuth.isAuthenticated(),
        currentUser: window.SecureFirebaseAuth.currentUser ? window.SecureFirebaseAuth.currentUser.email : 'none',
        websiteId: window.SecureFirebaseAuth.websiteId,
        websiteUrl: window.SecureFirebaseAuth.websiteUrl,
        internalUrl: window.SecureFirebaseAuth.internalUrl
    });
    return window.SecureFirebaseAuth;
};

// Add debug utility for Firebase paths
window.inspectFirebasePaths = async function (pluginId) {
    if (!window.SecureFirebaseAuth) {
        console.error('SecureFirebaseAuth not initialized');
        return { error: 'SecureFirebaseAuth not initialized' };
    }

    const auth = window.SecureFirebaseAuth;
    if (!auth.isInitialized) {
        await auth.initialize();
    }
    
    if (!auth.isAuthenticated()) {
        console.error('Not authenticated');
        return { error: 'Not authenticated' };
    }
    
    const userEmail = auth.currentUser.email;
    const safeName = auth.getSafeFirebaseKey(userEmail);
    const siteUrl = auth.internalUrl || window.location.hostname;
    const safeSiteUrl = auth.getSafeFirebaseKey(siteUrl);
    
    // Build the path for inspection
    const pluginsPath = `users/${safeName}/sites/${safeSiteUrl}/plugins`;
    const specificPluginPath = pluginId ? `${pluginsPath}/${pluginId}` : null;
    const settingsPath = pluginId ? `${specificPluginPath}/settings` : null;
    
    // Get existing settings if a plugin ID is specified
    let settings = null;
    if (pluginId) {
        try {
            const { ref, get } = auth.dbFunctions;
            const settingsRef = ref(auth.db, settingsPath);
            const snapshot = await get(settingsRef);
            if (snapshot.exists()) {
                settings = snapshot.val();
            }
        } catch (error) {
            console.error('Error getting settings:', error);
        }
    }
    
    // Return debug information
    return {
        userEmail,
        safeName,
        siteUrl,
        safeSiteUrl,
        pluginsPath,
        specificPluginPath,
        settingsPath,
        settings
    };
};