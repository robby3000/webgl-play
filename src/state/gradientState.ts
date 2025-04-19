/**
 * Default values and constraints for gradient parameters
 */
import { GradientParameters, ColorStop } from "../webgl/types";

// Default values for all parameters
export const DEFAULT_PARAMETERS: GradientParameters = {
  // Animation parameters
  speed: 0.4,
  
  // Wave parameters
  waveFreqX: 5.0,
  waveFreqY: 3.0,
  waveAmpX: 0.05,
  waveAmpY: 0.05,
  
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

// Parameter constraints
export const PARAMETER_CONSTRAINTS = {
  speed: { min: 0.1, max: 5.0, step: 0.05 },
  
  waveFreqX: { min: 0.5, max: 20.0, step: 0.1 },
  waveFreqY: { min: 0.5, max: 20.0, step: 0.1 },
  waveAmpX: { min: 0.0, max: 0.3, step: 0.005 },
  waveAmpY: { min: 0.0, max: 0.3, step: 0.005 },
  
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

// Default color stops
export const DEFAULT_COLOR_STOPS: ColorStop[] = [
  { id: 1, position: 0.0, color: "#ff0000" }, // Red
  { id: 2, position: 0.5, color: "#ffff00" }, // Yellow
  { id: 3, position: 1.0, color: "#0000ff" }, // Blue
];

/**
 * Generate random parameter values within constraints
 */
export function randomizeParameters(): GradientParameters {
  return {
    speed: randomInRange(PARAMETER_CONSTRAINTS.speed),
    
    waveFreqX: randomInRange(PARAMETER_CONSTRAINTS.waveFreqX),
    waveFreqY: randomInRange(PARAMETER_CONSTRAINTS.waveFreqY),
    waveAmpX: randomInRange(PARAMETER_CONSTRAINTS.waveAmpX),
    waveAmpY: randomInRange(PARAMETER_CONSTRAINTS.waveAmpY),
    
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
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    });
  }
  return randomStops.sort((a, b) => a.position - b.position);
}

/**
 * Helper function to generate a random value within a range
 */
function randomInRange({ min, max }: { min: number, max: number }): number {
  return min + Math.random() * (max - min);
}
