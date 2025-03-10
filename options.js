// Default values
const DEFAULT_GITHUB_URL = 'github.com';
const DEFAULT_SOURCEGRAPH_URL = 'https://sourcegraph.com';
const DEFAULT_GITHUB_ORGS = '';  // Empty string for all organizations

// Save options to chrome.storage
function saveOptions() {
  const githubUrl = document.getElementById('githubUrl').value.trim() || DEFAULT_GITHUB_URL;
  const sourcegraphUrl = document.getElementById('sourcegraphUrl').value.trim() || DEFAULT_SOURCEGRAPH_URL;
  const githubOrgs = document.getElementById('githubOrgs').value.trim();
  
  chrome.storage.sync.set({
    githubUrl: githubUrl,
    sourcegraphUrl: sourcegraphUrl,
    githubOrgs: githubOrgs
  }, function() {
    // Update status to let user know options were saved
    const status = document.getElementById('status');
    status.textContent = 'Options saved successfully!';
    status.className = 'status success';
    
    setTimeout(function() {
      status.textContent = '';
      status.className = 'status';
    }, 3000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({
    githubUrl: DEFAULT_GITHUB_URL,
    sourcegraphUrl: DEFAULT_SOURCEGRAPH_URL,
    githubOrgs: DEFAULT_GITHUB_ORGS
  }, function(items) {
    document.getElementById('githubUrl').value = items.githubUrl;
    document.getElementById('sourcegraphUrl').value = items.sourcegraphUrl;
    document.getElementById('githubOrgs').value = items.githubOrgs;
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);