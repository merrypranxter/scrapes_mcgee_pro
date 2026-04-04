# PHASE 3 COMPLETE: POST-PROCESSING FILTERS 🎨

## What's New

### ✅ **Color Modes**
Transform the visual palette of each transition:
- **Normal**: No color changes
- **Invert**: Flip the entire color spectrum (pink → green, blue → orange)
- **Grayscale**: Black & white
- **Grey Invert**: Inverted black & white (dark becomes light)

### ✅ **Mirror Modes**
Create symmetrical kaleidoscope effects:
- **None**: No mirroring
- **Horizontal**: Left/Right symmetry (2 copies side-by-side)
- **Vertical**: Top/Bottom symmetry (2 copies stacked)
- **🆕 QUAD (Bilateral)**: 4-WAY SYMMETRY - Takes top-left quarter and mirrors it both ways to create 4 symmetrical copies in a grid

### ✅ **Repeat Echo**
Temporal frame blending for ghost trails:
- **0**: No echo (default)
- **1-10**: Blend current frame with previous N frames
- Creates motion trails and temporal smearing
- Higher values = more ghosting/persistence

### ✅ **Pattern Overlays**
Add geometric corruption:
- **None**: Clean output
- **Stripes**: Diagonal stripe pattern overlay
- **Checkerboard**: Grid pattern overlay

---

## The QUAD Mirror Explained

**What it does:**
1. Crops video to top-left quarter (1/4 of frame)
2. Mirrors it horizontally → creates top-right quarter
3. Mirrors top half vertically → creates bottom half
4. Result: Perfect 4-way radial symmetry

**Visual:**
```
Original:        QUAD Mirror Result:
┌────────┐      ┌────┬────┐
│    A   │      │ A  │ A' │ (A' = A mirrored H)
│        │  →   ├────┼────┤
│        │      │ A" │ A"'│ (A" = A mirrored V)
└────────┘      └────┴────┘
```

**Perfect for:**
- Psychedelic kaleidoscope effects
- Symmetrical face distortions
- Mandala-style motion graphics
- Abstract visual feedback loops

---

## How to Use

### Example 1: Classic Color Invert Datamosh

```
1. Upload 2 videos
2. Click the transition arrow
3. Set:
   - Mode: I-Frame Strip
   - Intensity: 80
   - Delta: 12
   - Color Mode: Invert
4. Process
```

**Result:** Heavy glitch with inverted colors - green becomes pink, blue becomes orange

### Example 2: Quad Mirror Kaleidoscope

```
1. Upload selfie video + motion video
2. Transition settings:
   - Mode: Pixel Blend
   - Intensity: 60
   - Mirror Mode: Quad (4-way)
   - Repeat Echo: 5
3. Process
```

**Result:** 4-way symmetrical face with ghost trails - full psychedelic effect

### Example 3: Grayscale Corruption Chain

```
Video 1 → Video 2 → Video 3

Transition 1→2:
- I-Frame Strip
- Grayscale
- Delta: 8

Transition 2→3:
- I-Frame Strip  
- Grey Invert
- Delta: 15
- Repeat Echo: 7
```

**Result:** Escalating B&W corruption with inverted contrast in final stage

### Example 4: Pattern Overlay Glitch

```
1. Upload video
2. Set:
   - Stripes overlay
   - I-Frame Strip
   - Delta: 20
   - GOP: 50
   - Quality: Low
3. Process
```

**Result:** Diagonal stripes integrated into the datamosh artifacts

---

## Filter Combinations That Work

### **Soft Psychedelic**
- Mirror: Quad
- Color: Normal
- Repeat Echo: 3
- Mode: Pixel Blend
- Intensity: 40

### **Heavy Corruption**
- Mirror: None
- Color: Invert
- Repeat Echo: 0
- Mode: I-Frame Strip
- Delta: 18, GOP: 50, Quality: Low

### **B&W Abstract**
- Mirror: Vertical
- Color: Grayscale
- Repeat Echo: 5
- Pattern: Checkerboard
- Mode: I-Frame Strip

### **Kaleidoscope Melt**
- Mirror: Quad
- Color: Invert
- Repeat Echo: 8
- Mode: Pixel Blend
- Intensity: 70

---

## Technical Implementation

### FFmpeg Filter Chains

**Color Invert:**
```bash
-vf "negate"
```

**Grayscale:**
```bash
-vf "hue=s=0"
```

**Grey Invert:**
```bash
-vf "hue=s=0,negate"
```

**Horizontal Mirror:**
```bash
-vf "crop=iw/2:ih:0:0,split[left][tmp];[tmp]hflip[right];[left][right]hstack"
```

**Vertical Mirror:**
```bash
-vf "crop=iw:ih/2:0:0,split[top][tmp];[tmp]vflip[bottom];[top][bottom]vstack"
```

**QUAD Mirror:**
```bash
-vf "crop=iw/2:ih/2:0:0,split=4[tl1][tl2][tl3][tl4];
     [tl2]hflip[tr];[tl3]vflip[bl];[tl4]hflip,vflip[br];
     [tl1][tr]hstack[top];[bl][br]hstack[bottom];[top][bottom]vstack"
```

