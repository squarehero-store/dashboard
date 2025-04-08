/**
 * SquareHero Real Estate Listings Plugin - Settings Schema with Wizard Integration
 * Optimized for local JSON development mode while maintaining Firebase support
 */

// Register settings schema for the Real Estate Listings plugin
Dashboard.PluginSettingsRegistry.register('real-estate-listings', [
    // Optional: Show wizard if setup is not complete
    {
        type: 'custom',
        id: 'setup-wizard-container',
        render: function() {
            // Global dashboard test mode check - looks for data-wizard-enabled attribute
            const dashboardElement = document.querySelector('.dashboard-wrapper, body');
            const wizardGloballyDisabled = dashboardElement && dashboardElement.getAttribute('data-wizard-enabled') === 'false';
            
            // Check for test mode flag - add this to disable wizard temporarily
            const wizardLocallyDisabled = localStorage.getItem('disable_wizard') === 'true';
            
            // Only show if wizard setup is not completed and not disabled globally or locally
            if (wizardGloballyDisabled || wizardLocallyDisabled || !isWizardSetupRequired('real-estate-setup-wizard')) {
                return '';
            }
            
            return '<div id="real-estate-wizard-container"></div>';
        },
        bindEvents: function(form) {
            const wizardContainer = form.querySelector('#real-estate-wizard-container');
            if (wizardContainer) {
                initRealEstateWizard(wizardContainer);
            }
        }
    },
    
    // Normal settings - these will be visible after wizard completion
    {
        type: 'category',
        id: 'general',
        label: 'General',
        isDefault: true,
        components: [
            { 
                type: 'toggle', 
                id: 'enabled', 
                label: 'Enable Real Estate Listings Plugin', 
                default: true
            },
            {
                type: 'text',
                id: 'collection-slug',
                label: 'Collection URL Path',
                default: 'find-your-home',
                helpText: 'The URL path of your Squarespace blog collection with property listings'
            },
            {
                type: 'text',
                id: 'listing-title',
                label: 'Listings Section Title',
                width: 'half',
                default: 'Properties',
                placeholder: 'Enter title for your listings section',
                helpText: 'This will appear as the main heading for your listings section'
            },
            {
                type: 'dropdown', 
                id: 'layout', 
                label: 'Default Layout',
                width: 'half',
                options: [
                    { value: 'grid', label: 'Grid View' },
                    { value: 'list', label: 'List View' },
                    { value: 'map', label: 'Map View' }
                ],
                default: 'grid',
                helpText: 'The default view your visitors will see'
            },
            {
                type: 'slider',
                id: 'items-per-page',
                label: 'Items Per Page',
                width: 'half',
                min: 3,
                max: 24,
                step: 3,
                default: 9,
                helpText: 'Number of properties to display per page'
            },
            {
                type: 'dropdown', 
                id: 'grid-columns', 
                label: 'Grid Columns',
                width: 'half',
                options: [
                    { value: '2', label: '2 Columns' },
                    { value: '3', label: '3 Columns' },
                    { value: '4', label: '4 Columns' }
                ],
                default: '3',
                helpText: 'Number of columns'
            },
            { 
                type: 'color', 
                id: 'price-color', 
                label: 'Price Text Color', 
                width: 'half',
                default: 'hsla(var(--accent-hsl), 1)'
            },
            { 
                type: 'color', 
                id: 'status-bg-color', 
                label: 'Status Badge Background', 
                width: 'half',
                default: 'hsla(var(--darkAccent-hsl), 1)'
            }
        ]
    },
    {
        type: 'category',
        id: 'properties',
        label: 'Manage Properties',
        components: [
            {
                type: 'custom',
                id: 'property-manager',
                label: 'Manage Properties',
                script: 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@0/plugins/real-estate-listings/property-manager.js'
            }
        ]
    },
    {
        type: 'category',
        id: 'filtering',
        label: 'Filtering',
        components: [
            {
                type: 'toggle',
                id: 'show-filters',
                label: 'Enable Filtering',
                default: true,
                helpText: 'Allow visitors to filter properties by price, bedrooms, etc.'
            },
            {
                type: 'checkbox-group',
                id: 'visible-filters',
                label: 'Filter options',
                options: [
                    { value: 'price', label: 'Price' },
                    { value: 'bedrooms', label: 'Bedrooms' },
                    { value: 'bathrooms', label: 'Bathrooms' },
                    { value: 'area', label: 'Area (sq ft/m²)' },
                    { value: 'status', label: 'Property Status' }
                ],
                default: ['price', 'bedrooms', 'bathrooms', 'area', 'status'],
                helpText: 'Select which filter options to display in the property filter'
            },
            {
                type: 'text',
                id: 'categories-label',
                label: 'Categories label',
                width: 'half',
                default: 'Location',
                helpText: 'The label above the categories dropdown in the filter'
            },
            {
                type: 'text',
                id: 'tags-label',
                label: 'Tags label',
                width: 'half',
                default: 'Status',
                helpText: 'The label above the tags dropdown in the filter'
            }
        ]
    },
    {
        type: 'category',
        id: 'fields',
        label: 'Fields & Data',
        components: [
            {
                type: 'checkbox-group',
                id: 'visible-fields',
                label: 'Property Information to Display',
                options: [
                    { value: 'price', label: 'Price' },
                    { value: 'bedrooms', label: 'Bedrooms' },
                    { value: 'bathrooms', label: 'Bathrooms' },
                    { value: 'area', label: 'Area (sq ft/m²)' },
                    { value: 'garage', label: 'Garage Spaces' },
                    { value: 'year', label: 'Year Built' },
                    { value: 'status', label: 'Property Status' }
                ],
                default: ['price', 'bedrooms', 'bathrooms', 'area', 'status'],
                helpText: 'Select which property details to display in the listing'
            },
            {
                type: 'text',
                id: 'currency-symbol',
                label: 'Currency Symbol',
                width: 'half',
                default: '$',
                helpText: 'Symbol to display before prices'
            },
            {
                type: 'dropdown',
                id: 'area-unit',
                label: 'Area Unit',
                width: 'half',
                options: [
                    { value: 'sqft', label: 'Square Feet' },
                    { value: 'sqm', label: 'Square Meters' }
                ],
                default: 'sqft',
                helpText: 'Unit to use for property area'
            }
        ]
    }
], {
    // Event handlers
    onChange: (settingId, value) => {
        console.log(`Real Estate Listings setting changed: ${settingId} = ${value}`);
        
        // Handle collection slug changes to update property manager
        if (settingId === 'collection-slug' && value) {
            // Re-initialize property manager with new collection
            if (window.PropertyManager && window.PropertyManager.propertyDataManager) {
                // Force reload of property data with the new collection
                window.PropertyManager.propertyDataManager.forceReload();
            }
        }
    },
    onSave: (allSettings) => {
        console.log('Real Estate Listings settings saved:', allSettings);
        
        // Apply settings to the actual listings on the site
        applyListingsSettings(allSettings);
        
        // Call property manager's save handler if available
        const propertyManager = Dashboard.PluginRegistry.get('real-estate-listings', 'settings');
        if (propertyManager && typeof propertyManager.onSaveHandler === 'function') {
            propertyManager.onSaveHandler(allSettings);
        }
    }
});

