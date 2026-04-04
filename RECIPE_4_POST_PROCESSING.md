# RECIPE: Post-Processing Filters

## What It Does
Apply visual mutations AFTER datamosh processing: color modes, mirrors, temporal echo, pattern overlays.

## Parameters
```javascript
{
  // Applied to any datamosh mode
  colorMode: 'normal',           // 'normal' | 'invert' | 'grayscale' | 'greyInvert'
  mirrorMode: 'none',            // 'none' | 'horizontal' | 'vertical' | 'quad'
  repeatEcho: 0,                 // 0-10: Temporal frame blending
  patternOverlay: 'none'         // 'none' | 'stripes' | 'checkerboard'
}
```

## Color Modes

### Normal
```javascript
colorMode: 'normal'
```
No color changes

### Invert
```javascript
colorMode: 'invert'
```
FFmpeg: `-vf "negate"`
Result: Pink becomes green, blue becomes orange

### Grayscale
```javascript
colorMode: 'grayscale'
```
FFmpeg: `-vf "hue=s=0"`
Result: Black and white

### Grey Invert
```javascript
colorMode: 'greyInvert'
```
FFmpeg: `-vf "hue=s=0,negate"`
Result: Inverted black and white

## Mirror Modes

### None
```javascript
mirrorMode: 'none'
```
No mirroring

### Horizontal
```javascript
mirrorMode: 'horizontal'
```
FFmpeg: `-vf "crop=iw/2:ih:0:0,split[left][tmp];[tmp]hflip[right];[left][right]hstack"`
Result: Left/right symmetry (2 copies)

### Vertical
```javascript
mirrorMode: 'vertical'
```
FFmpeg: `-vf "crop=iw:ih/2:0:0,split[top][tmp];[tmp]vflip[bottom];[top][bottom]vstack"`
Result: Top/bottom symmetry (2 copies)

### Quad (Bilateral) 🆕
```javascript
mirrorMode: 'quad'
```
FFmpeg:
```bash
crop=iw/2:ih/2:0:0,split=4[tl1][tl2][tl3][tl4];
[tl2]hflip[tr];[tl3]vflip[bl];[tl4]hflip,vflip[br];
[tl1][tr]hstack[top];[bl][br]hstack[bottom];[top][bottom]vstack
```
Result: **4-way radial symmetry** (kaleidoscope effect)

## Repeat Echo

### No Echo
```javascript
repeatEcho: 0
```
No temporal blending

### Light Trails
```javascript
repeatEcho: 3
```
FFmpeg: `-vf "tmix=frames=4:weights='1 1 1 1'"`
Result: Subtle ghost trails

### Heavy Persistence
```javascript
repeatEcho: 8
```
FFmpeg: `-vf "tmix=frames=9:weights='1 1 1 1 1 1 1 1 1'"`
Result: Strong motion trails, layered frames

## Pattern Overlays

### None
```javascript
patternOverlay: 'none'
```
Clean output

### Stripes
```javascript
patternOverlay: 'stripes'
```
FFmpeg: `-vf "geq='lum=if(mod(X+Y,20)<10,p(X,Y),255-p(X,Y))'"`
Result: Diagonal stripe pattern

### Checkerboard
```javascript
patternOverlay: 'checkerboard'
```
FFmpeg: `-vf "geq='lum=if(mod(floor(X/20)+floor(Y/20),2),p(X,Y),255-p(X,Y))'"`
Result: Grid pattern

## Example Combinations

### "Kaleidoscope Melt"
```javascript
mode: 'pixelblend'
intensity: 70
mirrorMode: 'quad'
colorMode: 'invert'
repeatEcho: 5
```
Result: 4-way symmetrical psychedelic corruption

### "B&W Ghost Trail"
```javascript
mode: 'iframe'
delta: 10
colorMode: 'grayscale'
mirrorMode: 'vertical'
repeatEcho: 8
```
Result: Black & white with heavy temporal echo

### "Neon Corruption"
```javascript
mode: 'iframe'
delta: 15
gop: 50
quality: 'low'
colorMode: 'invert'
patternOverlay: 'stripes'
```
Result: Heavy glitch with inverted colors and geometric overlay

### "Quad Symmetry Clean"
```javascript
mode: 'pixelblend'
intensity: 40
mirrorMode: 'quad'
colorMode: 'normal'
repeatEcho: 0
```
Result: 4-way kaleidoscope without extra corruption

## Filter Application Order
```
1. Datamosh (iframe/pixelblend)
   ↓
2. Color Mode (invert/grayscale)
   ↓
3. Repeat Echo (temporal blending)
   ↓
4. Mirror Mode (spatial transformation)
   ↓
5. Pattern Overlay (geometric corruption)
```

## FFmpeg Filter Chain
```bash
ffmpeg -i input.mp4 \
  -vf "negate,tmix=frames=6:weights='1 1 1 1 1 1',crop=iw/2:ih/2:0:0,..." \
  output.mp4
```

## Best For
- Psychedelic kaleidoscope effects
- Symmetrical glitch art
- Temporal ghost trails
- Geometric visual corruption
