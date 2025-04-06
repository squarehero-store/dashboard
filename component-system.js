/**
 * SquareHero Component System
 * A modular approach for settings components that can be used across all plugins
 */

const ComponentSystem = (function () {
  // Store registered component types
  const componentTypes = {};

  // Store registered validators
  const validators = {};

  // Store global handlers
  const globalHandlers = {
    onChange: null,
    onSave: null
  };

  /**
   * Register a component type
   * @param {string} type - The component type identifier
   * @param {object} componentConfig - Component configuration
   */
  function registerComponentType(type, componentConfig) {
    componentTypes[type] = {
      // Component renderer function
      render: componentConfig.render || function () {
        return `<p>No renderer for component type: ${type}</p>`;
      },

      // Value collector function
      getValue: componentConfig.getValue || function () {
        return null;
      },

      // Bind events function
      bindEvents: componentConfig.bindEvents || function () {
        // Default empty implementation
      },

      // Default settings
      defaults: componentConfig.defaults || {}
    };

    console.log(`Registered component type: ${type}`);
    return componentTypes[type];
  }

  /**
   * Register a validator for a component type
   * @param {string} type - The component type identifier
   * @param {function} validatorFn - Validator function
   */
  function registerValidator(type, validatorFn) {
    validators[type] = validatorFn;
    console.log(`Registered validator for: ${type}`);
  }

  /**
   * Set global change handler
   * @param {function} handler - Global change handler
   */
  function setGlobalChangeHandler(handler) {
    globalHandlers.onChange = handler;
  }

  /**
   * Set global save handler
   * @param {function} handler - Global save handler
   */
  function setGlobalSaveHandler(handler) {
    globalHandlers.onSave = handler;
  }

  /**
   * Generate settings HTML for a set of components
   * @param {array} components - Array of component definitions
   * @param {object} currentValues - Current values
   * @returns {string} HTML for the components
   */
  function renderComponents(components, currentValues = {}) {
    return components.map(component => {
      const type = component.type;

      // Skip rendering if no type or unknown type
      if (!type || !componentTypes[type]) {
        console.warn(`Unknown component type: ${type}`);
        return '';
      }

      // Get renderer for this component type
      const renderer = componentTypes[type].render;
      return renderer(component, currentValues);
    }).join('');
  }

  /**
   * Collect values from all components in a form
   * @param {HTMLElement} form - The form element
   * @param {array} components - Array of component definitions
   * @returns {object} Collected values
   */
  function collectValues(form, components) {
    const values = {};

    components.forEach(component => {
      const type = component.type;

      // Skip if no type or unknown type
      if (!type || !componentTypes[type]) {
        console.warn(`Skipping value collection for unknown component type: ${type}`);
        return;
      }

      // Skip component types that don't have values (like titles)
      if (type === 'title' || type === 'category') {
        return;
      }

      // Get value collector for this component type
      const valueCollector = componentTypes[type].getValue;

      // Collect value
      values[component.id] = valueCollector(form, component);
    });

    return values;
  }

  /**
   * Bind events to all components in a form
   * @param {HTMLElement} form - The form element
   * @param {array} components - Array of component definitions
   * @param {function} onChange - Change handler
   */
  function bindEvents(form, components, onChange) {
    components.forEach(component => {
      const type = component.type;

      // Skip if no type or unknown type
      if (!type || !componentTypes[type]) {
        console.warn(`Skipping event binding for unknown component type: ${type}`);
        return;
      }

      // Get event binder for this component type
      const eventBinder = componentTypes[type].bindEvents;

      // Bind events
      eventBinder(form, component, onChange || globalHandlers.onChange);
    });
  }

  /**
   * Extract all components from a schema, including nested ones
   * @param {array} schema - Component schema
   * @returns {array} All components
   */
  function extractAllComponents(schema) {
    // Get all top-level components
    const topComponents = schema.filter(item => item.type !== 'category');

    // Extract components from categories
    const categoryComponents = [];
    schema.filter(item => item.type === 'category').forEach(category => {
      if (Array.isArray(category.components)) {
        categoryComponents.push(...category.components);
      }
    });

    // Return combined list
    return [...topComponents, ...categoryComponents];
  }

  /**
   * Register standard component types
   */
  function registerStandardComponents() {
    // Register text field component
    registerComponentType('text', {
      render: function (setting, currentValues) {
        const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || '');
        const widthClass = setting.width ? `form-group-${setting.width}` : '';

        return `
            <div class="form-group ${widthClass}">
              <label for="${setting.id}">${setting.label}</label>
              <input type="text" id="${setting.id}" name="${setting.id}" value="${value}" 
                    class="setting-input" ${setting.placeholder ? `placeholder="${setting.placeholder}"` : ''}>
              ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
            </div>
          `;
      },
      getValue: function (form, setting) {
        const element = form.querySelector(`#${setting.id}`);
        return element ? element.value : (setting.default || '');
      },
      bindEvents: function (form, setting, onChange) {
        const element = form.querySelector(`#${setting.id}`);
        if (element && onChange) {
          element.addEventListener('input', function () {
            onChange(setting.id, element.value);
          });
        }
      }
    });

    // Register custom component type
    registerComponentType('custom', {
      render: function (setting, currentValues) {
        // Create a container for the custom component
        // The actual content will be populated by the script specified in the component
        return `
        <div class="form-group form-group-full">
          <div id="${setting.id}-container" class="custom-component-container" data-component-id="${setting.id}" data-script="${setting.script}">
            <div class="loading-indicator">
              <p>Loading ${setting.label}...</p>
            </div>
          </div>
        </div>
      `;
      },

      getValue: function (form, setting) {
        // Custom components might handle their own value collection
        // This is just a placeholder - the actual implementation should be in the custom script
        const customValues = window[`${setting.id}Values`] || {};
        return customValues;
      },

      bindEvents: function (form, setting, onChange) {
        const container = form.querySelector(`#${setting.id}-container`);
        if (!container) return;

        // Load the custom script if it's not already loaded
        const scriptPath = setting.script;
        if (scriptPath && !document.querySelector(`script[src="${scriptPath}"]`)) {
          // Create a script element to load the custom component
          const script = document.createElement('script');
          script.src = scriptPath;
          script.onload = function () {
            console.log(`Custom component script loaded: ${scriptPath}`);
            // The script should register itself with the Dashboard.PluginRegistry
            // and will initialize itself
          };
          script.onerror = function () {
            console.error(`Failed to load custom component script: ${scriptPath}`);
            if (container) {
              container.innerHTML = `
              <div class="error-message">
                <p>Failed to load component. Please check the console for details.</p>
              </div>
            `;
            }
          };
          document.head.appendChild(script);
        }
      }
    });

    // Register toggle component
    registerComponentType('toggle', {
      render: function (setting, currentValues) {
        const checked = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;
        const widthClass = setting.width ? `form-group-${setting.width}` : '';

        return `
            <div class="form-group toggle-group ${widthClass}">
              <label class="toggle-label">
                <input type="checkbox" id="${setting.id}" name="${setting.id}" ${checked ? 'checked' : ''}>
                <span class="toggle-slider"></span>
                <span class="toggle-text">${setting.label}</span>
              </label>
              ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
            </div>
          `;
      },
      getValue: function (form, setting) {
        const element = form.querySelector(`#${setting.id}`);
        return element ? element.checked : (setting.default || false);
      },
      bindEvents: function (form, setting, onChange) {
        const element = form.querySelector(`#${setting.id}`);
        if (element && onChange) {
          element.addEventListener('change', function () {
            onChange(setting.id, element.checked);
          });
        }
      }
    });

    // Register dropdown component
    registerComponentType('dropdown', {
      render: function (setting, currentValues) {
        const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;
        const widthClass = setting.width ? `form-group-${setting.width}` : '';

        return `
            <div class="form-group ${widthClass}">
              <label for="${setting.id}">${setting.label}</label>
              <select id="${setting.id}" name="${setting.id}" class="setting-input">
                ${setting.options.map(option =>
          `<option value="${option.value}" ${value === option.value ? 'selected' : ''}>${option.label}</option>`
        ).join('')}
              </select>
              ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
            </div>
          `;
      },
      getValue: function (form, setting) {
        const element = form.querySelector(`#${setting.id}`);
        return element ? element.value : (setting.default || '');
      },
      bindEvents: function (form, setting, onChange) {
        const element = form.querySelector(`#${setting.id}`);
        if (element && onChange) {
          element.addEventListener('change', function () {
            onChange(setting.id, element.value);
          });
        }
      }
    });

    // Register slider component
    registerComponentType('slider', {
      render: function (setting, currentValues) {
        const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || 0);
        const widthClass = setting.width ? `form-group-${setting.width}` : '';

        return `
            <div class="form-group ${widthClass}">
              <label for="${setting.id}">${setting.label}</label>
              <div class="slider-container">
                <input type="range" id="${setting.id}" name="${setting.id}" value="${value}" 
                      min="${setting.min || 0}" max="${setting.max || 100}" step="${setting.step || 1}" 
                      class="slider-input">
                <span class="slider-value">${value}</span>
              </div>
              ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
            </div>
          `;
      },
      getValue: function (form, setting) {
        const element = form.querySelector(`#${setting.id}`);
        return element ? parseFloat(element.value) : (setting.default || 0);
      },
      bindEvents: function (form, setting, onChange) {
        const slider = form.querySelector(`#${setting.id}`);
        const valueDisplay = slider?.closest('.slider-container')?.querySelector('.slider-value');

        if (slider && valueDisplay && onChange) {
          slider.addEventListener('input', function () {
            valueDisplay.textContent = slider.value;
            onChange(setting.id, parseFloat(slider.value));
          });
        }
      }
    });

    
    // Register more components here...
  }

  // Initialize the system
  function init() {
    // Register standard component types
    registerStandardComponents();

    console.log("Component System initialized");
  }

  // Public API
  return {
    init,
    registerComponentType,
    registerValidator,
    setGlobalChangeHandler,
    setGlobalSaveHandler,
    renderComponents,
    collectValues,
    bindEvents,
    extractAllComponents
  };
})();

// Initialize the component system
document.addEventListener('DOMContentLoaded', function () {
  ComponentSystem.init();
});

// Make the component system available globally
window.ComponentSystem = ComponentSystem;