# CELLULAR AUTOMATA CORRUPTION MODE

## Concept
Treat video corruption as a living organism. Seed "infected" pixels that spread using cellular automata rules, creating organic, crystalline corruption patterns.

## How It Works

### 1. Infection Seeding
- Drop N random "seed" pixels in first frame
- Seeds can be:
  - Random locations
  - Motion-tracked (follow movement)
  - Grid-based (structured pattern)
  - Edge-detected (outline subjects)

### 2. CA Rules (Per Frame)
For each pixel, check 8 neighbors (Moore neighborhood):
```
[NW][N][NE]
[W ][X][E ]
[SW][S][SE]
```

**Rule Types:**

**Conway (Classic Game of Life)**
- Cell alive if 2-3 live neighbors
- Cell born if exactly 3 live neighbors
- Applied to luminance threshold

**Diamond Spread**
- Infect if 2+ diagonal neighbors infected
- Creates diamond/crystalline patterns

**Virus (Aggressive)**
- Infect if 1+ neighbor infected
- Mutates color as it spreads
- Fast, organic growth

**Crystal (Geometric)**
- Only spreads at right angles
- Creates sharp, faceted patterns
- Slow but structured

### 3. Infection State
Each pixel has:
- **Healthy**: Normal video pixel
- **Infected**: Altered color/glitch
- **Dead**: Black void (if using death rules)

## Parameters

### User Controls
```javascript
{
  mode: 'cellular_automata',
  seedCount: 1-50,        // Number of infection points
  spreadRate: 'slow' | 'medium' | 'fast',
  ruleType: 'conway' | 'diamond' | 'crystal' | 'virus',
  infectionColor: 'invert' | 'neon' | 'void' | 'rainbow',
  seedPattern: 'random' | 'grid' | 'motion' | 'edge',
  deathEnabled: boolean   // Can infected cells die?
}
```

### Visual Mutations

**Infection Color Options:**
- **Invert**: Flip RGB values
- **Neon**: Max saturation + bright colors
- **Void**: Pure black (#000000)
- **Rainbow**: Cycle through spectrum
- **Glitch**: Random noise pattern

## Implementation Strategy

### FFmpeg Approach (Complex)
```bash
# Extract all frames
ffmpeg -i input.mp4 frame_%04d.png

# Python script applies CA rules
python cellular_automata.py --frames frame_*.png --seeds 5 --rule virus

# Re-encode
ffmpeg -i infected_%04d.png -c:v libx264 output.mp4
```

### Canvas Approach (Simpler)
```javascript
// Load video into canvas
// For each frame:
//   1. Get pixel data as ImageData
//   2. Apply CA rules (check neighbors)
//   3. Mark infected pixels
//   4. Draw mutations
//   5. Next frame

const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, width, height);
const data = imageData.data; // RGBA array

// Apply CA rules
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const infected = checkNeighbors(x, y, data, width);
    if (infected) {
      applyInfection(x, y, data, width);
    }
  }
}
```

## Example Presets

### "Digital Mold"
```
Seeds: 3
Rule: Virus
Speed: Medium
Color: Neon green
Pattern: Random
```
Creates organic, spreading green corruption

### "Crystal Fracture"
```
Seeds: 1
Rule: Crystal
Speed: Slow
Color: Invert
Pattern: Center
```
Creates geometric, angular patterns radiating from center

### "Pixel Plague"
```
Seeds: 20
Rule: Conway
Speed: Fast
Color: Rainbow
Pattern: Grid
```
Multiple infection points competing for space

### "Edge Decay"
```
Seeds: 50
Rule: Diamond
Speed: Medium
Color: Void
Pattern: Edge-detect
```
Corruption follows subject outlines, eating inward

## Technical Challenges

1. **Performance**: CA on every pixel every frame = slow
   - Solution: Downsample, only process changed regions
   
2. **Memory**: Need to track state of every pixel
   - Solution: Use typed arrays, process in chunks

3. **Visual feedback**: Hard to preview in real-time
   - Solution: Show preview of first 30 frames

## Visual Examples

**Frame 1:**
```
. . . . . . . .
. . . X . . . .  (X = seed)
. . . . . . . .
```

**Frame 10 (Virus rule):**
```
. . X X X . . .
. X X X X X . .
X X X X X X X .
. X X X X X . .
```

**Frame 30 (Crystal rule):**
```
. . . X . . . .
. . X X X . . .
. X . X . X . .
X . . X . . X .
```

## Next Steps
1. Build CA engine (standalone module)
2. Add UI controls to GlitchMode
3. Test different rule types
4. Optimize for performance
5. Add real-time preview option
