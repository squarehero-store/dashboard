(function() {
  // Wait for Squarespace UI to be fully loaded
  function initWhenReady() {
    if (!window.top || !window.top.document) {
      console.warn("Cannot access top window - possibly due to cross-origin restrictions");
      return;
    }
    
    // Check if toolbar exists
    const toolbar = window.top.document.querySelector('#frame-toolbar-desktop');
    if (!toolbar) {
      // Retry after a short delay if toolbar isn't ready yet
      setTimeout(initWhenReady, 500);
      return;
    }
    
    // Function to navigate in preview frame
    function navigateInPreview(path) {
      // Find the site preview iframe
      const previewFrame = window.top.document.querySelector('iframe#sqs-site-frame');
      
      if (!previewFrame || !previewFrame.contentDocument) {
        console.error('Cannot access preview frame');
        return false;
      }
      
      // Always create a new temporary link for navigation
      // This ensures navigation works every time regardless of state
      const targetLink = previewFrame.contentDocument.createElement('a');
      targetLink.href = path;
      targetLink.style.display = 'none';
      previewFrame.contentDocument.body.appendChild(targetLink);
      
      // Simulate a click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: previewFrame.contentWindow
      });
      
      // Dispatch the click event
      targetLink.dispatchEvent(clickEvent);
      
      // Remove temporary link after a short delay
      setTimeout(() => {
        try {
          if (targetLink.parentNode) {
            targetLink.parentNode.removeChild(targetLink);
          }
        } catch (e) {
          console.warn('Could not remove temporary link:', e);
        }
      }, 100);
      
      return true;
    }

    // Function to replace SquareHero Dashboard sidebar icon
    function replaceSidebarIcon() {
      // Try to access the sidebar in the preview frame
      const previewFrame = window.top.document.querySelector('iframe#sqs-site-frame');
      if (!previewFrame || !previewFrame.contentDocument) {
        console.log("Preview frame not accessible, will retry replacing sidebar icon later");
        setTimeout(replaceSidebarIcon, 1000);
        return;
      }
      
      const sidebarItemList = previewFrame.contentDocument.querySelector('.App-sidebar .rpp-item-list');
      
      if (!sidebarItemList) {
        console.log("Sidebar item list not found, will retry later");
        setTimeout(replaceSidebarIcon, 1000);
        return;
      }
      
      const listItems = sidebarItemList.querySelectorAll('[data-test="grouped-list-item"]');
      
      for (const listItem of listItems) {
        const pTag = listItem.querySelector('p');
        if (pTag && pTag.textContent.trim() === 'SquareHero Dashboard') {
          const existingSvg = listItem.querySelector('svg');
          if (existingSvg) {
            const newSvg = previewFrame.contentDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            newSvg.setAttribute('width', '18');
            newSvg.setAttribute('height', '21');
            newSvg.setAttribute('fill', 'none');
            newSvg.setAttribute('viewBox', '0 0 18 21');
            newSvg.innerHTML = '<g clip-path="url(#a)"><path fill="#001E45" d="M16.71 14.418V5.612L9 1.209 1.29 5.612v8.805L9 18.82l7.71-4.402Z"/><path fill="#87C4CC" d="M16.71 14.418V5.612L9 1.209 1.29 5.612v8.805L9 18.82l7.71-4.402Z"/><path fill="#fff" d="M3.8 4.187a5.97 5.97 0 0 0 2.198 2.175 6.053 6.053 0 0 0 6.004 0 5.97 5.97 0 0 0 2.197-2.175l-5.2-2.978L3.798 4.18l.003.007ZM9 12.88a6.077 6.077 0 0 0-3 .8 5.994 5.994 0 0 0-2.2 2.171L9 18.82l5.199-2.969a5.995 5.995 0 0 0-2.2-2.171 6.077 6.077 0 0 0-3-.8Z"/><path fill="#0E0E0E" d="M14.677 4.457a6.52 6.52 0 0 1-2.4 2.374 6.61 6.61 0 0 1-6.555 0 6.52 6.52 0 0 1-2.4-2.374L1.29 5.612v8.805l2.033 1.162a6.52 6.52 0 0 1 2.399-2.375 6.61 6.61 0 0 1 6.556 0 6.52 6.52 0 0 1 2.4 2.375l2.032-1.162V5.612l-2.033-1.155Z"/><path fill="#0E0E0E" stroke="#0E0E0E" stroke-width=".5" d="M9 13.13c-1.01 0-2.004.264-2.878.764-.801.457-1.476 1.1-1.971 1.869L9 18.53l4.848-2.768a5.721 5.721 0 0 0-1.97-1.87A5.803 5.803 0 0 0 9 13.132Zm5.76-8.339a6.77 6.77 0 0 1-2.358 2.256 6.864 6.864 0 0 1-6.804 0 6.77 6.77 0 0 1-2.36-2.256l-1.698.965v8.514l1.698.972a6.773 6.773 0 0 1 2.36-2.256A6.859 6.859 0 0 1 9 12.085c1.194 0 2.367.31 3.402.901a6.77 6.77 0 0 1 2.36 2.256l1.698-.972V5.757l-1.7-.965ZM4.153 4.267a5.721 5.721 0 0 0 1.97 1.87 5.804 5.804 0 0 0 5.756 0 5.722 5.722 0 0 0 1.971-1.87L9 1.495 4.153 4.267Zm13.361 10.61-.127.073-.275.156-1.74.995-.295.168-.478.271-5.2 2.97-.275.157-.124.071-.125-.071-.276-.157L.89 15.106v.001l-.127-.072-.15-.085-.125-.072V5.149l.127-.072.276-.156.01-.006h.002L8.599.518l.276-.158L9 .29l.124.071.275.159V.519l7.707 4.4.281.16.127.071v9.728Z"/><path fill="#fff" d="M15.464 8.463 9.854 9.53l1.87 1.067 3.74-2.135ZM2.536 8.463l5.61 1.068-1.87 1.067-3.74-2.135Z"/><path fill="#0E0E0E" d="m12.741 14.28-5.61 1.068 1.87 1.068 3.74-2.136Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h18v20.5H0z"/></clipPath></defs>';
            existingSvg.parentNode.replaceChild(newSvg, existingSvg);
            console.log("SVG replaced for 'SquareHero Dashboard' with the new SVG.");
            return; // Stop after finding and replacing the first one
          } else {
            console.log("Existing SVG not found within the 'SquareHero Dashboard' item.");
          }
        }
      }
      
      // If we didn't find it, retry after a short delay
      console.log("'SquareHero Dashboard' item not found in the sidebar, will retry later");
      setTimeout(replaceSidebarIcon, 1000);
    }

    // Remove any existing button to prevent duplicates
    const existingButton = window.top.document.querySelector('.custom-toolbar-button');
    if (existingButton && existingButton.parentNode) {
      existingButton.parentNode.removeChild(existingButton);
    }

    // Use a static but unique ID for the clip path
    const clipPathId = 'squarehero-logo-clip-path';

    // Create our custom button element
    const customButton = document.createElement('div');
    customButton.className = 'custom-toolbar-button';
    customButton.innerHTML = `
      <div class="sh-button">
        <button class="squarehero-dashboard-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" fill="none">
            <g clip-path="url(#${clipPathId})">
              <path fill="#001E45" d="M22.883 19.777V7.264L12 1.007 1.115 7.264v12.513L12 26.033l10.884-6.256Z"/>
              <path fill="#87C4CC" d="M22.883 19.777V7.264L12 1.007 1.115 7.264v12.513L12 26.033l10.884-6.256Z"/>
              <path fill="#0CC2ED" d="M4.66 5.239a8.455 8.455 0 0 0 3.102 3.09 8.502 8.502 0 0 0 8.476 0 8.455 8.455 0 0 0 3.102-3.09L12 1.007 4.655 5.229l.004.01ZM12 17.594a8.535 8.535 0 0 0-4.236 1.135 8.49 8.49 0 0 0-3.104 3.086L12 26.033l7.34-4.218a8.49 8.49 0 0 0-3.105-3.086A8.536 8.536 0 0 0 12 17.594Z"/>
              <path fill="#001E45" d="M20.015 5.623a9.234 9.234 0 0 1-3.387 3.373 9.286 9.286 0 0 1-9.255 0 9.234 9.234 0 0 1-3.388-3.373l-2.87 1.64v12.514l2.87 1.65a9.232 9.232 0 0 1 3.387-3.373 9.284 9.284 0 0 1 9.256 0 9.231 9.231 0 0 1 3.387 3.374l2.87-1.65V7.263l-2.87-1.641Z"/>
              <path fill="#fff" d="M23.271 6.591 12.39.336l-.39-.225-.39.225L.743 6.58l-.016.01-.392.223v13.412l.21.12.18.103 10.884 6.256.39.225.39-.225 7.34-4.22.675-.386.418-.238 2.455-1.412.39-.224V6.816l-.396-.225Zm-3.256 14.836a9.234 9.234 0 0 0-3.387-3.374 9.284 9.284 0 0 0-9.256 0 9.233 9.233 0 0 0-3.387 3.374l-2.87-1.65V7.263l2.87-1.64a9.234 9.234 0 0 0 3.387 3.372 9.285 9.285 0 0 0 9.255 0 9.235 9.235 0 0 0 3.388-3.373l2.87 1.641v12.514l-2.87 1.65Zm-8.016-20.42 7.343 4.222a8.455 8.455 0 0 1-3.101 3.09 8.502 8.502 0 0 1-8.477 0 8.455 8.455 0 0 1-3.101-3.09l7.336-4.222Zm0 25.026-7.34-4.218a8.456 8.456 0 0 1 3.103-3.09 8.502 8.502 0 0 1 8.476 0 8.455 8.455 0 0 1 3.101 3.09L12 26.033Z"/>
              <path fill="#fff" d="m21.125 11.316-7.92 1.518 2.64 1.517 5.28-3.035ZM2.875 11.316l7.919 1.518-2.64 1.517-5.28-3.035ZM17.281 19.583 9.361 21.1l2.641 1.518 5.28-3.035Z"/>
            </g>
            <defs>
              <clipPath id="${clipPathId}">
                <path fill="#fff" d="M0 0h24v27H0z"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    `;

    // Find insertion point using stable structure
    const buttonContainer = toolbar.querySelector('ul') || toolbar.lastChild;

    if (buttonContainer) {
      // Create a container that matches the toolbar structure
      const listItem = document.createElement('li');
      listItem.className = 'custom-list-item';
      listItem.style.cssText = 'display: flex; align-items: center;';
      listItem.appendChild(customButton);

      // Insert at the beginning of the list
      buttonContainer.insertBefore(listItem, buttonContainer.firstChild);
    } else {
      // Fallback - append to the toolbar
      toolbar.appendChild(customButton);
    }

    // Add click handler that navigates to the dashboard page
    customButton.querySelector('button').addEventListener('click', () => {
      console.log('SquareHero button clicked - navigating to dashboard page');
      navigateInPreview('/squarehero-dashboard');
    });
    
    // Add some base styles through a style tag
    const baseStyle = document.createElement('style');
    baseStyle.id = 'squarehero-base-styles';
    baseStyle.textContent = `
      .custom-toolbar-button {
        display: inline-flex;
        align-items: center;
        margin-right: 10px;
      }
      .custom-button button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .custom-button button:hover {
        background: rgba(0,0,0,0.05);
      }
      .squarehero-dashboard-button {
        background: none;
        color: #007bff;
        font-weight: bold;
      }
    `;
    
    // Load external CSS file into the top window
    function loadExternalCSS() {
      // Create link element in top window
      const linkElement = window.top.document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/sh-helper.min.css';
      linkElement.id = 'squarehero-styles';
      
      // Remove any previous instance to prevent duplicates
      const existingLink = window.top.document.getElementById('squarehero-styles');
      if (existingLink && existingLink.parentNode) {
        existingLink.parentNode.removeChild(existingLink);
      }
      
      // Add to top window's head
      window.top.document.head.appendChild(linkElement);
      console.log('SquareHero: External CSS loaded into top window');
      
      // Check for dashboard container and notification banner and add iframe padding if needed
      checkAndAddIframePadding();
    }
    
    // Function to check for dashboard container and notification banner and add iframe padding if needed
    function checkAndAddIframePadding() {
      // Check every 500ms until the iframe is properly loaded
      const checkInterval = setInterval(() => {
        const previewFrame = window.top.document.querySelector('iframe#sqs-site-frame');
        
        if (!previewFrame || !previewFrame.contentDocument) {
          return; // Frame not accessible yet
        }
        
        // Check if dashboard container exists inside the frame
        const dashboardContainer = previewFrame.contentDocument.querySelector('#squarehero-dashboard-container');
        if (!dashboardContainer) {
          return; // Dashboard container not found
        }
        
        // Check if notification banner exists
        const notificationBanner = previewFrame.contentDocument.querySelector('.App-footer .app-notifications-banner-container');
        if (!notificationBanner) {
          return; // Notification banner not found
        }
        
        // Both elements exist, add padding to iframe
        const iframePaddingStyle = window.top.document.getElementById('squarehero-iframe-padding');
        if (!iframePaddingStyle) {
          const styleElement = window.top.document.createElement('style');
          styleElement.id = 'squarehero-iframe-padding';
          styleElement.textContent = `
            iframe#sqs-site-frame {
              padding-bottom: 40px;
              box-sizing: border-box;
            }
          `;
          window.top.document.head.appendChild(styleElement);
          console.log('SquareHero: Added padding to iframe for notification banner');
        }
        
        // Clear the interval once we've added the padding
        clearInterval(checkInterval);
      }, 500);
      
      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Remove any existing base styles
    const existingStyles = window.top.document.getElementById('squarehero-base-styles');
    if (existingStyles && existingStyles.parentNode) {
      existingStyles.parentNode.removeChild(existingStyles);
    }
    
    // Add the base styles to the top window
    window.top.document.head.appendChild(baseStyle);
    
    // Load the external CSS file
    loadExternalCSS();

    // Start the sidebar icon replacement process
    setTimeout(replaceSidebarIcon, 1000);
  }
  
  // Start initialization process when script loads
  if (document.readyState === 'complete') {
    initWhenReady();
  } else {
    window.addEventListener('load', initWhenReady);
  }
})();