/**
 * SquareHero Wizard Component Extension
 * Extends the ComponentSystem to support wizard-based setup flows
 * With improved conditional navigation, fixed progress indicators, and validation
 */

// Register the wizard component type
ComponentSystem.registerComponentType('wizard', {
  // Render the wizard container
  render: function (setting, currentValues) {
    // Get the wizard steps
    const steps = setting.steps || [];

    // Determine current step (default to first or stored value)
    const currentStep = currentValues[`${setting.id}-current-step`] || 0;
    
    // Count how many dots we need (one for each main step in the flow)
    // For a basic 3-step wizard (welcome, choice, complete) we need 3 dots
    const progressDotCount = 3; // Hardcoded for simplicity

    // Create wizard container with fixed progress dots at bottom
    return `
        <div class="wizard-container" data-wizard-id="${setting.id}" data-current-step="${currentStep}">
          <div class="wizard-content">
            <!-- Step content will be inserted here -->
          </div>
          
          <!-- Fixed progress dots container -->
          <div class="wizard-progress-container">
            <div class="wizard-progress">
              ${Array(progressDotCount).fill().map((_, index) => 
                `<span class="wizard-progress-dot"></span>`
              ).join('')}
            </div>
          </div>
        </div>
      `;
  },

  // Bind events to the wizard
  bindEvents: function (form, setting, onChange) {
    // Get the wizard container
    const wizardContainer = form.querySelector(`.wizard-container[data-wizard-id="${setting.id}"]`);
    if (!wizardContainer) return;

    // Get the wizard steps
    const steps = setting.steps || [];

    // Get current step (default to first or stored value)
    let currentStep = parseInt(wizardContainer.getAttribute('data-current-step') || 0);

    // Keep track of path history for back button navigation
    const navigationHistory = [];

    // This tracks which visual step (dot) we're on (0-2 for a 3-dot wizard)
    let visualStep = 0;

    // Update the current step value whenever it changes
    const updateCurrentStep = (newStep) => {
      currentStep = newStep;
      wizardContainer.setAttribute('data-current-step', newStep);
      if (onChange) {
        onChange(`${setting.id}-current-step`, newStep);
      }
    };

    // Update progress dots based on visual step
    const updateProgressDots = (visualStepIndex) => {
      const progressDots = wizardContainer.querySelectorAll('.wizard-progress-dot');
      
      progressDots.forEach((dot, index) => {
        // A dot is active if it represents the current visual step
        dot.classList.toggle('active', index === visualStepIndex);
        
        // A dot is completed if it comes before the current visual step
        dot.classList.toggle('completed', index < visualStepIndex);
      });
    };

    // Function to render a specific step
    const renderStep = (stepIndex, addToHistory = true) => {
      console.log(`Rendering step ${stepIndex}`);

      // Validate step index
      if (stepIndex < 0 || stepIndex >= steps.length) {
        console.error(`Invalid step index: ${stepIndex}`);
        return;
      }

      // Add current step to history if we're not going back
      if (addToHistory && currentStep !== stepIndex) {
        navigationHistory.push(currentStep);
        console.log(`Added step ${currentStep} to history. History: ${navigationHistory}`);
      }

      // Get the step
      const step = steps[stepIndex];
      console.log(`Step ID: ${step.id}, conditional: ${!!step.conditional}`);

      // Get the wizard content container
      const contentContainer = wizardContainer.querySelector('.wizard-content');

      // Create step content with navigation included with content
      let stepHtml = `
          <div class="wizard-step" data-step-id="${step.id}">
            ${step.image ? `<div class="wizard-step-image"><img src="${step.image}" alt="${step.title || ''}"></div>` : ''}
            
            <div class="wizard-step-header">
              ${step.title ? `<h2 class="wizard-step-title">${step.title}</h2>` : ''}
            </div>
            
            <div class="wizard-step-body">
              ${step.content ? `<p class="wizard-step-content">${step.content}</p>` : ''}
              
              <div class="wizard-step-components">
                ${(step.components || []).map(component => {
                  return ComponentSystem.renderComponents([component], {});
                }).join('')}
              </div>
            </div>
            
            <!-- Navigation stays with the content -->
            <div class="wizard-navigation">
              <button type="button" class="wizard-back-button ${stepIndex === 0 ? 'hidden' : ''}">Back</button>
              <button type="button" class="wizard-next-button">${stepIndex === steps.length - 1 ? 'Finish' : 'Continue'}</button>
            </div>
          </div>
        `;

      // Update the content container
      contentContainer.innerHTML = stepHtml;

      // Bind events to the step components
      if (step.components && step.components.length > 0) {
        ComponentSystem.bindEvents(contentContainer, step.components, onChange);

        // For conditional button groups, add data-next-step attributes
        if (step.conditional) {
          const buttonComponents = step.components.filter(c => c.type === 'button-group');

          buttonComponents.forEach(buttonComponent => {
            const buttonGroup = contentContainer.querySelector(`.button-group-container[data-component-id="${buttonComponent.id}"]`);
            if (buttonGroup) {
              const options = buttonGroup.querySelectorAll('.button-option');

              options.forEach(option => {
                const value = option.getAttribute('data-value');
                const optionData = buttonComponent.options.find(o => o.value === value);

                if (optionData && optionData.nextStep) {
                  option.setAttribute('data-next-step', optionData.nextStep);
                  console.log(`Set data-next-step="${optionData.nextStep}" for option ${value}`);
                }
              });
            }
          });
        }
      }

      // Set visual step based on step ID
      // This maps specific steps to visual dots
      if (step.id === 'welcome') {
        visualStep = 0;
      } else if (step.id === 'existing-collection' || step.id === 'create-collection') {
        visualStep = 1;
      } else if (step.id === 'complete') {
        visualStep = 2;
      }

      // Update progress dots
      updateProgressDots(visualStep);

      // Store the current step
      updateCurrentStep(stepIndex);
      
      // Find and bind the navigation buttons within this step
      bindNavigationButtons(contentContainer);
    };
    
    // Helper functions for validation errors
    const showValidationError = (container, message) => {
      // Remove any existing error messages first
      hideValidationError(container);
      
      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.className = 'wizard-validation-error';
      errorElement.textContent = message;
      
      // Find where to insert it - before the navigation buttons
      const navigationDiv = container.querySelector('.wizard-navigation');
      if (navigationDiv) {
        navigationDiv.parentNode.insertBefore(errorElement, navigationDiv);
      } else {
        // If no navigation div, append to container
        container.appendChild(errorElement);
      }
      
      // Highlight the options that need to be selected
      const buttonGroup = container.querySelector('.button-group');
      if (buttonGroup) {
        buttonGroup.classList.add('validation-highlight');
      }
    };
    
    const hideValidationError = (container) => {
      // Remove error message if exists
      const errorElement = container.querySelector('.wizard-validation-error');
      if (errorElement) {
        errorElement.remove();
      }
      
      // Remove highlighting from button group
      const buttonGroup = container.querySelector('.button-group');
      if (buttonGroup) {
        buttonGroup.classList.remove('validation-highlight');
      }
    };
    
    // Helper function to bind navigation buttons
    const bindNavigationButtons = (container) => {
      const backButton = container.querySelector('.wizard-back-button');
      const nextButton = container.querySelector('.wizard-next-button');
      
      if (backButton) {
        backButton.addEventListener('click', () => {
          if (navigationHistory.length > 0) {
            // Pop the previous step from history
            const previousStep = navigationHistory.pop();
            console.log(`Going back to step ${previousStep}. Remaining history: ${navigationHistory}`);
            renderStep(previousStep, false); // Don't add to history when going back
          }
        });
      }
      
      if (nextButton) {
        // Check if step is conditional and preemptively disable the button if no selection
        const step = steps[currentStep];
        if (step && step.conditional === true) {
          const buttonContainer = container.querySelector('.button-group-container');
          if (buttonContainer) {
            const selectedOption = buttonContainer.querySelector('.button-option.selected');
            if (!selectedOption) {
              // Add visual indication that a selection is needed
              const buttonGroup = buttonContainer.querySelector('.button-group');
              if (buttonGroup) {
                buttonGroup.classList.add('selection-required');
              }
            }
          }
        }
        
        nextButton.addEventListener('click', handleNextButtonClick);
      }
    };
    
    // Handle next button click with proper navigation logic
    const handleNextButtonClick = () => {
      console.log('----------------------------------------');
      console.log('NEXT BUTTON CLICKED - NAVIGATION LOGIC:');
      
      // Get current step
      const step = steps[currentStep];
      console.log(`Current step: ${step.id} (index: ${currentStep})`);
      
      // Handle last step completion
      if (currentStep === steps.length - 1) {
        console.log('This is the last step - handling completion');
        
        // Call onComplete handler if exists
        if (setting.onComplete && typeof setting.onComplete === 'function') {
          const values = ComponentSystem.collectValues(form, setting.steps.flatMap(s => s.components || []));
          setting.onComplete(form, values);
        }
        
        // Set wizard as completed
        if (setting.id) {
          localStorage.setItem(`${setting.id}_completed`, 'true');
          
          // Call the completion callback if provided
          if (setting.completionCallback && typeof window[setting.completionCallback] === 'function') {
            const values = ComponentSystem.collectValues(form, setting.steps.flatMap(s => s.components || []));
            window[setting.completionCallback](values);
          }
        }
        
        // Hide the wizard container if specified
        if (setting.hideOnComplete) {
          wizardContainer.style.display = 'none';
        }
        
        return;
      }
      
      // Direct schema check for conditional steps
      if (step.conditional === true) {
        console.log('This step is CONDITIONAL - checking selected button');
        
        // Find the selected button value
        const contentContainer = wizardContainer.querySelector('.wizard-content');
        const selectedButton = contentContainer.querySelector('.button-option.selected');
        
        if (!selectedButton) {
          console.log('ERROR: No button is selected!');
          
          // Show validation error message
          showValidationError(contentContainer, "Please select an option to continue");
          return; // Prevent proceeding without selection
        } else {
          // If previously showed an error, hide it now
          hideValidationError(contentContainer);
          
          const selectedValue = selectedButton.getAttribute('data-value');
          console.log(`Selected button value: ${selectedValue}`);
          
          // Check for data-next-step attribute directly
          const dataNextStep = selectedButton.getAttribute('data-next-step');
          if (!dataNextStep) {
            console.log('WARNING: No data-next-step attribute found on button element');
          } else {
            console.log(`Found data-next-step attribute: ${dataNextStep}`);
            
            // Find the step index by ID
            const nextStepIndex = steps.findIndex(s => s.id === dataNextStep);
            
            if (nextStepIndex === -1) {
              console.log(`ERROR: Step with ID "${dataNextStep}" not found in steps array!`);
              console.log('Available step IDs:', steps.map(s => s.id));
            } else {
              console.log(`SUCCESS! Navigating to step index: ${nextStepIndex} (id: ${dataNextStep})`);
              renderStep(nextStepIndex);
              return;
            }
          }
          
          // Find the button component in the step
          const buttonComponent = step.components.find(c => 
            c.type === 'button-group' && c.options && c.options.some(o => o.value === selectedValue)
          );
          
          if (!buttonComponent) {
            console.log('ERROR: Could not find button component in step schema!');
          } else {
            // Find the selected option in the schema
            const selectedOption = buttonComponent.options.find(o => o.value === selectedValue);
            
            if (!selectedOption) {
              console.log(`ERROR: Could not find option with value "${selectedValue}" in schema!`);
            } else if (!selectedOption.nextStep) {
              console.log('ERROR: The selected option does not have a nextStep property in schema!');
              console.log('Schema option:', selectedOption);
            } else {
              console.log(`Found nextStep in schema: ${selectedOption.nextStep}`);
              
              // Find the step index by ID
              const nextStepIndex = steps.findIndex(s => s.id === selectedOption.nextStep);
              
              if (nextStepIndex === -1) {
                console.log(`ERROR: Step with ID "${selectedOption.nextStep}" not found in steps array!`);
                console.log('Available step IDs:', steps.map(s => s.id));
              } else {
                console.log(`SUCCESS! Navigating to step index: ${nextStepIndex} (id: ${selectedOption.nextStep})`);
                renderStep(nextStepIndex);
                return;
              }
            }
          }
        }
      } else {
        console.log('This step is NOT conditional');
      }
      
      // Use direct nextStep property if available
      if (step.nextStep) {
        console.log(`Step has direct nextStep property: ${step.nextStep}`);
        const nextStepIndex = steps.findIndex(s => s.id === step.nextStep);
        if (nextStepIndex !== -1) {
          console.log(`Navigating to step index: ${nextStepIndex}`);
          renderStep(nextStepIndex);
          return;
        } else {
          console.log(`ERROR: Step with ID "${step.nextStep}" not found in steps array!`);
        }
      }
      
      // Default to sequential navigation
      console.log(`Falling back to sequential navigation: going to step ${currentStep + 1}`);
      renderStep(currentStep + 1);
    };

    // Initialize progress dots
    updateProgressDots(visualStep);

    // Render the initial step
    renderStep(currentStep, false);

    // Add click handlers to progress dots if clickable
    if (setting.clickableDots) {
      const progressDots = wizardContainer.querySelectorAll('.wizard-progress-dot');
      progressDots.forEach((dot, index) => {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', () => {
          // Find the step index corresponding to the dot
          let targetStepIndex;
          
          // Simple mapping from dot index to step ID
          if (index === 0) {
            targetStepIndex = steps.findIndex(s => s.id === 'welcome');
          } else if (index === 1) {
            // For the second dot, use the step the user previously visited if possible
            const pathStep = steps.find(s => 
              (s.id === 'existing-collection' || s.id === 'create-collection') && 
              navigationHistory.includes(steps.findIndex(step => step.id === s.id))
            );
            
            if (pathStep) {
              targetStepIndex = steps.findIndex(s => s.id === pathStep.id);
            } else {
              // Default to the first option if no history
              targetStepIndex = steps.findIndex(s => s.id === 'existing-collection');
            }
          } else if (index === 2) {
            targetStepIndex = steps.findIndex(s => s.id === 'complete');
          }
          
          if (targetStepIndex >= 0) {
            // Clear navigation history when directly clicking a dot
            navigationHistory.length = 0;
            renderStep(targetStepIndex, false);
          }
        });
      });
    }
  },

  // Get the wizard values
  getValue: function (form, setting) {
    // For wizard component, we just return the current step
    const wizardContainer = form.querySelector(`.wizard-container[data-wizard-id="${setting.id}"]`);
    if (!wizardContainer) return 0;

    // Get current step from data attribute
    const currentStep = wizardContainer.getAttribute('data-current-step') || 0;

    return currentStep;
  },

  // Default settings
  defaults: {
    clickableDots: false,
    hideOnComplete: false
  }
});

