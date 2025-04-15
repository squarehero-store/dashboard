# SquareHero Plugin Dashboard

This repository contains the SquareHero Plugin Dashboard - a configurable dashboard system for Squarespace sites that allows users to manage plugins and settings.

## Table of Contents
- [SCSS Structure](#scss-structure)
- [Bundling System](#bundling-system)
- [Development Workflow](#development-workflow)
- [Deploying to Squarespace](#deploying-to-squarespace)
- [Using with jsDelivr CDN](#using-with-jsdelivr-cdn)

## Bundling System

This project uses webpack to bundle all assets (HTML, JS, CSS) into a single JavaScript file that can be injected into Squarespace. The bundling system:

1. Combines all CSS files into a single CSS file
2. Includes all JavaScript dependencies
3. Packages the dashboard HTML
4. Creates a self-executing script that injects everything into a target div

### Key Files

- `src/injector.js` - The main entry point for webpack that handles injection
- `webpack.config.js` - Configuration for the bundling process
- `dist/squarehero-dashboard-bundle.js` - The final bundled file for deployment

## Development Workflow

### Prerequisites

1. Make sure you have Node.js installed on your machine
2. Run `npm install` in the project directory to install dependencies

### Development Commands

- **Build for production:**
  ```
  npm run build
  ```

- **Build for development (with source maps):**
  ```
  npm run build:dev
  ```

- **Watch files and rebuild automatically:**
  ```
  npm run watch
  ```

### Development Process

1. **During development:**
   - Work on individual files (HTML, CSS, JS) as normal
   - Use `npm run sass` to compile SCSS files as needed

2. **To test changes:**
   - Run `npm run build` to bundle everything into the dist folder
   - Use the generated `dist/squarehero-dashboard-bundle.js` file on Squarespace

3. **For continuous development:**
   - Run `npm run watch` to automatically rebuild when files change

## Deploying to Squarespace

1. **Build the bundle:**
   ```
   npm run build
   ```

2. **In Squarespace:**
   - Go to Settings > Advanced > Code Injection
   - In the "Header" section, add:
     ```html
     <div id="squarehero-dashboard-container"></div>
     ```
   - In the "Footer" section, add:
     ```html
     <script src="https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/dist/squarehero-dashboard-bundle.js"></script>
     ```

**Note:** If the target div `squarehero-dashboard-container` doesn't exist, the bundle will create it automatically.

## Using with jsDelivr CDN

This project is configured to be hosted on jsDelivr at:
```
https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest
```

### Versioning

- Use `@latest` for the most recent version
- Use `@0` to lock to a major version (e.g., `@0` for all 0.x.x versions)
- Use `@0.1.2` to lock to a specific version

### Updating jsDelivr Paths

When deploying:

1. The main bundle and CSS files will be available at:
   ```
   https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/squarehero-dashboard-bundle.js
   https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/squarehero-dashboard-styles.css
   ```

2. Other assets (like images) will be available at:
   ```
   https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/assets/sh-logo.png
   ```

3. Plugins will be available at:
   ```
   https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/plugins/real-estate-listings/settings.js
   ```

To automatically update paths for jsDelivr in the bundled file, you can modify the webpack.config.js file to add a public path:

```javascript
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: 'squarehero-dashboard-bundle.js',
  publicPath: 'https://cdn.jsdelivr.net/gh/squarehero-store/dashboard@latest/',
  clean: true
}
```

## SCSS Structure

This project uses SCSS (Sass) for more organized and maintainable CSS. The SCSS files are structured in a modular way and compiled into a hybrid approach - one main CSS file for core dashboard styles and separate CSS files for each plugin.

### Directory Structure

The SCSS files are organized as follows:

```
scss/                           # Main dashboard SCSS files
  dashboard.scss                # Main entry file that imports all core partials
  components/                   # Component-specific styles
    _buttons.scss               # Button styles
    _cards.scss                 # Card component styles
    _forms.scss                 # Form element styles
    _notifications.scss         # Notification and alert styles
    _plugin-settings.scss       # Plugin settings UI styles
  layout/                       # Layout-related styles
    _dashboard.scss             # Main dashboard layout
    _header.scss                # Header styles
    _panels.scss                # Panel and modal styles
    _tabs.scss                  # Tabs and navigation styles
  utils/                        # Utilities
    _mixins.scss                # Reusable mixins
    _variables.scss             # Variables for colors, sizes, etc.

plugins/                        # Plugin-specific SCSS files
  real-estate-listings/         
    scss/                      
      property-manager.scss     # Property manager specific styles
      wizard.scss               # Wizard component styles
```

### Compiling SCSS to CSS

You can use the following npm scripts to compile your SCSS files to CSS:

- **Watch all SCSS files for changes and compile automatically:**
  ```
  npm run sass
  ```

- **Compile all SCSS files once with compressed output (for production):**
  ```
  npm run sass:build
  ```

- **Watch only the main dashboard SCSS:**
  ```
  npm run sass:dashboard
  ```

- **Watch only the plugin-specific SCSS:**
  ```
  npm run sass:plugins
  ```

### Compilation Strategy

This project uses a hybrid compilation approach:

1. **Core Dashboard**: All core dashboard styles are compiled into a single `dashboard.css` file
   - Reduces HTTP requests for the main dashboard
   - Ensures consistent styling across the core UI

2. **Plugin-Specific**: Each plugin maintains its own separate CSS files
   - Keeps plugin styles isolated from core styles
   - Allows plugins to be updated independently
   - Makes debugging plugin-specific style issues easier

### How to Make Changes

1. Edit the appropriate SCSS file(s) based on what you want to change:
   - For colors, sizes, and other variables, edit `scss/utils/_variables.scss`
   - For layout changes, edit the relevant file in `scss/layout/`
   - For component styles, edit the relevant file in `scss/components/`
   - For plugin-specific styles, edit the files in `plugins/[plugin-name]/scss/`

2. Run one of the compilation commands above to process your changes.

3. The compiled CSS will automatically overwrite the corresponding CSS file:
   - `scss/dashboard.scss` compiles to `dashboard.css`
   - `plugins/real-estate-listings/scss/property-manager.scss` compiles to `plugins/real-estate-listings/property-manager.css`
   - `plugins/real-estate-listings/scss/wizard.scss` compiles to `plugins/real-estate-listings/wizard.css`

### Adding Styles for New Plugins

For new plugins, create a similar structure:

1. Create a `scss` directory in your plugin folder:
   ```
   mkdir -p plugins/your-plugin-name/scss
   ```

2. Create SCSS files for your plugin components. Make sure to import the variables and mixins:
   ```scss
   // Import variables and mixins from main SCSS
   @import '../../../scss/utils/variables';
   @import '../../../scss/utils/mixins';

   // Your plugin-specific styles here
   ```

3. To watch and compile your new plugin's SCSS files, run:
   ```
   sass --watch plugins/your-plugin-name/scss:plugins/your-plugin-name
   ```

4. To add this permanently to your workflow, update the `sass:plugins` script in `package.json`.

### Benefits of This SCSS Structure

- **Organization**: Styles are grouped by function and purpose
- **Maintainability**: Smaller, focused files are easier to manage
- **DRY Code**: Variables and mixins prevent repetition
- **Nesting**: Proper nesting keeps related styles together
- **Consistency**: Shared variables ensure a consistent look
