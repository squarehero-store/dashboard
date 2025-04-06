/**
 * SquareHero Skeleton Loader System
 * A universal system for showing skeleton loading states across the dashboard
 */

const SkeletonLoader = (function() {
    
    // Templates for different skeleton components
    const templates = {
        // Plugin card skeleton
        pluginCard: function() {
            return `
                <div class="plugin-card skeleton-wrapper">
                    <div class="plugin-  skeleton-wrapper">
                        <div class="skeleton-hexagon"></div>
                    </div>
                    <div class="plugin-content skeleton-wrapper">
                        <div class="plugin-header">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton status-badge-skeleton"></div>
                        </div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                </div>
            `;
        },
        
        // News item skeleton
        newsItem: function() {
            return `
                <div class="news-item skeleton-wrapper">
                    <div class="skeleton skeleton-text small"></div>
                    <div class="skeleton skeleton-title"></div>
                </div>
            `;
        },
        
        // Property card skeleton - for real estate listings
        propertyCard: function() {
            return `
                <div class="property-card-skeleton">
                    <div class="skeleton property-image-skeleton"></div>
                    <div class="property-content-skeleton">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-text small"></div>
                        <div class="skeleton skeleton-text medium"></div>
                        <div class="property-details-skeleton">
                            <div class="skeleton property-icon-skeleton"></div>
                            <div class="skeleton property-icon-skeleton"></div>
                            <div class="skeleton property-icon-skeleton"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // Settings panel skeleton
        settingsPanel: function() {
            return `
                <div class="settings-panel-skeleton">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    
                    <div class="settings-form-skeleton">
                        <div class="setting-row-skeleton">
                            <div class="skeleton setting-label-skeleton"></div>
                            <div class="skeleton setting-control-skeleton"></div>
                        </div>
                        <div class="setting-row-skeleton">
                            <div class="skeleton setting-label-skeleton"></div>
                            <div class="skeleton setting-control-skeleton"></div>
                        </div>
                        <div class="setting-row-skeleton">
                            <div class="skeleton setting-label-skeleton"></div>
                            <div class="skeleton setting-control-skeleton"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    };
    
    // Load CSS
    function loadStyles() {
        // Check if styles are already loaded
        if (document.querySelector('link[href="skeleton-loader.css"]')) {
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'skeleton-loader.css';
        document.head.appendChild(link);
    }
    
    /**
     * Show skeleton loading for a container
     * @param {string} containerId - ID of the container to show skeletons in
     * @param {string} type - Type of skeleton to show (pluginCard, newsItem, etc.)
     * @param {number} count - Number of skeleton items to show
     */
    function show(containerId, type, count = 3) {
        // Get container
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        // Hide existing content
        Array.from(container.children).forEach(child => {
            // Skip if it's already a skeleton
            if (child.classList.contains('skeleton-wrapper')) return;
            // Otherwise hide the element
            child.classList.add('skeleton-hidden');
        });
        
        // Get template function
        const templateFn = templates[type];
        if (!templateFn) {
            console.error(`Skeleton template "${type}" not found.`);
            return;
        }
        
        // Create skeleton elements
        let skeletonHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonHTML += templateFn();
        }
        
        // Add skeletons to container
        container.innerHTML += skeletonHTML;
        
        return {
            hide: () => hide(containerId)
        };
    }
    
    /**
     * Hide skeleton loading and show real content
     * @param {string} containerId - ID of the container to hide skeletons in
     */
    function hide(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Remove all skeleton elements
        const skeletons = container.querySelectorAll('.skeleton-wrapper');
        skeletons.forEach(skeleton => skeleton.remove());
        
        // Show real content
        Array.from(container.children).forEach(child => {
            child.classList.remove('skeleton-hidden');
        });
        
        // Add loaded class to container
        container.classList.add('loaded');
    }
    
    /**
     * Create a custom skeleton
     * @param {string} containerId - ID of the container to show skeletons in
     * @param {Function} templateFn - Function that returns the HTML for the skeleton
     */
    function custom(containerId, templateFn) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        // Hide existing content
        Array.from(container.children).forEach(child => {
            child.classList.add('skeleton-hidden');
        });
        
        // Add custom skeleton
        container.innerHTML += templateFn();
        
        return {
            hide: () => hide(containerId)
        };
    }
    
    /**
     * Initialize the skeleton loader
     */
    function init() {
        loadStyles();
        console.log('SquareHero Skeleton Loader initialized');
    }
    
    // Return public API
    return {
        init,
        show,
        hide,
        custom,
        templates
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    SkeletonLoader.init();
});

// Make SkeletonLoader globally available
window.SkeletonLoader = SkeletonLoader;