# DEPLOY & PUSH INSTRUCTIONS

## Your Changes Are Ready! 🎉

All code is committed locally. You just need to push to GitHub.

## Quick Push

```bash
cd scrapes_mcgee_pro
git push origin main
```

If you get auth errors, use:

```bash
git push
```

Or if you need to set up auth:

```bash
git remote set-url origin https://YOUR_USERNAME@github.com/merrypranxter/scrapes_mcgee_pro.git
git push
```

---

## What Was Added

### New Files
- `src/components/glitch/GlitchMode.tsx` - Full cascade chain UI
- `src/components/scraper/ScraperMode.tsx` - Original scraper (moved)
- `CASCADE_README.md` - Phase 2 documentation
- `DATAMOSH_README.md` - Phase 1 documentation

### Modified Files
- `src/App.tsx` - Mode toggle between Scraper/Glitch
- `package.json` - Added FFmpeg.wasm dependencies

### Commit Message
```
Phase 2: Add cascade chain datamosh - unlimited video chaining with per-transition controls
```

---

## Deploy to Netlify (Optional)

### Auto-Deploy Setup

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select `merrypranxter/scrapes_mcgee_pro`
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Environment Variables

Add in Netlify dashboard → Site settings → Environment variables:

```
GEMINI_API_KEY=your_gemini_key_here
```

### Custom Domain (Optional)

In Netlify dashboard:
- Domain settings → Add custom domain
- Follow DNS instructions

---

## Test Locally First

```bash
npm run dev
```

Open http://localhost:5173

1. Click "GLITCH MODE"
2. Upload 2+ videos
3. Drag to reorder
4. Click transition arrows to customize
5. Process cascade

---

## Current Status

✅ **Phase 1**: Single video datamosh with effect regions  
✅ **Phase 2**: Multi-video cascade chain  
⏳ **Phase 3**: Your phone examples + advanced features  

---

**Ready when you are - push to GitHub and let's test!**
