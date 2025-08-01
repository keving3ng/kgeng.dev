# Deployment Guide

This portfolio site is configured for deployment on **Netlify** (free tier) with automatic GitHub Actions CI/CD.

## 🚀 Quick Setup

### Option 1: Netlify (Recommended - FREE)

1. **Create Netlify account** at [netlify.com](https://netlify.com)
2. **Connect GitHub repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select this repository
   - Build settings are auto-detected from `netlify.toml`

3. **Get your site credentials**:
   ```bash
   # From Netlify dashboard > Site settings
   NETLIFY_SITE_ID=your-site-id
   NETLIFY_AUTH_TOKEN=your-auth-token  # User settings > Applications > Personal access tokens
   ```

4. **Add GitHub Secrets**:
   - Go to GitHub repo > Settings > Secrets and variables > Actions
   - Add secrets:
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`

5. **Deploy automatically**: Push to main branch triggers production deployment!

### Option 2: GitHub Pages (100% FREE)

1. **Enable GitHub Pages**:
   - Repo Settings > Pages
   - Source: GitHub Actions

2. **Use this workflow** (replace `deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         pages: write
         id-token: write
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./out
         - uses: actions/deploy-pages@v4
   ```

### Option 3: Cloudflare Pages (FREE)

1. **Create Cloudflare account** at [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Connect GitHub repository**
3. **Build settings**:
   - Build command: `npm run deploy`
   - Build output directory: `out`
   - Node.js version: `18`

## 🔧 Configuration Files

- **`netlify.toml`**: Netlify configuration with redirects, headers, and build settings
- **`next.config.js`**: Optimized for static export with security headers
- **`.github/workflows/deploy.yml`**: Automated deployment with quality checks

## 💰 Cost Comparison

| Platform | Free Tier | Bandwidth | Builds | Custom Domain |
|----------|-----------|-----------|--------|---------------|
| **Netlify** | ✅ | 100GB/month | 300 min/month | ✅ Free SSL |
| **GitHub Pages** | ✅ | Unlimited | Unlimited | ✅ Free SSL |
| **Cloudflare Pages** | ✅ | Unlimited | 500/month | ✅ Free SSL |
| **Vercel** | ❌ Limited | 100GB/month | 6000 min/month | ✅ Free SSL |

## 🎯 Recommended Workflow

1. **Development**: `npm run dev`
2. **Quality Check**: `npm run lint && npm run type-check`
3. **Local Build Test**: `npm run deploy`
4. **Deploy**: Push to main branch (auto-deploys via GitHub Actions)

## 🔧 Manual Deployment

```bash
# Build and export static files
npm run deploy

# Deploy to Netlify manually (if needed)
npx netlify-cli deploy --prod --dir=out
```

## 🌐 Custom Domain Setup

### Netlify:
1. Domain settings > Add custom domain
2. Configure DNS records as instructed
3. SSL certificate is automatically provisioned

### GitHub Pages:
1. Repo Settings > Pages > Custom domain
2. Add CNAME record pointing to `username.github.io`
3. Wait for SSL certificate provisioning

## 🔍 Troubleshooting

### Build Failures:
- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Routing Issues:
- Next.js static export limitations: no API routes, no dynamic routing
- Use client-side routing for dynamic behavior

### Performance Optimization:
- Images are unoptimized in static export (required)
- Use WebP/AVIF formats when possible
- Enable Cloudflare or Netlify image optimization

## 📊 Monitoring

- **Netlify**: Built-in analytics and deployment logs
- **GitHub Pages**: GitHub Insights
- **Performance**: Use Google PageSpeed Insights, Lighthouse
- **Uptime**: UptimeRobot (free monitoring)

---

**Total Monthly Cost: $0** 🎉

Choose Netlify for the best developer experience, or GitHub Pages for complete simplicity!