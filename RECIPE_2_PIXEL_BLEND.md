# RECIPE: Pixel Blend Datamosh

## What It Does
Crossfade transition with controlled blending between two videos. Smoother than I-frame strip, creates gradient transitions.

## Parameters
```javascript
{
  mode: 'pixelblend',
  intensity: 70,         // 0-100: Blend strength (higher = more visible blend)
  gop: 12,              // 5-60: Keyframe interval
  quality: 'med',       // 'low' | 'med' | 'high': Output bitrate
  overlapFrames: 15     // 5-60: Blend duration in frames
}
```

## How It Works
1. Calculate blend duration from overlapFrames
2. Apply FFmpeg xfade filter between videos
3. Creates smooth gradient transition
4. Re-encode with specified GOP/quality

## Example Settings

### "Gentle Fade"
```javascript
intensity: 40
gop: 15
quality: 'high'
overlapFrames: 30
```
Result: Smooth, subtle crossfade

### "Aggressive Blend"
```javascript
intensity: 90
gop: 8
quality: 'low'
overlapFrames: 45
```
Result: Heavy blending with compression artifacts

### "Quick Snap"
```javascript
intensity: 60
gop: 20
quality: 'med'
overlapFrames: 8
```
Result: Fast transition, minimal blend time

## FFmpeg Commands
```bash
# Calculate blend duration (overlapFrames / framerate)
blendDuration=$(echo "scale=2; 15 / 25" | bc)  # e.g., 0.60 seconds

# Apply xfade blend
ffmpeg -i video_a.mp4 -i video_b.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${blendDuration}:offset=0[v]" \
  -map "[v]" \
  -c:v libx264 -g 12 -b:v 500k \
  output.mp4
```

## Best For
- Smooth video transitions
- Dreamlike sequences
- Psychedelic effects
- Less aggressive datamoshing
