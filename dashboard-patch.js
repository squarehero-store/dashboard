/**
 * SquareHero Dashboard - Active Panel Patch
 * This patch ensures the active panel ID is properly exposed globally
 */

(function() {
    // Check if already patched
    if (window.dashboardPatchApplied) {
        console.log('Dashboard patch already applied');
        return;
    }
    
    // Function to patch the loadPluginSettingsModule method
    function patchDashboard() {
        if (typeof window.Dashboard === 'undefined') {
            console.warn('Dashboard not available yet, waiting before applying patch');
            setTimeout(patchDashboard, 100);
            return;
        }
        
        // Store original function reference
        const originalLoadPluginSettingsModule = Dashboard.loadPluginSettingsModule;
        
        if (!originalLoadPluginSettingsModule) {
            console.error('Dashboard.loadPluginSettingsModule not found, cannot apply patch');
            return;
        }
        
        // Replace with patched version
        Dashboard.loadPluginSettingsModule = function(pluginId) {
            // Call the original function
            originalLoadPluginSettingsModule.apply(this, arguments);
            
            // Explicitly set and expose the active panel ID globally
            window.activePanel = pluginId;
            console.log('Active panel ID globally exposed:', window.activePanel);
            
            // Also set data attribute on the panel for easier detection
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.setAttribute('data-plugin-id', pluginId);
                console.log('Added data-plugin-id attribute to settings panel');
            }
        };
        
        // Add a global accessor for the active panel
        Object.defineProperty(window.Dashboard, 'activePanel', {
            get: function() {
                return window.activePanel;
            },
            set: function(value) {
                window.activePanel = value;
                console.log(`Active panel updated: ${value}`);
            },
            enumerable: true
        });
        
        // Mark as patched
        window.dashboardPatchApplied = true;
        console.log('Dashboard patch applied successfully');
    }
    
    // Function to patch closeSettingsPanel to clean up when panel closes
    function patchCloseSettingsPanel() {
        if (typeof window.Dashboard === 'undefined' || !window.Dashboard.closeSettingsPanel) {
            console.warn('Dashboard.closeSettingsPanel not available yet, waiting before applying patch');
            setTimeout(patchCloseSettingsPanel, 100);
            return;
        }
        
        // Store original function reference
        const originalCloseSettingsPanel = Dashboard.closeSettingsPanel;
        
        // Replace with patched version
        Dashboard.closeSettingsPanel = function() {
            // Call the original function
            originalCloseSettingsPanel.apply(this, arguments);
            
            // Clear the active panel ID when closing
            window.activePanel = null;
            console.log('Active panel ID cleared on panel close');
            
            // Remove the data attribute
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.removeAttribute('data-plugin-id');
            }
        };
        
        console.log('closeSettingsPanel patch applied successfully');
    }
    
    // Apply the patches
    patchDashboard();
    patchCloseSettingsPanel();
    
    // Helper function to get the current active plugin ID using various methods
    window.getActivePluginId = function() {
        // First check direct global variable
        if (window.activePanel) {
            return window.activePanel;
        }
        
        // Then check Dashboard property
        if (window.Dashboard && window.Dashboard.activePanel) {
            return window.Dashboard.activePanel;
        }
        
        // Then check DOM for data attribute
        const settingsPanel = document.querySelector('.settings-panel.visible');
        if (settingsPanel && settingsPanel.hasAttribute('data-plugin-id')) {
            return settingsPanel.getAttribute('data-plugin-id');
        }
        
        // Then try to determine from panel title
        const panelTitle = document.getElementById('plugin-settings-title')?.textContent.trim();
        if (panelTitle && window.installedPlugins) {
            const matchingPlugin = window.installedPlugins.find(p => p.name === panelTitle);
            if (matchingPlugin) {
                return matchingPlugin.id;
            }
        }
        
        // No plugin ID could be determined
        return null;
    };
    
    // Load helper script to monitor panel activity
    window.addEventListener('load', function() {
        // Create a MutationObserver to detect when the settings panel becomes visible
        const panelObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('visible')) {
                    
                    // Panel has become visible, check if we need to update activePanel
                    if (!window.activePanel) {
                        const pluginId = window.getActivePluginId();
                        if (pluginId) {
                            window.activePanel = pluginId;
                            console.log('Active panel ID updated via observer:', pluginId);
                            
                            // Update the data attribute if needed
                            if (!mutation.target.hasAttribute('data-plugin-id')) {
                                mutation.target.setAttribute('data-plugin-id', pluginId);
                            }
                        }
                    }
                }
            });
        });
        
        // Start observing the settings panel
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            panelObserver.observe(settingsPanel, { attributes: true });
            console.log('Panel observer initialized');
        }
    });
})();