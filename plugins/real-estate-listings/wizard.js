/**
 * SquareHero Real Estate Listings Plugin - Setup Wizard
 * This file handles the initial setup wizard for the Real Estate Listings plugin
 * With improved conditional navigation
 */

(function () {
  console.log("✓ REAL ESTATE WIZARD SCRIPT LOADED");

  // Create the wizard manager
  const RealEstateWizard = {
    /*Initialize the wizard*/
    initialize: function () {
      console.log('Initializing Real Estate Listings Wizard');

      // Check if wizard should be shown
      if (!this.shouldShowWizard()) {
        console.log('Wizard already completed, skipping initialization');
        return false;
      }

      // Register wizard schema with settings registry
      this.registerWizardSchema();

      return true;
    },

    /**
     * Check if wizard should be shown
     */
    shouldShowWizard: function () {
      // Use the same key format as isWizardSetupRequired uses
      const wizardCompleted = localStorage.getItem('real-estate-setup-wizard_completed') === 'true';
      
      // For development, you can force the wizard to show
      const forceWizard = localStorage.getItem('force-wizard') === 'true';

      return !wizardCompleted || forceWizard;
    },

    /**
     * Mark wizard as completed
     */
    markWizardCompleted: function () {
      // Set both keys for compatibility
      localStorage.setItem('real-estate-setup-wizard_completed', 'true');
      localStorage.setItem('real-estate-wizard-completed', 'true');
      console.log('Wizard marked as completed');

      // Refresh the panel to show regular settings
      if (window.Dashboard && window.Dashboard.refreshCurrentPanel) {
        window.Dashboard.refreshCurrentPanel();
      }
    },

    /**
     * Register wizard schema with settings registry
     */
    registerWizardSchema: function () {
      // Define wizard steps
      const wizardSchema = [
        {
          type: 'wizard',
          id: 'real-estate-setup-wizard', // Change to match the key in isWizardSetupRequired
          steps: [
            // Welcome step
            {
              id: 'welcome',
              title: 'Let\'s get started!',
              content: 'This wizard will help you set up your Real Estate Listings plugin for your Squarespace site. Before we begin, let us know about your current setup:',
              image: 'plugins/real-estate-listings/icon.svg',
              conditional: true, // Mark as conditional step
              components: [
                {
                  type: 'button-group',
                  id: 'setup-status',
                  options: [
                    {
                      value: 'existing',
                      label: 'I already have a blog collection with properties',
                      description: 'You have a Squarespace blog or collection where your property listings are stored',
                      nextStep: 'existing-collection' // Specify next step ID
                    },
                    {
                      value: 'new',
                      label: 'I need to set up my properties collection',
                      description: 'You haven\'t created a Squarespace blog or collection for your properties yet',
                      nextStep: 'create-collection' // Specify next step ID
                    }
                  ],
                }
              ]
            },

            // Path A: For users with existing collections
            {
              id: 'existing-collection',
              title: 'Connect to Your Existing Collection',
              content: 'Please specify the URL path of your existing properties collection:',
              nextStep: 'complete', // Will go to complete after this step
              components: [
                {
                  type: 'text',
                  id: 'collection-slug',
                  label: 'Collection URL Path',
                  default: 'properties',
                  helpText: 'The URL path of your Squarespace blog collection with property listings'
                }
              ]
            },

            // Path B: For users who need to create a collection
            {
              id: 'create-collection',
              title: 'Create a New Collection',
              content: 'Let\'s set up a new collection for your properties. Here\'s how:',
              nextStep: 'complete', // Will go to complete after this step
              components: [
                {
                  type: 'text',
                  id: 'new-collection-name',
                  label: 'What would you like to name your collection?',
                  default: 'Properties',
                  helpText: 'This will be the name of your new Squarespace collection'
                }
              ]
            },

            // Completion step
            {
              id: 'complete',
              title: 'Setup Complete!',
              content: 'Great job! Your Real Estate Listings plugin is now configured. You can make additional adjustments in the settings panel anytime.',
              image: 'plugins/real-estate-listings/icon.svg',
              components: []
            }
          ],
          onComplete: this.onWizardComplete.bind(this),
          completionCallback: 'realEstateWizardCompleted'
        }
      ];

      // Register with the settings registry
      if (window.Dashboard && window.Dashboard.registerWizardSchema) {
        window.Dashboard.registerWizardSchema('real-estate-listings', wizardSchema);
        console.log('Wizard schema registered');
      } else {
        console.error('Dashboard.registerWizardSchema method not available');
      }
    },

    /**
     * Handle wizard completion
     */
    onWizardComplete: function (form, values) {
      console.log('Wizard completed with values:', values);

      // Prepare settings to save based on the chosen path
      const settingsToSave = { ...values };

      // Add a flag to indicate wizard has been completed
      settingsToSave.wizardCompleted = true;

      // Save the collected values to plugin settings
      if (window.Dashboard && window.Dashboard.savePluginSettings) {
        window.Dashboard.savePluginSettings('real-estate-listings', settingsToSave);
      }

      // Mark wizard as completed
      this.markWizardCompleted();

      return true;
    }
  };

  // Register with Dashboard if available
  if (typeof window.Dashboard !== 'undefined') {
    console.log("Registering Real Estate Wizard with Dashboard");

    // Register the wizard with the Dashboard
    window.Dashboard.PluginRegistry.register('real-estate-listings', 'wizard', RealEstateWizard);
  }

  // Add global callback that will be called when wizard is complete
  window.realEstateWizardCompleted = function (values) {
    console.log('Wizard completed callback with values:', values);

    // Get which path was taken
    const setupStatus = values['setup-status'] || 'new';

    // Any additional steps needed after wizard completion
    if (setupStatus === 'new') {
      console.log('User needs to create a new collection named:', values['new-collection-name']);
      // Could show instructions for creating collection
    } else {
      console.log('User will use existing collection with slug:', values['collection-slug']);
      // Could verify collection exists or make API call to connect
    }

    // Refresh the page or panel to show the regular settings
    if (window.Dashboard && window.Dashboard.refreshCurrentPanel) {
      setTimeout(() => {
        window.Dashboard.refreshCurrentPanel();
      }, 1000); // Small delay to ensure all data is saved
    }
  };

  // Initialize the wizard
  RealEstateWizard.initialize();
})();