/**
 * Function to apply settings to the actual listings
 */
function applyListingsSettings(settings) {
    // In a real implementation, this would update the actual listings on the site
    console.log('Applying real estate listings settings:', settings);
    
    // For local development environment, manually trigger update functions
    if (window.PropertyManager) {
        // If we have custom property data, make sure it's registered with the Dashboard
        if (window.PropertyManager.propertyDataManager && 
            window.PropertyManager.propertyDataManager.propertyDetails) {
            
            // Ensure we register property data with the Dashboard's registry
            if (window.Dashboard && window.Dashboard.CustomComponentDataRegistry) {
                window.Dashboard.CustomComponentDataRegistry.register(
                    'real-estate-listings',
                    'property-manager',
                    window.PropertyManager.propertyDataManager.propertyDetails
                );
                console.log('Registered updated property data with dashboard registry');
            }
        }
    }
    
    // Save local settings to Firebase if available
    if (window.Dashboard && window.Dashboard.FirebaseService) {
        window.Dashboard.FirebaseService.updatePluginSettings('real-estate-listings', settings)
            .then(success => {
                if (success) {
                    console.log('Settings successfully saved to Firebase');
                } else {
                    console.warn('Firebase save operation did not report success');
                }
            })
            .catch(error => {
                console.error('Error saving to Firebase:', error);
            });
    }
}

