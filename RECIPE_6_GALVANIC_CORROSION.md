# RECIPE: Galvanic Corrosion

## What It Does
Electrochemical color warfare. Red channel oxidizes (loses data), Blue channel gains. Creates rusty, corroded trails that follow motion. NOT blur - RUST.

## Parameters
```javascript
{
  corrosionStrength: 70,        // 0-100: How much red transfers to blue
  motionThreshold: 40,          // 0-100: Sensitivity to motion
  oxidationDepth: 5,            // 1-10: How far rust spreads
  preserveGreen: true,          // Keep green channel stable?
  reversePolarity: false        // Flip: blue oxidizes, red gains
}
```

## The Chemistry

### Normal Polarity
```javascript
reversePolarity: false
```
- **Red = Anode** (weak, loses electrons)
- **Blue = Cathode** (strong, gains electrons)
- **Motion = Electrolyte** (conducts reaction)

Result: Red degrades to static, Blue becomes neon-bright

### Reverse Polarity
```javascript
reversePolarity: true
```
- **Blue = Anode** (weak, loses electrons)
- **Red = Cathode** (strong, gains electrons)

Result: Blue degrades, Red swells

## Example Presets

### "Battery Acid"
```javascript
corrosionStrength: 85
motionThreshold: 35
oxidationDepth: 7
preserveGreen: true
reversePolarity: false
```
Result: Aggressive blue neon trails, red degrades to noise

### "Subtle Rust"
```javascript
corrosionStrength: 30
motionThreshold: 60
oxidationDepth: 2
preserveGreen: true
reversePolarity: false
```
Result: Light oxidation, natural-looking degradation

### "Reverse Polarity"
```javascript
corrosionStrength: 70
motionThreshold: 50
oxidationDepth: 4
preserveGreen: false
reversePolarity: true
```
Result: Red becomes strong, blue corrodes, green also affected

### "Cascading Oxide"
```javascript
corrosionStrength: 60
motionThreshold: 30
oxidationDepth: 9
preserveGreen: false
```
Result: Aggressive spreading rust, all channels corrode

## Algorithm (Pseudocode)
```javascript
for each frame:
  // 1. Detect motion
  for each pixel:
    motion = abs(current[r,g,b] - previous[r,g,b])
    if (motion > motionThreshold):
      motionMap[pixel] = motion
  
  // 2. Apply galvanic exchange
  for each pixel with motion:
    strength = (corrosionStrength / 100) * (motion / 255)
    
    if (!reversePolarity):
      redLoss = red * strength
      red = max(0, red - redLoss)
      blue = min(255, blue + redLoss)
    else:
      blueLoss = blue * strength
      blue = max(0, blue - blueLoss)
      red = min(255, red + blueLoss)
    
    if (!preserveGreen):
      greenLoss = green * (strength * 0.5)
      green = max(0, green - greenLoss)
  
  // 3. Spread oxidation to neighbors
  for depth iterations:
    for each corroded pixel:
      leak 30% to cardinal neighbors (N, E, S, W)
```

## Processing Pipeline
```
1. Load video
2. For each frame:
   a. Compare to previous frame (detect motion)
   b. Where motion > threshold:
      - Red oxidizes (loses data)
      - Blue gains (absorbs lost data)
   c. Spread oxidation to neighbors
   d. Save frame
3. Re-encode video
```

## Motion Threshold Behavior

### Low (0-30)
```javascript
motionThreshold: 20
```
Even tiny movements trigger corrosion
Result: Highly sensitive, everything rusts

### Medium (31-70)
```javascript
motionThreshold: 50
```
Normal motion sensitivity
Result: Balanced - only clear motion corrodes

### High (71-100)
```javascript
motionThreshold: 85
```
Only dramatic motion corrodes
Result: Sparse rust trails on fast movement only

## Oxidation Depth Behavior

### Tight (1-3)
```javascript
oxidationDepth: 2
```
Rust stays on motion paths
Result: Precise, controlled corrosion

### Spreading (4-7)
```javascript
oxidationDepth: 5
```
Rust leaks to neighbors
Result: Organic spreading patterns

### Cascading (8-10)
```javascript
oxidationDepth: 9
```
Aggressive cascade
Result: Entire regions corrode

## Visual Comparison

### Motion Blur
```
Frame 1: Person at X=100
Frame 2: Person at X=120
Result: Smooth gradient between positions
```

### Galvanic Corrosion
```
Frame 1: Person at X=100 (Red: 200, Blue: 100)
Frame 2: Person at X=120

Motion path X=100→120:
- Red drops to 60 (oxidized)
- Blue rises to 240 (gained electrons)

Result: NOT smooth - crusty, jagged trails
```

## Performance
- ~1-2x realtime processing
- Per-pixel motion detection
- Oxidation spreading adds overhead
- Best for <1080p videos

## Best For
- Rusty, degraded aesthetic
- Metallic corruption trails
- Electrochemical glitch art
- Asymmetric color effects
- Industrial/dystopian visuals

## What Makes This Unique
**No other app has this:**
- Asymmetric channel transfer (one gains, one loses)
- Motion-dependent electrochemical reaction
- Creates RUST not blur
- Spreading oxidation cascade
- Genuinely novel visual glitch
