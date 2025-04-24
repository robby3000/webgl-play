/**
 * Wave Tracer Texture Generation Module
 * 
 * Provides specialized texture generation functions for the Wave Tracer style.
 * These textures are generated once on initialization and when parameters change,
 * not on every frame, for better performance.
 */

import { TEXTURE_SIZE } from './constants';

// Force a unique seed for each regeneration
let globalSeed = Date.now();

/**
 * Params for randomizing the wave displacement texture
 */
export interface WaveDisplacementParams {
  // Unique seed to force regeneration
  seed: number;
  
  // Frequency multipliers
  freqMultiplier1: number;
  freqMultiplier2: number;
  freqMultiplier3: number;
  
  // Phase shifts
  phaseShift1: number;
  phaseShift2: number;
  phaseShift3: number;
  
  // Pattern mix weights
  weightLarge: number;
  weightMedium: number;
  weightFine: number;
  
  // Swirl intensity
  swirlStrength: number;
}

/**
 * Simple pseudo-random number generator with seed
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generate randomized parameters for the wave displacement texture
 */
export function generateRandomWaveParams(): WaveDisplacementParams {
  // Update global seed to ensure uniqueness
  globalSeed = Date.now() + Math.floor(Math.random() * 1000000);
  
  // Create seeded random function
  const random = seededRandom(globalSeed);
  
  return {
    // Store seed for debugging
    seed: globalSeed,
    
    // Randomize frequency multipliers (keep ranges that create good looking patterns)
    freqMultiplier1: 2.5 + random() * 2.5,    // 2.5-5.0
    freqMultiplier2: 6.0 + random() * 5.0,    // 6.0-11.0
    freqMultiplier3: 12.0 + random() * 6.0,   // 12.0-18.0
    
    // Randomize phase shifts for varied patterns
    phaseShift1: random() * Math.PI * 2,
    phaseShift2: random() * Math.PI * 2,
    phaseShift3: random() * Math.PI * 2,
    
    // Randomize weights but keep large pattern dominant for better coherence
    weightLarge: 0.5 + random() * 0.3,        // 0.5-0.8
    weightMedium: 0.1 + random() * 0.3,       // 0.1-0.4
    weightFine: 0.05 + random() * 0.15,       // 0.05-0.2
    
    // Randomize swirl intensity
    swirlStrength: 0.3 + random() * 0.5       // 0.3-0.8
  };
}

/**
 * Generate the wave displacement texture for the Wave Tracer style
 * This texture contains organic flowing patterns used for wave animation and distortion
 */
