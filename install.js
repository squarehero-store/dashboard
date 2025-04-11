// SquareHero Dashboard Creator v0.1.13
// Hosted version - For use with Squarespace
// Creates a password-protected dashboard page and removes itself from code injection

(function () {
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
        // Create the overlay
        const overlay = document.createElement('div');
        overlay.id = 'squarehero-install-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            backdrop-filter: blur(5px);
            color: white;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        `;

        // SquareHero Logo
        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = `
            margin-bottom: 40px;
        `;
        logoContainer.innerHTML = `
            <svg width="220" height="50" viewBox="0 0 350 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M41.1111 13.5H20.8889C17.1107 13.5 14 16.6107 14 20.3889V40.6111C14 44.3893 17.1107 47.5 20.8889 47.5H41.1111C44.8893 47.5 48 44.3893 48 40.6111V20.3889C48 16.6107 44.8893 13.5 41.1111 13.5Z" stroke="white" stroke-width="4"/>
                <path d="M76.1111 32.5H55.8889C52.1107 32.5 49 35.6107 49 39.3889V59.6111C49 63.3893 52.1107 66.5 55.8889 66.5H76.1111C79.8893 66.5 83 63.3893 83 59.6111V39.3889C83 35.6107 79.8893 32.5 76.1111 32.5Z" stroke="white" stroke-width="4"/>
                <path d="M105.048 47.2C102.168 47.2 99.8 46.544 97.944 45.232C96.088 43.888 94.872 41.968 94.296 39.472H99.4C99.848 40.784 100.616 41.792 101.704 42.496C102.824 43.168 103.992 43.504 105.208 43.504C106.616 43.504 107.736 43.2 108.568 42.592C109.4 41.952 109.816 41.104 109.816 40.048C109.816 39.216 109.56 38.544 109.048 38.032C108.536 37.52 107.88 37.136 107.08 36.88C106.312 36.592 105.224 36.272 103.816 35.92C101.928 35.44 100.408 34.96 99.256 34.48C98.136 34 97.144 33.248 96.28 32.224C95.448 31.168 95.032 29.76 95.032 28C95.032 26.4 95.448 24.992 96.28 23.776C97.112 22.528 98.28 21.568 99.784 20.896C101.32 20.224 103.064 19.888 105.016 19.888C107.992 19.888 110.408 20.624 112.264 22.096C114.152 23.536 115.32 25.536 115.768 28.096H110.504C110.248 27.04 109.64 26.192 108.68 25.552C107.72 24.88 106.552 24.544 105.176 24.544C103.928 24.544 102.904 24.832 102.104 25.408C101.304 25.952 100.904 26.752 100.904 27.808C100.904 28.576 101.144 29.2 101.624 29.68C102.136 30.16 102.76 30.528 103.496 30.784C104.264 31.04 105.336 31.344 106.712 31.696C108.6 32.176 110.12 32.672 111.272 33.184C112.424 33.664 113.416 34.432 114.248 35.488C115.112 36.512 115.544 37.936 115.544 39.76C115.544 41.168 115.16 42.512 114.392 43.792C113.624 45.072 112.472 46.112 110.936 46.912C109.4 47.104 107.416 47.2 105.048 47.2ZM132.905 29.776C135.065 29.776 136.828 30.32 138.196 31.408C139.596 32.496 140.396 34.144 140.594 36.352H135.722C135.626 35.456 135.292 34.768 134.717 34.288C134.174 33.776 133.438 33.52 132.51 33.52C131.486 33.52 130.685 33.888 130.11 34.624C129.534 35.328 129.246 36.464 129.246 38.032C129.246 39.6 129.534 40.752 130.11 41.488C130.686 42.192 131.486 42.544 132.51 42.544C134.27 42.544 135.37 41.68 135.81 39.952H140.683C140.491 42.096 139.708 43.728 138.338 44.848C136.97 45.936 135.146 46.48 132.86 46.48C130.188 46.48 128.11 45.68 126.626 44.08C125.14 42.448 124.398 40.144 124.398 37.168C124.398 34.816 125.14 32.736 126.626 30.928C128.142 29.488 130.22 28.768 132.862 28.768H132.905V29.776ZM154.642 46.48C152.002 46.48 149.954 45.712 148.498 44.176C147.042 42.608 146.314 40.304 146.314 37.264C146.314 34.32 147.042 32.032 148.498 30.4C149.986 28.768 152.002 27.968 154.546 27.968C156.274 27.968 157.778 28.384 159.058 29.216C160.37 30.016 161.346 31.152 161.986 32.624C162.658 34.096 162.994 35.824 162.994 37.808V39.088H150.771C150.866 40.224 151.218 41.104 151.826 41.728C152.466 42.352 153.282 42.656 154.274 42.656C155.042 42.656 155.682 42.448 156.194 42.032C156.706 41.584 157.058 40.992 157.25 40.256H162.482C162.162 42.096 161.266 43.552 159.794 44.624C158.322 45.664 156.594 46.176 154.61 46.176L154.642 46.48ZM154.626 31.68C153.698 31.68 152.93 31.968 152.322 32.544C151.714 33.088 151.33 33.92 151.17 35.04H157.778C157.778 34.048 157.458 33.248 156.818 32.64C156.178 32 155.458 31.68 154.658 31.68H154.626ZM177.397 46.48C175.733 46.48 174.293 46.112 173.077 45.376C171.893 44.64 170.981 43.616 170.341 42.304C169.733 40.992 169.429 39.488 169.429 37.792C169.429 36.096 169.733 34.592 170.341 33.28C170.981 31.968 171.893 30.944 173.077 30.208C174.261 29.472 175.701 29.104 177.397 29.104C179.093 29.104 180.533 29.472 181.717 30.208C182.933 30.944 183.845 31.968 184.453 33.28C185.093 34.592 185.413 36.096 185.413 37.792C185.413 39.488 185.093 40.992 184.453 42.304C183.813 43.616 182.901 44.64 181.717 45.376C180.533 46.112 179.093 46.48 177.397 46.48ZM177.397 42.608C178.421 42.608 179.221 42.176 179.797 41.312C180.405 40.448 180.709 39.264 180.709 37.76C180.709 36.256 180.405 35.072 179.797 34.208C179.221 33.344 178.421 32.912 177.397 32.912C176.405 32.912 175.605 33.344 174.997 34.208C174.421 35.072 174.133 36.256 174.133 37.76C174.133 39.264 174.421 40.448 174.997 41.312C175.605 42.176 176.405 42.608 177.397 42.608ZM197.93 46.288C196.29 46.288 194.858 45.936 193.642 45.232C192.426 44.496 191.498 43.504 190.858 42.256C190.218 40.976 189.898 39.52 189.898 37.888C189.898 36.224 190.218 34.768 190.858 33.52C191.498 32.24 192.426 31.232 193.642 30.496C194.858 29.76 196.29 29.392 197.93 29.392C199.37 29.392 200.618 29.712 201.674 30.352C202.762 30.96 203.594 31.84 204.17 32.992V22.448H208.778V46H204.266V42.592C203.722 43.744 202.906 44.656 201.818 45.328C200.73 45.968 199.434 46.288 197.93 46.288ZM198.97 42.48C200.09 42.48 200.986 42.08 201.658 41.28C202.33 40.448 202.682 39.312 202.714 37.872C202.714 36.432 202.362 35.296 201.658 34.464C200.986 33.632 200.09 33.216 198.97 33.216C197.85 33.216 196.954 33.632 196.282 34.464C195.61 35.296 195.274 36.432 195.274 37.872C195.274 39.312 195.61 40.448 196.282 41.28C196.954 42.08 197.85 42.48 198.97 42.48ZM224.587 46.48C222.923 46.48 221.483 46.112 220.267 45.376C219.083 44.64 218.171 43.616 217.531 42.304C216.923 40.992 216.619 39.488 216.619 37.792C216.619 36.096 216.923 34.592 217.531 33.28C218.171 31.968 219.083 30.944 220.267 30.208C221.451 29.472 222.891 29.104 224.587 29.104C226.283 29.104 227.723 29.472 228.907 30.208C230.123 30.944 231.035 31.968 231.643 33.28C232.283 34.592 232.603 36.096 232.603 37.792C232.603 39.488 232.283 40.992 231.643 42.304C231.003 43.616 230.091 44.64 228.907 45.376C227.723 46.112 226.283 46.48 224.587 46.48ZM224.587 42.608C225.611 42.608 226.411 42.176 226.987 41.312C227.595 40.448 227.899 39.264 227.899 37.76C227.899 36.256 227.595 35.072 226.987 34.208C226.411 33.344 225.611 32.912 224.587 32.912C223.595 32.912 222.795 33.344 222.187 34.208C221.611 35.072 221.323 36.256 221.323 37.76C221.323 39.264 221.611 40.448 222.187 41.312C222.795 42.176 223.595 42.608 224.587 42.608ZM261.724 20.704H274.116V46H268.468V25.84H261.724V20.704ZM287.666 46.48C285.97 46.48 284.53 46.112 283.346 45.376C282.162 44.64 281.25 43.616 280.61 42.304C280.002 40.992 279.698 39.488 279.698 37.792C279.698 36.096 280.002 34.592 280.61 33.28C281.25 31.968 282.162 30.944 283.346 30.208C284.53 29.472 285.97 29.104 287.666 29.104C289.362 29.104 290.802 29.472 291.986 30.208C293.202 30.944 294.114 31.968 294.722 33.28C295.362 34.592 295.682 36.096 295.682 37.792C295.682 39.488 295.362 40.992 294.722 42.304C294.082 43.616 293.17 44.64 291.986 45.376C290.802 46.112 289.362 46.48 287.666 46.48ZM287.666 42.608C288.69 42.608 289.49 42.176 290.066 41.312C290.674 40.448 290.978 39.264 290.978 37.76C290.978 36.256 290.674 35.072 290.066 34.208C289.49 33.344 288.69 32.912 287.666 32.912C286.674 32.912 285.874 33.344 285.266 34.208C284.69 35.072 284.402 36.256 284.402 37.76C284.402 39.264 284.69 40.448 285.266 41.312C285.874 42.176 286.674 42.608 287.666 42.608Z" fill="white"/>
            </svg>
        `;

        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 300px;
            background-color: rgba(255, 255, 255, 0.1);
            height: 5px;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 25px;
        `;

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.id = 'squarehero-progress-bar';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00D1FF 0%, #E600FF 50%, #FF003D 100%);
            background-size: 200% 100%;
            animation: gradient-shift 2s ease infinite;
            border-radius: 10px;
            transition: width 0.5s ease;
        `;

        // Add keyframes animation
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(styleSheet);

        progressContainer.appendChild(progressBar);

        // Status text
        const statusText = document.createElement('div');
        statusText.id = 'squarehero-status-text';
        statusText.style.cssText = `
            font-size: 24px;
            font-weight: 500;
            margin-bottom: 15px;
            text-align: center;
        `;
        statusText.textContent = 'Installing SquareHero Dashboard';

        // Funny message container
        const funnyMessageContainer = document.createElement('div');
        funnyMessageContainer.id = 'squarehero-funny-message';
        funnyMessageContainer.style.cssText = `
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            height: 24px;
            font-style: italic;
        `;
        funnyMessageContainer.textContent = getRandomFunnyMessage();

        // Build overlay
        overlay.appendChild(logoContainer);
        overlay.appendChild(statusText);
        overlay.appendChild(progressContainer);
        overlay.appendChild(funnyMessageContainer);
        document.body.appendChild(overlay);

        // Start funny message rotation
        startMessageRotation();

        return {
            updateProgress: function (percent, message) {
                const progressBar = document.getElementById('squarehero-progress-bar');
                if (progressBar) {
                    progressBar.style.width = percent + '%';
                }

                if (message) {
                    const statusText = document.getElementById('squarehero-status-text');
                    if (statusText) {
                        statusText.textContent = message;
                    }
                }
            },
            setStatus: function (message) {
                const statusText = document.getElementById('squarehero-status-text');
                if (statusText) {
                    statusText.textContent = message;
                }
            },
            close: function () {
                const overlay = document.getElementById('squarehero-install-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.5s ease';

                    // Remove after fade out
                    setTimeout(() => {
                        overlay.remove();
                    }, 500);
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

        // Make the message container fade
        const messageStyle = document.createElement('style');
        messageStyle.textContent = `
            #squarehero-funny-message {
                transition: opacity 0.5s ease;
            }
        `;
        document.head.appendChild(messageStyle);
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