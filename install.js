// SquareHero Dashboard Creator v1.0
// Hosted version - For use with Squarespace
// Creates a password-protected dashboard page and removes itself from code injection

(function () {
    // Configuration - fixed values
    const pageTitle = "SquareHero Dashboard";
    const pageUrlId = "squarehero-dashboard";
    const headerCodeToInject = `<div><p>SquareHero Dashboard - Created automatically</p></div>`;

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

        // The exact script tag we need to remove
        const scriptTag = `<script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/install.min.js"></script>`;

        // Find our script tag in the header injection
        if (currentSettings.header) {
            if (currentSettings.header.includes(scriptTag)) {
                console.log("Script tag found in header injection, removing it...");

                // Create new header content without this script
                const newHeader = currentSettings.header.replace(scriptTag, '');

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
                showNotification("Installation complete! Script removed successfully", "#4CAF50");
            } else {
                console.log("Script tag not found in header injection");
                showNotification("Installation complete! (Script tag not found for removal)", "#FF9800");
            }
        }
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