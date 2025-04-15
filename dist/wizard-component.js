function isWizardSetupRequired(e){if("true"===localStorage.getItem("force_wizard_setup"))return!0;return!("true"===localStorage.getItem(`${e}_completed`))}function resetWizardState(e){return localStorage.removeItem(`${e}_completed`),console.log(`Wizard state reset for: ${e}`),!0}function setWizardTestMode(e){return"force"===e?(localStorage.setItem("force_wizard_setup","true"),console.log("Wizard forced to show for testing"),!0):(localStorage.removeItem("force_wizard_setup"),console.log("Wizard test mode reset"),!1)}function enableWizardDebug(){return localStorage.setItem("wizard_debug","true"),console.log("Wizard debug mode enabled"),!0}function disableWizardDebug(){return localStorage.removeItem("wizard_debug"),console.log("Wizard debug mode disabled"),!1}ComponentSystem.registerComponentType("wizard",{render:function(e,t){e.steps;const o=t[`${e.id}-current-step`]||0;return`\n        <div class="wizard-container" data-wizard-id="${e.id}" data-current-step="${o}">\n          <div class="wizard-content">\n            \x3c!-- Step content will be inserted here --\x3e\n          </div>\n          \n          \x3c!-- Fixed progress dots container --\x3e\n          <div class="wizard-progress-container">\n            <div class="wizard-progress">\n              ${Array(3).fill().map(((e,t)=>'<span class="wizard-progress-dot"></span>')).join("")}\n            </div>\n          </div>\n        </div>\n      `},bindEvents:function(e,t,o){const n=e.querySelector(`.wizard-container[data-wizard-id="${t.id}"]`);if(!n)return;const i=t.steps||[];let s=parseInt(n.getAttribute("data-current-step")||0);const l=[];let a=0;const d=e=>{n.querySelectorAll(".wizard-progress-dot").forEach(((t,o)=>{t.classList.toggle("active",o===e),t.classList.toggle("completed",o<e)}))},r=(e,r=!0)=>{if(console.log(`Rendering step ${e}`),e<0||e>=i.length)return void console.error(`Invalid step index: ${e}`);r&&s!==e&&(l.push(s),console.log(`Added step ${s} to history. History: ${l}`));const c=i[e];console.log(`Step ID: ${c.id}, conditional: ${!!c.conditional}`);const u=n.querySelector(".wizard-content");let g=`\n          <div class="wizard-step" data-step-id="${c.id}">\n            ${c.image?`<div class="wizard-step-image"><img src="${c.image}" alt="${c.title||""}"></div>`:""}\n            \n            <div class="wizard-step-header">\n              ${c.title?`<h2 class="wizard-step-title">${c.title}</h2>`:""}\n            </div>\n            \n            <div class="wizard-step-body">\n              ${c.content?`<p class="wizard-step-content">${c.content}</p>`:""}\n              \n              <div class="wizard-step-components">\n                ${(c.components||[]).map((e=>ComponentSystem.renderComponents([e],{}))).join("")}\n              </div>\n            </div>\n            \n            \x3c!-- Navigation stays with the content --\x3e\n            <div class="wizard-navigation">\n              <button type="button" class="wizard-back-button ${0===e?"hidden":""}">Back</button>\n              <button type="button" class="wizard-next-button">${e===i.length-1?"Finish":"Continue"}</button>\n            </div>\n          </div>\n        `;if(u.innerHTML=g,c.components&&c.components.length>0&&(ComponentSystem.bindEvents(u,c.components,o),c.conditional)){c.components.filter((e=>"button-group"===e.type)).forEach((e=>{const t=u.querySelector(`.button-group-container[data-component-id="${e.id}"]`);if(t){t.querySelectorAll(".button-option").forEach((t=>{const o=t.getAttribute("data-value"),n=e.options.find((e=>e.value===o));n&&n.nextStep&&(t.setAttribute("data-next-step",n.nextStep),console.log(`Set data-next-step="${n.nextStep}" for option ${o}`))}))}}))}var b;"welcome"===c.id?a=0:"existing-collection"===c.id||"create-collection"===c.id?a=1:"complete"===c.id&&(a=2),d(a),s=b=e,n.setAttribute("data-current-step",b),o&&o(`${t.id}-current-step`,b),p(u)},c=e=>{const t=e.querySelector(".wizard-validation-error");t&&t.remove();const o=e.querySelector(".button-group");o&&o.classList.remove("validation-highlight")},p=e=>{const t=e.querySelector(".wizard-back-button"),o=e.querySelector(".wizard-next-button");if(t&&t.addEventListener("click",(()=>{if(l.length>0){const e=l.pop();console.log(`Going back to step ${e}. Remaining history: ${l}`),r(e,!1)}})),o){const t=i[s];if(t&&!0===t.conditional){const t=e.querySelector(".button-group-container");if(t){if(!t.querySelector(".button-option.selected")){const e=t.querySelector(".button-group");e&&e.classList.add("selection-required")}}}o.addEventListener("click",u)}},u=()=>{console.log("----------------------------------------"),console.log("NEXT BUTTON CLICKED - NAVIGATION LOGIC:");const o=i[s];if(console.log(`Current step: ${o.id} (index: ${s})`),s!==i.length-1){if(!0===o.conditional){console.log("This step is CONDITIONAL - checking selected button");const e=n.querySelector(".wizard-content"),t=e.querySelector(".button-option.selected");if(!t)return console.log("ERROR: No button is selected!"),void((e,t)=>{c(e);const o=document.createElement("div");o.className="wizard-validation-error",o.textContent=t;const n=e.querySelector(".wizard-navigation");n?n.parentNode.insertBefore(o,n):e.appendChild(o);const i=e.querySelector(".button-group");i&&i.classList.add("validation-highlight")})(e,"Please select an option to continue");{c(e);const n=t.getAttribute("data-value");console.log(`Selected button value: ${n}`);const s=t.getAttribute("data-next-step");if(s){console.log(`Found data-next-step attribute: ${s}`);const e=i.findIndex((e=>e.id===s));if(-1!==e)return console.log(`SUCCESS! Navigating to step index: ${e} (id: ${s})`),void r(e);console.log(`ERROR: Step with ID "${s}" not found in steps array!`),console.log("Available step IDs:",i.map((e=>e.id)))}else console.log("WARNING: No data-next-step attribute found on button element");const l=o.components.find((e=>"button-group"===e.type&&e.options&&e.options.some((e=>e.value===n))));if(l){const e=l.options.find((e=>e.value===n));if(e)if(e.nextStep){console.log(`Found nextStep in schema: ${e.nextStep}`);const t=i.findIndex((t=>t.id===e.nextStep));if(-1!==t)return console.log(`SUCCESS! Navigating to step index: ${t} (id: ${e.nextStep})`),void r(t);console.log(`ERROR: Step with ID "${e.nextStep}" not found in steps array!`),console.log("Available step IDs:",i.map((e=>e.id)))}else console.log("ERROR: The selected option does not have a nextStep property in schema!"),console.log("Schema option:",e);else console.log(`ERROR: Could not find option with value "${n}" in schema!`)}else console.log("ERROR: Could not find button component in step schema!")}}else console.log("This step is NOT conditional");if(o.nextStep){console.log(`Step has direct nextStep property: ${o.nextStep}`);const e=i.findIndex((e=>e.id===o.nextStep));if(-1!==e)return console.log(`Navigating to step index: ${e}`),void r(e);console.log(`ERROR: Step with ID "${o.nextStep}" not found in steps array!`)}console.log(`Falling back to sequential navigation: going to step ${s+1}`),r(s+1)}else{if(console.log("This is the last step - handling completion"),t.onComplete&&"function"==typeof t.onComplete){const o=ComponentSystem.collectValues(e,t.steps.flatMap((e=>e.components||[])));t.onComplete(e,o)}if(t.id&&(localStorage.setItem(`${t.id}_completed`,"true"),t.completionCallback&&"function"==typeof window[t.completionCallback])){const o=ComponentSystem.collectValues(e,t.steps.flatMap((e=>e.components||[])));window[t.completionCallback](o)}t.hideOnComplete&&(n.style.display="none")}};if(d(a),r(s,!1),t.clickableDots){n.querySelectorAll(".wizard-progress-dot").forEach(((e,t)=>{e.style.cursor="pointer",e.addEventListener("click",(()=>{let e;if(0===t)e=i.findIndex((e=>"welcome"===e.id));else if(1===t){const t=i.find((e=>("existing-collection"===e.id||"create-collection"===e.id)&&l.includes(i.findIndex((t=>t.id===e.id)))));e=t?i.findIndex((e=>e.id===t.id)):i.findIndex((e=>"existing-collection"===e.id))}else 2===t&&(e=i.findIndex((e=>"complete"===e.id)));e>=0&&(l.length=0,r(e,!1))}))}))}},getValue:function(e,t){const o=e.querySelector(`.wizard-container[data-wizard-id="${t.id}"]`);if(!o)return 0;return o.getAttribute("data-current-step")||0},defaults:{clickableDots:!1,hideOnComplete:!1}}),ComponentSystem.registerComponentType("button-group",{render:function(e,t){const o=void 0!==t[e.id]?t[e.id]:e.default;return console.log("Rendering button group with options:",e.options),`\n      <div class="button-group-container" data-component-id="${e.id}">\n        <div class="button-group">\n          ${e.options.map((e=>(console.log("Option:",e.value,"nextStep:",e.nextStep),`\n              <div class="button-option ${o===e.value?"selected":""}" \n                   data-value="${e.value}" \n                   ${e.nextStep?`data-next-step="${e.nextStep}"`:""}>\n                ${e.icon?`<div class="button-option-icon">${e.icon}</div>`:""}\n                <div class="button-option-content">\n                  <div class="button-option-label">${e.label}</div>\n                  ${e.description?`<div class="button-option-description">${e.description}</div>`:""}\n                </div>\n              </div>`))).join("")}\n        </div>\n        ${e.helpText?`<p class="setting-help">${e.helpText}</p>`:""}\n      </div>\n    `},bindEvents:function(e,t,o){const n=e.querySelector(`.button-group-container[data-component-id="${t.id}"]`);if(!n)return;const i=n.querySelectorAll(".button-option");console.log("Button group options found:",i.length),i.forEach((e=>{console.log("DOM Option:",e.getAttribute("data-value"),"data-next-step:",e.getAttribute("data-next-step"))})),i.forEach((e=>{e.addEventListener("click",(()=>{console.log(`Button option clicked: ${e.getAttribute("data-value")}`),console.log(`Next step: ${e.getAttribute("data-next-step")||"none"}`),i.forEach((e=>e.classList.remove("selected"))),e.classList.add("selected");const n=e.getAttribute("data-value");o&&o(t.id,n)}))}))},getValue:function(e,t){const o=e.querySelector(`.button-group-container[data-component-id="${t.id}"]`);if(!o)return t.default||"";const n=o.querySelector(".button-option.selected");return n?n.getAttribute("data-value"):t.default||""}}),window.isWizardSetupRequired=isWizardSetupRequired,window.resetWizardState=resetWizardState,window.setWizardTestMode=setWizardTestMode,window.enableWizardDebug=enableWizardDebug,window.disableWizardDebug=disableWizardDebug;