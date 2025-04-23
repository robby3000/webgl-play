/**
 * Default values and constraints for gradient parameters
 */
import { GradientParameters, ColorStop } from "../webgl/types";

// Default values for all parameters
export const DEFAULT_PARAMETERS: GradientParameters = {
  // Animation parameters - increased for more visible animation
  speed: 1.0,
  
  // Wave parameters - adjusted for more visible waves
  waveFreqX: 6.0,
  waveFreqY: 4.0,
  waveAmpX: 0.12,
  waveAmpY: 0.12,
  
  // Noise parameters
  noiseScale: 1.0,
  noiseVerticalStretch: 1.0,
  noiseSwirlSpeed: 1.0,
  noiseFlowSpeed: 1.0,
  
  // Blur parameters
  blurAmount: 1.0, 
  blurSharpnessMin: 0.9,
  blurSharpnessMax: 1.2,
  blurNoiseScale: 1.0,
  blurNoiseSpeed: 1.0,
  blurPulsingSpeed: 1.0
};

// Parameter constraints - adjusted ranges for better wave visualization
export const PARAMETER_CONSTRAINTS = {
  speed: { min: 0.3, max: 5.0, step: 0.05 },
  
  waveFreqX: { min: 2.0, max: 20.0, step: 0.1 },
  waveFreqY: { min: 2.0, max: 20.0, step: 0.1 },
  waveAmpX: { min: 0.05, max: 0.3, step: 0.005 },
  waveAmpY: { min: 0.05, max: 0.3, step: 0.005 },
  
  noiseScale: { min: 0.1, max: 5.0, step: 0.1 },
  noiseVerticalStretch: { min: 0.2, max: 3.0, step: 0.1 },
  noiseSwirlSpeed: { min: 0.1, max: 5.0, step: 0.1 },
  noiseFlowSpeed: { min: 0.1, max: 5.0, step: 0.1 },
  
  blurAmount: { min: 0.1, max: 3.0, step: 0.1 },
  blurSharpnessMin: { min: 0.5, max: 1.5, step: 0.05 },
  blurSharpnessMax: { min: 0.8, max: 2.0, step: 0.05 },
  blurNoiseScale: { min: 0.1, max: 5.0, step: 0.1 },
  blurNoiseSpeed: { min: 0.1, max: 5.0, step: 0.1 },
  blurPulsingSpeed: { min: 0.1, max: 5.0, step: 0.1 }
};

// Default color stops - more vibrant colors for better visualization
export const DEFAULT_COLOR_STOPS: ColorStop[] = [
  { id: 1, position: 0.0, color: "#ff2b00" }, // Bright red
  { id: 2, position: 0.5, color: "#ffcc00" }, // Yellow
  { id: 3, position: 1.0, color: "#00aaff" }, // Blue
];

/**
 * Generate random parameter values within constraints
 */
export function randomizeParameters(): GradientParameters {
  return {
    // Higher animation speed range for better visualization
    speed: 0.5 + Math.random() * 1.5,
    
    // Higher wave frequencies and amplitudes for more visible waves
    waveFreqX: 3.0 + Math.random() * 5.0,
    waveFreqY: 2.0 + Math.random() * 4.0,
    waveAmpX: 0.08 + Math.random() * 0.12,
    waveAmpY: 0.08 + Math.random() * 0.12,
    
    noiseScale: randomInRange(PARAMETER_CONSTRAINTS.noiseScale),
    noiseVerticalStretch: randomInRange(PARAMETER_CONSTRAINTS.noiseVerticalStretch),
    noiseSwirlSpeed: randomInRange(PARAMETER_CONSTRAINTS.noiseSwirlSpeed),
    noiseFlowSpeed: randomInRange(PARAMETER_CONSTRAINTS.noiseFlowSpeed),
    
    blurAmount: randomInRange(PARAMETER_CONSTRAINTS.blurAmount),
    blurSharpnessMin: randomInRange(PARAMETER_CONSTRAINTS.blurSharpnessMin),
    blurSharpnessMax: randomInRange(PARAMETER_CONSTRAINTS.blurSharpnessMax),
    blurNoiseScale: randomInRange(PARAMETER_CONSTRAINTS.blurNoiseScale),
    blurNoiseSpeed: randomInRange(PARAMETER_CONSTRAINTS.blurNoiseSpeed),
    blurPulsingSpeed: randomInRange(PARAMETER_CONSTRAINTS.blurPulsingSpeed)
  };
}

/**
 * Generate random color stops
 */
export function randomizeColorStops(numStops: number = 3): ColorStop[] {
  const randomStops: ColorStop[] = [];
  for (let i = 0; i < numStops; i++) {
    randomStops.push({
      id: Date.now() + i,
      position: i === 0 ? 0 : (i === numStops - 1 ? 1 : Math.random()),
      // Generate more vibrant, saturated colors
      color: generateVibrantColor()
    });
  }
  return randomStops.sort((a, b) => a.position - b.position);
}

/**
 * Generate a vibrant, saturated color
 */
function generateVibrantColor(): string {
  // Use HSL to ensure vibrant colors
  const h = Math.floor(Math.random() * 360); // Hue: 0-359
  const s = 70 + Math.floor(Math.random() * 30); // Saturation: 70-100%
  const l = 45 + Math.floor(Math.random() * 25); // Lightness: 45-70%
  
  // Convert HSL to hex
  return hslToHex(h, s, l);
}

/**
 * Convert HSL values to hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  const normR = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const normG = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const normB = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `#${normR}${normG}${normB}`;
}

/**
 * Helper function to generate a random value within a range
 */
function randomInRange({ min, max }: { min: number, max: number }): number {
  return min + Math.random() * (max - min);
}
