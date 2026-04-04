# RECIPE: Cascade Chain Datamosh

## What It Does
Chain unlimited videos together with independent settings per transition. Each arrow (A→B→C→D) has its own datamosh configuration.

## Parameters (Per Transition)
```javascript
{
  transitions: [
    {
      fromVideoId: 'video_a',
      toVideoId: 'video_b',
      mode: 'iframe',        // 'iframe' | 'pixelblend'
      intensity: 70,
      delta: 5,
      gop: 12,
      quality: 'med',
      overlapFrames: 15
    },
    {
      fromVideoId: 'video_b',
      toVideoId: 'video_c',
      mode: 'pixelblend',
      intensity: 50,
      delta: 8,
      gop: 20,
      quality: 'high',
      overlapFrames: 25
    }
    // ... more transitions
  ],
  exportMode: 'final'      // 'final' | 'all_stages'
}
```

## How It Works
1. Process first transition: A → B
2. Feed output into next transition: (A→B) → C
3. Continue sequentially through chain
4. Optionally export all intermediate stages

## Example Chains

### "Escalating Corruption"
```javascript
Video A → Video B → Video C

Transition A→B:
  mode: 'iframe'
  delta: 5
  gop: 15
  quality: 'high'

Transition B→C:
  mode: 'iframe'
  delta: 15
  gop: 40
  quality: 'low'
```
Result: Clean start, progressively messier

### "Blend to Chaos"
```javascript
Video A → Video B → Video C → Video D

A→B: pixelblend, intensity: 30
B→C: pixelblend, intensity: 60
C→D: iframe, delta: 20, gop: 50
```
Result: Smooth blends evolving into heavy corruption

### "Symmetrical Journey"
```javascript
Video A → Video B → Video C → Video B → Video A

A→B: iframe, delta: 8
B→C: iframe, delta: 15 (peak corruption)
C→B: iframe, delta: 8
B→A: iframe, delta: 5
```
Result: Build up to chaos, then back down

## Export Modes

### Final Only
```javascript
exportMode: 'final'
```
Downloads: `cascade_final.mp4`

### All Stages
```javascript
exportMode: 'all_stages'
```
Downloads:
- `stage_1_A_into_B.mp4`
- `stage_2_AB_into_C.mp4`
- `stage_3_ABC_into_D.mp4`
- `cascade_final.mp4`

## Processing Pipeline
```bash
# Stage 1: A→B
ffmpeg ... -i A.mp4 -i B.mp4 ... -o AB.mp4

# Stage 2: AB→C
ffmpeg ... -i AB.mp4 -i C.mp4 ... -o ABC.mp4

# Stage 3: ABC→D
ffmpeg ... -i ABC.mp4 -i D.mp4 ... -o ABCD.mp4
```

## Best For
- Long-form glitch narratives
- Escalating/de-escalating corruption
- Complex multi-video projects
- Experimental video art
