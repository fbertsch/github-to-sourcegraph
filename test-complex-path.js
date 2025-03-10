// Test URL path extraction with the specific complex example
const testUrl = 'https://github.com/microsoft/vscode/blob/master/src/vs/workbench/api/browser/mainThreadWebview.ts';
const pathname = '/microsoft/vscode/blob/master/src/vs/workbench/api/browser/mainThreadWebview.ts';

// Split the path and remove empty parts
const urlParts = pathname.split('/').filter(part => part.length > 0);
console.log("URL parts after filtering:", urlParts);

// Extract organization and repository
const orgName = urlParts[0];
const repoName = urlParts[1];
console.log("Org:", orgName);
console.log("Repo:", repoName);

// Check if it's a file path (contains 'blob')
if (urlParts.length > 3 && urlParts[2] === 'blob') {
  // The branch is at index 3
  const branch = urlParts[3];
  console.log("Branch:", branch);
  
  // The file path consists of all parts after the branch
  const filePath = urlParts.slice(4).join('/');
  console.log("File path:", filePath);
  
  // Create Sourcegraph URL
  const sourcegraphUrl = `https://sourcegraph.com/github.com/microsoft/${repoName}/-/blob/${filePath}`;
  console.log("Sourcegraph URL:", sourcegraphUrl);
}

/*
Expected output:
URL parts after filtering: ["microsoft", "vscode", "blob", "master", "src", "vs", "workbench", "api", "browser", "mainThreadWebview.ts"]
Org: microsoft
Repo: vscode
Branch: master
File path: src/vs/workbench/api/browser/mainThreadWebview.ts
Sourcegraph URL: https://sourcegraph.com/github.com/microsoft/vscode/-/blob/src/vs/workbench/api/browser/mainThreadWebview.ts
*/