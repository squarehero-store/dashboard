// SquareHero Dashboard Creator v0.1.14
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
        console.log("Creating installation overlay...");
        // Create the overlay
        const overlay = document.createElement('div');
        overlay.id = 'squarehero-install-overlay';

        // Add the helper CSS for installation styling
        console.log("Adding helper CSS for styling...");
        const helperCSS = document.createElement('link');
        helperCSS.rel = 'stylesheet';
        helperCSS.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/sh-helper.min.css';
        document.head.appendChild(helperCSS);

        console.log("Current body children count:", document.body.children.length);

        // Add gradient circles for background effect
        const gradientCircle1 = document.createElement('div');
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

        const gradientCircle2 = document.createElement('div');
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
        const logoContainer = document.createElement('div');
        logoContainer.id = 'squarehero-logo-container';
        logoContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" fill="none" viewBox="0 0 240 118"><g clip-path="url(#a987z)"><path fill="#001E45" d="M142.291 40.455V14.713L119.999 1.842l-22.293 12.87v25.743l22.293 12.87 22.292-12.87Z"/><path fill="#87C4CC" d="M142.291 40.455V14.713L119.999 1.842l-22.293 12.87v25.743l22.293 12.87 22.292-12.87Z"/><path fill="#0CC2ED" d="M104.967 10.548A17.347 17.347 0 0 0 120 19.23a17.355 17.355 0 0 0 15.033-8.683l-15.035-8.706-15.04 8.686.009.02ZM119.999 35.965a17.428 17.428 0 0 0-15.032 8.683l15.032 8.678 15.034-8.678a17.423 17.423 0 0 0-15.034-8.683Z"/><path fill="#001E45" d="M136.416 11.337a18.956 18.956 0 0 1-32.832 0l-5.878 3.376v25.742l5.878 3.395A18.957 18.957 0 0 1 120 34.368a18.953 18.953 0 0 1 16.416 9.482l5.878-3.395V14.713l-5.878-3.376Z"/><path fill="#fff" d="M143.087 13.33 120.797.462 119.998 0l-.798.462L96.945 13.31l-.035.02-.8.459v27.59l.43.247.368.211L119.2 54.708l.798.462.799-.462 15.034-8.68 1.383-.795.855-.49 5.029-2.906.798-.459V13.792l-.809-.462Zm-6.671 30.52A18.957 18.957 0 0 0 120 34.368a18.953 18.953 0 0 0-16.416 9.482l-5.878-3.395V14.713l5.878-3.376A18.948 18.948 0 0 0 120 20.817a18.957 18.957 0 0 0 16.416-9.48l5.878 3.376v25.742l-5.878 3.395ZM119.998 1.842l15.041 8.686a17.357 17.357 0 0 1-30.067 0l15.026-8.686Zm0 51.484-15.031-8.678A17.346 17.346 0 0 1 120 35.965a17.355 17.355 0 0 1 15.033 8.683l-15.035 8.678Z"/><path fill="#fff" d="m138.691 23.051-16.221 3.122 5.405 3.121 10.816-6.243ZM101.309 23.051l16.221 3.122-5.408 3.121-10.813-6.243ZM130.817 40.056l-16.22 3.121 5.408 3.122 10.812-6.243ZM18.612 69.042c0-2.096-.062-4.448-.57-6.272-.502-1.73-1.291-2.939-2.517-2.905-2.018.137-2.671 2.734-2.677 6.557 0 2.223.784 4.493 1.93 6.887 1.146 2.395 2.651 4.826 4.156 7.395 1.79 3.067 3.578 6.172 4.932 9.2 1.354 3.027 2.28 6.148 2.28 9.564 0 4.184-.6 8.187-2.26 11.402-1.659 3.216-4.316 5.611-8.535 6.477-4.932 1.018-7.697-.69-9.276-4.011-1.58-3.321-1.927-8.104-1.927-13.127a483.19 483.19 0 0 1 7.588-2.076c0 2.763.063 5.519.633 7.466.496 2.05 1.351 3.299 2.996 3.014 2.28-.411 3.159-3.521 3.17-7.62 0-2.093-.855-4.413-1.995-6.81-.644-1.141-1.286-2.384-1.996-3.624a216.43 216.43 0 0 1-4.872-8.458 38.686 38.686 0 0 1-3.802-9.978 21.799 21.799 0 0 1-.645-5.328c0-3.64.647-7.591 2.31-10.599 1.658-2.922 4.19-4.977 7.87-5.06 4.693-.08 7.43 2.264 8.934 5.582 1.506 3.42 1.922 7.566 1.91 11.07-2.544.42-5.09.838-7.637 1.254ZM48.462 99.975a18.049 18.049 0 0 1-.61 4.256c-.23.838-.515 1.66-.855 2.46a3.652 3.652 0 0 0 2.814 1.545c-.012 2.245-.022 4.487-.032 6.728-3.99.57-6.026-1.015-7.26-3.136a11.402 11.402 0 0 1-3.541 1.212c-2.358.37-4.188 0-5.49-1.015-1.303-.929-2.147-2.246-2.732-3.689-.71-1.65-1.094-3.672-1.14-5.969.04-11.107.081-22.213.123-33.32.04-2.093.448-4.164 1.203-6.117.599-1.554 1.456-3.108 2.774-4.276 1.317-1.17 3.158-1.95 5.524-1.982 2.366-.031 4.134.69 5.44 1.78a10.035 10.035 0 0 1 2.805 3.99 15.747 15.747 0 0 1 1.154 5.767l-.177 31.766Zm-6.947-31.48c0-1.492-.254-2.526-.904-3.402a1.838 1.838 0 0 0-1.442-.55c-1.246.043-1.842 1.118-2.11 2.11a6.697 6.697 0 0 0-.27 2.05l-.14 32.697c0 1.585.316 2.597.966 3.336a1.527 1.527 0 0 0 1.374.413c1.246-.168 1.84-1.14 2.107-2.298.21-.661.306-1.353.285-2.046.04-10.77.085-21.54.134-32.31ZM72.44 57.148c-.063 13.641-.126 26.988-.186 40.626a15.681 15.681 0 0 1-1.211 5.702 11.142 11.142 0 0 1-2.85 4.056c-1.323 1.255-3.105 2.073-5.474 2.335-2.37.262-4.208-.165-5.516-1.163a8.126 8.126 0 0 1-2.74-3.581 14.748 14.748 0 0 1-1.154-5.673l.21-42.293h7.093l-.205 41.598c0 1.505.316 2.474.972 3.195a1.646 1.646 0 0 0 1.377.437c1.251-.12 1.847-1.027 2.115-2.113.209-.624.306-1.28.285-1.938l.197-41.179 7.087-.009ZM75.433 108.071c2.514-17.287 5.02-33.992 7.517-50.923h8.675c2.38 16.737 4.772 32.935 7.175 49.469-2.31.095-4.622.203-6.935.325-.43-3.394-.86-6.791-1.289-10.191-2.28.102-4.567.218-6.859.347-.45 3.473-.902 6.951-1.357 10.434-2.309.166-4.618.345-6.927.539Zm12.193-34.924a342.33 342.33 0 0 1-.194-1.3h-.394l-.202 1.308-2.098 16.03c1.625-.074 3.25-.143 4.875-.205-.662-5.265-1.324-10.542-1.987-15.833ZM114.861 106.218l-3.683-20.879-1.912.023-.026 20.942c-2.38.047-4.755.111-7.127.191l.103-49.318 7.098-.02c8.475-.014 12.093 4.416 12.096 13.786 0 4.923-1.252 9.368-3.954 11.26l4.561 24.004c-2.389-.014-4.774-.01-7.156.011Zm-5.584-27.612c.989 0 2.306-.157 3.361-1.109 1.055-.952 1.913-2.777 1.916-6.272.002-3.495-.856-5.393-1.905-6.334-1.049-.94-2.366-1.003-3.352-1-.008 4.9-.014 9.806-.02 14.715ZM125.934 57.16h16.232c0 2.514.014 4.561.02 7.075-3.041-.032-6.088-.057-9.142-.074 0 4.35.006 8.7.02 13.05 2.195.026 4.39.058 6.585.098 0 2.672.006 5.341.02 8.008-2.197-.048-4.395-.09-6.594-.126 0 4.561.007 9.114.02 13.658 3.062.066 6.121.155 9.179.265 0 2.516.007 5.033.02 7.549a535.649 535.649 0 0 0-16.326-.436l-.034-49.067ZM160.345 83.364c-2.026-.088-4.053-.17-6.081-.245.033 8.065.062 16.128.089 24.188a540.616 540.616 0 0 0-7.837-.45c-.055-18.37-.108-36.741-.16-55.113h7.794l.086 22.98c2.024.053 4.049.112 6.075.179l-.097-23.154h7.797c.085 18.882.172 37.76.259 56.636a540.406 540.406 0 0 0-7.825-.656c-.034-8.117-.068-16.239-.1-24.365ZM173.55 57.16h16.223c0 2.705.029 5.356.04 8.062-3.041-.097-6.082-.186-9.122-.268l.068 13.84c2.193.12 4.384.246 6.571.38l.043 8.58c-2.19-.173-4.375-.338-6.557-.496l.071 14.487c3.041.304 6.082.632 9.123.984.011 2.706.023 5.411.037 8.116a534.635 534.635 0 0 0-16.249-1.913c-.083-17.338-.166-34.434-.248-51.772ZM206.615 113.325a7277.462 7277.462 0 0 0-3.765-23.977l-1.902-.183.103 23.268a541.172 541.172 0 0 0-7.079-1.049l-.256-54.224h7.092c8.47.091 12.099 5.927 12.136 16.737.02 5.664-1.209 10.679-3.886 12.56a5832.425 5832.425 0 0 1 4.613 28.088c-2.349-.423-4.701-.83-7.056-1.22Zm-5.701-31.666c.983.074 2.295.029 3.341-.949 1.046-.978 1.887-2.968 1.87-6.927-.017-3.96-.875-6.13-1.93-7.23-1.055-1.1-2.369-1.223-3.352-1.257.022 5.454.046 10.909.071 16.363ZM235.852 106.472c-.063 2.483-.453 4.652-1.166 6.414a8.431 8.431 0 0 1-2.791 3.871c-1.297 1.041-3.047 1.392-5.39.904-2.344-.487-4.165-1.571-5.471-3.087a13.761 13.761 0 0 1-2.748-4.764 20.254 20.254 0 0 1-1.195-6.474c-.034-11.32-.065-22.928-.099-34.246.02-2.104.413-4.187 1.16-6.154.587-1.554 1.425-3.105 2.745-4.276 1.32-1.172 3.136-1.928 5.508-1.885 2.372.043 4.136.89 5.448 2.155a11.892 11.892 0 0 1 2.822 4.627 20.751 20.751 0 0 1 1.177 6.617v36.298Zm-7.067-36.72c0-1.625-.265-2.78-.923-3.783a1.943 1.943 0 0 0-1.443-.713c-1.246-.054-1.833 1.043-2.092 2.073a7.256 7.256 0 0 0-.26 2.149c.023 11.56.049 23.41.071 34.97 0 1.682.331 2.851.984 3.854a2.127 2.127 0 0 0 1.368.89c1.238.225 1.822-.639 2.081-1.814a6.486 6.486 0 0 0 .257-2.146l-.043-35.48ZM234.11 59.717V59.7a2.917 2.917 0 0 1 5.83-.017v.017a2.917 2.917 0 0 1-5.83.017Zm5.291-.017a2.386 2.386 0 0 0-.666-1.734 2.366 2.366 0 0 0-1.71-.726 2.38 2.38 0 0 0-2.376 2.46v.014a2.367 2.367 0 0 0 .672 1.732 2.371 2.371 0 0 0 2.64.529 2.38 2.38 0 0 0 1.44-2.275Zm-3.483-1.508h1.263a1.21 1.21 0 0 1 .883.31.85.85 0 0 1 .237.625v.014a.89.89 0 0 1-.616.887l.699 1.023h-.736l-.61-.92h-.496v.92h-.633l.009-2.859Zm1.263 1.388c.319 0 .49-.17.49-.41v-.014c0-.285-.191-.417-.505-.417h-.615v.841h.63Z"/></g><defs><clipPath id="a987z"><path fill="#fff" d="M0 0h240v118H0z"/></clipPath></defs></svg>
        `;

        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.id = 'squarehero-progress-container';

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.id = 'squarehero-progress-bar';
        progressContainer.appendChild(progressBar);

        // Status text
        const statusText = document.createElement('div');
        statusText.id = 'squarehero-status-text';
        statusText.textContent = 'Installing SquareHero Dashboard';

        console.log("Overlay element created with ID:", overlay.id);
        console.log("Appending overlay to document body...");
        document.body.appendChild(overlay);
        console.log("Overlay appended. Is overlay in DOM?", document.getElementById('squarehero-install-overlay') !== null);
        console.log("Overlay z-index:", getComputedStyle(overlay).zIndex);
        console.log("Overlay visibility:", getComputedStyle(overlay).visibility);
        console.log("Overlay display:", getComputedStyle(overlay).display);
        console.log("Overlay opacity:", getComputedStyle(overlay).opacity);

        // Funny message container
        const funnyMessageContainer = document.createElement('div');
        funnyMessageContainer.id = 'squarehero-funny-message';
        funnyMessageContainer.textContent = getRandomFunnyMessage();

        // Build overlay
        overlay.appendChild(gradientCircle1);
        overlay.appendChild(gradientCircle2);
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