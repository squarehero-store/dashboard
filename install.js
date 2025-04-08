// SquareHero Dashboard Creator v0.1.12
// Hosted version - For use with Squarespace
// Creates a password-protected dashboard page and removes itself from code injection

(function () {
    // Configuration - fixed values
    const pageTitle = "SquareHero Dashboard";
    const pageUrlId = "squarehero-dashboard";
    const headerCodeToInject = `<!-- SquareHero Dashboard Embed -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.15/dashboard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.15/dashboard-tabs.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.15/wizard-component.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.15/help-docs.min.css">

<div class="dashboard-wrapper" data-wizard-enabled="false">
    <header class="dashboard-header">
        <img src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.15/sh-logo.png" alt="SquareHero Logo" class="logo">
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
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/settings-components.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/component-system.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/wizard-component.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/dashboard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/firebase-docs-integration.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0.1.10/help-docs-loader.min.js"></script>`;

    // Main function to initialize dashboard
    async function initSquareHeroDashboard() {
        console.log("SquareHero Dashboard initializing...");

        // Get the crumb cookie for CSRF protection
        const crumb = document.cookie.split(';')
            .find(c => c.trim().startsWith('crumb='))
            ?.split('=')[1];

        if (!crumb) {
            console.error("Could not find crumb cookie. Are you logged into Squarespace?");
            showNotification("Error: Authentication token not found. Please login to Squarespace.", "#F44336");
            return null;
        }

        try {
            // First check if the dashboard page already exists
            const dashboardExists = await checkIfPageExists(crumb);

            if (dashboardExists) {
                console.log("SquareHero Dashboard already exists");
                showNotification("SquareHero Dashboard already exists", "#2196F3");
            } else {
                // Create the dashboard page
                console.log("Creating SquareHero Dashboard...");
                await createDashboardPage(crumb);
                showNotification("SquareHero Dashboard created successfully!", "#4CAF50");
            }

            // Now, remove the script tag from code injection
            console.log("Removing script from code injection...");
            await removeScriptTagFromInjection(crumb);

            // Add a delay before refreshing the page
            console.log("Installation complete. Page will refresh in 3 seconds...");
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (error) {
            console.error("Error in dashboard creation process:", error);
            showNotification("Error: " + error.message, "#F44336");
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
                showNotification("Installation complete! Script removed successfully. Page will refresh shortly...", "#4CAF50");
                return true;
            } else {
                console.log("Script tag not found in header injection");
                showNotification("Installation complete! (Script tag not found for removal). Page will refresh shortly...", "#FF9800");
                return false;
            }
        }
        return false;
    }

    // Helper function to escape special characters in strings for RegExp
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to show notifications
    function showNotification(message, bgColor) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = bgColor || '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        notification.textContent = message;

        // Add to DOM, then remove after 5 seconds
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 1s';
            setTimeout(() => notification.remove(), 1000);
        }, 5000);
    }

    // Check if we're in the Squarespace admin interface
    if (window.location.href.includes('/config') ||
        window.location.href.includes('/home') ||
        window.location.hostname.includes('.squarespace.com') ||
        document.querySelector('.sqs-editing-overlay')) {
        // Wait for page to fully load before executing
        window.addEventListener('load', function () {
            // Add a slight delay to ensure everything is loaded
            setTimeout(initSquareHeroDashboard, 2000);
        });
    } else {
        console.log("Not detected as Squarespace admin interface. Current URL:", window.location.href);
    }
})();