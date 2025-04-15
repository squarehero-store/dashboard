(()=>{"use strict";!function(){const e=(()=>{const e=document.getElementsByTagName("script"),n=e[e.length-1].src,t=n.substring(0,n.lastIndexOf("/")+1);return console.log("SquareHero Dashboard: Using base URL:",t),t})();function n(){let n=document.getElementById("squarehero-dashboard-container");n||(console.log("SquareHero Dashboard: Creating container element"),n=document.createElement("div"),n.id="squarehero-dashboard-container",document.body.appendChild(n));const s=document.createElement("div");s.className="squarehero-dashboard-wrapper";let a="";("localhost"===window.location.hostname||"127.0.0.1"===window.location.hostname||"file:"===window.location.protocol)&&(a+=`\n        <div class="sqs-admin-placeholder">\n          <img src="${e}assets/sqs-placeholder.jpg" alt="Squarespace Admin">\n        </div>\n      `,console.log("SquareHero Dashboard: Including admin placeholder for local development")),a+=`\n      <div class="dashboard-wrapper" data-wizard-enabled="false">\n        <header class="dashboard-header">\n          <img src="${e}assets/sh-logo.png" alt="SquareHero Logo" class="logo">\n          <div class="title-section">\n            <h1 class="dashboard-title">SquareHero Hub</h1>\n          </div>\n          <div class="header-buttons">\n            <button class="support-button">SquareHero Support</button>\n          </div>\n        </header>\n\n        <div class="dashboard-tabs">\n          <button class="dashboard-tab active" data-tab="plugins">Your Plugins</button>\n          <button class="dashboard-tab" data-tab="discover-plugins">Discover Plugins</button>\n          <button class="dashboard-tab" data-tab="settings">Settings</button>\n        </div>\n\n        <main class="dashboard-container">\n          <section class="plugins-column dashboard-tab-content active" id="plugins-tab">\n            <div class="column-header">\n              <h2 class="column-title">Manage your plugins</h2>\n              <p class="column-description">Your plugins are shown below. Click any plugin to adjust settings or view documentation.</p>\n            </div>\n\n            <div id="plugin-cards-container">\n              <div class="loading-indicator">\n              </div>\n            </div>\n          </section>\n\n          <section class="whats-new-column dashboard-tab-content" id="news-tab">\n            <div class="column-header">\n              <h2 class="column-title">What's new</h2>\n              <p class="column-description">Stay updated on the latest announcements, feature releases, and important plugin updates from the SquareHero team.</p>\n            </div>\n\n            <div id="news-items-container">\n              <div class="loading-indicator">\n                <p>Loading updates...</p>\n              </div>\n            </div>\n          </section>\n\n          <section class="discover-plugins-column dashboard-tab-content" id="discover-plugins-tab">\n            <div class="column-header">\n              <h2 class="column-title">Explore plugins with our no-risk trial</h2>\n              <p class="column-description">Simple setup, instant results - just one click. No code, no downloads, no emails, no commitment.</p>\n            </div>\n            <div id="discover-plugins-content">\n            </div>\n          </section>\n\n          <section class="help-column dashboard-tab-content" id="settings-tab">\n            <div class="column-header">\n              <h2 class="column-title">Settings</h2>\n              <p class="column-description">General settings for this dashboard.</p>\n            </div>\n            <div id="help-content">\n              <p>Settings content will go here.</p>\n              <button class="logout-button" id="logout-button">Logout</button>\n            </div>\n          </section>\n        </main>\n\n        <div class="settings-panel" id="settings-panel">\n          <div class="panel-header">\n            <h2 class="panel-title" id="plugin-settings-title">Plugin Settings</h2>\n            <button class="close-button" id="close-panel">&times;</button>\n          </div>\n          <div class="panel-content" id="panel-content">\n          </div>\n        </div>\n\n        <div class="overlay" id="overlay"></div>\n      </div>\n    `,s.innerHTML=a,n.appendChild(s),function(e){const n=document.createElement("link");n.rel="stylesheet",n.href=e,document.head.appendChild(n)}(`${e}squarehero-dashboard-styles.css`),function(){const n=[{src:`${e}auth.js`},{src:`${e}component-system.js`},{src:`${e}settings-components.js`},{src:`${e}wizard-component.js`},{src:`${e}licensing.js`},{src:`${e}skeleton-loader.js`},{src:`${e}firebase-docs-integration.js`},{src:`${e}help-docs-loader.js`},{src:`${e}dashboard.js`}];new Promise((e=>{const n=[{src:"https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js",type:"module"},{src:"https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js",type:"module"},{src:"https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js",type:"module"},{src:"https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js",type:"module"}],t=document.createElement("script");t.type="module",t.textContent='\n        // Import Firebase modules\n        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";\n        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";\n\n        // Firebase configuration\n        const firebaseConfig = {\n          apiKey: "AIzaSyBEmTwE1DWjj4rGEV6UDGIhxVy4oZ5lqNg",\n          authDomain: "my-squarehero-hub.firebaseapp.com",\n          databaseURL: "https://my-squarehero-hub-default-rtdb.firebaseio.com",\n          projectId: "my-squarehero-hub",\n          storageBucket: "my-squarehero-hub.firebasestorage.app",\n          messagingSenderId: "233555790724",\n          appId: "1:233555790724:web:062d5a4b5d38f7445b2bd1",\n          measurementId: "G-YEMQV45TPL"\n        };\n\n        // Initialize Firebase\n        window.firebaseApp = initializeApp(firebaseConfig);\n        window.firebaseAuth = getAuth(window.firebaseApp);\n\n        // Check authentication state\n        onAuthStateChanged(window.firebaseAuth, (user) => {\n          if (!user) {\n            // No user is signed in, redirect to login in production\n            console.log(\'User not authenticated, would redirect to login\');\n            // window.location.href = \'login.html\';\n          } else {\n            console.log(\'User authenticated:\', user.email);\n            // Make sure SecureFirebaseAuth is initialized with the current user\n            if (window.SecureFirebaseAuth) {\n              window.SecureFirebaseAuth.setCurrentUser(user);\n            }\n          }\n        });\n        \n        // Signal that Firebase is loaded\n        window.dispatchEvent(new Event(\'firebase-ready\'));\n      ';let s=0;n.forEach((e=>{const a=document.createElement("script");a.src=e.src,a.type=e.type||"text/javascript",a.onload=()=>{s++,s===n.length&&document.head.appendChild(t)},document.head.appendChild(a)})),window.addEventListener("firebase-ready",(()=>{console.log("Firebase initialized successfully"),e()})),setTimeout((()=>{s===n.length&&(console.log("Firebase initialization timed out, continuing anyway"),e())}),5e3)})).then((()=>{t(n,0)}))}()}function t(e,n){if(n>=e.length)return console.log("SquareHero Dashboard: All scripts loaded"),void(window.Dashboard&&"function"==typeof window.Dashboard.init?setTimeout((()=>{console.log("Initializing Dashboard"),window.Dashboard.init()}),100):console.error("SquareHero Dashboard: Dashboard object not found or init method not available"));const s=document.createElement("script");s.src=e[n].src,s.onload=function(){console.log(`SquareHero Dashboard: Loaded ${e[n].src}`),t(e,n+1)},s.onerror=function(){console.error(`SquareHero Dashboard: Failed to load ${e[n].src}`),t(e,n+1)},document.head.appendChild(s)}function s(){document.head.insertAdjacentHTML("beforeend","\n      <style>\n        :root {\n          /* White */\n          --white-hsl: 0, 0%, 100%;\n\n          /* Light cream */\n          --lightAccent-hsl: 36, 100%, 97%;\n\n          /* Gold */\n          --accent-hsl: 36, 57%, 58%;\n\n          /* Olive green */\n          --darkAccent-hsl: 82, 23%, 41%;\n\n          /* Dark green */\n          --black-hsl: 94, 26%, 21%;\n        }\n      </style>\n    ")}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",(function(){s(),n()})):(s(),n())}()})();