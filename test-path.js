// Test the URL path extraction for the specific example
const testPath = '/microsoft/vscode/blob/master/README.md';
const urlParts = testPath.split('/');
console.log("URL parts:", urlParts);

// Extract the file path (everything after the branch)
const filePath = urlParts.slice(5).join('/');
console.log("File path:", filePath);

// Construct the sourcegraph URL
const repo = 'vscode';
const sourcegraphUrl = `https://sourcegraph.com/github.com/microsoft/${repo}/-/blob/${filePath}`;
console.log("Sourcegraph URL:", sourcegraphUrl);

/*
Expected output:
URL parts: ["", "microsoft", "vscode", "blob", "master", "README.md"]
File path: README.md
Sourcegraph URL: https://sourcegraph.com/github.com/microsoft/vscode/-/blob/README.md
*/