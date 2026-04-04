# RECIPE: Cellular Automata Corruption

## What It Does
Organic, spreading corruption that grows frame-by-frame using mathematical rules. Like digital mold or crystals growing across the video.

## Parameters
```javascript
{
  seedCount: 10,                    // 1-50: Number of infection points
  seedPattern: 'random',            // 'random' | 'grid' | 'center' | 'edges'
  ruleType: 'virus',                // 'conway' | 'diamond' | 'crystal' | 'virus'
  spreadRate: 60,                   // 0-100: How fast infection grows
  infectionColor: 'neon',           // 'invert' | 'neon' | 'void' | 'rainbow' | 'glitch'
}
```

## Seed Patterns

### Random
```javascript
seedPattern: 'random'
seedCount: 5
```
Result: 5 random infection points scattered across frame

### Grid
```javascript
seedPattern: 'grid'
seedCount: 9
```
Result: 3x3 organized grid of seeds

### Center
```javascript
seedPattern: 'center'
seedCount: 1
```
Result: Single seed at center, radiating outward

### Edges
```javascript
seedPattern: 'edges'
seedCount: 20
```
Result: Seeds start from all 4 borders, eating inward

## Rule Types

### Conway (Game of Life)
```javascript
ruleType: 'conway'
spreadRate: 50
```
Rules:
- Cell alive if 2-3 live neighbors
- Cell born if exactly 3 live neighbors

Result: Balanced organic growth with natural death

### Diamond
```javascript
ruleType: 'diamond'
spreadRate: 60
```
Rules:
- Spreads along diagonals
- Infect if 2+ diagonal neighbors infected

Result: Crystalline, angular patterns

### Crystal
```javascript
ruleType: 'crystal'
spreadRate: 40
```
Rules:
- Only spreads horizontally/vertically
- Sharp, faceted patterns

Result: Geometric, structured corruption

### Virus (Aggressive)
```javascript
ruleType: 'virus'
spreadRate: 80
```
Rules:
- Spreads to ANY neighbor
- Very fast growth

Result: Chaotic, organic mold-like expansion

## Infection Colors

### Invert
```javascript
infectionColor: 'invert'
```
Result: RGB values flipped (255-R, 255-G, 255-B)

### Neon
```javascript
infectionColor: 'neon'
```
Result: Max saturation, bright colors

### Void
```javascript
infectionColor: 'void'
```
Result: Pure black (#000000)

### Rainbow
```javascript
infectionColor: 'rainbow'
```
Result: Colors cycle through spectrum based on generation

### Glitch
```javascript
infectionColor: 'glitch'
```
Result: Random noise at each infected pixel

## Example Presets

### "Digital Mold"
```javascript
seedCount: 3
seedPattern: 'random'
ruleType: 'virus'
spreadRate: 60
infectionColor: 'neon'
```
Result: Green organic corruption spreading like fungus

### "Crystal Fracture"
```javascript
seedCount: 1
seedPattern: 'center'
ruleType: 'crystal'
spreadRate: 40
infectionColor: 'invert'
```
Result: Geometric patterns radiating from center

### "Pixel Plague"
```javascript
seedCount: 20
seedPattern: 'grid'
ruleType: 'conway'
spreadRate: 75
infectionColor: 'rainbow'
```
Result: Competing infection zones, psychedelic colors

### "Void Consumption"
```javascript
seedCount: 50
seedPattern: 'edges'
ruleType: 'virus'
spreadRate: 70
infectionColor: 'void'
```
Result: Black corruption eating inward from all sides

## Algorithm (Pseudocode)
```javascript
// Frame 1: Seed infection
for (let i = 0; i < seedCount; i++) {
  let [x, y] = getRandomPosition();
  infectionState[x][y] = 1;
}

// Each subsequent frame
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let neighbors = countInfectedNeighbors(x, y);
    
    // Apply rule
    if (ruleType === 'virus') {
      if (neighbors >= 1) infect(x, y);
    } else if (ruleType === 'conway') {
      if (isInfected(x, y) && (neighbors === 2 || neighbors === 3)) {
        keepInfected(x, y);
      } else if (!isInfected(x, y) && neighbors === 3) {
        infect(x, y);
      }
    }
    // ... other rules
    
    // Apply color mutation
    if (isInfected(x, y)) {
      applyInfectionColor(x, y, infectionColor);
    }
  }
}
```

## Processing Pipeline
```
1. Load video frames
2. Initialize infection seeds in frame 1
3. For each frame:
   a. Check each pixel's neighbors
   b. Apply CA rules (spread infection)
   c. Mutate infected pixels
   d. Save frame
4. Re-encode to video
```

## Performance
- Slower than datamosh (~1-2 fps processing)
- Per-pixel operations
- Best for videos <30 seconds
- Can downsample for speed

## Best For
- Organic corruption effects
- Fractal/crystalline patterns
- Psychedelic growing visuals
- Abstract video art
- Music video effects
