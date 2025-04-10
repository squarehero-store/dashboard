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
        <div class="custom-button">
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
    }
    
    // Start initialization process when script loads
    if (document.readyState === 'complete') {
      initWhenReady();
    } else {
      window.addEventListener('load', initWhenReady);
    }
  })();