/**
 * Test utilities for the wizard
 * This section adds tools to control wizard visibility for testing purposes
 */
if (window.Dashboard) {
    // Reset wizard state to force it to appear
    window.Dashboard.resetWizard = function() {
        resetWizardState('real-estate-setup-wizard');
        // Make sure wizard is enabled
        localStorage.removeItem('disable_wizard');
        console.log('Wizard state reset. Refresh the page to see the wizard.');
        
        // Refresh the page after a delay to show the wizard
        setTimeout(() => {
            location.reload();
        }, 1000);
    };
    
    // Disable wizard to test regular settings
    window.Dashboard.disableWizard = function() {
        localStorage.setItem('disable_wizard', 'true');
        console.log('Wizard disabled. Refresh the page to see regular settings.');
        
        // Refresh the page after a delay
        setTimeout(() => {
            location.reload();
        }, 1000);
    };
    
    // Enable wizard for testing
    window.Dashboard.enableWizard = function() {
        localStorage.removeItem('disable_wizard');
        console.log('Wizard enabled. Refresh the page to see the wizard if it should be shown.');
        
        // Refresh the page after a delay
        setTimeout(() => {
            location.reload();
        }, 1000);
    };
    
    // Check wizard status
    window.Dashboard.getWizardStatus = function() {
        const dashboardElement = document.querySelector('.dashboard-wrapper, body');
        const wizardGloballyDisabled = dashboardElement && dashboardElement.getAttribute('data-wizard-enabled') === 'false';
        const wizardLocallyDisabled = localStorage.getItem('disable_wizard') === 'true';
        const wizardCompleted = localStorage.getItem('real-estate-setup-wizard_completed') === 'true';
        
        console.log({
            'Wizard Globally Disabled': wizardGloballyDisabled,
            'Wizard Locally Disabled': wizardLocallyDisabled,
            'Wizard Completed': wizardCompleted,
            'Will Show Wizard': !wizardGloballyDisabled && !wizardLocallyDisabled && !wizardCompleted
        });
        
        return {
            globallyDisabled: wizardGloballyDisabled,
            locallyDisabled: wizardLocallyDisabled,
            completed: wizardCompleted,
            willShow: !wizardGloballyDisabled && !wizardLocallyDisabled && !wizardCompleted
        };
    };
    
    // Toggle global wizard setting via code
    window.Dashboard.toggleGlobalWizard = function(enable) {
        const dashboardElement = document.querySelector('.dashboard-wrapper, body');
        if (dashboardElement) {
            dashboardElement.setAttribute('data-wizard-enabled', enable ? 'true' : 'false');
            console.log(`Wizards globally ${enable ? 'enabled' : 'disabled'}. Refresh the page to see changes.`);
        } else {
            console.error('Dashboard element not found. Cannot toggle wizard setting.');
        }
    };
}

/**
 * Manual function to initialize property manager when needed
 * This can be called from the console or other parts of the code
 */
window.manualInitPropertyManager = function() {
    if (window.PropertyManager && typeof window.PropertyManager.initialize === 'function') {
        const container = document.querySelector('.custom-component-container[data-component-id="property-manager"]');
        if (container) {
            window.PropertyManager.initialize(container.id);
            return true;
        }
    }
    return false;
};

console.log('Real Estate Listings plugin settings registered with wizard integration and local development support');