/**
 * WebGL gradient animation types
 */

export interface CreateFragmentShader {
  (): string;
}

/**
 * Common interface for gradient parameters
 */
export interface GradientParameters {
  // Animation parameters
  speed: number;
  
  // Wave parameters
  waveFreqX: number;
  waveFreqY: number;
  waveAmpX: number;
  waveAmpY: number;
  
  // Noise parameters
  noiseScale: number;
  noiseVerticalStretch: number;
  noiseSwirlSpeed: number;
  noiseFlowSpeed: number;
  
  // Blur parameters
  blurAmount: number;
  blurSharpnessMin: number;
  blurSharpnessMax: number;
  blurNoiseScale: number;
  blurNoiseSpeed: number;
  blurPulsingSpeed: number;
}

/**
 * Interface for gradient color stops
 */
export interface ColorStop {
  id: number;       // For React key prop
  position: number; // 0.0 to 1.0
  color: string;    // Hex color string (e.g., "#ff0000")
}

/**
 * WebGL uniform locations
 */
export interface UniformLocations {
  u_time: WebGLUniformLocation | null;
  u_resolution: WebGLUniformLocation | null;
  u_speed: WebGLUniformLocation | null;
  u_waveFreq: WebGLUniformLocation | null;
  u_waveAmp: WebGLUniformLocation | null;
  u_gradient: WebGLUniformLocation | null;
  
  // New uniforms for Phase 2
  u_noiseScale?: WebGLUniformLocation | null;
  u_noiseVerticalStretch?: WebGLUniformLocation | null;
  u_noiseSwirlSpeed?: WebGLUniformLocation | null;
  u_noiseFlowSpeed?: WebGLUniformLocation | null;
  
  u_blurAmount?: WebGLUniformLocation | null;
  u_blurSharpnessRange?: WebGLUniformLocation | null;
  u_blurNoiseScale?: WebGLUniformLocation | null;
  u_blurNoiseSpeed?: WebGLUniformLocation | null;
  u_blurPulsingSpeed?: WebGLUniformLocation | null;
}

/**
 * Vector2 type for 2D values
 */
export type Vec2 = [number, number];

/**
 * Vector3 type for RGB colors
 */
export type Vec3 = [number, number, number];
