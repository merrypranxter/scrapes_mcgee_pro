# DATAMOSH CASCADE - Setup & Usage

## What We Built

Added a full datamosh glitch suite to Scrapes McGee Pro with:

### ✅ Core Features
- **Dual-mode toggle**: Switch between Scraper Mode (web scraping) and Glitch Mode (datamosh)
- **Video upload & queue**: Drag/drop multiple videos
- **Timeline effect regions**: Add multiple glitch zones to any video
- **Two datamosh modes**:
  - I-frame strip (classic datamosh with motion bleed)
  - Pixel blend (crossfade effects)

### ✅ Destructiveness Controls
- **Delta Value** (1-30 frames): Process every Nth frame for aggressive glitching
- **GOP Size** (5-60 frames): Keyframe interval (higher = messier)
- **Quality** (Low/Med/High): Bitrate control (low = max artifacts)
- **Blend Intensity** (0-100%): For pixel blend mode

### ✅ Timeline Features
- Add unlimited effect zones to a single video
- Each zone has independent settings
- Visual timeline with colored regions:
  - Green = I-frame strip
  - Pink = Pixel blend
- Precise start/end time control per zone

## Setup

1. **Dependencies already installed**:
   ```bash
   npm install @ffmpeg/ffmpeg @ffmpeg/util react-player
   ```

2. **Run locally**:
   ```bash
   npm run dev
   ```

3. **Access the app**:
   - Open http://localhost:5173
   - Click "GLITCH MODE" button at the top

## How to Use

### Basic Workflow

1. **Upload a video**
   - Click the "Add Videos" button
   - Select one or more video files (mp4, mov, avi)
   - Video appears in the queue on the left

2. **Add effect zones**
   - Click the "+" button in "EFFECT ZONES" panel
   - New zone appears on timeline (default: 0-5 seconds)
   - Click a zone to select and edit it

3. **Configure the glitch**
   - Choose mode: I-Frame Strip or Pixel Blend
   - Adjust start/end times to position the zone
   - Tweak Delta Value (higher = more glitch)
   - Tweak GOP Size (higher = messier compression)
   - Choose Quality (Low = max artifacts)

4. **Add more zones** (optional)
   - Create multiple zones with different settings
   - Zones can overlap or be separate
   - Each zone is independent

5. **Process & download**
   - Click "DATAMOSH & DOWNLOAD"
   - FFmpeg processes in-browser (progress bar shows %)
   - Auto-downloads when complete

### Example Use Cases

**Soft Glitch Trail**:
- Mode: I-Frame Strip
- Delta: 3
- GOP: 12
- Quality: Med
- Single zone at 2-7 seconds

**Heavy Corruption**:
- Mode: I-Frame Strip
- Delta: 15
- GOP: 50
- Quality: Low
- Multiple overlapping zones

**Subtle Blend**:
- Mode: Pixel Blend
- Blend Intensity: 30%
- Delta: 5
- GOP: 20
- Quality: High

## What's Next (Phase 2)

### Video-to-Video Cascade
Currently you can glitch ONE video with multiple effect zones. Next phase:
- Upload Video A and Video B
- Datamosh A into B (A's motion bleeds into B's content)
- Then datamosh that result into Video C
- Chain unlimited videos: A→B→C→D...

### Implementation Plan for Cascade
1. Modify video queue to be chainable (drag to reorder)
2. Add "Transition Settings" between videos
3. Extract last frames of Video A
4. Replace first I-frame of Video B with Video A's P-frames
5. Sequential processing pipeline

### Additional Features to Add
- **Presets**: Save/load your favorite glitch settings
- **Audio glitch**: Bitcrush, stutter, pitch warp
- **Real-time preview**: Scrub through glitched output before rendering
- **Batch export**: Download each stage separately (A, A→B, A→B→C)
- **Advanced blend modes**: Chromatic split, optical flow

## Technical Notes

### FFmpeg.wasm
- Runs FFmpeg entirely in browser
- ~31MB download on first load (cached after)
- Processing speed: ~0.5-2x realtime depending on video size
- Max file size: ~1GB (browser memory limit)

### Processing Details
- Clean segments use `-c copy` (no re-encoding, fast)
- Effect segments get re-encoded with user settings
- Final output concatenates all segments
- Audio is stripped from glitch regions by default

### Troubleshooting

**FFmpeg won't load**:
- Check browser console for CORS errors
- Try a different browser (Chrome/Edge recommended)

**Processing fails**:
- Video might be too large (try <500MB)
- Unsupported codec (convert to H.264 first)
- Check console for specific FFmpeg errors

**Glitch isn't visible**:
- Try higher Delta value (10+)
- Lower Quality setting
- Increase GOP size (30+)

## File Structure

```
src/
├── App.tsx                              # Mode toggle
├── components/
│   ├── scraper/
│   │   └── ScraperMode.tsx              # Original web scraper
│   └── glitch/
│       └── GlitchMode.tsx               # Datamosh interface
└── lib/
    └── utils.ts                         # Shared utilities
```

## Current Limitations

1. **Single video processing**: Can't chain videos yet (coming in Phase 2)
2. **No real-time preview**: Must process fully to see result
3. **No preset library**: Manual settings each time
4. **Audio always stripped**: From glitch regions (will add audio glitch options)

## Demo Video Suggestions

Test with:
- **High motion videos**: Sports, dancing, fast panning
- **Scene cuts**: Music videos, film clips
- **Portrait videos**: Phone recordings work great
- **4K works but slow**: Stick to 1080p or 720p for speed

---

**Ready to glitch? Upload your video and fuck around with the settings!**
