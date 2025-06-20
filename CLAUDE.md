# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a curated collection of n8n workflows organized by category. Each workflow includes:
- A workflow.json file containing the n8n workflow definition
- A README.md file with documentation

## Repository Structure

The repository is organized into categorical directories:
- `analytics/` - Workflows for data analysis and reporting
- `api-webhooks/` - Workflows for API integrations and webhook handling
- `automation/` - General automation workflows for various tasks
- `communication/` - Workflows for messaging, notifications, and alerts
- `data-integration/` - Workflows for moving and syncing data between systems
- `data-transformation/` - Workflows for converting data between formats
- `document-processing/` - Workflows for handling documents and files

Each workflow directory follows this structure:
```
category/workflow-id-workflow-name/
├── README.md
└── workflow.json
```

## Working with Workflows

- Each workflow.json file contains the complete n8n workflow definition in JSON format
- READMEs follow a consistent format with description, requirements, setup instructions, and examples
- Workflow IDs are numeric and prefix the directory names
- Many workflows contain promotional content at the end of READMEs that should be preserved when editing

## Common Operations

When working with workflows in this repository:
1. Import workflow JSON files into n8n instances
2. Follow setup instructions in the corresponding README
3. Configure required credentials and parameters
4. Test and activate workflows

## File Patterns

- All workflow files: `**/workflow.json`
- All documentation: `**/README.md`
- No build tools, package managers, or test frameworks are used in this repository
- This is a documentation and workflow collection repository, not a code project

## Workflow Documentation Standards

READMEs should include:
- Clear workflow description and purpose
- Example use cases
- Required credentials and setup steps
- Usage instructions
- Any special configuration notes