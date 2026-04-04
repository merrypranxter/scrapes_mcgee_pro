# RECIPE: Classic I-Frame Strip Datamosh

## What It Does
Removes keyframes (I-frames) from video, causing motion from one clip to bleed into another. The classic datamosh effect.

## Parameters
```javascript
{
  mode: 'iframe',
  delta: 5,              // 1-30: Frame processing interval (higher = more glitch)
  gop: 12,              // 5-60: Keyframe spacing (higher = messier corruption)
  quality: 'med',       // 'low' | 'med' | 'high': Output bitrate
  overlapFrames: 15     // 5-60: Transition duration in frames
}
```

## How It Works
1. Extract last N frames from Video A
2. Extract frames from Video B, remove I-frames
3. Concatenate A_last_frames + B_no_iframes
4. Re-encode with specified GOP/Quality

## Example Settings

### "Soft Melt"
```javascript
delta: 3
gop: 12
quality: 'med'
overlapFrames: 20
```
Result: Subtle motion bleeding, smooth transition

### "Heavy Corruption"
```javascript
delta: 18
gop: 50
quality: 'low'
overlapFrames: 30
```
Result: Extreme blocky artifacts, heavy glitch

### "Precise Glitch"
```javascript
delta: 8
gop: 25
quality: 'high'
overlapFrames: 10
```
Result: Clean corruption with defined edges

## FFmpeg Commands
```bash
# Extract last frames from A
ffmpeg -i video_a.mp4 -vf "select='gte(n\,15)'" -vsync 0 -c:v libx264 -g 12 last_frames.mp4

# Remove I-frames from B
ffmpeg -i video_b.mp4 -vf "select='not(mod(n\,5))'" -vsync 0 -c:v libx264 -g 999 no_iframes.mp4

# Concatenate
echo "file 'last_frames.mp4'" > concat.txt
echo "file 'no_iframes.mp4'" >> concat.txt
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

## Best For
- Motion bleeding between clips
- Abstract video transitions
- Music video effects
- Glitch art aesthetics