**Repeat Echo:**
```bash
-vf "tmix=frames=N:weights='1 1 1 ... 1'"  # N frames blended equally
```

**Diagonal Stripes:**
```bash
-vf "geq='lum=if(mod(X+Y,20)<10,p(X,Y),255-p(X,Y))'"
```

**Checkerboard:**
```bash
-vf "geq='lum=if(mod(floor(X/20)+floor(Y/20),2),p(X,Y),255-p(X,Y))'"
```

### Filter Chain Composition

Filters are applied in this order:
1. Color mode (invert/grayscale)
2. Repeat echo (temporal blending)
3. Mirror (spatial transformation)
4. Pattern overlay (geometric corruption)

Multiple filters combine with commas:
```bash
-vf "negate,tmix=frames=5:weights='1 1 1 1 1',crop=iw/2:ih/2:0:0,..."
```

---

## Processing Notes

### Performance Impact

**Filters ranked by processing time:**
1. **Fastest**: Color modes (instant)
2. **Fast**: Mirror modes (single pass)
3. **Medium**: Repeat echo (temporal buffer)
4. **Slow**: Pattern overlays (per-pixel math)

**Cascading filters:**
- Each transition processes independently
- Filters DON'T compound between stages
- Stage 1 output → Stage 2 input (filters reset)

### Memory Usage

**QUAD mirror:**
- Reduces effective resolution to 1/4
- Then scales back up to original size
- Lower memory than full-frame processing

**Repeat echo:**
- Buffers N previous frames
- Echo=10 needs 10x frame memory
- Keep under 7 for large videos

---

## UI Layout

Each transition now has **POST-PROCESSING** section:

```
Mode: [I-Frame Strip] [Pixel Blend]

Intensity: [====70====]
Delta: [====10====]
GOP: [====25====]
Quality: [Low][Med][High]
Overlap: [====20====]

--- POST-PROCESSING ---

Color Mode: [Normal][Invert][Grayscale][Grey Invert]
Mirror Mode: [None][Horizontal][Vertical][Quad (4-way)]
Repeat Echo: [====5====] (Blend with previous 5 frames)
Pattern: [None][Stripes][Checkerboard]
```

All settings are **per-transition** - each arrow between videos has independent filter controls.

---

## What We Matched from Mobile Apps

✅ **Color Invert** - Full spectrum flip  
✅ **Grayscale** - B&W conversion  
✅ **Grey Invert** - Inverted B&W  
✅ **Mirror H/V** - Single-axis symmetry  
✅ **"Repeat One"** - Temporal echo effect  

🆕 **QUAD Mirror** - We went BEYOND mobile apps with 4-way symmetry!

---

## Comparison to Mobile App Features

### What Mobile Apps Have
- Color invert
- Grayscale modes
- Horizontal/Vertical mirror (one at a time)
- "Repeat" effect (echo)

### What We Added
- ✅ All of the above
- ✅ **QUAD/Bilateral mirror** (4-way symmetry - NOT in mobile apps!)
- ✅ **Per-transition settings** (mobile apps apply globally)
- ✅ **Pattern overlays** (stripes, checkerboard)
- ✅ **Cascading control** (different filters per stage)

---

## Testing Suggestions

### Test 1: Quad Mirror Selfie
1. Upload a selfie video where you move your head
2. Set Mirror: Quad
3. Watch yourself become a 4-way kaleidoscope

### Test 2: Color Cascade
```
Video A → Video B → Video C

A→B: Normal colors
B→C: Invert colors
Result: Color flip happens mid-cascade
```

### Test 3: Echo Trail
1. Upload high-motion video (dancing, sports)
2. Repeat Echo: 10
3. Watch motion trails build up

### Test 4: B&W Progression
```
Stage 1: Normal
Stage 2: Grayscale
Stage 3: Grey Invert
Result: Gradual desaturation + inversion
```

---

## Known Limitations

1. **Pattern overlays slow on large files** - Use with <1080p for speed
2. **QUAD mirror reduces effective resolution** - Output is scaled from 1/4 size
3. **High repeat echo (8-10) may cause browser memory issues** on long videos
4. **Filters don't persist between stages** - Each transition resets (by design)

---

## What's Next (Phase 4)

Potential additions:
- [ ] Chromatic aberration (RGB channel shift)
- [ ] Custom pattern upload (use your own overlay image)
- [ ] Preset library ("Kaleidoscope Melt", "B&W Corruption", etc.)
- [ ] Real-time filter preview
- [ ] Audio glitch (bitcrush, pitch shift, stutter)
- [ ] Temporal displacement (past/future frame mixing)

---

## Files Modified

```
src/components/glitch/GlitchMode.tsx
  - Added Transition interface filters
  - Added buildFilterChain() function
  - Added post-processing UI panel
  - Updated processCascade() to apply filters
```

---

**GO TEST PHASE 3 NOW** 🎛️✨

```bash
npm run dev
```

1. Upload 2+ videos
2. Click a transition
3. Scroll down to POST-PROCESSING
4. Try **Quad Mirror** + **Repeat Echo: 5** + **Color Invert**
5. Process and watch the kaleidoscope chaos

**You now have MORE datamosh control than mobile apps** 🔥
