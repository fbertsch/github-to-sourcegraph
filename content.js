// Default values
const DEFAULT_GITHUB_URL = 'github.com';
const DEFAULT_SOURCEGRAPH_URL = 'https://sourcegraph.com';
const DEFAULT_GITHUB_ORGS = '';  // Empty string for all organizations

// Set retry mechanism constants
const MAX_RETRIES = 10;
const RETRY_DELAY = 300; // milliseconds
let retryCount = 0;

// Initialize extension options
window.extensionOptions = {
  githubUrl: DEFAULT_GITHUB_URL,
  sourcegraphUrl: DEFAULT_SOURCEGRAPH_URL,
  githubOrgs: DEFAULT_GITHUB_ORGS
};

// Retrieve extension options and initialize banner
function initializeExtension() {
  console.log("Initializing GitHub to Sourcegraph extension...");
  
  // Start with default values
  window.extensionOptions = {
    githubUrl: DEFAULT_GITHUB_URL,
    sourcegraphUrl: DEFAULT_SOURCEGRAPH_URL,
    githubOrgs: DEFAULT_GITHUB_ORGS
  };
  
  // Try to add banner immediately with defaults
  tryAddSourcegraphBanner();
  
  // Then load any saved options asynchronously
  try {
    // Use browser API for Firefox or chrome API for Chrome
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    
    storage.sync.get({
      githubUrl: DEFAULT_GITHUB_URL,
      sourcegraphUrl: DEFAULT_SOURCEGRAPH_URL,
      githubOrgs: DEFAULT_GITHUB_ORGS
    }, function(options) {
      console.log("Loaded saved options:", options);
      // Update options and refresh the banner if options differ from defaults
      if (JSON.stringify(options) !== JSON.stringify(window.extensionOptions)) {
        window.extensionOptions = options;
        tryAddSourcegraphBanner();
      }
    });
  } catch (error) {
    console.error("Error loading options:", error);
    // Continue with defaults if options can't be loaded
  }
}

