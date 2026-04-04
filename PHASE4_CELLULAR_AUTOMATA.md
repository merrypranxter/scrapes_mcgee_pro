# PHASE 4: CELLULAR AUTOMATA MODE 🧬

## What It Is

**Living, organic video corruption** that spreads like mold, crystals, or a virus.

Instead of datamoshing frames together, we treat the video as a **living organism** where corruption **grows** and **spreads** following biological/mathematical rules.

---

## How It Works

### **1. Infection Seeds**
Drop "infected" pixels into the first frame:
- **Random**: Scattered across the frame
- **Grid**: Organized pattern
- **Center**: Single point radiating outward
- **Edges**: Infection starts from borders

### **2. Spread Rules**
Every frame, check each pixel's neighbors and decide if it gets infected:

**Conway (Game of Life)**
- Classic cellular automata
- Balanced growth and death
- Creates organic, evolving patterns

**Diamond**
- Spreads along diagonals
- Creates crystalline patterns
- Geometric, angular growth

**Crystal**
- Only spreads horizontally/vertically
- Sharp, faceted patterns
- Structured corruption

**Virus (Aggressive)**
- Spreads to any neighbor
- Fast, chaotic growth
- Organic mold-like expansion

### **3. Visual Mutation**
Infected pixels transform:
- **Invert**: Flip colors
- **Neon**: Max saturation
- **Void**: Turn black
- **Rainbow**: Cycle through spectrum
- **Glitch**: Random noise

---

## Controls

```
CELLULAR AUTOMATA MODE

Seed Pattern: [Random] [Grid] [Center] [Edges]
Seed Count: [====10====] (1-50)

Rule Type: [Conway] [Diamond] [Crystal] [Virus]
Spread Rate: [====60====] (0-100, how fast it grows)

Infection Color: [Invert] [Neon] [Void] [Rainbow] [Glitch]

[INFECT VIDEO]
```

---

## Example Presets

### **"Digital Mold"**
```
Seeds: 3 (Random)
Rule: Virus
Speed: 60
Color: Neon (green hue)
```
**Result**: Organic green corruption spreading like mold

### **"Crystal Fracture"**
```
Seeds: 1 (Center)
Rule: Crystal
Speed: 40
Color: Invert
```
**Result**: Geometric patterns radiating from center

### **"Pixel Plague"**
```
Seeds: 20 (Grid)
Rule: Conway
Speed: 80
Color: Rainbow
```
**Result**: Competing infection zones creating psychedelic patterns

### **"Void Consumption"**
```
Seeds: 50 (Edges)
Rule: Virus
Speed: 70
Color: Void
```
**Result**: Black corruption eating inward from all sides

---

## Visual Evolution

**Frame 1:**
```
. . . . . . . .
. . . X . . . .  ← Single seed
. . . . . . . .
```

**Frame 10 (Virus):**
```
. . X X X . . .
. X X X X X . .
X X X X X X X .  ← Spreading
. X X X X X . .
```

**Frame 30 (Virus):**
```
X X X X X X X X
X X X X X X X X  ← Total infection
X X X X X X X X
```

**Frame 10 (Crystal):**
```
. . . X . . . .
. . X X X . . .
. X . X . X . .  ← Geometric growth
X . . X . . X .
```

---

## How It Compares

### **Traditional Datamosh**
- Removes keyframes
- Motion bleeding between videos
- Instant corruption
- **Static** corruption pattern

### **Cellular Automata**
- Pixel-level infection
- Single video
- **Growing** corruption
- **Dynamic** organic patterns

---

## Technical Details

### **Processing Pipeline**
```
1. Extract frames from video
2. Initialize infection seeds
3. For each frame:
   a. Apply CA rules to spread infection
   b. Mutate infected pixels
   c. Save frame
4. Re-encode frames to video
```

### **Performance**
- **Slower** than datamosh (pixel-level processing)
- ~1-3 fps processing speed
- Best for shorter videos (<30 seconds)
- Can downsample for faster processing

### **Memory**
- Needs to track infection state for every pixel
- Uses typed arrays (Uint8Array) for efficiency
- ~2-4MB per 1080p frame

---

## Use Cases

### **Music Videos**
- Organic corruption growing with the beat
- Seeds triggered by audio peaks
- Visual "infection" spreading through the scene

### **Abstract Art**
- Fractal patterns emerging from chaos
- Geometric crystalline structures
- Psychedelic color mutations

### **Horror/Glitch Aesthetic**
- Decay spreading across the frame
- Void consumption (everything turns black)
- Chaotic visual breakdown

---

## Combining with Other Modes

**CA + Datamosh:**
```
1. Apply cellular automata corruption
2. Use corrupted video in cascade chain
3. Datamosh the infected footage

Result: Double corruption - organic spread + motion bleeding
```

**CA + Filters:**
```
Apply CA, then:
- Quad mirror for 4-way symmetry
- Color invert for extra weirdness
- Repeat echo for ghost trails
```

---

## Limitations

1. **Slower processing** - Per-pixel operations take time
2. **Memory intensive** - Tracking every pixel state
3. **No real-time preview** - Too computationally expensive
4. **Best for short clips** - Processing time scales with length

---

## What Makes This Unique

**Nobody else has this.** 

Mobile datamosh apps have:
- ✅ I-frame removal
- ✅ Pixel blending
- ✅ Color filters
- ✅ Optical flow (glide)

But **NONE** have **cellular automata corruption** that:
- Grows organically frame-by-frame
- Uses mathematical rules (Conway, etc.)
- Creates living, evolving patterns
- Spreads like a biological organism

**This is genuinely novel glitch art tech.** 🧬

---

## Files

```
src/lib/cellularAutomata.ts - CA engine
src/components/glitch/GlitchMode.tsx - UI integration (Phase 4)
CELLULAR_AUTOMATA_SPEC.md - Technical spec
```

---

## Next Steps

1. ✅ CA engine built
2. ⏳ Integrate into UI
3. ⏳ Add processing pipeline
4. ⏳ Test different rule types
5. ⏳ Optimize performance

---

**READY TO CODE THE UI INTEGRATION?** 🎛️

This is wild, experimental shit that'll create effects nobody's seen before.
