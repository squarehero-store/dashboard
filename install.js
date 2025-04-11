// SquareHero Dashboard Creator v0.1.14
// Hosted version - For use with Squarespace
// Creates a password-protected dashboard page and removes itself from code injection

(function () {

    // At the beginning of your script, add these logs to identify the context
    console.log("Script executing in context:", window.location.href);
    console.log("Is in iframe?", window !== window.top);

    if (window !== window.top) {
        console.log("Parent frame URL (if accessible):",
            window.parent.location.href || "Not accessible due to same-origin policy");
    }

    console.log("Available frames in window.top:",
        window.top.frames.length ? window.top.frames.length : "Not accessible");

    // Try to log all iframe sources in the document
    console.log("Checking iframes in current document:");
    const iframes = document.querySelectorAll('iframe');
    console.log(`Found ${iframes.length} iframes in current document`);
    iframes.forEach((iframe, index) => {
        console.log(`iframe ${index} src:`, iframe.src);
        console.log(`iframe ${index} id:`, iframe.id);
    });


    // Configuration - fixed values
    const pageTitle = "SquareHero Dashboard";
    const pageUrlId = "squarehero-dashboard";
    const headerCodeToInject = `<!-- SquareHero Dashboard Embed -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.8/dashboard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/dashboard-tabs.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/wizard-component.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/help-docs.min.css">

<div class="dashboard-wrapper" data-wizard-enabled="false">
    <header class="dashboard-header">
        <img src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-logo.png" alt="SquareHero Logo" class="logo">
        <h1 class="dashboard-title">SquareHero Dashboard</h1>
        <button class="support-button">SquareHero Support</button>
    </header>

    <div class="dashboard-tabs">
        <button class="dashboard-tab active" data-tab="plugins">Your Plugins</button>
        <button class="dashboard-tab" data-tab="discover-plugins">Discover Plugins</button>
        <button class="dashboard-tab" data-tab="register">Register Plugins</button>
        <button class="dashboard-tab" data-tab="news">Notifications</button>
    </div>

    <main class="dashboard-container">
        <section class="plugins-column dashboard-tab-content active" id="plugins-tab">
            <div class="column-header">
                <h2 class="column-title">Manage your plugins</h2>
                <p class="column-description">Your plugins are shown below. Click any plugin to adjust settings or view documentation.</p>
            </div>

            <div id="plugin-cards-container">
                <div class="loading-indicator">
                </div>
            </div>
        </section>

        <section class="whats-new-column dashboard-tab-content" id="news-tab">
            <div class="column-header">
                <h2 class="column-title">What's new</h2>
                <p class="column-description">Stay updated on the latest announcements, feature releases, and
                    important plugin updates from the SquareHero team.</p>
            </div>

            <div id="news-items-container">
                <div class="loading-indicator">
                    <p>Loading updates...</p>
                </div>
            </div>
        </section>

        <section class="discover-plugins-column dashboard-tab-content" id="discover-plugins-tab">
            <div class="column-header">
                <h2 class="column-title">Explore plugins with our no-risk trial</h2>
                <p class="column-description">Simple setup, instant results - just one click. No code, no downloads, no emails, no commitment.</p>
            </div>
            <div id="discover-plugins-content">
                <p>Dashboard settings content will go here.</p>
            </div>
        </section>

        <section class="help-column dashboard-tab-content" id="register-tab">
            <div class="column-header">
                <h2 class="column-title">Register</h2>
                <p class="column-description">Find documentation and support resources.</p>
            </div>
            <div id="help-content">
                <div class="registration-form">
                    <div class="form-description">
                        <p>Enter your license key below to register a purchased plugin. License keys are sent to the email address associated with your purchase.</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="license-key">License Key</label>
                        <input type="text" id="license-key" class="setting-input" placeholder="Enter your license key (xxxx-xxxx-xxxx-xxxx)">
                    </div>
                    
                    <div class="form-actions">
                        <button id="register-plugin-button" class="button save-button">Register Plugin</button>
                    </div>
                    
                    <div class="registration-help">
                        <p>Need help finding your license key? <a href="#" class="help-link">Contact Support</a></p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <div class="settings-panel" id="settings-panel">
        <div class="panel-header">
            <h2 class="panel-title" id="plugin-settings-title">Plugin Settings</h2>
            <button class="close-button" id="close-panel">&times;</button>
        </div>
        <div class="panel-content" id="panel-content">
        </div>
    </div>

    <div class="overlay" id="overlay"></div>
</div>

<!-- Script Imports -->
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/settings-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/component-system.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/wizard-component.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/auth.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/dashboard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/firebase-docs-integration.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.2.3/help-docs-loader.min.js"></script>
<!-- Additional Resources -->
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.css">`;

    // Funny messages for the loading screen
    const funnyMessages = [
        "Testing ejector seats...",
        "Installing cup holders...",
        "Watching 60's Batman reruns...",
        "Polishing the dashboard buttons...",
        "Charging up the flux capacitor...",
        "Convincing pixels to move faster...",
        "Teaching robots to dance...",
        "Brewing digital coffee...",
        "Sorting the ones from the zeros..."
    ];

    // Create and manage the full-screen overlay
    function createInstallOverlay() {
        console.log("Creating installation overlay...");
    
        // Get the iframe element
        const iframe = document.getElementById('sqs-site-frame');
        if (!iframe || !iframe.contentDocument) {
            console.error("Could not find #sqs-site-frame or access its contentDocument");
            return null;
        }
    
        const iframeDocument = iframe.contentDocument;
    
        // Create the overlay
        const overlay = iframeDocument.createElement('div');
        overlay.id = 'squarehero-install-overlay';
    
        // Add the helper CSS for installation styling
        const helperCSS = iframeDocument.createElement('link');
        helperCSS.rel = 'stylesheet';
        helperCSS.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.css';
    
        try {
            // Add CSS to iframe document head
            iframeDocument.head.appendChild(helperCSS);
    
            // Force styles on the overlay element to ensure visibility
            overlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(0, 9, 25, 0.95) !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 9999999 !important;
                color: white !important;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            `;
    
            // Add the overlay to the iframe document body
            iframeDocument.body.appendChild(overlay);
            console.log("Overlay added to iframe document");
        } catch (e) {
            console.error("Error adding overlay to iframe document:", e);
            return null;
        }
    
        // Add gradient circles for background effect
        const gradientCircle1 = iframeDocument.createElement('div');
        gradientCircle1.className = 'gradient-circle-1';
        gradientCircle1.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 639 701" fill="none">
                <g filter="url(#a)" opacity=".4">
                    <circle cx="288.5" cy="350.5" r="256.5" fill="url(#b)" fill-opacity=".7"></circle>
                </g>
                <defs>
                    <linearGradient id="b" x1="288.5" x2="288.5" y1="94" y2="607" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00D1FF"></stop>
                        <stop offset=".45" stop-color="#A603F3"></stop>
                        <stop offset=".975" stop-color="#FF00E6"></stop>
                    </linearGradient>
                    <filter id="a" width="701" height="701" x="-62" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                        <feGaussianBlur result="effect1_foregroundBlur_200_26237" stdDeviation="47"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
        `;
    
        const gradientCircle2 = iframeDocument.createElement('div');
        gradientCircle2.className = 'gradient-circle-2';
        gradientCircle2.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 542 542" fill="none">
                <g filter="url(#a)" opacity=".4">
                    <circle cx="271" cy="271" r="177" fill="url(#b)"></circle>
                </g>
                <defs>
                    <linearGradient id="b" x1="271" x2="271" y1="94" y2="448" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00D1FF"></stop>
                        <stop offset=".45" stop-color="#A603F3"></stop>
                        <stop offset=".975" stop-color="#FF00E6"></stop>
                    </linearGradient>
                    <filter id="a" width="542" height="542" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                        <feGaussianBlur result="effect1_foregroundBlur_206_91770" stdDeviation="47"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
        `;
    
        // SquareHero Logo
        const logoContainer = iframeDocument.createElement('div');
        logoContainer.id = 'squarehero-logo-container';
        logoContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" fill="none" viewBox="0 0 240 118">
                <!-- SVG content here -->
            </svg>
        `;
    
        // Progress container
        const progressContainer = iframeDocument.createElement('div');
        progressContainer.id = 'squarehero-progress-container';
    
        // Progress bar
        const progressBar = iframeDocument.createElement('div');
        progressBar.id = 'squarehero-progress-bar';
        progressContainer.appendChild(progressBar);
    
        // Status text
        const statusText = iframeDocument.createElement('div');
        statusText.id = 'squarehero-status-text';
        statusText.textContent = 'Installing SquareHero Dashboard';
    
        // Funny message container
        const funnyMessageContainer = iframeDocument.createElement('div');
        funnyMessageContainer.id = 'squarehero-funny-message';
        funnyMessageContainer.textContent = getRandomFunnyMessage();
    
        // Build overlay
        overlay.appendChild(gradientCircle1);
        overlay.appendChild(gradientCircle2);
        overlay.appendChild(logoContainer);
        overlay.appendChild(statusText);
        overlay.appendChild(progressContainer);
        overlay.appendChild(funnyMessageContainer);
    
        // Start funny message rotation
        startMessageRotation(iframeDocument);
    
        return {
            updateProgress: function (percent, message) {
                const progressBar = iframeDocument.getElementById('squarehero-progress-bar');
                if (progressBar) {
                    progressBar.style.width = percent + '%';
                }
    
                if (message) {
                    const statusText = iframeDocument.getElementById('squarehero-status-text');
                    if (statusText) {
                        statusText.textContent = message;
                    }
                }
            },
            setStatus: function (message) {
                const statusText = iframeDocument.getElementById('squarehero-status-text');
                if (statusText) {
                    statusText.textContent = message;
                }
            },
            close: function () {
                try {
                    const overlay = iframeDocument.getElementById('squarehero-install-overlay');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            overlay.remove();
                        }, 500);
                    }
                } catch (e) {
                    console.error("Error closing overlay:", e);
                }
            }
        };
    }

    // Get a random funny message
    function getRandomFunnyMessage() {
        return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    }

    // Start rotating funny messages
    function startMessageRotation() {
        let messageInterval = setInterval(() => {
            const messageElement = document.getElementById('squarehero-funny-message');
            if (messageElement) {
                messageElement.style.opacity = '0';

                setTimeout(() => {
                    messageElement.textContent = getRandomFunnyMessage();
                    messageElement.style.opacity = '1';
                }, 500);
            } else {
                clearInterval(messageInterval);
            }
        }, 3000);
    }

    // Navigate to the Pages panel
    function navigateToPages() {
        return new Promise((resolve) => {
            if (window.top && window.top.CONFIG_PANEL &&
                window.top.CONFIG_PANEL.get("router") &&
                window.top.CONFIG_PANEL.get("router").history &&
                window.top.CONFIG_PANEL.get("router").history.push) {

                const pagesPath = "/config/pages";
                console.log(`Navigating to the Pages panel: ${pagesPath}`);
                try {
                    window.top.CONFIG_PANEL.get("router").history.push(pagesPath);
                    console.log("Navigation successful");

                    // Give the UI time to update
                    setTimeout(resolve, 500);
                } catch (error) {
                    console.error("Error navigating to the Pages panel:", error);
                    resolve(); // Continue even if navigation fails
                }
            } else {
                console.warn("Could not access the internal router object");
                resolve(); // Continue without navigation
            }
        });
    }

    // Main function to initialize dashboard
    async function initSquareHeroDashboard() {
        console.log("SquareHero Dashboard initializing...");

        // First navigate to the Pages panel
        await navigateToPages();

        // Create our full-screen overlay
        const overlay = createInstallOverlay();

        // Get the crumb cookie for CSRF protection
        const crumb = document.cookie.split(';')
            .find(c => c.trim().startsWith('crumb='))
            ?.split('=')[1];

        if (!crumb) {
            console.error("Could not find crumb cookie. Are you logged into Squarespace?");
            overlay.setStatus("Authentication Error");
            overlay.updateProgress(100, "Error: Authentication token not found");
            setTimeout(() => {
                overlay.close();
            }, 5000);
            return null;
        }

        try {
            // First check if the dashboard page already exists
            overlay.updateProgress(20, "Checking for existing dashboard...");
            const dashboardExists = await checkIfPageExists(crumb);

            if (dashboardExists) {
                console.log("SquareHero Dashboard already exists");
                overlay.updateProgress(40, "Dashboard already exists");
                overlay.setStatus("Dashboard Already Exists");
            } else {
                // Create the dashboard page
                console.log("Creating SquareHero Dashboard...");
                overlay.updateProgress(40, "Creating dashboard page...");
                await createDashboardPage(crumb);
                overlay.updateProgress(60, "Dashboard page created!");
            }

            // Now, remove the script tag from code injection
            console.log("Removing script from code injection...");
            overlay.updateProgress(70, "Cleaning up installation...");
            await removeScriptTagFromInjection(crumb);

            // Add helper script to site-wide header
            console.log("Adding helper script to site-wide header...");
            overlay.updateProgress(85, "Adding helper tools...");
            await addHelperScriptToHeader(crumb);

            // Complete the installation
            overlay.updateProgress(100, "Installation complete!");
            overlay.setStatus("SquareHero Dashboard Ready!");

            // Add a delay before refreshing the page
            console.log("Installation complete. Page will refresh in 5 seconds...");
            setTimeout(() => {
                overlay.close();
                window.location.reload();
            }, 5000);

        } catch (error) {
            console.error("Error in dashboard creation process:", error);
            overlay.setStatus("Installation Error");
            overlay.updateProgress(100, "Error: " + error.message);
            setTimeout(() => {
                overlay.close();
            }, 5000);
        }
    }

    // Check if the dashboard page already exists
    async function checkIfPageExists(crumb) {
        // Fetch the site layout to see if our dashboard already exists
        const response = await fetch(`${window.location.origin}/api/commondata/GetSiteLayout`, {
            method: "GET",
            headers: {
                "accept": "application/json, text/plain, */*",
                "x-csrf-token": crumb
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to get site layout: ${response.status}`);
        }

        const siteLayout = await response.json();

        // Check collections directly if they exist
        if (siteLayout.collections && Array.isArray(siteLayout.collections)) {
            for (const collection of siteLayout.collections) {
                if (collection && collection.urlId === pageUrlId) {
                    console.log("Found matching collection:", collection);
                    return true;
                }
            }
        }

        // Check in navigation sections
        if (siteLayout.layout && Array.isArray(siteLayout.layout)) {
            for (const nav of siteLayout.layout) {
                if (nav && nav.links && Array.isArray(nav.links)) {
                    for (const linkObj of nav.links) {
                        if (linkObj && linkObj.urlId === pageUrlId) {
                            console.log("Found matching page in navigation:", linkObj);
                            return true;
                        }
                    }
                }
            }
        }

        console.log("Dashboard page not found in existing pages");
        return false;
    }

    // Function to create the dashboard page
    async function createDashboardPage(crumb) {
        // Generate a random password (20 characters)
        const generateRandomPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
            let password = '';
            for (let i = 0; i < 20; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                password += chars[randomIndex];
            }
            return password;
        };

        const randomPassword = generateRandomPassword();

        // Basic page data with header injection code and automatic password protection
        const pageData = {
            "collectionData": {
                "description": { "html": "", "raw": false },
                "enabled": true,
                "deleted": false,
                "folder": false,
                "regionName": "default",
                "dirty": false,
                "body": null,
                "collectionType": 10,
                "typeName": "page",
                "title": pageTitle,
                "newTitle": pageTitle,
                "ordering": 3,
                "icon": "page",
                "navigationTitle": pageTitle,
                "urlId": pageUrlId,
                "type": 10,
                "headerInjectCode": headerCodeToInject,
                "passwordProtected": true,
                "password": randomPassword
            },
            "memberAreaData": {
                "memberAreaIds": []
            }
        };

        const response = await fetch(`${window.location.origin}/api/commondata/SaveCollectionSettings`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-csrf-token": crumb
            },
            body: JSON.stringify(pageData),
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to create page: ${response.status}`);
        }

        const result = await response.json();
        console.log("Page created successfully:", result);
        return result;
    }

    // Function to remove the script tag from code injection
    async function removeScriptTagFromInjection(crumb) {
        // First, retrieve current injection settings
        const settingsResponse = await fetch(`${window.location.origin}/api/config/GetInjectionSettings`, {
            method: "GET",
            headers: {
                "x-csrf-token": crumb,
                "accept": "application/json, text/plain, */*"
            },
            credentials: "include"
        });

        if (!settingsResponse.ok) {
            throw new Error(`Failed to get injection settings: ${settingsResponse.status}`);
        }

        const currentSettings = await settingsResponse.json();
        console.log("Current code injection retrieved");

        // Look for script tag with our custom attribute
        if (currentSettings.header) {
            // Use regex to find the script tag with our attribute
            const regex = /<script[^>]*squarehero-function=["']?dashboard-install["']?[^>]*>[\s\S]*?<\/script>/i;

            if (regex.test(currentSettings.header)) {
                console.log("Script tag found in header injection, removing it...");

                // Create new header content without this script
                const newHeader = currentSettings.header.replace(regex, '');

                // Prepare form-urlencoded body
                const formBody = new URLSearchParams({
                    header: newHeader.trim(),
                    footer: currentSettings.footer || '',
                    lockPage: currentSettings.lockPage || '',
                    postItem: currentSettings.postItem || ''
                });

                // Save updated settings
                const saveResponse = await fetch(`${window.location.origin}/api/config/SaveInjectionSettings`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "x-csrf-token": crumb
                    },
                    body: formBody.toString(),
                    credentials: "include"
                });

                if (!saveResponse.ok) {
                    throw new Error(`Failed to save updated injection settings: ${saveResponse.status}`);
                }

                console.log("Script tag removed successfully");
                return true;
            } else {
                console.log("Script tag not found in header injection");
                return false;
            }
        }
        return false;
    }

    // Function to add helper script to site-wide header
    async function addHelperScriptToHeader(crumb) {
        // First, retrieve current injection settings
        const settingsResponse = await fetch(`${window.location.origin}/api/config/GetInjectionSettings`, {
            method: "GET",
            headers: {
                "x-csrf-token": crumb,
                "accept": "application/json, text/plain, */*"
            },
            credentials: "include"
        });

        if (!settingsResponse.ok) {
            throw new Error(`Failed to get injection settings: ${settingsResponse.status}`);
        }

        const currentSettings = await settingsResponse.json();
        console.log("Current code injection retrieved for adding helper script");

        // Define the helper script to add
        const helperScript = `<!-- SquareHero Helper Script -->
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.css">`;

        // Check if the helper script is already in the header
        if (currentSettings.header &&
            (currentSettings.header.includes('sh-helper.min.js') ||
                currentSettings.header.includes('sh-helper.min.css'))) {
            console.log("Helper script already exists in header, skipping addition");
            return false;
        }

        // Add the helper script to the current header
        const newHeader = currentSettings.header ?
            (currentSettings.header.trim() + '\n\n' + helperScript) :
            helperScript;

        // Prepare form-urlencoded body
        const formBody = new URLSearchParams({
            header: newHeader,
            footer: currentSettings.footer || '',
            lockPage: currentSettings.lockPage || '',
            postItem: currentSettings.postItem || ''
        });

        // Save updated settings
        const saveResponse = await fetch(`${window.location.origin}/api/config/SaveInjectionSettings`, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-csrf-token": crumb
            },
            body: formBody.toString(),
            credentials: "include"
        });

        if (!saveResponse.ok) {
            throw new Error(`Failed to save updated injection settings with helper script: ${saveResponse.status}`);
        }

        console.log("Helper script added successfully");
        return true;
    }

    // Check if we're in the Squarespace admin interface
    if (window.location.href.includes('/config') ||
        window.location.href.includes('/home') ||
        window.location.hostname.includes('.squarespace.com') ||
        document.querySelector('.sqs-editing-overlay')) {
        // Wait for page to fully load before executing
        window.addEventListener('load', function () {
            // Add a slight delay to ensure everything is loaded
            setTimeout(initSquareHeroDashboard, 1000);
        });
    } else {
        console.log("Not detected as Squarespace admin interface. Current URL:", window.location.href);
    }
})();