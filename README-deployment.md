# n8n Workflow Search Website - Deployment Guide

This guide explains how to set up and deploy the searchable n8n workflow website to GitHub Pages.

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your local machine
- Git installed and configured
- GitHub account

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anima-t3d/n8n-workflows.git
   cd n8n-workflows
   ```

2. **Initialize npm (optional but recommended)**
   ```bash
   npm init -y
   ```

3. **Generate the workflow index**
   ```bash
   node build-index.js
   ```
   
   This will:
   - Scan all workflow JSON files in the repository
   - Extract workflow names, services used, and GitHub URLs
   - Create `public/workflows.json` with the processed data
   - Display processing statistics

4. **Test locally (optional)**
   
   You can test the website locally using a simple HTTP server:
   
   **Using Python:**
   ```bash
   cd public
   python -m http.server 8000
   ```
   
   **Using Node.js (if you have http-server installed):**
   ```bash
   npx http-server public -p 8000
   ```
   
   **Using PHP:**
   ```bash
   cd public
   php -S localhost:8000
   ```
   
   Then open `http://localhost:8000` in your browser.

## 🌐 GitHub Pages Deployment

### Method 1: Automatic Deployment (Recommended)

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add workflow search website"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings** (in the repository menu)
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Configure for /public folder**
   - Change the folder selection from **/ (root)** to **/public**
   - Click **Save**

4. **Access your site**
   - Your site will be available at: `https://your-username.github.io/n8n-workflows/`
   - It may take a few minutes to deploy initially

### Method 2: GitHub Actions (Advanced)

If you want automatic regeneration of the workflow index when new workflows are added:

1. **Create `.github/workflows/deploy.yml`**
   ```yaml
   name: Build and Deploy
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'
       
       - name: Build workflow index
         run: node build-index.js
       
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         if: github.ref == 'refs/heads/main'
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./public
   ```

2. **Enable GitHub Pages for gh-pages branch**
   - Go to repository Settings > Pages
   - Select **Deploy from a branch**
   - Choose **gh-pages** branch and **/ (root)** folder

## 🔧 Customization

### Updating Styles
The website uses Tailwind CSS via CDN. You can customize colors and styling by modifying the `tailwind.config` section in `public/index.html`.

### Adding Features
The JavaScript application (`public/app.js`) is modular and can be extended with additional features:
- Category-based filtering
- Sorting options
- Workflow complexity indicators
- Integration statistics

### Modifying the Data Structure
If you need different data fields, modify the `build-index.js` script:
- Add new extraction logic in the `processWorkflows()` function
- Update the JavaScript app to handle new fields
- Modify the HTML template as needed

## 📁 File Structure

```
n8n-workflows/
├── build-index.js          # Data processing script
├── public/                 # Website files
│   ├── index.html         # Main HTML page
│   ├── app.js             # JavaScript application
│   └── workflows.json     # Generated workflow data
├── analytics/             # Workflow categories...
├── automation/
├── api-webhooks/
└── ...
```

## 🐛 Troubleshooting

### Common Issues

**1. "workflows.json not found" error**
- Make sure you ran `node build-index.js` before deploying
- Check that the `public/` directory exists and contains `workflows.json`

**2. GitHub Pages not updating**
- It can take 5-10 minutes for changes to appear
- Check the Actions tab for deployment status
- Ensure the correct branch and folder are selected in Pages settings

**3. No workflows showing up**
- Check browser console for JavaScript errors
- Verify `workflows.json` contains valid JSON data
- Make sure the file paths in the script match your repository structure

**4. Styling issues**
- Ensure Tailwind CSS is loading (check network tab in browser dev tools)
- Verify the CDN link is working: `https://cdn.tailwindcss.com`

### Debug Mode

To debug the build process:

```bash
# Run with verbose output
node build-index.js

# Check the generated data
cat public/workflows.json | head -20
```

## 🔄 Maintenance

### Regular Updates

When new workflows are added to the repository:

1. Run the build script: `node build-index.js`
2. Commit and push changes
3. GitHub Pages will automatically update

### Performance Optimization

For large repositories (100+ workflows):
- Consider implementing pagination
- Add lazy loading for workflow cards
- Implement virtual scrolling for better performance

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review browser console for errors
3. Verify all files are in the correct locations
4. Test locally before deploying

## 🎯 Features

The deployed website includes:

- **🔍 Real-time search** - Search workflows by name, service, or category
- **🏷️ Service filtering** - Filter by specific n8n services/nodes
- **📱 Responsive design** - Works on desktop, tablet, and mobile
- **⚡ Fast performance** - Static site with optimized loading
- **🎨 Modern UI** - Clean design with Tailwind CSS
- **⌨️ Keyboard shortcuts** - `/` to focus search, `Esc` to clear filters
- **📊 Statistics** - Shows workflow counts and service usage
- **🔗 Direct links** - One-click access to workflow files on GitHub

## 🚀 Next Steps

After deployment, you can:
- Share the website URL with your team
- Add the link to your main repository README
- Customize the design to match your branding
- Add analytics tracking if needed