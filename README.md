# GitHub to Sourcegraph

A browser extension for Chrome and Firefox that adds a banner to GitHub repository pages with a link to view the same repository on Sourcegraph. This makes it easy to switch from GitHub to Sourcegraph for enhanced code navigation and searching.

## Features

- Adds a banner below the GitHub header with a Sourcegraph link
- Automatically detects if you're viewing a file or repository and creates the appropriate link
- For files, links directly to the same file in Sourcegraph
- Fully configurable for:
  - Custom GitHub domains (for enterprise GitHub instances)
  - Custom Sourcegraph instances
  - Specific GitHub organizations to enable the extension for

## Installation

### Chrome
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension should now be installed and active

### Firefox
1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..." and select the manifest.json file in the extension directory
4. The extension should now be installed and active temporarily (will be removed when Firefox is closed)

For permanent installation in Firefox:
1. Pack the extension into a .xpi file (zip the contents with .xpi extension)
2. Go to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the .xpi file you created

## Configuration

After installing the extension, click on the extension options to configure:

1. **GitHub URL**: Specify your GitHub domain (default: `github.com`)
   - For GitHub Enterprise, use your custom domain (e.g., `github.mycompany.com`)

2. **Sourcegraph URL**: Set your Sourcegraph instance URL (default: `https://sourcegraph.com`)
   - For private Sourcegraph instances, use your custom URL (e.g., `https://sourcegraph.mycompany.com`)

3. **GitHub Organizations**: Choose which GitHub organizations to enable the extension for
   - Leave blank to enable for all GitHub repositories (default)
   - Enter specific organization names (one per line) to restrict to only those organizations

## Usage

Once installed and configured, simply browse GitHub repositories as normal:

- When viewing any GitHub repository, a blue banner will appear below the header with a link to view the same repository in Sourcegraph
- When viewing a specific file, the banner will link directly to that same file in Sourcegraph
- Links open in a new tab, so you can easily reference both GitHub and Sourcegraph at the same time

## Customization

- Replace the placeholder icons in the `images` folder with actual PNG icons of the appropriate sizes (16x16, 48x48, and 128x128)
- Modify the styling of the banner in `content.js` if desired

## Contributing

Feel free to submit issues or pull requests to improve the extension.

## License

MIT