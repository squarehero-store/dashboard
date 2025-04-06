/**
 * SquareHero Scroll to Top Plugin - Settings Schema
 */

// Register settings schema for the Scroll to Top plugin
Dashboard.PluginSettingsRegistry.register('scroll-to-top', [
    {
        type: 'category',
        id: 'general',
        label: 'General',
        isDefault: true,
        components: [
            { 
                type: 'toggle', 
                id: 'enabled', 
                label: 'Enable Scroll to Top Button', 
                default: true
            },
            {
                type: 'dropdown', 
                id: 'position', 
                label: 'Button Position',
                width: 'half',
                options: [
                    { value: 'right', label: 'Bottom Right' },
                    { value: 'center', label: 'Bottom Center' },
                    { value: 'left', label: 'Bottom Left' }
                ],
                default: 'right',
                helpText: 'Where the button will appear on the page'
            },
            {
                type: 'slider',
                id: 'offset',
                label: 'Scroll Offset',
                width: 'half',
                min: 100,
                max: 1000,
                step: 50,
                default: 300,
                helpText: 'How far to scroll before showing the button'
            },
            {
                type: 'slider',
                id: 'size',
                label: 'Button Size',
                width: 'half',
                min: 30,
                max: 80,
                step: 5,
                default: 44,
                helpText: 'Size of the button in pixels'
            },
            {
                type: 'slider',
                id: 'bottom',
                label: 'Bottom Margin',
                width: 'half',
                min: 10,
                max: 100,
                step: 5,
                default: 20,
                helpText: 'Distance from bottom of screen'
            }
        ]
    },
    {
        type: 'category',
        id: 'appearance',
        label: 'Appearance',
        components: [
            { 
                type: 'color', 
                id: 'background', 
                label: 'Button Background Color', 
                width: 'half',
                default: '#000000'
            },
            { 
                type: 'color', 
                id: 'circle', 
                label: 'Progress Circle Color', 
                width: 'half',
                default: '#FFFFFF'
            },
            { 
                type: 'color', 
                id: 'arrow', 
                label: 'Arrow Color', 
                width: 'half',
                default: '#FFFFFF'
            },
            {
                type: 'toggle',
                id: 'shadow',
                label: 'Show Drop Shadow',
                default: true,
                helpText: 'Adds a subtle shadow for depth'
            }
        ]
    },
    {
        type: 'category',
        id: 'behavior',
        label: 'Behavior',
        components: [
            {
                type: 'toggle',
                id: 'smoothScroll',
                label: 'Smooth Scrolling',
                default: true,
                helpText: 'Enables smooth scrolling animation'
            },
            {
                type: 'slider',
                id: 'scrollDuration',
                label: 'Scroll Duration',
                width: 'half',
                min: 100,
                max: 2000,
                step: 100,
                default: 800,
                helpText: 'Duration of scroll animation in milliseconds'
            },
            {
                type: 'dropdown',
                id: 'scrollEasing',
                label: 'Scroll Easing',
                width: 'half',
                options: [
                    { value: 'linear', label: 'Linear' },
                    { value: 'easeInOut', label: 'Ease In/Out' },
                    { value: 'easeOut', label: 'Ease Out' }
                ],
                default: 'easeInOut',
                helpText: 'Easing function for scroll animation'
            }
        ]
    }
], {
    // Event handlers
    onChange: (settingId, value) => {
        console.log(`Scroll to Top setting changed: ${settingId} = ${value}`);
        
        // Handle live preview updates if needed
        if (window.updateButtonPreview) {
            window.updateButtonPreview(settingId, value);
        }
    },
    onSave: (allSettings) => {
        console.log('Scroll to Top settings saved:', allSettings);
        
        // Apply settings to the actual button
        applyButtonSettings(allSettings);
    }
});

// Function to apply settings to the actual button
function applyButtonSettings(settings) {
    // In a real implementation, this would update the actual button on the site
    console.log('Applying button settings:', settings);
}

console.log('Scroll to Top plugin settings registered');