# ALL DATAMOSH RECIPES - MASTER INDEX

Complete recipe collection for every datamosh mode built so far.

---

## Working Modes (Integrated in UI)

### ✅ Recipe 1: Classic I-Frame Strip
**File:** `RECIPE_1_IFRAME_STRIP.md`

**What:** Removes keyframes for classic motion bleeding  
**Best for:** Traditional datamosh aesthetics  
**Key params:** Delta, GOP, Quality

---

### ✅ Recipe 2: Pixel Blend
**File:** `RECIPE_2_PIXEL_BLEND.md`

**What:** Smooth crossfade transitions  
**Best for:** Dreamlike sequences, less aggressive glitch  
**Key params:** Intensity, Overlap frames

---

### ✅ Recipe 3: Cascade Chain
**File:** `RECIPE_3_CASCADE_CHAIN.md`

**What:** Chain unlimited videos with per-transition settings  
**Best for:** Long-form glitch narratives, escalating corruption  
**Key params:** Per-transition mode/settings, Export mode

---

### ✅ Recipe 4: Post-Processing Filters
**File:** `RECIPE_4_POST_PROCESSING.md`

**What:** Color modes, mirrors (including QUAD), echo, patterns  
**Best for:** Psychedelic kaleidoscope, symmetrical glitch  
**Key params:** Color mode, Mirror mode (QUAD!), Repeat echo

---

## Standalone Engines (Built, Not Yet in UI)

### ⚠️ Recipe 5: Cellular Automata
**File:** `RECIPE_5_CELLULAR_AUTOMATA.md`

**What:** Organic spreading corruption using CA rules  
**Best for:** Fractal patterns, growing corruption, abstract art  
**Key params:** Rule type (Conway/Virus/Crystal), Infection color  
**Status:** Engine coded in `src/lib/cellularAutomata.ts`

---

### ⚠️ Recipe 6: Galvanic Corrosion
**File:** `RECIPE_6_GALVANIC_CORROSION.md`

**What:** Electrochemical color warfare - red oxidizes, blue gains  
**Best for:** Rusty trails, metallic corruption, asymmetric glitch  
**Key params:** Corrosion strength, Motion threshold, Oxidation depth  
**Status:** Engine coded in `src/lib/galvanicCorrosion.ts`

---

## Quick Reference

| Mode | Type | Complexity | Performance | Best Use |
|------|------|------------|-------------|----------|
| I-Frame Strip | Datamosh | Medium | Fast (~2x RT) | Classic glitch |
| Pixel Blend | Datamosh | Low | Fast (~2x RT) | Smooth transitions |
| Cascade Chain | Meta | High | Slow (sequential) | Multi-video projects |
| Post-Processing | Filters | Low | Medium | Psychedelic effects |
| Cellular Automata | Organic | High | Slow (~1-2 fps) | Abstract art |
| Galvanic Corrosion | Chemical | High | Medium (~1x RT) | Rusty aesthetics |

RT = Realtime

---

## Combining Recipes

### Example 1: "Kaleidoscope Cascade"
```
Recipe 3 (Cascade) + Recipe 4 (Quad Mirror)

Video A → Video B → Video C
Each transition: Pixel blend, Intensity 60
Final output: Quad mirror + Color invert
```

### Example 2: "Cellular Mold Growth"
```
Recipe 5 (CA) → Recipe 4 (Post-processing)

Single video with CA corruption
Rule: Virus, Seeds: 5, Color: Neon
Then apply: Repeat echo 7 for ghost trails
```

### Example 3: "Rusty Datamosh"
```
Recipe 1 (I-Frame) + Recipe 6 (Galvanic)

Traditional datamosh first
Then apply galvanic corrosion
Result: Motion bleeding + rusty oxidation trails
```

---

## File Locations

```
/RECIPE_1_IFRAME_STRIP.md
/RECIPE_2_PIXEL_BLEND.md
/RECIPE_3_CASCADE_CHAIN.md
/RECIPE_4_POST_PROCESSING.md
/RECIPE_5_CELLULAR_AUTOMATA.md
/RECIPE_6_GALVANIC_CORROSION.md
/RECIPES_MASTER_INDEX.md (this file)
```

---

## Usage for AI Studio

Each recipe file contains:
- ✅ Complete parameter specifications
- ✅ Example presets with settings
- ✅ FFmpeg commands (where applicable)
- ✅ Algorithm pseudocode
- ✅ Visual examples/descriptions
- ✅ Best use cases

**Feed any recipe file to AI Studio** to generate:
- Preset configurations
- UI mockups
- Tutorial content
- Processing scripts
- Documentation

---

**All recipes ready for AI Studio ingestion** 🎛️