// Main function to add the banner
function tryAddSourcegraphBanner() {
  try {
    // Get the current URL and print it for debugging
    const currentUrl = window.location.href;
    console.log("EXTENSION RUNNING ON URL:", currentUrl);
    
    // Always remove any existing banner first to ensure fresh creation
    removeExistingBanner();
    
    // Get configured GitHub URL (default to github.com)
    const githubUrl = window.extensionOptions.githubUrl || DEFAULT_GITHUB_URL;
    
    // Check if we're on a GitHub page
    if (!currentUrl.includes(githubUrl)) {
      console.log(`Not on configured GitHub domain (${githubUrl}), exiting`);
      return;
    }

    // Parse the URL to get repository and file path information
    const pathname = window.location.pathname;
    
    // Log the full information for debugging
    console.log("Current URL:", currentUrl);
    console.log("Pathname:", pathname);
    
    // Split the path into components
    const urlParts = pathname.split('/').filter(part => part.length > 0);
    console.log("URL parts after filtering:", urlParts);
    
    // Must have at least org/repo parts
    if (urlParts.length < 2) {
      console.log("URL lacks org/repo parts, exiting");
      return;
    }
    
    const orgName = urlParts[0]; // Organization name
    const repoName = urlParts[1]; // Repository name
    
    console.log("Organization:", orgName);
    console.log("Repository:", repoName);
    
    // Check if we should process this organization
    if (!shouldProcessOrg(orgName)) {
      console.log(`Organization ${orgName} is not in the configured list, exiting`);
      return;
    }
    
    // Determine if we're viewing a file and construct the appropriate Sourcegraph URL
    let sourcegraphUrl = '';
    let linkText = '';
    
    // Get configured Sourcegraph URL (default to https://sourcegraph.com)
    const sourcegraphBaseUrl = window.extensionOptions.sourcegraphUrl || DEFAULT_SOURCEGRAPH_URL;
    
    // Check if we're in a file view (standard pattern is /org/repo/blob/branch/path/to/file)
    // or if we're in a tree view (standard pattern is /org/repo/tree/branch/path/to/dir)
    const isFileView = urlParts.length > 3 && urlParts[2] === 'blob';
    const isTreeView = urlParts.length > 3 && urlParts[2] === 'tree';
    
    if (isFileView || isTreeView) {
      // The branch/tag is at index 3
      const branchOrTag = urlParts[3];
      
      // The file/directory path consists of all parts after the branch
      // We need to join all parts starting from index 4 (5th element)
      const filePath = urlParts.slice(4).join('/');
      
      console.log("Branch/Tag:", branchOrTag);
      console.log("Path:", filePath);
      
      if (isFileView) {
        // Create a Sourcegraph URL that points to the specific file at the specific branch/tag
        sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}@${branchOrTag}/-/blob/${filePath}`;
        linkText = `View this file on Sourcegraph`;
      } else {
        // For tree views (directories), link to the directory at the specific branch/tag
        sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}@${branchOrTag}/-/tree/${filePath}`;
        linkText = `View this directory on Sourcegraph`;
      }
      
      console.log("Generated Sourcegraph URL:", sourcegraphUrl);
    } else if (urlParts.length > 2 && urlParts[2] === 'tree') {
      // This is a branch/tag root with no additional path
      // Format: /org/repo/tree/branch
      const branchOrTag = urlParts[3];
      
      sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}@${branchOrTag}`;
      linkText = `View this repository on Sourcegraph`;
      
      console.log("Generated branch/tag root URL:", sourcegraphUrl);
    } else if (urlParts.length > 2 && (urlParts[2] === 'releases' || urlParts[2] === 'tags')) {
      // This is a releases or tags page
      // For releases/tags pages, link to the repository
      sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}`;
      linkText = `View this repository on Sourcegraph`;
      
      // If a specific release/tag is selected, modify the URL
      if (urlParts.length > 3 && urlParts[2] === 'releases' && urlParts[3] === 'tag') {
        const tag = urlParts[4];
        sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}@${tag}`;
        linkText = `View this repository on Sourcegraph`;
      }
    } else if (urlParts.length > 2 && urlParts[2] === 'pull') {
      // This is a pull request page
      // For pull requests, just link to the repo (Sourcegraph doesn't have direct PR links)
      sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}`;
      linkText = `View this repository on Sourcegraph`;
    } else if (urlParts.length > 2 && urlParts[2] === 'commit') {
      // This is a commit page
      // For commits, just link to the repo (Sourcegraph doesn't have direct commit links)
      sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}`;
      linkText = `View this repository on Sourcegraph`;
    } else if (urlParts.length === 2 && document.querySelector('.branch-select-menu')) {
      // We're at the repo root but there might be a non-default branch selected
      // Try to extract the current branch from the UI
      let currentBranch = null;
      
      // Try to find the branch selector element
      const branchMenuButton = document.querySelector('.branch-select-menu button');
      if (branchMenuButton) {
        // Extract the branch text, trim whitespace and remove any extra text
        const branchText = branchMenuButton.textContent.trim();
        // Check if this is something like "main" or "feature/xyz" and not "# branches"
        if (branchText && !branchText.includes('branch') && !branchText.includes('tag')) {
          currentBranch = branchText;
        }
      }
      
      if (currentBranch) {
        // If we found a branch, link to that specific branch
        sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}@${currentBranch}`;
        linkText = `View this repository on Sourcegraph`;
      } else {
        // Default to the main repository URL
        sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}`;
        linkText = `View this repository on Sourcegraph`;
      }
    } else {
      // We're in the repo root or another view
      sourcegraphUrl = `${sourcegraphBaseUrl}/github.com/${orgName}/${repoName}`;
      linkText = `View this repository on Sourcegraph`;
      console.log("Not a file view, linking to repo root");
    }
    
    console.log("FINAL URL TO USE:", sourcegraphUrl);
    console.log("LINK TEXT:", linkText);
    
    // Create the banner
    createBanner(sourcegraphUrl, linkText);
    
  } catch (error) {
    console.error("Error in GitHub to Sourcegraph extension:", error);
  }
}

// Helper function to check if we should process this organization
function shouldProcessOrg(orgName) {
  // Get the configured GitHub organizations
  const configuredOrgs = window.extensionOptions.githubOrgs || DEFAULT_GITHUB_ORGS;
  
  // If no specific orgs are configured, process all orgs
  if (!configuredOrgs) {
    return true;
  }
  
  // Split the configured orgs by newlines and check if the current org is in the list
  const orgsList = configuredOrgs.split('\n').map(org => org.trim()).filter(org => org.length > 0);
  
  return orgsList.includes(orgName);
}

// Remove any existing banner
function removeExistingBanner() {
  const existingBanner = document.getElementById('sourcegraph-banner');
  if (existingBanner) {
    console.log("Removing existing banner");
    existingBanner.remove();
  }
}

// Create a new banner with the given URL and text
function createBanner(url, text) {
  console.log("Creating banner with URL:", url);
  
  // Find the proper location to insert the banner
  // This function will attempt to find the main content or header
  const insertLocation = findInsertLocation();
  
  if (!insertLocation) {
    console.log("Could not find a suitable insert location, will retry...");
    scheduleRetry();
    return;
  }
  
  // Create a banner with a link to Sourcegraph
  const banner = document.createElement('div');
  banner.id = 'sourcegraph-banner';
  
  // Style the banner
  banner.style.position = 'relative';
  banner.style.width = '100%';
  banner.style.backgroundColor = '#3178c6'; // Sourcegraph blue
  banner.style.color = 'white';
  banner.style.padding = '5px';
  banner.style.textAlign = 'center';
  banner.style.fontWeight = 'bold';
  banner.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Create the actual link
  const link = document.createElement('a');
  link.href = url;
  link.textContent = text;
  link.style.color = 'white';
  link.style.textDecoration = 'underline';
  link.style.fontSize = '13px';
  link.target = '_blank'; // Open in new tab
  
  // Add a data attribute with the URL for debugging
  link.setAttribute('data-sourcegraph-url', url);
  
  banner.appendChild(link);
  
  // Insert the banner in the proper location
  const { element, method } = insertLocation;
  
  if (method === 'before') {
    element.parentNode.insertBefore(banner, element);
  } else if (method === 'after') {
    element.parentNode.insertBefore(banner, element.nextSibling);
  } else if (method === 'prepend') {
    element.insertBefore(banner, element.firstChild);
  } else {
    console.error("Unknown insert method:", method);
    return;
  }
  
  console.log("Banner created successfully with URL:", url);
}

// Helper function to find the proper location to insert the banner
function findInsertLocation() {
  // Try to find the main content area first (most reliable)
  const mainContent = document.querySelector('main');
  if (mainContent) {
    console.log("Found main content element");
    return { element: mainContent, method: 'before' };
  }
  
  // Next, try to find the header
  const header = document.querySelector('header');
  if (header) {
    console.log("Found header element");
    return { element: header, method: 'after' };
  }
  
  // If both fail, try to find GitHub's repository content area
  const repoContent = document.querySelector('.repository-content');
  if (repoContent) {
    console.log("Found repository content element");
    return { element: repoContent, method: 'before' };
  }
  
  // If all specific selectors fail, try more generic selectors
  const appContainer = document.querySelector('#js-repo-pjax-container, .application-main');
  if (appContainer) {
    console.log("Found application container");
    return { element: appContainer, method: 'prepend' };
  }
  
  // Last resort: add to the body if it exists
  if (document.body) {
    console.log("Using document body as fallback");
    return { element: document.body, method: 'prepend' };
  }
  
  // No suitable location found
  return null;
}

// Schedule a retry attempt if the banner couldn't be created
function scheduleRetry() {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Banner creation retry ${retryCount}/${MAX_RETRIES} scheduled in ${RETRY_DELAY}ms`);
    setTimeout(() => {
      console.log(`Executing retry attempt ${retryCount}`);
      tryAddSourcegraphBanner();
    }, RETRY_DELAY);
  } else {
    console.log(`Max retries (${MAX_RETRIES}) reached, giving up on banner creation`);
  }
}

