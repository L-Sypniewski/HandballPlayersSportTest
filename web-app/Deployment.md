# Deploying to Cloudflare Pages

This guide covers deploying the Handball Players Sport Test web application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- Node.js 18+ installed
- Git repository (for Git-connected deployment)

---

## Method 1: Git-Connected Deployment (Recommended)

Connect your repository to Cloudflare Pages for automatic deployments on every push.

### Steps

1. **Push to GitHub/GitLab**
   Ensure your code is pushed to a Git repository.

2. **Access Cloudflare Dashboard**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

3. **Select Repository**
   - Authorize Cloudflare to access your Git provider
   - Select the `HandballPlayersSportTest-copilot` repository

4. **Configure Build Settings**

   | Setting | Value |
   |---------|-------|
   | Project name | `handball-players-sport-test` (or your preferred name) |
   | Production branch | `master` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `web-app` |

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete (usually 1-2 minutes)

6. **Get Your URL**
   - Cloudflare provides a URL like: `https://handball-players-sport-test.pages.dev`

---

## Method 2: Direct Upload via Wrangler CLI

Deploy directly from your local machine without a Git repository.

### Installation

```bash
npm install -g wrangler
```

### Login

```bash
wrangler login
```

### Deploy

From the `web-app/` directory:

```bash
cd web-app

# Build the static site
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=handball-players-sport-test
```

### First Deploy Output

On first deploy, Wrangler will:
1. Create the project automatically
2. Upload all files from `dist/`
3. Provide your deployment URL

---

## Configuration Summary

| Setting | Value |
|---------|-------|
| Framework | Astro 5.x |
| Output Mode | Static (`output: 'static'`) |
| Build Command | `npm run build` |
| Output Directory | `dist/` |
| Node.js Version | 18+ (Cloudflare default) |

---

## Environment Variables (Optional)

If you need environment variables:

1. Go to your project in Cloudflare Dashboard
2. Navigate to **Settings** → **Environment variables**
3. Add variables for **Production** and/or **Preview** environments

Access them in Astro via `import.meta.env.VARIABLE_NAME`.

---

## Post-Deployment Steps

1. **Test the Application**
   - Visit your Cloudflare Pages URL
   - Upload an Excel file with player data
   - Verify player table displays correctly
   - Test file download functionality

2. **Custom Domain (Optional)**
   - Go to **Custom domains** in project settings
   - Add your domain
   - Update DNS records as instructed

3. **Enable Analytics (Optional)**
   - Cloudflare Web Analytics can be enabled in project settings

---

## Troubleshooting

### Build Fails

- **Check Node version**: Ensure compatibility with Astro 5.x
- **Review build logs**: Look for specific error messages in Cloudflare dashboard
- **Local test**: Run `npm run build` locally to reproduce issues

### 404 Errors on Pages

- Verify `dist/` directory contains `index.html`
- Check Astro config has `output: 'static'`

### Excel Files Not Processing

- Browser console for JavaScript errors
- Verify ExcelJS is included in the build (check bundle size)

### Large File Uploads

Cloudflare Pages has a 25MB limit for static assets. For larger file handling, consider:
- Cloudflare Workers for server-side processing
- Client-side processing only (current implementation)

---

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy with Wrangler
wrangler pages deploy dist --project-name=handball-players-sport-test
```

---

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
