const fs = require('fs');
const path = require('path');

// Function to extract service name from node type
function extractServiceName(nodeType) {
  if (!nodeType || typeof nodeType !== 'string') return null;
  
  // Remove the base prefix and convert to readable format
  const cleanType = nodeType.replace('n8n-nodes-base.', '').replace('n8n-nodes-', '');
  
  // Handle special cases and convert to readable names
  const serviceMap = {
    'manualTrigger': 'Manual Trigger',
    'set': 'Set',
    'itemLists': 'Item Lists',
    'markdown': 'Markdown',
    'stickyNote': 'Sticky Note',
    'n8nTrainingCustomerDatastore': 'Customer Datastore',
    'webhook': 'Webhook',
    'respondToWebhook': 'Respond to Webhook',
    'httpRequest': 'HTTP Request',
    'function': 'Function',
    'if': 'IF',
    'switch': 'Switch',
    'merge': 'Merge',
    'split': 'Split',
    'sort': 'Sort',
    'limit': 'Limit',
    'aggregate': 'Aggregate',
    'dateTime': 'Date & Time',
    'crypto': 'Crypto',
    'compression': 'Compression',
    'executeSql': 'Execute SQL',
    'xml': 'XML',
    'html': 'HTML',
    'json': 'JSON',
    'csv': 'CSV',
    'emailSend': 'Send Email',
    'ftp': 'FTP',
    'sftp': 'SFTP',
    'ssh': 'SSH'
  };
  
  // Check if we have a mapped name
  if (serviceMap[cleanType]) {
    return serviceMap[cleanType];
  }
  
  // For service names, capitalize first letter and handle camelCase
  return cleanType
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Function to get workflow name from directory structure
function getWorkflowName(filePath) {
  const pathParts = filePath.split(path.sep);
  const workflowDir = pathParts[pathParts.length - 2]; // Get parent directory name
  
  // Extract name from directory format: "1700-very-quick-quickstart"
  const namePart = workflowDir.replace(/^\d+-/, '');
  
  // Convert kebab-case to Title Case
  return namePart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Function to recursively find all workflow.json files
function findWorkflowFiles(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (item === 'workflow.json') {
        files.push(fullPath);
      }
    }
  }
  
  searchDir(dir);
  return files;
}

// Function to get relative path from root for GitHub URL
function getRelativePath(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return relativePath.replace(/\\/g, '/'); // Convert Windows paths to Unix format
}

// Main function to process all workflows
async function processWorkflows() {
  console.log('🔍 Scanning for workflow files...');
  
  const workflowFiles = findWorkflowFiles(process.cwd());
  console.log(`📁 Found ${workflowFiles.length} workflow files`);
  
  const workflows = [];
  
  for (const filePath of workflowFiles) {
    try {
      // Read and parse the workflow file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const workflow = JSON.parse(fileContent);
      
      // Extract workflow name
      const name = getWorkflowName(filePath);
      
      // Extract unique service names from nodes
      const nodeTypes = new Set();
      
      if (workflow.nodes && Array.isArray(workflow.nodes)) {
        for (const node of workflow.nodes) {
          if (node.type) {
            const serviceName = extractServiceName(node.type);
            if (serviceName && serviceName !== 'Sticky Note') { // Filter out sticky notes
              nodeTypes.add(serviceName);
            }
          }
        }
      }
      
      // Convert to sorted array
      const nodes = Array.from(nodeTypes).sort();
      
      // Create GitHub URL
      const relativePath = getRelativePath(filePath);
      const fileUrl = `https://github.com/Anima-t3d/n8n-workflows/blob/main/${relativePath}`;
      
      workflows.push({
        name,
        nodes,
        fileUrl,
        category: relativePath.split('/')[0] // Add category for additional filtering
      });
      
      console.log(`✅ Processed: ${name} (${nodes.length} nodes)`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write the workflows data to public/workflows.json
  const outputPath = path.join(publicDir, 'workflows.json');
  fs.writeFileSync(outputPath, JSON.stringify(workflows, null, 2));
  
  console.log(`\n🎉 Successfully processed ${workflows.length} workflows`);
  console.log(`📄 Data saved to: ${outputPath}`);
  
  // Print some statistics
  const allNodes = new Set();
  workflows.forEach(workflow => {
    workflow.nodes.forEach(node => allNodes.add(node));
  });
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total workflows: ${workflows.length}`);
  console.log(`   Unique services: ${allNodes.size}`);
  console.log(`   Categories: ${new Set(workflows.map(w => w.category)).size}`);
}

// Run the script
if (require.main === module) {
  processWorkflows().catch(console.error);
}

module.exports = { processWorkflows };