(()=>{"use strict";var __webpack_modules__={"./help-docs.css":
/*!***********************!*\
  !*** ./help-docs.css ***!
  \***********************/(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://squarehero-plugin-dashboard/./help-docs.css?")},"./scss/dashboard.scss":
/*!*****************************!*\
  !*** ./scss/dashboard.scss ***!
  \*****************************/(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://squarehero-plugin-dashboard/./scss/dashboard.scss?")},"./src/injector.js":
/*!*************************!*\
  !*** ./src/injector.js ***!
  \*************************/(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scss_dashboard_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/dashboard.scss */ "./scss/dashboard.scss");\n/* harmony import */ var _help_docs_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../help-docs.css */ "./help-docs.css");\n/**\n * SquareHero Dashboard Injector\n * This file is responsible for injecting the SquareHero dashboard into a target div\n * on a Squarespace page with ID \'squarehero-dashboard-container\'\n */\n\n// Import main SCSS file (this will be processed by webpack)\n\n\n\n// Create a self-executing function to avoid polluting the global namespace\n(function() {\n  // Get the base URL from the current script\n  const getBaseUrl = () => {\n    // When served from CDN, the path will be like:\n    // https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/squarehero-dashboard-bundle.js\n    const scripts = document.getElementsByTagName(\'script\');\n    const currentScript = scripts[scripts.length - 1];\n    const scriptSrc = currentScript.src;\n    \n    // Extract the base path from the script URL (everything up to the last /)\n    const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf(\'/\') + 1);\n    console.log(\'SquareHero Dashboard: Using base URL:\', baseUrl);\n    return baseUrl;\n  };\n  \n  // Store the base URL for use throughout the injector\n  const BASE_URL = getBaseUrl();\n  \n  // Cache busting function - adds timestamp to URL to prevent caching\n  const addCacheBuster = (url) => {\n    // Always add cache busting during development\n    // This includes localhost, Squarespace admin/preview environments\n    const timestamp = new Date().getTime();\n    const separator = url.includes(\'?\') ? \'&\' : \'?\';\n    return `${url}${separator}_cb=${timestamp}`;\n  };\n  \n  // Check if we\'re in a development environment\n  const isLocalDevelopment = window.location.hostname === \'localhost\' || \n                            window.location.hostname === \'127.0.0.1\' || \n                            window.location.protocol === \'file:\';\n                            \n  // Track whether styles have been loaded\n  let stylesLoaded = false;\n  \n  // Function to load external CSS file\n  function loadExternalCSS(url) {\n    return new Promise((resolve) => {\n      const link = document.createElement(\'link\');\n      link.rel = \'stylesheet\';\n      link.href = url;\n      \n      // Set up onload handler\n      link.onload = function() {\n        console.log(\'SquareHero Dashboard: CSS loaded:\', url);\n        stylesLoaded = true;\n        resolve(true);\n      };\n      \n      // Set up error handler\n      link.onerror = function() {\n        console.error(\'SquareHero Dashboard: Failed to load CSS:\', url);\n        resolve(false);\n      };\n      \n      document.head.appendChild(link);\n      \n      // Fallback resolve in case onload doesn\'t fire\n      setTimeout(() => {\n        if (!stylesLoaded) {\n          console.warn(\'SquareHero Dashboard: CSS load timeout, continuing anyway\');\n          resolve(true);\n        }\n      }, 3000);\n    });\n  }\n  \n  // Load all required CSS first, before any HTML is injected\n  async function loadAllStyles() {\n    console.log(\'SquareHero Dashboard: Loading CSS files...\');\n    \n    // Add a specific style to ensure login UI and dashboard are visible on Squarespace\n    const inlineStyle = document.createElement(\'style\');\n    inlineStyle.textContent = `\n      #squarehero-dashboard-container {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100vw;\n        height: 100vh;\n        display: block;\n        z-index: 999999;\n      }\n      \n      .sh-login-wrapper {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100vw;\n        height: 100vh;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        background-color: #011E45;\n        z-index: 999999;\n      }\n      \n      /* Shared styles for login components */\n      .sh-login-container {\n        background: rgba(255, 255, 255, 0.1);\n        backdrop-filter: blur(10px);\n        -webkit-backdrop-filter: blur(10px);\n        border-radius: 4px;\n        padding: 40px;\n        width: 100%;\n        max-width: 400px;\n        position: relative;\n        z-index: 1;\n        border: 1px solid rgba(255, 255, 255, 0.1);\n      }\n      \n      .sh-login-header {\n        text-align: center;\n        margin-bottom: 30px;\n      }\n      \n      .sh-login-header h1 {\n        font-family: "Red Hat Display", sans-serif;\n        color: white;\n        margin: 20px 0 10px;\n        font-size: 24px;\n      }\n      \n      .sh-login-form {\n        display: flex;\n        flex-direction: column;\n        gap: 20px;\n      }\n      \n      .sh-login-input {\n        background: rgba(255, 255, 255, 0.05);\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        padding: 12px 16px;\n        border-radius: 2px;\n        color: white;\n        font-size: 16px;\n      }\n      \n      .sh-login-button {\n        border: none;\n        background: none;\n        padding: 20px;\n        border-radius: 8px;\n        color: white;\n        font-weight: 600;\n        cursor: pointer;\n        position: relative;\n        font-family: "Roboto Condensed", sans-serif;\n        font-size: 16px;\n        font-weight: 700;\n        text-transform: uppercase;\n      }\n      \n      .sh-login-button:before {\n        content: "";\n        position: absolute;\n        inset: 0;\n        padding: 2px;\n        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n        -webkit-mask-composite: xor;\n        mask-composite: exclude;\n        background: linear-gradient(90deg, #00D1FF 0%, #FF00E6 33.33%, #FF003D 66.66%, #00D1FF 100%);\n        background-size: 200% 100%;\n      }\n      \n      .alert {\n        position: fixed;\n        bottom: 20px;\n        left: 50%;\n        transform: translateX(-50%) translateY(100%);\n        background-color: #1d1f22;\n        color: white;\n        padding: 16px 24px;\n        border-radius: 4px;\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        z-index: 2000;\n        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n        transition: transform 0.3s ease;\n        min-width: 300px;\n      }\n      \n      .alert.visible {\n        transform: translateX(-50%) translateY(0);\n      }\n    `;\n    document.head.appendChild(inlineStyle);\n    \n    // Load the main bundled CSS\n    await loadExternalCSS(addCacheBuster(`${BASE_URL}squarehero-dashboard-styles.css`));\n    \n    console.log(\'SquareHero Dashboard: All CSS loaded\');\n    return true;\n  }\n  \n  // Create login UI\n  async function createLoginUI() {\n    console.log(\'SquareHero Dashboard: Creating login UI...\');\n    \n    let container = document.getElementById(\'squarehero-dashboard-container\');\n    \n    if (!container) {\n      console.log(\'SquareHero Dashboard: Creating container element for login UI\');\n      container = document.createElement(\'div\');\n      container.id = \'squarehero-dashboard-container\';\n      document.body.appendChild(container);\n    }\n\n    // Clear any existing content\n    container.innerHTML = \'\';\n    \n    // Create the login UI based on login.html structure\n    const loginHTML = `\n      <div class="sh-login-wrapper">\n        \x3c!-- Gradient Circle 1 --\x3e\n        <div class="gradient-circle-1">\n          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 639 701" fill="none">\n            <g filter="url(#a)" opacity=".4">\n              <circle cx="288.5" cy="350.5" r="256.5" fill="url(#b)" fill-opacity=".7"></circle>\n            </g>\n            <defs>\n              <linearGradient id="b" x1="288.5" x2="288.5" y1="94" y2="607" gradientUnits="userSpaceOnUse">\n                <stop stop-color="#00D1FF"></stop>\n                <stop offset=".45" stop-color="#A603F3"></stop>\n                <stop offset=".975" stop-color="#FF00E6"></stop>\n              </linearGradient>\n              <filter id="a" width="701" height="701" x="-62" y="0" color-interpolation-filters="sRGB"\n                filterUnits="userSpaceOnUse">\n                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>\n                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>\n                <feGaussianBlur result="effect1_foregroundBlur_200_26237" stdDeviation="47"></feGaussianBlur>\n              </filter>\n            </defs>\n          </svg>\n        </div>\n\n        \x3c!-- Gradient Circle 2 --\x3e\n        <div class="gradient-circle-2">\n          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 639 701" fill="none">\n            <g filter="url(#a)" opacity=".4">\n              <circle cx="288.5" cy="350.5" r="256.5" fill="url(#b)" fill-opacity=".7"></circle>\n            </g>\n            <defs>\n              <linearGradient id="b" x1="288.5" x2="288.5" y1="94" y2="607" gradientUnits="userSpaceOnUse">\n                <stop stop-color="#00D1FF"></stop>\n                <stop offset=".45" stop-color="#A603F3"></stop>\n                <stop offset=".975" stop-color="#FF00E6"></stop>\n              </linearGradient>\n              <filter id="a" width="701" height="701" x="-62" y="0" color-interpolation-filters="sRGB"\n                filterUnits="userSpaceOnUse">\n                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>\n                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>\n                <feGaussianBlur result="effect1_foregroundBlur_200_26237" stdDeviation="47"></feGaussianBlur>\n              </filter>\n            </defs>\n          </svg>\n        </div>\n\n        <div class="sh-login-container">\n          <div class="sh-login-header">\n            <img src="${BASE_URL}/assets/sh-logo.png" alt="SquareHero Logo" width="180">\n            <h1>Dashboard Login</h1>\n          </div>\n          <form class="sh-login-form" id="loginForm">\n            <input type="email" class="sh-login-input" name="email" placeholder="Enter email" required>\n            <input type="password" class="sh-login-input" name="password" placeholder="Enter password" required>\n            <button type="submit" class="sh-login-button">Login to Dashboard</button>\n            <a href="#" class="sh-forgot-password" id="forgotPassword">Forgot Password?</a>\n          </form>\n        </div>\n      </div>\n\n      \x3c!-- Alert Container --\x3e\n      <div class="alert" id="alert">\n        <div class="alert-message">\n          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\n            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>\n            <path class="alert-icon-success" d="M8 12l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"/>\n            <path class="alert-icon-error" d="M12 8v5m0 2v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display: none;"/>\n          </svg>\n          <span class="alert-text"></span>\n        </div>\n        <div class="alert-actions">\n          <button type="button" class="alert-close">Close</button>\n        </div>\n      </div>\n    `;\n    \n    container.innerHTML = loginHTML;\n    \n    // Log to help with debugging\n    console.log(\'SquareHero Dashboard: Login UI created\', container);\n    \n    // Initialize Firebase authentication\n    initializeLoginFunctionality();\n  }\n  \n  // Initialize login functionality\n  function initializeLoginFunctionality() {\n    // Create a module script for Firebase initialization\n    const script = document.createElement(\'script\');\n    script.type = "module";\n    \n    // Use ES module imports\n    script.textContent = `\n      // Import Firebase modules\n      import { initializeApp } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js\';\n      import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js\';\n      \n      // Firebase configuration\n      const firebaseConfig = {\n        apiKey: "AIzaSyBEmTwE1DWjj4rGEV6UDGIhxVy4oZ5lqNg",\n        authDomain: "my-squarehero-hub.firebaseapp.com",\n        databaseURL: "https://my-squarehero-hub-default-rtdb.firebaseio.com",\n        projectId: "my-squarehero-hub",\n        storageBucket: "my-squarehero-hub.firebasestorage.app",\n        messagingSenderId: "233555790724",\n        appId: "1:233555790724:web:062d5a4b5d38f7445b2bd1",\n        measurementId: "G-YEMQV45TPL"\n      };\n      \n      // Initialize Firebase\n      const app = initializeApp(firebaseConfig);\n      const auth = getAuth(app);\n      \n      console.log(\'Firebase initialized for login\');\n      \n      // Make auth accessible to other functions\n      window.firebaseAuth = auth;\n      \n      // Set up alert functionality\n      const alertEl = document.getElementById(\'alert\');\n      const alertText = alertEl.querySelector(\'.alert-text\');\n      const alertIconSuccess = alertEl.querySelector(\'.alert-icon-success\');\n      const alertIconError = alertEl.querySelector(\'.alert-icon-error\');\n      let alertTimeout;\n\n      function showAlert(message, type = \'error\') {\n        console.log(\'Showing alert:\', message, type);\n        \n        // Clear any existing timeout\n        if (alertTimeout) {\n          clearTimeout(alertTimeout);\n        }\n\n        // Update alert content\n        alertText.textContent = message;\n        alertEl.className = \\`alert visible \\${type}\\`;\n\n        // Show/hide appropriate icon\n        alertIconSuccess.style.display = type === \'success\' ? \'block\' : \'none\';\n        alertIconError.style.display = type === \'error\' ? \'block\' : \'none\';\n\n        // Auto-hide after 5 seconds\n        alertTimeout = setTimeout(() => {\n          hideAlert();\n        }, 5000);\n      }\n\n      function hideAlert() {\n        alertEl.classList.remove(\'visible\');\n      }\n\n      // Add event listener to close button\n      const closeButton = alertEl.querySelector(\'.alert-close\');\n      if (closeButton) {\n        closeButton.addEventListener(\'click\', hideAlert);\n      } else {\n        console.warn(\'Alert close button not found\');\n      }\n\n      // Handle login form submission\n      const loginForm = document.getElementById(\'loginForm\');\n      if (loginForm) {\n        console.log(\'Login form found, adding event listener\');\n        \n        loginForm.addEventListener(\'submit\', async (e) => {\n          e.preventDefault();\n          console.log(\'Login form submitted\');\n          \n          const email = e.target.email.value;\n          const password = e.target.password.value;\n          \n          console.log(\'Attempting login with:\', email);\n\n          try {\n            // Sign in with Firebase\n            const userCredential = await signInWithEmailAndPassword(auth, email, password);\n            const user = userCredential.user;\n            \n            console.log(\'Login successful for user:\', user.email);\n            showAlert(\'Login successful!\', \'success\');\n            \n            // Store auth info in session storage to persist across page reloads\n            sessionStorage.setItem(\'squarehero_user_email\', email);\n            \n            // Set the user in SecureFirebaseAuth if available\n            if (window.SecureFirebaseAuth) {\n              window.SecureFirebaseAuth.setCurrentUser(user);\n            }\n            \n            // Switch to dashboard UI after successful login\n            setTimeout(() => {\n              console.log(\'Switching to dashboard after successful login\');\n              injectDashboard();\n            }, 1000);\n          } catch (error) {\n            console.error(\'Login error:\', error.code, error.message);\n            \n            let errorMessage = \'Login failed. Please check your credentials.\';\n            if (error.code === \'auth/user-not-found\') {\n              errorMessage = \'No account found with this email address.\';\n            } else if (error.code === \'auth/wrong-password\') {\n              errorMessage = \'Incorrect password.\';\n            } else if (error.code === \'auth/invalid-credential\') {\n              errorMessage = \'Invalid credentials. Please check your email and password.\';\n            }\n            \n            showAlert(errorMessage, \'error\');\n          }\n        });\n      } else {\n        console.error(\'Login form not found\');\n      }\n\n      // Handle forgot password link\n      const forgotPasswordLink = document.getElementById(\'forgotPassword\');\n      if (forgotPasswordLink) {\n        console.log(\'Forgot password link found, adding event listener\');\n        \n        forgotPasswordLink.addEventListener(\'click\', async (e) => {\n          e.preventDefault();\n          const emailInput = document.querySelector(\'input[name="email"]\');\n          const email = emailInput.value;\n\n          if (!email) {\n            showAlert(\'Please enter your email address first\', \'error\');\n            emailInput.focus();\n            return;\n          }\n\n          try {\n            await sendPasswordResetEmail(auth, email);\n            showAlert(\'Password reset email sent! Please check your inbox.\', \'success\');\n          } catch (error) {\n            console.error(\'Password reset error:\', error.code, error.message);\n            \n            let errorMessage = \'Failed to send password reset email.\';\n            if (error.code === \'auth/user-not-found\') {\n              errorMessage = \'No account found with this email address.\';\n            }\n            \n            showAlert(errorMessage, \'error\');\n          }\n        });\n      } else {\n        console.error(\'Forgot password link not found\');\n      }\n    `;\n    \n    // Add the script to the document\n    document.head.appendChild(script);\n    console.log(\'Login functionality initialized\');\n  }\n  \n  // Function to check authentication status\n  function checkAuthentication() {\n    return new Promise((resolve) => {\n      console.log(\'SquareHero Dashboard: Checking authentication...\');\n      \n      // Create and execute a module script to check auth\n      const script = document.createElement(\'script\');\n      script.type = "module";\n      script.textContent = `\n        // Import Firebase auth modules\n        import { initializeApp } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js\';\n        import { getAuth, onAuthStateChanged } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js\';\n        \n        // Firebase configuration\n        const firebaseConfig = {\n          apiKey: "AIzaSyBEmTwE1DWjj4rGEV6UDGIhxVy4oZ5lqNg",\n          authDomain: "my-squarehero-hub.firebaseapp.com",\n          databaseURL: "https://my-squarehero-hub-default-rtdb.firebaseio.com",\n          projectId: "my-squarehero-hub",\n          storageBucket: "my-squarehero-hub.firebasestorage.app",\n          messagingSenderId: "233555790724",\n          appId: "1:233555790724:web:062d5a4b5d38f7445b2bd1",\n          measurementId: "G-YEMQV45TPL"\n        };\n        \n        try {\n          // Initialize Firebase\n          const app = initializeApp(firebaseConfig);\n          const auth = getAuth(app);\n          \n          console.log(\'SquareHero Dashboard: Auth check - Firebase initialized\');\n          \n          let authStateReceived = false;\n          \n          // Check auth state\n          onAuthStateChanged(auth, (user) => {\n            authStateReceived = true;\n            if (user) {\n              console.log(\'SquareHero Dashboard: User is authenticated:\', user.email);\n              window.authCheckResult(true);\n            } else {\n              console.log(\'SquareHero Dashboard: User is not authenticated\');\n              window.authCheckResult(false);\n            }\n          });\n          \n          // If no auth state change within 2 seconds, assume not authenticated\n          // This is a fallback in case onAuthStateChanged doesn\'t fire immediately\n          setTimeout(() => {\n            if (!authStateReceived) {\n              console.log(\'SquareHero Dashboard: Auth state check timed out, assuming not authenticated\');\n              window.authCheckResult(false);\n            }\n          }, 2000);\n        } catch (error) {\n          console.error(\'SquareHero Dashboard: Error checking authentication:\', error);\n          window.authCheckResult(false);\n        }\n      `;\n      \n      // Set up callback function for the auth check script\n      window.authCheckResult = function(isAuthenticated) {\n        console.log(\'SquareHero Dashboard: Auth check result:\', isAuthenticated);\n        resolve(isAuthenticated);\n        // Don\'t delete the function as it might be needed again\n      };\n      \n      // Add the script to the document\n      document.head.appendChild(script);\n      \n      // Set a global fallback timeout in case the script completely fails\n      setTimeout(() => {\n        console.warn(\'SquareHero Dashboard: Auth check global timeout reached, forcing login screen\');\n        resolve(false); // Force showing login screen if everything fails\n      }, 5000);\n    });\n  }\n  \n  // Add Squarespace theme color variables to the root\n  function addSquarespaceThemeColors() {\n    const cssVars = `\n      <style>\n        :root {\n          /* White */\n          --white-hsl: 0, 0%, 100%;\n\n          /* Light cream */\n          --lightAccent-hsl: 36, 100%, 97%;\n\n          /* Gold */\n          --accent-hsl: 36, 57%, 58%;\n\n          /* Olive green */\n          --darkAccent-hsl: 82, 23%, 41%;\n\n          /* Dark green */\n          --black-hsl: 94, 26%, 21%;\n        }\n      </style>\n    `;\n    \n    document.head.insertAdjacentHTML(\'beforeend\', cssVars);\n  }\n  \n  // Initialize when DOM is ready with revised flow:\n  // 1. Load CSS first\n  // 2. Check authentication\n  // 3. Show appropriate UI (login or dashboard)\n  async function init() {\n    console.log(\'SquareHero Dashboard: Initializing...\');\n    \n    // Add Squarespace theme colors\n    addSquarespaceThemeColors();\n    \n    // Load CSS files first to ensure proper styling from the start\n    await loadAllStyles();\n    \n    // After CSS is loaded, check authentication and display appropriate UI\n    const isAuthenticated = await checkAuthentication();\n    \n    if (isAuthenticated) {\n      console.log(\'SquareHero Dashboard: User is authenticated, showing dashboard\');\n      injectDashboard();\n    } else {\n      console.log(\'SquareHero Dashboard: User is not authenticated, showing login screen\');\n      createLoginUI();\n    }\n  }\n  \n  if (document.readyState === \'loading\') {\n    document.addEventListener(\'DOMContentLoaded\', init);\n  } else {\n    init();\n  }\n  \n  // Function to inject dashboard\n  function injectDashboard() {\n    console.log(\'SquareHero Dashboard: Injecting dashboard UI...\');\n    \n    // First, add the dashboard container if it doesn\'t exist\n    let container = document.getElementById(\'squarehero-dashboard-container\');\n    \n    if (!container) {\n      console.log(\'SquareHero Dashboard: Creating container element\');\n      container = document.createElement(\'div\');\n      container.id = \'squarehero-dashboard-container\';\n      document.body.appendChild(container);\n    }\n    \n    // Clear any existing content (like login UI)\n    container.innerHTML = \'\';\n    \n    // Create dashboard wrapper and inject the HTML structure\n    const dashboardWrapper = document.createElement(\'div\');\n    dashboardWrapper.className = \'squarehero-dashboard-wrapper\';\n    \n    // Start building the HTML structure\n    let dashboardHTML = \'\';\n    \n    // Only include the admin placeholder in local development\n    if (isLocalDevelopment) {\n      dashboardHTML += `\n        <div class="sqs-admin-placeholder">\n          <img src="${addCacheBuster(`${BASE_URL}assets/sqs-placeholder.jpg`)}" alt="Squarespace Admin">\n        </div>\n      `;\n      console.log(\'SquareHero Dashboard: Including admin placeholder for local development\');\n    }\n    \n    // Add the main dashboard structure\n    dashboardHTML += `\n      <div class="dashboard-wrapper" data-wizard-enabled="false">\n        <header class="dashboard-header">\n          <img src="${addCacheBuster(`${BASE_URL}assets/sh-logo.png`)}" alt="SquareHero Logo" class="logo">\n          <div class="title-section">\n            <h1 class="dashboard-title">SquareHero Hub</h1>\n          </div>\n          <div class="header-buttons">\n            <button class="support-button">SquareHero Support</button>\n          </div>\n        </header>\n\n        <div class="dashboard-tabs">\n          <button class="dashboard-tab active" data-tab="plugins">Your Plugins</button>\n          <button class="dashboard-tab" data-tab="discover-plugins">Discover Plugins</button>\n          <button class="dashboard-tab" data-tab="settings">Settings</button>\n        </div>\n\n        <main class="dashboard-container">\n          <section class="plugins-column dashboard-tab-content active" id="plugins-tab">\n            <div class="column-header">\n              <h2 class="column-title">Manage your plugins</h2>\n              <p class="column-description">Your plugins are shown below. Click any plugin to adjust settings or view documentation.</p>\n            </div>\n\n            <div id="plugin-cards-container">\n              <div class="loading-indicator">\n              </div>\n            </div>\n          </section>\n\n          <section class="whats-new-column dashboard-tab-content" id="news-tab">\n            <div class="column-header">\n              <h2 class="column-title">What\'s new</h2>\n              <p class="column-description">Stay updated on the latest announcements, feature releases, and important plugin updates from the SquareHero team.</p>\n            </div>\n\n            <div id="news-items-container">\n              <div class="loading-indicator">\n                <p>Loading updates...</p>\n              </div>\n            </div>\n          </section>\n\n          <section class="discover-plugins-column dashboard-tab-content" id="discover-plugins-tab">\n            <div class="column-header">\n              <h2 class="column-title">Explore plugins with our no-risk trial</h2>\n              <p class="column-description">Simple setup, instant results - just one click. No code, no downloads, no emails, no commitment.</p>\n            </div>\n            <div id="discover-plugins-content">\n            </div>\n          </section>\n\n          <section class="help-column dashboard-tab-content" id="settings-tab">\n            <div class="column-header">\n              <h2 class="column-title">Settings</h2>\n              <p class="column-description">General settings for this dashboard.</p>\n            </div>\n            <div id="help-content">\n              <p>Settings content will go here.</p>\n              <button class="logout-button" id="logout-button">Logout</button>\n            </div>\n          </section>\n        </main>\n\n        <div class="settings-panel" id="settings-panel">\n          <div class="panel-header">\n            <h2 class="panel-title" id="plugin-settings-title">Plugin Settings</h2>\n            <button class="close-button" id="close-panel">&times;</button>\n          </div>\n          <div class="panel-content" id="panel-content">\n          </div>\n        </div>\n\n        <div class="overlay" id="overlay"></div>\n      </div>\n    `;\n    \n    // Set the innerHTML of the dashboard wrapper\n    dashboardWrapper.innerHTML = dashboardHTML;\n    \n    // Append the dashboard to the container\n    container.appendChild(dashboardWrapper);\n    \n    // Load all scripts\n    loadScripts();\n  }\n  \n  // Function to load a script with callback\n  function loadScript(url, callback, isModule = false) {\n    const script = document.createElement(\'script\');\n    script.src = url;\n    if (isModule) {\n      script.type = "module";\n    }\n    script.onload = callback;\n    script.onerror = function() {\n      console.error(`Failed to load script: ${url}`);\n    };\n    document.head.appendChild(script);\n  }\n  \n  // Function to load Firebase modules\n  function loadFirebase() {\n    return new Promise((resolve) => {\n      // Load Firebase scripts using ES modules for v11.5.0\n      const firebaseScripts = [\n        { src: \'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js\', isModule: true },\n        { src: \'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js\', isModule: true },\n        { src: \'https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js\', isModule: true },\n        { src: \'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js\', isModule: true }\n      ];\n      \n      let scriptsLoaded = 0;\n      const totalScripts = firebaseScripts.length;\n      \n      // Create a module script to initialize Firebase\n      const initScript = document.createElement(\'script\');\n      initScript.type = \'module\';\n      initScript.textContent = `\n        // Import Firebase modules\n        import { initializeApp } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js\';\n        import { getAuth, onAuthStateChanged } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js\';\n        import { getFirestore } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js\';\n        import { getDatabase } from \'https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js\';\n        \n        // Firebase configuration\n        const firebaseConfig = {\n          apiKey: "AIzaSyBEmTwE1DWjj4rGEV6UDGIhxVy4oZ5lqNg",\n          authDomain: "my-squarehero-hub.firebaseapp.com",\n          databaseURL: "https://my-squarehero-hub-default-rtdb.firebaseio.com",\n          projectId: "my-squarehero-hub",\n          storageBucket: "my-squarehero-hub.firebasestorage.app",\n          messagingSenderId: "233555790724",\n          appId: "1:233555790724:web:062d5a4b5d38f7445b2bd1",\n          measurementId: "G-YEMQV45TPL"\n        };\n\n        // Initialize Firebase\n        const app = initializeApp(firebaseConfig);\n        const auth = getAuth(app);\n        const firestore = getFirestore(app);\n        const database = getDatabase(app);\n        \n        // Expose Firebase instances to window for other scripts to use\n        window.firebaseApp = app;\n        window.firebaseAuth = auth;\n        window.firebaseFirestore = firestore;\n        window.firebaseDatabase = database;\n        \n        // Check auth state\n        onAuthStateChanged(auth, (user) => {\n          if (user) {\n            console.log(\'User is authenticated:\', user.email);\n            if (window.SecureFirebaseAuth) {\n              window.SecureFirebaseAuth.setCurrentUser(user);\n            }\n          } else {\n            console.log(\'User is not authenticated\');\n          }\n        });\n        \n        console.log(\'Firebase initialized successfully with module approach\');\n        \n        // Signal that Firebase is ready\n        window.dispatchEvent(new Event(\'firebase-ready\'));\n      `;\n      \n      // Add the initialization script\n      document.head.appendChild(initScript);\n      \n      // Listen for the initialization event\n      window.addEventListener(\'firebase-ready\', () => {\n        console.log(\'Firebase modules loaded and initialized successfully\');\n        resolve();\n      });\n      \n      // Fallback if initialization takes too long\n      setTimeout(() => {\n        console.warn(\'Firebase initialization timed out\');\n        resolve();\n      }, 10000);\n    });\n  }\n  \n  // Function to load all necessary scripts for the dashboard\n  function loadScripts() {\n    const scripts = [\n      { src: `${BASE_URL}auth.js` },\n      { src: `${BASE_URL}component-system.js` },\n      { src: `${BASE_URL}settings-components.js` },\n      { src: `${BASE_URL}wizard-component.js` },\n      { src: `${BASE_URL}licensing.js` },\n      { src: `${BASE_URL}skeleton-loader.js` },\n      { src: `${BASE_URL}firebase-docs-integration.js` },\n      { src: `${BASE_URL}help-docs-loader.js` },\n      { src: `${BASE_URL}dashboard.js` }\n    ];\n    \n    // Make sure Firebase is loaded with compat version first\n    loadFirebase().then(() => {\n      // Then load our scripts sequentially\n      loadScriptSequentially(scripts, 0);\n    }).catch(error => {\n      console.error(\'Error loading Firebase:\', error);\n      // Try to continue with other scripts even if Firebase failed\n      loadScriptSequentially(scripts, 0);\n    });\n  }\n  \n  // Helper function to load scripts sequentially\n  function loadScriptSequentially(scripts, index) {\n    if (index >= scripts.length) {\n      console.log(\'SquareHero Dashboard: All scripts loaded\');\n      // Initialize the dashboard\n      if (window.Dashboard && typeof window.Dashboard.init === \'function\') {\n        setTimeout(() => {\n          console.log(\'Initializing Dashboard\');\n          window.Dashboard.init();\n        }, 100);\n      } else {\n        console.error(\'SquareHero Dashboard: Dashboard object not found or init method not available\');\n      }\n      return;\n    }\n    \n    const script = document.createElement(\'script\');\n    // Add cache buster to script URLs\n    script.src = addCacheBuster(scripts[index].src);\n    \n    script.onload = function() {\n      console.log(`SquareHero Dashboard: Loaded ${scripts[index].src}`);\n      loadScriptSequentially(scripts, index + 1);\n    };\n    \n    script.onerror = function() {\n      console.error(`SquareHero Dashboard: Failed to load ${scripts[index].src}`);\n      // Continue with next script even if one fails\n      loadScriptSequentially(scripts, index + 1);\n    };\n    \n    document.head.appendChild(script);\n  }\n})();\n\n//# sourceURL=webpack://squarehero-plugin-dashboard/./src/injector.js?')}},__webpack_module_cache__={};function __webpack_require__(e){var n=__webpack_module_cache__[e];if(void 0!==n)return n.exports;var t=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](t,t.exports,__webpack_require__),t.exports}__webpack_require__.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./src/injector.js")})();