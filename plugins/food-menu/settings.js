/**
 * SquareHero Food & Drink Menu Manager - Settings Schema
 */

// Register settings schema for the Food & Drink Menu Manager plugin
Dashboard.PluginSettingsRegistry.register('food-menu', [
    {
        type: 'category',
        id: 'general',
        label: 'General',
        isDefault: true,
        components: [
            { 
                type: 'toggle', 
                id: 'enabled', 
                label: 'Enable Food & Drink Menu Manager', 
                default: true
            },
            {
                type: 'dropdown', 
                id: 'style', 
                label: 'Menu Style',
                width: 'half',
                options: [
                    { value: 'modern', label: 'Modern' },
                    { value: 'simple', label: 'Simple' }
                ],
                default: 'modern'
            },
            { 
                type: 'title', 
                id: 'colour_title', 
                label: 'Colors'
            },
            { 
                type: 'color', 
                id: 'category_button', 
                label: 'Category Button', 
                width: 'third',
                default: 'hsla(var(--darkAccent-hsl), 1)'
            },
            { 
                type: 'color', 
                id: 'category_title', 
                label: 'Category Title', 
                width: 'third',
                default: 'hsla(var(--darkAccent-hsl), 1)'
            },
            { 
                type: 'color', 
                id: 'menu_item_title', 
                label: 'Menu Item Title', 
                width: 'third',
                default: 'hsla(var(--black-hsl),1)'
            },
            { 
                type: 'color', 
                id: 'menu_item_price', 
                label: 'Menu Item Price', 
                width: 'third',
                default: 'hsla(var(--black-hsl),1)'
            },
            { 
                type: 'color', 
                id: 'menu_item_description', 
                label: 'Menu Item Description', 
                width: 'third',
                default: 'hsla(var(--black-hsl),1)'
            },
            { 
                type: 'color', 
                id: 'menu_item_mods', 
                label: 'Menu Item Mods', 
                width: 'third',
                default: 'hsla(var(--darkAccent-hsl),1)'
            }
        ]
    },
    {
        type: 'category',
        id: 'items',
        label: 'Menu items',
        components: [
            // Menu items management components will go here
        ]
    }
], {
    // Event handlers
    onChange: (settingId, value) => {
        console.log(`Food & Drink Menu setting changed: ${settingId} = ${value}`);
        
        // Implement real-time preview updates here if needed
    },
    onSave: (allSettings) => {
        console.log('Food & Drink Menu settings saved:', allSettings);
        
        // Apply settings to the actual menu on the site
        applyMenuSettings(allSettings);
    }
});

// Function to apply settings to the menu
function applyMenuSettings(settings) {
    // In a real implementation, this would update the actual menu on the site
    console.log('Applying menu settings:', settings);
}

console.log('Food & Drink Menu plugin settings registered');