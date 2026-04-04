// Galvanic Corrosion Engine - Electrochemical Color Channel Warfare

export interface GalvanicConfig {
  corrosionStrength: number; // 0-100
  motionThreshold: number; // 0-100
  oxidationDepth: number; // 1-10
  preserveGreen: boolean;
  reversePolarity: boolean;
}

export class GalvanicCorrosionEngine {
  private width: number;
  private height: number;
  private config: GalvanicConfig;
  private previousFrame: Uint8ClampedArray | null = null;
  
  constructor(width: number, height: number, config: GalvanicConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
  }
  
  /**
   * Detect motion between current and previous frame
   * Returns motion intensity (0-255) for each pixel
   */
  private detectMotion(current: Uint8ClampedArray, previous: Uint8ClampedArray): Uint8Array {
    const motion = new Uint8Array(this.width * this.height);
    
    for (let i = 0; i < current.length; i += 4) {
      const pixelIdx = Math.floor(i / 4);
      
      // Calculate color difference
      const rDiff = Math.abs(current[i] - previous[i]);
      const gDiff = Math.abs(current[i + 1] - previous[i + 1]);
      const bDiff = Math.abs(current[i + 2] - previous[i + 2]);
      
      // Average difference as motion intensity
      const motionIntensity = (rDiff + gDiff + bDiff) / 3;
      
      // Threshold check
      const threshold = (this.config.motionThreshold / 100) * 255;
      motion[pixelIdx] = motionIntensity > threshold ? motionIntensity : 0;
    }
    
    return motion;
  }
  
  /**
   * Apply galvanic exchange: Red oxidizes, Blue gains
   */
  private applyGalvanicExchange(
    data: Uint8ClampedArray,
    motion: Uint8Array,
    x: number,
    y: number
  ): void {
    const idx = (y * this.width + x) * 4;
    const pixelIdx = y * this.width + x;
    
    if (motion[pixelIdx] === 0) return;
    
    // Motion intensity affects strength (0-1)
    const motionFactor = motion[pixelIdx] / 255;
    const strength = (this.config.corrosionStrength / 100) * motionFactor;
    
    const r = data[idx];
    const b = data[idx + 2];
    
    if (this.config.reversePolarity) {
      // Reverse: Blue oxidizes, Red gains
      const blueLoss = b * strength;
      data[idx + 2] = Math.max(0, b - blueLoss);
      data[idx] = Math.min(255, r + blueLoss);
    } else {
      // Normal: Red oxidizes, Blue gains
      const redLoss = r * strength;
      data[idx] = Math.max(0, r - redLoss);
      data[idx + 2] = Math.min(255, b + redLoss);
    }
    
    // Optionally corrupt green channel too
    if (!this.config.preserveGreen) {
      const g = data[idx + 1];
      const greenLoss = g * (strength * 0.5); // Half strength for green
      data[idx + 1] = Math.max(0, g - greenLoss);
    }
  }
  
  /**
   * Spread oxidation to neighboring pixels (cascade effect)
   */
  private spreadOxidation(data: Uint8ClampedArray, motion: Uint8Array): void {
    // Create temporary motion map for spreading
    const spreadMotion = new Uint8Array(motion);
    
    for (let depth = 0; depth < this.config.oxidationDepth; depth++) {
      const newSpread = new Uint8Array(spreadMotion);
      
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          const idx = y * this.width + x;
          
          if (spreadMotion[idx] === 0) continue;
          
          // Leak corrosion to cardinal neighbors
          const leakAmount = Math.floor(spreadMotion[idx] * 0.3); // 30% leak
          
          const neighbors = [
            [x, y - 1], // North
            [x + 1, y], // East
            [x, y + 1], // South
            [x - 1, y], // West
          ];
          
          neighbors.forEach(([nx, ny]) => {
            const nIdx = ny * this.width + nx;
            newSpread[nIdx] = Math.min(255, newSpread[nIdx] + leakAmount);
          });
        }
      }
      
      // Apply corrosion to spread areas
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (newSpread[y * this.width + x] > 0) {
            this.applyGalvanicExchange(data, newSpread, x, y);
          }
        }
      }
      
      spreadMotion.set(newSpread);
    }
  }
  
  /**
   * Process a single frame with galvanic corrosion
   */
  public processFrame(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    // Need previous frame for motion detection
    if (!this.previousFrame) {
      this.previousFrame = new Uint8ClampedArray(data);
      return imageData;
    }
    
    // Detect motion
    const motion = this.detectMotion(data, this.previousFrame);
    
    // Apply galvanic exchange to moving pixels
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.applyGalvanicExchange(data, motion, x, y);
      }
    }
    
    // Spread oxidation if depth > 0
    if (this.config.oxidationDepth > 1) {
      this.spreadOxidation(data, motion);
    }
    
    // Store current frame for next iteration
    this.previousFrame = new Uint8ClampedArray(data);
    
    return imageData;
  }
  
  /**
   * Reset engine state (clear previous frame)
   */
  public reset(): void {
    this.previousFrame = null;
  }
  
  /**
   * Get corrosion statistics
   */
  public getStats(imageData: ImageData): {
    avgRedLoss: number;
    avgBlueGain: number;
    corrodedPixels: number;
  } {
    if (!this.previousFrame) {
      return { avgRedLoss: 0, avgBlueGain: 0, corrodedPixels: 0 };
    }
    
    let totalRedLoss = 0;
    let totalBlueGain = 0;
    let corrodedCount = 0;
    
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const redDiff = this.previousFrame[i] - data[i];
      const blueDiff = data[i + 2] - this.previousFrame[i + 2];
      
      if (redDiff > 0 || blueDiff > 0) {
        totalRedLoss += redDiff;
        totalBlueGain += blueDiff;
        corrodedCount++;
      }
    }
    
    const totalPixels = this.width * this.height;
    
    return {
      avgRedLoss: totalRedLoss / totalPixels,
      avgBlueGain: totalBlueGain / totalPixels,
      corrodedPixels: corrodedCount,
    };
  }
}