/**
 * Fixed Button Group Component
 * This component properly transfers the nextStep property to the data-next-step attribute
 */
ComponentSystem.registerComponentType('button-group', {
  render: function (setting, currentValues) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;

    // For debugging
    console.log('Rendering button group with options:', setting.options);

    return `
      <div class="button-group-container" data-component-id="${setting.id}">
        <div class="button-group">
          ${setting.options.map(option => {
            // Log each option for debugging
            console.log('Option:', option.value, 'nextStep:', option.nextStep);

            return `
              <div class="button-option ${value === option.value ? 'selected' : ''}" 
                   data-value="${option.value}" 
                   ${option.nextStep ? `data-next-step="${option.nextStep}"` : ''}>
                ${option.icon ? `<div class="button-option-icon">${option.icon}</div>` : ''}
                <div class="button-option-content">
                  <div class="button-option-label">${option.label}</div>
                  ${option.description ? `<div class="button-option-description">${option.description}</div>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  bindEvents: function (form, setting, onChange) {
    const container = form.querySelector(`.button-group-container[data-component-id="${setting.id}"]`);
    if (!container) return;

    const options = container.querySelectorAll('.button-option');

    // For debugging
    console.log('Button group options found:', options.length);
    options.forEach(option => {
      console.log('DOM Option:', option.getAttribute('data-value'),
        'data-next-step:', option.getAttribute('data-next-step'));
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        // Log button click for debugging
        console.log(`Button option clicked: ${option.getAttribute('data-value')}`);
        console.log(`Next step: ${option.getAttribute('data-next-step') || 'none'}`);

        // Remove selected class from all options
        options.forEach(opt => opt.classList.remove('selected'));

        // Add selected class to clicked option
        option.classList.add('selected');

        // Get the value
        const value = option.getAttribute('data-value');

        // Call onChange
        if (onChange) {
          onChange(setting.id, value);
        }
      });
    });
  },

  getValue: function (form, setting) {
    const container = form.querySelector(`.button-group-container[data-component-id="${setting.id}"]`);
    if (!container) return setting.default || '';

    const selectedOption = container.querySelector('.button-option.selected');
    return selectedOption ? selectedOption.getAttribute('data-value') : (setting.default || '');
  }
});

// Helper to check if wizard setup is needed for a plugin
function isWizardSetupRequired(wizardId) {
  // Allow force enabling for testing
  if (localStorage.getItem('force_wizard_setup') === 'true') {
    return true;
  }

  // Check if setup has been completed
  const setupCompleted = localStorage.getItem(`${wizardId}_completed`) === 'true';
  return !setupCompleted;
}

// Helper to reset wizard state (for testing)
function resetWizardState(wizardId) {
  localStorage.removeItem(`${wizardId}_completed`);
  console.log(`Wizard state reset for: ${wizardId}`);
  return true;
}

// Helper to force wizard mode for testing
function setWizardTestMode(mode) {
  if (mode === 'force') {
    localStorage.setItem('force_wizard_setup', 'true');
    console.log('Wizard forced to show for testing');
    return true;
  } else {
    localStorage.removeItem('force_wizard_setup');
    console.log('Wizard test mode reset');
    return false;
  }
}

// Enable console debug mode for easier debugging
function enableWizardDebug() {
  localStorage.setItem('wizard_debug', 'true');
  console.log('Wizard debug mode enabled');
  return true;
}

// Disable debug mode
function disableWizardDebug() {
  localStorage.removeItem('wizard_debug');
  console.log('Wizard debug mode disabled');
  return false;
}

// Make helpers globally available
window.isWizardSetupRequired = isWizardSetupRequired;
window.resetWizardState = resetWizardState;
window.setWizardTestMode = setWizardTestMode;
window.enableWizardDebug = enableWizardDebug;
window.disableWizardDebug = disableWizardDebug;