export function generateWaveDisplacementTexture(
  gl: WebGLRenderingContext, 
  texture: WebGLTexture | null,
  params: WaveDisplacementParams = generateRandomWaveParams()
): void {
  if (!texture) return;
  
  console.log(`Generating displacement texture with seed: ${params.seed}`);
  
  const size = TEXTURE_SIZE;
  const data = new Uint8Array(size * size * 4);
  
  // Extract parameters
  const {
    freqMultiplier1, freqMultiplier2, freqMultiplier3,
    phaseShift1, phaseShift2, phaseShift3,
    weightLarge, weightMedium, weightFine, 
    swirlStrength
  } = params;
  
  // Normalize weights
  const totalWeight = weightLarge + weightMedium + weightFine;
  const normWeightLarge = weightLarge / totalWeight;
  const normWeightMedium = weightMedium / totalWeight;
  const normWeightFine = weightFine / totalWeight;
  
  // Generate complex organic flowing patterns
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Normalize coordinates to 0-1 range
      const nx = x / size;
      const ny = y / size;
      
      // Create multi-frequency organic patterns with randomized parameters
      
      // Large flowing curves
      const nx1 = nx * freqMultiplier1;
      const ny1 = ny * (freqMultiplier1 * 0.8);
      const flow1 = Math.sin(nx1 * Math.PI + phaseShift1) * 
                    Math.sin(ny1 * Math.PI * 0.7 + phaseShift1 * 0.8);
      
      // Medium detail with cross-feedback
      const nx2 = nx * freqMultiplier2 + flow1 * 0.2;
      const ny2 = ny * (freqMultiplier2 * 0.9) + flow1 * 0.1;
      const flow2 = Math.sin(nx2 * Math.PI * 0.7 + phaseShift2) * 
                    Math.sin(ny2 * Math.PI + phaseShift2 * 1.2);
      
      // Fine details with feedback from medium layer
      const nx3 = nx * freqMultiplier3 + flow2 * 0.1;
      const ny3 = ny * (freqMultiplier3 * 0.95) + flow1 * 0.15;
      const flow3 = Math.sin(nx3 * Math.PI + phaseShift3) * 
                    Math.sin(ny3 * Math.PI + phaseShift3 * 0.9);
      
      // R channel: primary horizontal displacement with weighted combination
      const noiseR = flow1 * normWeightLarge + flow2 * normWeightMedium + flow3 * normWeightFine;
      
      // G channel: slightly different pattern for vertical displacement
      // Use different phase combinations for variety
      const flow1G = Math.sin(nx1 * Math.PI + phaseShift1 + 0.7) * 
                     Math.sin(ny1 * Math.PI * 0.7 + phaseShift1 * 1.3 + 1.1);
      const flow2G = Math.sin(nx2 * Math.PI * 0.7 + phaseShift2 + 0.9) * 
                     Math.sin(ny2 * Math.PI + phaseShift2 * 0.7 + 0.3);
      const flow3G = Math.sin(nx3 * Math.PI + phaseShift3 + 0.5) * 
                     Math.sin(ny3 * Math.PI + phaseShift3 * 1.1 + 0.8);
      const noiseG = flow1G * normWeightLarge + flow2G * normWeightMedium + flow3G * normWeightFine;
      
      // B channel: additional pattern with different frequencies
      const nx1B = nx * (freqMultiplier1 * 1.1);
      const ny1B = ny * (freqMultiplier1 * 0.9);
      const flow1B = Math.sin(nx1B * Math.PI + phaseShift1 * 1.2) * 
                     Math.sin(ny1B * Math.PI * 0.8 + phaseShift1 * 0.6);
      const flow2B = Math.sin(nx2 * Math.PI * 0.9 + phaseShift2 * 1.4) * 
                     Math.sin(ny2 * Math.PI * 1.1 + phaseShift2 * 0.8);
      const flow3B = Math.sin(nx3 * Math.PI * 1.2 + phaseShift3 * 0.7) * 
                     Math.sin(ny3 * Math.PI * 0.9 + phaseShift3 * 1.3);
      const noiseB = flow1B * normWeightLarge + flow2B * normWeightMedium + flow3B * normWeightFine;
      
      // Alpha channel: controls flow direction and strength
      // Creates swirl patterns and variable edge softness
      const angle = Math.atan2(ny - 0.5, nx - 0.5) * 2;
      const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2;
      const swirl = (Math.sin(dist * 7 + angle * 3 + phaseShift1) * 0.5 + 0.5) * 
                   (1.0 - Math.min(1.0, dist));
      const noiseA = (flow1 * 0.3 + flow2 * 0.3 + swirl * swirlStrength) * 0.8 + 0.2;
      
      // Store in RGBA format, normalizing to 0-255 range
      data[idx] = Math.floor((noiseR * 0.5 + 0.5) * 255);     // R: horizontal displacement
      data[idx + 1] = Math.floor((noiseG * 0.5 + 0.5) * 255); // G: vertical displacement
      data[idx + 2] = Math.floor((noiseB * 0.5 + 0.5) * 255); // B: intensity modulation
      data[idx + 3] = Math.floor(noiseA * 255);               // A: flow control
    }
  }
  
  // Upload to WebGL texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  
  // Use linear filtering for smoother transitions
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  // Use repeat wrap mode for seamless tiling
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}
