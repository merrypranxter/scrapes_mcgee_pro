# GALVANIC CORROSION MODE ⚡🔋

## Concept

Treat video as electrochemical warfare between incompatible metals.

**NOT blur. NOT smear. RUST.**

---

## The Chemistry

### Color Channels as Metals

**Blue Channel = CATHODE (Noble Metal)**
- Copper-like properties
- Strong, resistant
- **Gains** electrons (data) during reaction
- Becomes bloated, hyper-saturated

**Red Channel = ANODE (Weak Metal)**  
- Zinc-like properties
- Weak, vulnerable
- **Loses** electrons (data) during reaction
- Degrades into static noise

**Green Channel = NEUTRAL**
- Inert, doesn't participate
- Stays stable during corrosion

### Motion as Electrolyte

**Motion vectors = Saltwater**
- Conducts the electrochemical reaction
- Where things move → corrosion happens
- Static areas stay clean

---

## How It Works

### 1. Motion Detection
```
For each frame pair:
  Calculate pixel difference
  If delta > threshold → motion detected at that pixel
```

### 2. Galvanic Exchange
```
Where motion occurs:
  Red oxidizes: R_new = R_old * (1 - corrosion_strength)
  Blue gains: B_new = B_old + (R_old * corrosion_strength)
  
Result: Red loses data, Blue absorbs it
```

### 3. Oxidation Cascade
```
For deeper corrosion:
  Apply exchange to neighboring pixels
  Creates spreading rust patterns
  Oxidation "leaks" outward from motion paths
```

---

## Parameters

```javascript
{
  mode: 'galvanic_corrosion',
  corrosionStrength: 0-100,    // How much data transfers
  motionThreshold: 0-100,       // Sensitivity to motion
  oxidationDepth: 1-10,         // How far rust spreads
  preserveGreen: boolean,       // Keep green stable?
  reversePolarity: boolean      // Red = cathode, Blue = anode
}
```

### Parameter Effects

**Corrosion Strength**
- Low (0-30): Subtle rust trails
- Medium (31-70): Visible degradation
- High (71-100): Aggressive oxidation, heavy corruption

**Motion Threshold**
- Low (0-30): Even tiny movements trigger corrosion
- Medium (31-70): Normal motion sensitivity
- High (71-100): Only dramatic motion corrodes

**Oxidation Depth**
- 1-3: Tight, precise rust along motion paths
- 4-7: Spreading corrosion, leaks to neighbors
- 8-10: Aggressive cascade, entire regions corrode

---

## Visual Examples

### Before (Normal Frame)
```
Red: 200, Green: 150, Blue: 100
[Balanced colors]
```

### After Motion (Corrosion Applied)
```
Red: 80 ← OXIDIZED (lost 60% of data)
Green: 150 ← UNCHANGED
Blue: 220 ← SWOLLEN (gained from red)

Visual: Red areas turn dark/noisy, Blue areas become neon-bright
```

---

## Implementation Strategy

### FFmpeg Approach (Frame-based)

```bash
# Extract frames
ffmpeg -i input.mp4 frame_%04d.png

# Python/Node script applies corrosion
for frame in frames:
  motion = detect_motion(current, previous)
  corroded = apply_galvanic_exchange(frame, motion, strength)
  save(corroded)

# Re-encode
ffmpeg -i corroded_%04d.png -c:v libx264 output.mp4
```

### Canvas Approach (Real-time-ish)

```javascript
const ctx = canvas.getContext('2d');
const current = ctx.getImageData(0, 0, w, h);
const previous = getPreviousFrame();

for (let i = 0; i < current.data.length; i += 4) {
  const motion = Math.abs(current.data[i] - previous.data[i]) +
                 Math.abs(current.data[i+1] - previous.data[i+1]) +
                 Math.abs(current.data[i+2] - previous.data[i+2]);
  
  if (motion > motionThreshold) {
    // R = index i, G = i+1, B = i+2
    const redLoss = current.data[i] * (corrosionStrength / 100);
    current.data[i] -= redLoss;        // Red oxidizes
    current.data[i+2] += redLoss;      // Blue gains
  }
}
```

---

## Example Presets

### "Battery Acid"
```
Strength: 80
Motion Threshold: 40
Depth: 5
Preserve Green: Yes
```
**Result:** Aggressive corrosion, blue neon trails, red degrades heavily

### "Subtle Rust"
```
Strength: 30
Motion Threshold: 60
Depth: 2
Preserve Green: Yes
```
**Result:** Light oxidation trails, natural-looking degradation

### "Reverse Polarity"
```
Strength: 70
Motion Threshold: 50
Depth: 4
Reverse Polarity: Yes
```
**Result:** Red becomes cathode, blue becomes anode (inverted effect)

### "Cascading Oxide"
```
Strength: 60
Motion Threshold: 30
Depth: 9
Preserve Green: No
```
**Result:** Aggressive spreading rust, even green channel corrodes

---

## Visual Comparison

### Traditional Motion Blur
```
Frame 1: Person at X=100
Frame 2: Person at X=120
Result: Smooth gradient between positions
```

### Galvanic Corrosion
```
Frame 1: Person at X=100 (Red: 200, Blue: 100)
Frame 2: Person at X=120
Motion path: X=100 to X=120

Result:
- Trailing pixels: Red drops to 60, Blue rises to 240
- NOT smooth - crusty, jagged, corroded
- Looks like rusty metal dragged across screen
```

---

## Advanced: Oxidation Cascade

For deeper corrosion, apply spreading algorithm:

```javascript
// After initial exchange, spread oxidation to neighbors
for (let depth = 0; depth < oxidationDepth; depth++) {
  for each pixel with corrosion:
    leak 20% of oxidation to 4 cardinal neighbors
}
```

**Result:** Rust doesn't just follow motion - it SPREADS like actual corrosion

---

## Combining with Other Effects

### Galvanic + Datamosh
```
1. Apply I-frame strip datamosh
2. Run galvanic corrosion on output
Result: Motion bleeding + metallic rust trails
```

### Galvanic + Quad Mirror
```
1. Apply galvanic corrosion
2. Apply quad mirror
Result: 4-way symmetrical rust patterns
```

### Galvanic + Cellular Automata
```
1. Run CA infection
2. Apply galvanic to infected regions only
Result: Organic spreading + metallic degradation
```

---

## Technical Challenges

1. **Motion Detection Noise**
   - Solution: Gaussian blur before motion detection
   
2. **Channel Clamping**
   - Red can't go below 0, Blue can't exceed 255
   - Solution: Track "excess" and redistribute

3. **Performance**
   - Per-pixel operations are slow
   - Solution: Downsample for preview, full-res for final

---

## What Makes This Unique

**Nobody has this.**

Existing effects:
- Motion blur: Smooth gradient
- Echo: Temporal blending
- Datamosh: I-frame corruption

**Galvanic Corrosion:**
- Electrochemical transfer between channels
- Assymetric (red loses, blue gains)
- Creates RUST, not blur
- Oxidation spreads like real corrosion
- **Genuinely novel visual effect**

---

## Files to Create

```
src/lib/galvanicCorrosion.ts - Core engine
src/components/glitch/GalvanicMode.tsx - UI integration
GALVANIC_EXAMPLES/ - Test outputs
```

---

## Next Steps

1. ✅ Spec complete
2. ⏳ Build corrosion engine
3. ⏳ Add motion detection
4. ⏳ Create UI controls
5. ⏳ Test on sample videos
6. ⏳ Optimize performance

---

**READY TO CODE THE ENGINE?** ⚡🔋

This is genuinely experimental glitch art that doesn't exist anywhere else.
