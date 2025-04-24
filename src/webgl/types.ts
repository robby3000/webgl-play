/**
 * WebGL gradient animation types
 */

export interface CreateFragmentShader {
  (): string;
}

/**
 * Gradient animation style options
 */
export enum GradientStyle {
  MARSHMALLOW_SOUP = "marshmallow_soup",
  WAVE_TRACER = "wave_tracer"
}

/**
 * Common interface for gradient parameters
 */
export interface GradientParameters {
  // Style selection
  style: GradientStyle;
  
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
 * WebGL uniform locations for optimized renderer
 */
export interface UniformLocations {
  // Basic uniforms (updated every frame)
  u_time: WebGLUniformLocation | null;
  u_resolution: WebGLUniformLocation | null;
  
  // Animation uniforms (updated when parameters change)
  u_speed: WebGLUniformLocation | null;
  u_waveFreq: WebGLUniformLocation | null;
  u_waveAmp: WebGLUniformLocation | null;
  
  // Style selection uniform (updated when style changes)
  u_style: WebGLUniformLocation | null;
  
  // Texture sampler uniforms (set once)
  u_gradient: WebGLUniformLocation | null;
  u_bgTexture: WebGLUniformLocation | null;
  u_noiseTexture: WebGLUniformLocation | null;
  u_waveTexture: WebGLUniformLocation | null;
  u_waveDisplacementTexture: WebGLUniformLocation | null;
}

/**
 * Vector2 type for 2D values
 */
export type Vec2 = [number, number];

/**
 * Vector3 type for RGB colors
 */
export type Vec3 = [number, number, number];

/**
 * Texture layer information
 */
export interface TextureLayer {
  texture: WebGLTexture | null;
  unit: number;
}