// Detect when GitHub's content has changed significantly and update the banner
function setupMutationObserver() {
  console.log("Setting up mutation observer");
  
  // Create a mutation observer to watch for navigation events or DOM changes
  const observer = new MutationObserver((mutations) => {
    // Check if the URL has changed
    if (window.location.href !== lastUrl) {
      console.log("URL changed from", lastUrl, "to", window.location.href);
      lastUrl = window.location.href;
      
      // Reset retry count for each new page
      retryCount = 0;
      
      // Add banner for the new page
      tryAddSourcegraphBanner();
      return;
    }
    
    // Check for specific DOM changes that indicate a page content update
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Look for significant content changes (main content or repository content added)
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.tagName === 'MAIN' || 
              node.classList?.contains('repository-content') ||
              node.querySelector('main, .repository-content')
            ) {
              console.log("Detected significant DOM change, updating banner");
              retryCount = 0;
              tryAddSourcegraphBanner();
              return;
            }
          }
        }
      }
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document, { 
    childList: true, 
    subtree: true, 
    attributes: false,
    characterData: false
  });
  
  return observer;
}

// Track the last URL to detect changes
let lastUrl = window.location.href;

// Start the extension when the page begins loading
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded event fired");
  retryCount = 0;
  initializeExtension();
});

// Also run when the page is fully loaded (as a fallback)
window.addEventListener('load', () => {
  console.log("Load event fired");
  retryCount = 0;
  tryAddSourcegraphBanner();
});

// Initialize immediately in case the page is already loaded
console.log("Script executing...");
initializeExtension();

// Set up mutation observer to detect GitHub's single-page navigation
const observer = setupMutationObserver();