// Cellular Automata Engine for Video Corruption

export type CARuleType = 'conway' | 'diamond' | 'crystal' | 'virus';
export type InfectionColor = 'invert' | 'neon' | 'void' | 'rainbow' | 'glitch';
export type SeedPattern = 'random' | 'grid' | 'center' | 'edges';

export interface CAConfig {
  seedCount: number;
  ruleType: CARuleType;
  infectionColor: InfectionColor;
  seedPattern: SeedPattern;
  spreadRate: number; // 0-100
}

interface InfectionState {
  infected: Uint8Array; // 1 = infected, 0 = healthy
  generation: Uint8Array; // How old the infection is
}

export class CellularAutomataEngine {
  private width: number;
  private height: number;
  private state: InfectionState;
  private config: CAConfig;
  
  constructor(width: number, height: number, config: CAConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
    
    const size = width * height;
    this.state = {
      infected: new Uint8Array(size),
      generation: new Uint8Array(size),
    };
    
    this.seedInfection();
  }
  
  private seedInfection() {
    const seeds: [number, number][] = [];
    
    switch (this.config.seedPattern) {
      case 'random':
        for (let i = 0; i < this.config.seedCount; i++) {
          seeds.push([
            Math.floor(Math.random() * this.width),
            Math.floor(Math.random() * this.height),
          ]);
        }
        break;
        
      case 'grid': {
        const gridSize = Math.ceil(Math.sqrt(this.config.seedCount));
        const spacing = Math.floor(Math.min(this.width, this.height) / gridSize);
        for (let i = 0; i < this.config.seedCount; i++) {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          seeds.push([col * spacing + spacing / 2, row * spacing + spacing / 2]);
        }
        break;
      }
        
      case 'center':
        seeds.push([Math.floor(this.width / 2), Math.floor(this.height / 2)]);
        break;
        
      case 'edges':
        for (let i = 0; i < this.config.seedCount; i++) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) seeds.push([Math.floor(Math.random() * this.width), 0]);
          else if (edge === 1) seeds.push([this.width - 1, Math.floor(Math.random() * this.height)]);
          else if (edge === 2) seeds.push([Math.floor(Math.random() * this.width), this.height - 1]);
          else seeds.push([0, Math.floor(Math.random() * this.height)]);
        }
        break;
    }
    
    seeds.forEach(([x, y]) => {
      const idx = y * this.width + x;
      this.state.infected[idx] = 1;
      this.state.generation[idx] = 1;
    });
  }
  
  private getNeighborCount(x: number, y: number): number {
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const idx = ny * this.width + nx;
          if (this.state.infected[idx]) count++;
        }
      }
    }
    
    return count;
  }
  
  private getDiagonalNeighborCount(x: number, y: number): number {
    let count = 0;
    const diagonals = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    
    diagonals.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        const idx = ny * this.width + nx;
        if (this.state.infected[idx]) count++;
      }
    });
    
    return count;
  }
  
  private getCardinalNeighborCount(x: number, y: number): number {
    let count = 0;
    const cardinals = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    cardinals.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        const idx = ny * this.width + nx;
        if (this.state.infected[idx]) count++;
      }
    });
    
    return count;
  }
  
  public step() {
    const newInfected = new Uint8Array(this.state.infected.length);
    const newGeneration = new Uint8Array(this.state.generation.length);
    
    const threshold = (100 - this.config.spreadRate) / 100; // Convert spread rate to threshold
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const isInfected = this.state.infected[idx];
        
        let shouldInfect = false;
        
        switch (this.config.ruleType) {
          case 'conway': {
            const neighbors = this.getNeighborCount(x, y);
            if (isInfected) {
              shouldInfect = neighbors === 2 || neighbors === 3;
            } else {
              shouldInfect = neighbors === 3;
            }
            break;
          }
          
          case 'diamond': {
            const diagonals = this.getDiagonalNeighborCount(x, y);
            shouldInfect = isInfected || (diagonals >= 2 && Math.random() > threshold);
            break;
          }
          
          case 'crystal': {
            const cardinals = this.getCardinalNeighborCount(x, y);
            shouldInfect = isInfected || (cardinals >= 2 && Math.random() > threshold);
            break;
          }
          
          case 'virus': {
            const neighbors = this.getNeighborCount(x, y);
            shouldInfect = isInfected || (neighbors >= 1 && Math.random() > threshold);
            break;
          }
        }
        
        newInfected[idx] = shouldInfect ? 1 : 0;
        newGeneration[idx] = shouldInfect ? this.state.generation[idx] + 1 : 0;
      }
    }
    
    this.state.infected = newInfected;
    this.state.generation = newGeneration;
  }
  
  public applyToImageData(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        if (!this.state.infected[idx]) continue;
        
        const pixelIdx = idx * 4;
        const generation = this.state.generation[idx];
        
        switch (this.config.infectionColor) {
          case 'invert':
            data[pixelIdx] = 255 - data[pixelIdx];
            data[pixelIdx + 1] = 255 - data[pixelIdx + 1];
            data[pixelIdx + 2] = 255 - data[pixelIdx + 2];
            break;
            
          case 'neon': {
            const max = Math.max(data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2]);
            if (max > 0) {
              data[pixelIdx] = (data[pixelIdx] / max) * 255;
              data[pixelIdx + 1] = (data[pixelIdx + 1] / max) * 255;
              data[pixelIdx + 2] = (data[pixelIdx + 2] / max) * 255;
            }
            break;
          }
            
          case 'void':
            data[pixelIdx] = 0;
            data[pixelIdx + 1] = 0;
            data[pixelIdx + 2] = 0;
            break;
            
          case 'rainbow': {
            const hue = (generation * 10) % 360;
            const rgb = this.hslToRgb(hue / 360, 1, 0.5);
            data[pixelIdx] = rgb[0];
            data[pixelIdx + 1] = rgb[1];
            data[pixelIdx + 2] = rgb[2];
            break;
          }
            
          case 'glitch':
            data[pixelIdx] = Math.floor(Math.random() * 256);
            data[pixelIdx + 1] = Math.floor(Math.random() * 256);
            data[pixelIdx + 2] = Math.floor(Math.random() * 256);
            break;
        }
      }
    }
    
    return imageData;
  }
  
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  public getInfectionPercentage(): number {
    let infected = 0;
    for (let i = 0; i < this.state.infected.length; i++) {
      if (this.state.infected[i]) infected++;
    }
    return (infected / this.state.infected.length) * 100;
  }
}
