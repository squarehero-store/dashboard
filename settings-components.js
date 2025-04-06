/**
* SquareHero Dashboard - Settings Components
* Reusable UI components for plugin settings
*/

const SettingsComponents = {
  /**
   * Generate a complete settings form from schema with categories/tabs
   */
  generateForm: function (schema, currentValues = {}) {
    // First, separate categories from regular settings
    const categories = schema.filter(item => item.type === 'category');

    // If there are no categories, render a simple form
    if (categories.length === 0) {
      return `
        <div class="settings-form">
          ${schema.map(setting => this.renderSetting(setting, currentValues)).join('')}
        </div>
      `;
    }

    // Find the default category
    const defaultCategory = categories.find(cat => cat.isDefault) || categories[0];

    // Generate content for each tab - each tab contains its own settings-form
    const tabContentsHtml = categories.map(category => {
      // Get components from the category
      const categorySettings = category.components || [];

      return `
        <div class="tab-content ${category.id === defaultCategory.id ? 'active' : ''}" data-tab-content="${category.id}">
          <div class="settings-form">
            ${categorySettings.map(setting => this.renderSetting(setting, currentValues)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Return just the tab contents (tabs themselves are added in dashboard.js)
    return tabContentsHtml;
  },

  /**
   * Render a setting based on its type
   */
  renderSetting: function (setting, currentValues) {
    // Skip category type since it's handled in generateForm
    if (setting.type === 'category') {
      return '';
    }

    // Add width class if specified
    const widthClass = setting.width ? `form-group-${setting.width}` : '';

    switch (setting.type) {
      case 'dropdown':
        return this.renderDropdown(setting, currentValues, widthClass);
      case 'toggle':
        return this.renderToggle(setting, currentValues, widthClass);
      case 'text':
        return this.renderTextField(setting, currentValues, widthClass);
      case 'color':
        return this.renderColorPicker(setting, currentValues, widthClass);
      case 'number':
        return this.renderNumberInput(setting, currentValues, widthClass);
      case 'radio':
        return this.renderRadioGroup(setting, currentValues, widthClass);
      case 'slider':
        return this.renderSlider(setting, currentValues, widthClass);
      case 'title':
        return this.renderTitleField(setting, currentValues, widthClass);
      case 'checkbox-group':
        return this.renderCheckboxGroup(setting, currentValues, widthClass);
        case 'custom':
  return this.renderCustomComponent(setting, currentValues, widthClass);
      default:
        return `<p>Unknown setting type: ${setting.type}</p>`;
    }
  },

  

  /**
 * Custom component renderer
 */
  renderCustomComponent: function(setting, currentValues, widthClass) {
    console.log(`Rendering custom component: ${setting.id}`);
    
    // Use a consistent ID format that matches what property-manager.js expects
    return `
      <div class="form-group ${widthClass || 'form-group-full'}">
        <div id="${setting.id}-container" class="custom-component-container" 
             data-component-id="${setting.id}" 
             data-script="${setting.script}">
          <div class="loading-indicator">
            <p>Loading ${setting.label}...</p>
          </div>
        </div>
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
   * Dropdown select component
   */
  renderDropdown: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;
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

  /**
   * Toggle switch component
   */
  renderToggle: function (setting, currentValues, widthClass) {
    const checked = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;
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

  /**
   * Text field component
   */
  renderTextField: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || '');
    return `
      <div class="form-group ${widthClass}">
        <label for="${setting.id}">${setting.label}</label>
        <input type="text" id="${setting.id}" name="${setting.id}" value="${value}" 
               class="setting-input" ${setting.placeholder ? `placeholder="${setting.placeholder}"` : ''}>
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
   * Title component
   */
  renderTitleField: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || '');
    return `
      <div class="form-group ${widthClass}">
        <h4 for="${setting.id}">${setting.label}</h4>
      </div>
    `;
  },



  /**
   * Enhanced color picker component with Squarespace palette integration
   */
  renderColorPicker: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || '#000000');
    const isSquarespaceVar = typeof value === 'string' && value.includes('hsla(var(--');

    return `
      <div class="form-group color-picker-group ${widthClass}">
        <label for="${setting.id}">${setting.label}</label>
        
        <div class="color-picker-compact" data-setting-id="${setting.id}">
          <div class="current-color-display" style="background-color: ${value};">
            <span class="color-value hidden-visually">${isSquarespaceVar ? 'Site Color' : value}</span>
          </div>
          
          <div class="color-picker-expanded" style="display: none;">
            <div class="color-picker-tab-buttons">
              <button type="button" class="tab-button ${isSquarespaceVar ? 'active' : ''}" data-tab="palette">Palette</button>
              <button type="button" class="tab-button ${!isSquarespaceVar ? 'active' : ''}" data-tab="custom">Custom</button>
            </div>
            
            <div class="color-picker-tab-content">
              <div class="tab-panel ${isSquarespaceVar ? 'active' : ''}" data-panel="palette">
                <div class="palette-swatches">
                  <button type="button" class="color-swatch" data-for="${setting.id}" data-color-var="hsla(var(--white-hsl), 1)" style="background-color: hsla(var(--white-hsl), 1);"></button>
                  <button type="button" class="color-swatch" data-for="${setting.id}" data-color-var="hsla(var(--lightAccent-hsl), 1)" style="background-color: hsla(var(--lightAccent-hsl), 1);"></button>
                  <button type="button" class="color-swatch" data-for="${setting.id}" data-color-var="hsla(var(--accent-hsl), 1)" style="background-color: hsla(var(--accent-hsl), 1);"></button>
                  <button type="button" class="color-swatch" data-for="${setting.id}" data-color-var="hsla(var(--darkAccent-hsl), 1)" style="background-color: hsla(var(--darkAccent-hsl), 1);"></button>
                  <button type="button" class="color-swatch" data-for="${setting.id}" data-color-var="hsla(var(--black-hsl), 1)" style="background-color: hsla(var(--black-hsl), 1);"></button>
                </div>
              </div>
              
              <div class="tab-panel ${!isSquarespaceVar ? 'active' : ''}" data-panel="custom">
                <div class="color-input-container">
                  <input type="color" id="${setting.id}" name="${setting.id}" value="${!isSquarespaceVar ? value : '#ffffff'}" class="color-input" data-used-var="${isSquarespaceVar ? value : ''}">
                  <input type="text" id="${setting.id}-hex" value="${!isSquarespaceVar ? value : '#ffffff'}" class="color-hex-input" data-color-for="${setting.id}">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
   * Number input component
   */
  renderNumberInput: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || 0);
    return `
      <div class="form-group ${widthClass}">
        <label for="${setting.id}">${setting.label}</label>
        <input type="number" id="${setting.id}" name="${setting.id}" value="${value}" 
               min="${setting.min || 0}" max="${setting.max || 100}" step="${setting.step || 1}" class="setting-input">
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
   * Radio group component
   */
  renderRadioGroup: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : setting.default;
    return `
      <div class="form-group ${widthClass}">
        <label class="group-label">${setting.label}</label>
        <div class="radio-group">
          ${setting.options.map(option => `
            <label class="radio-label">
              <input type="radio" name="${setting.id}" value="${option.value}" ${value === option.value ? 'checked' : ''}>
              <span>${option.label}</span>
            </label>
          `).join('')}
        </div>
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
   * Slider component
   */
  renderSlider: function (setting, currentValues, widthClass) {
    const value = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || 0);
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

  /**
   * Checkbox group component
   */
  renderCheckboxGroup: function (setting, currentValues, widthClass) {
    const values = currentValues[setting.id] !== undefined ? currentValues[setting.id] : (setting.default || []);
    return `
      <div class="form-group ${widthClass}">
        <label class="group-label">${setting.label}</label>
        <div class="checkbox-group">
          ${setting.options.map(option => `
            <label class="checkbox-label">
              <input type="checkbox" name="${setting.id}[]" value="${option.value}" 
                     ${values.includes(option.value) ? 'checked' : ''}>
              <span>${option.label}</span>
            </label>
          `).join('')}
        </div>
        ${setting.helpText ? `<p class="setting-help">${setting.helpText}</p>` : ''}
      </div>
    `;
  },

  /**
 * Collect all form values according to schema
 */
  collectFormValues: function (form, schema) {
    console.log(`Collecting form values using schema with ${schema.length} items`);

    // Extract all settings from all tabs/categories
    let allSettings = [];

    // Add direct settings from schema (non-category items)
    allSettings = allSettings.concat(schema.filter(item => item.type !== 'category'));

    // Add settings from each category
    schema.filter(item => item.type === 'category').forEach(category => {
      if (Array.isArray(category.components)) {
        allSettings = allSettings.concat(category.components);
      }
    });

    console.log(`Total settings to collect: ${allSettings.length}`);

    // Now collect values from all settings, looking in the entire panel content (not just form)
    const panelContent = document.getElementById('panel-content');

    return allSettings.reduce((values, setting) => {
      // Skip category items
      if (setting.type === 'category') return values;


      // Get value based on type - first try to find by ID then by name
      let element = panelContent.querySelector(`#${setting.id}`);
      if (!element) {
        element = panelContent.querySelector(`[name="${setting.id}"]`);
      }

      if (!element) {
        console.log(`Element for setting ${setting.id} not found, using default: ${setting.default}`);
        values[setting.id] = setting.default;
        return values;
      }

      switch (setting.type) {
        case 'custom':
            // For custom components, check the data registry
            const pluginId = activePanel; // This should be available in the scope
            if (window.Dashboard && window.Dashboard.CustomComponentDataRegistry) {
                const customData = window.Dashboard.CustomComponentDataRegistry.get(pluginId, setting.id);
                if (customData) {
                    values[setting.id] = customData;
                }
            }
            break;

        case 'toggle':
          // IMPORTANT: Explicitly convert to boolean and log the value
          const isChecked = element.checked === true;
          console.log(`Toggle ${setting.id} value: ${isChecked} (raw checked: ${element.checked})`);
          values[setting.id] = isChecked;
          break;

        case 'number':
        case 'slider':
          const numValue = parseFloat(element.value);
          console.log(`Number/slider ${setting.id} value: ${numValue}`);
          values[setting.id] = numValue;
          break;

        case 'radio':
          const checkedEl = panelContent.querySelector(`[name="${setting.id}"]:checked`);
          const radioValue = checkedEl ? checkedEl.value : setting.default;
          console.log(`Radio ${setting.id} value: ${radioValue}`);
          values[setting.id] = radioValue;
          break;

        case 'checkbox-group':
          const checkboxes = panelContent.querySelectorAll(`[name="${setting.id}[]"]:checked`);
          const checkValues = Array.from(checkboxes).map(cb => cb.value);
          console.log(`Checkbox group ${setting.id} value: [${checkValues.join(', ')}]`);
          values[setting.id] = checkValues;
          break;

        case 'color':
          // Check if using a CSS variable from palette
          const usedVar = element.getAttribute('data-used-var');
          if (usedVar && usedVar.trim() !== '') {
            console.log(`Color ${setting.id} value: ${usedVar} (using CSS var)`);
            values[setting.id] = usedVar;
          } else {
            console.log(`Color ${setting.id} value: ${element.value}`);
            values[setting.id] = element.value;
          }
          break;

        default:
          console.log(`Default ${setting.id} value: ${element.value}`);
          values[setting.id] = element.value;
      }

      return values;
    }, {});
  },

  /**
   * Extract all settings from schema including nested ones in categories
   */
  extractAllSettings: function (schema) {
    // Get all non-category settings from schema
    const settingsSchema = schema.filter(item => item.type !== 'category');

    // Extract components from categories
    const categoryComponents = [];
    schema.filter(item => item.type === 'category').forEach(category => {
      if (Array.isArray(category.components)) {
        categoryComponents.push(...category.components);
      }
    });

    // Return combined list
    return [...settingsSchema, ...categoryComponents];
  },

  /**
   * Get the appropriate value based on setting type
   */
  getValueForType: function (form, setting) {
    console.log(`Getting value for setting ${setting.id} (type: ${setting.type})`);

    // The critical fix: search in the entire form, not just at the top level
    // This handles the case when settings are in different tabs

    // Find elements by ID first (more reliable)
    let element = form.querySelector(`#${setting.id}`);

    // If not found by ID, try by name
    if (!element) {
      element = form.querySelector(`[name="${setting.id}"]`);
    }

    if (!element) {
      console.log(`Element for setting ${setting.id} not found, using default: ${setting.default}`);
      return setting.default;
    }

    switch (setting.type) {
      case 'toggle':
        // IMPORTANT: Explicitly convert to boolean and log the value
        const isChecked = element.checked === true;
        console.log(`Toggle ${setting.id} value: ${isChecked} (raw checked: ${element.checked})`);
        return isChecked;

      case 'number':
      case 'slider':
        const numValue = parseFloat(element.value);
        console.log(`Number/slider ${setting.id} value: ${numValue}`);
        return numValue;

      case 'radio':
        const checkedEl = form.querySelector(`[name="${setting.id}"]:checked`);
        const radioValue = checkedEl ? checkedEl.value : setting.default;
        console.log(`Radio ${setting.id} value: ${radioValue}`);
        return radioValue;

      case 'checkbox-group':
        const checkboxes = form.querySelectorAll(`[name="${setting.id}[]"]:checked`);
        const checkValues = Array.from(checkboxes).map(cb => cb.value);
        console.log(`Checkbox group ${setting.id} value: [${checkValues.join(', ')}]`);
        return checkValues;

      case 'color':
        // Check if using a CSS variable from palette
        const usedVar = element.getAttribute('data-used-var');
        if (usedVar && usedVar.trim() !== '') {
          console.log(`Color ${setting.id} value: ${usedVar} (using CSS var)`);
          return usedVar;
        }
        console.log(`Color ${setting.id} value: ${element.value}`);
        return element.value;

      default:
        console.log(`Default ${setting.id} value: ${element.value}`);
        return element.value;
    }
  },

  /**
   * Bind event handlers to form elements
   */
  bindEventHandlers: function (form, schema, onChange) {
    // Add tab switching functionality
    const tabButtons = form.querySelectorAll('.settings-tabs .tab-button');
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', function () {
          // Remove active class from all tabs and contents
          form.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
          form.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

          // Add active class to current tab and content
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          form.querySelector(`.tab-content[data-tab-content="${tabId}"]`).classList.add('active');
        });
      });
    }

    // Skip category settings when binding element handlers
    const nonCategorySettings = schema.filter(setting => setting.type !== 'category');

    nonCategorySettings.forEach(setting => {
      const element = form.querySelector(`[name="${setting.id}"]`);
      if (!element) return;

      // Color picker special handling
      if (setting.type === 'color') {
        const hexInput = form.querySelector(`#${setting.id}-hex`);

        // Add click handler to expand/collapse color picker
        const colorDisplay = form.querySelector(`.color-picker-compact[data-setting-id="${setting.id}"] .current-color-display`);
        if (colorDisplay) {
          colorDisplay.addEventListener('click', () => {
            const expanded = form.querySelector(`.color-picker-compact[data-setting-id="${setting.id}"] .color-picker-expanded`);
            if (expanded) {
              expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
            }
          });
        }

        // Add tab button handlers
        const tabButtons = form.querySelectorAll(`.color-picker-compact[data-setting-id="${setting.id}"] .color-picker-tab-buttons .tab-button`);
        tabButtons.forEach(button => {
          button.addEventListener('click', e => {
            const targetTab = e.target.getAttribute('data-tab');
            const settingParent = e.target.closest('.color-picker-compact');
            const settingId = settingParent.getAttribute('data-setting-id');

            // Update active state on tabs
            settingParent.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Show the correct panel
            const panels = settingParent.querySelectorAll('.tab-panel');
            panels.forEach(panel => {
              panel.classList.toggle('active', panel.getAttribute('data-panel') === targetTab);
            });

            // If switching to palette tab, clear the custom color var
            if (targetTab === 'palette') {
              // Nothing needed here - will be set when palette color is clicked
            } else {
              // If switching to custom tab, clear any palette selection
              const swatches = settingParent.querySelectorAll('.color-swatch');
              swatches.forEach(s => s.classList.remove('selected'));
              element.setAttribute('data-used-var', '');
            }
          });
        });

        // Add swatch click handlers
        const swatches = form.querySelectorAll('.color-swatch[data-for="' + setting.id + '"]');
        swatches.forEach(swatch => {
          swatch.addEventListener('click', e => {
            const colorVar = e.target.getAttribute('data-color-var');
            const settingId = e.target.getAttribute('data-for');
            const colorInput = form.querySelector(`#${settingId}`);
            const hexInput = form.querySelector(`#${settingId}-hex`);

            // Set the input to use the CSS variable
            colorInput.setAttribute('data-used-var', colorVar);

            // Highlight the selected swatch
            const parentPanel = e.target.closest('.tab-panel');
            parentPanel.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');

            // Update the displayed color
            const colorDisplay = form.querySelector(`.color-picker-compact[data-setting-id="${settingId}"] .current-color-display`);
            if (colorDisplay) {
              colorDisplay.style.backgroundColor = e.target.style.backgroundColor;
            }

            // Call onChange with the CSS variable
            if (onChange) onChange(settingId, colorVar);
          });
        });

        // Regular color input handlers
        element.addEventListener('input', e => {
          // Clear any selected CSS variable
          element.setAttribute('data-used-var', '');

          // Update hex input
          if (hexInput) hexInput.value = e.target.value;

          // Remove swatch selections
          const settingParent = e.target.closest('.color-picker-group');
          const swatches = settingParent.querySelectorAll('.color-swatch');
          swatches.forEach(s => s.classList.remove('selected'));

          // Update the displayed color
          const colorDisplay = form.querySelector(`.color-picker-compact[data-setting-id="${setting.id}"] .current-color-display`);
          if (colorDisplay) {
            colorDisplay.style.backgroundColor = e.target.value;
          }

          // Call onChange handler
          if (onChange) onChange(setting.id, e.target.value);
        });

        if (hexInput) {
          hexInput.addEventListener('input', e => {
            // If it looks like a CSS variable, don't try to validate as hex
            if (e.target.value.startsWith('hsla(')) {
              return;
            }

            // Ensure valid hex
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
              element.value = e.target.value;
              element.setAttribute('data-used-var', '');

              // Remove swatch selections
              const settingParent = e.target.closest('.color-picker-group');
              const swatches = settingParent.querySelectorAll('.color-swatch');
              swatches.forEach(s => s.classList.remove('selected'));

              // Update the displayed color
              const colorDisplay = form.querySelector(`.color-picker-compact[data-setting-id="${setting.id}"] .current-color-display`);
              if (colorDisplay) {
                colorDisplay.style.backgroundColor = e.target.value;
              }

              if (onChange) onChange(setting.id, e.target.value);
            }
          });
        }
        return;
      }

      // Slider handlers
      if (setting.type === 'slider') {
        const slider = form.querySelector(`#${setting.id}`);
        const valueDisplay = slider?.closest('.slider-container')?.querySelector('.slider-value');

        if (slider && valueDisplay) {
          slider.addEventListener('input', function (e) {
            valueDisplay.textContent = e.target.value;
            if (onChange) {
              onChange(setting.id, parseFloat(e.target.value));
            }
          });
        }
        return;
      }

      // Checkbox group handlers
      if (setting.type === 'checkbox-group') {
        const checkboxes = form.querySelectorAll(`[name="${setting.id}[]"]`);

        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', function () {
            const checkedValues = Array.from(
              form.querySelectorAll(`[name="${setting.id}[]"]:checked`)
            ).map(cb => cb.value);

            if (onChange) {
              onChange(setting.id, checkedValues);
            }
          });
        });
        return;
      }

      // After handling other component types:
if (setting.type === 'custom') {
  const container = form.querySelector(`#${setting.id}-container`);
  if (!container) return;
  
  // Load the custom script if it's not already loaded
  const scriptPath = setting.script;
  if (scriptPath && !document.querySelector(`script[src="${scriptPath}"]`)) {
    // Create a script element to load the custom component
    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = function() {
      console.log(`Custom component script loaded: ${scriptPath}`);
      // The script will handle its own initialization
    };
    script.onerror = function() {
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

      // All other elements
      const eventType = setting.type === 'toggle' ? 'change' : 'input';
      element.addEventListener(eventType, e => {
        const value = this.getValueForType(form, setting);
        if (onChange) onChange(setting.id, value);
      });
    });
  }
};