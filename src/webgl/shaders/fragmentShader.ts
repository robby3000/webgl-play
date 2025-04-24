import { CreateFragmentShader } from "../types";
import { createWaveTracerShader } from "./waveTracerShader";

/**
 * Creates the WebGL fragment shader with all necessary uniform declarations
 * and utility functions
 */
const createFragmentShader: CreateFragmentShader = () => {
  // Import the Wave Tracer specific shader code
  const waveTracerShader = createWaveTracerShader();

  const shader = /* glsl */ `
    precision mediump float;

    // Basic uniforms
    uniform float u_time;         // Time in seconds
    uniform vec2 u_resolution;    // Canvas size (width, height)
    uniform float u_speed;        // Animation speed multiplier
    uniform vec2 u_waveFreq;      // Frequency of waves (x, y components)
    uniform vec2 u_waveAmp;       // Amplitude of waves (x, y components)
    uniform float u_style;        // Style selection (0: Marshmallow Soup, 1: Wave Tracer)
    
    // Texture samplers for layered approach
    uniform sampler2D u_gradient; // 1D texture for the gradient
    uniform sampler2D u_bgTexture;    // Background texture
    uniform sampler2D u_noiseTexture; // Pre-computed noise texture
    uniform sampler2D u_waveTexture;  // Wave distortion texture
    uniform sampler2D u_waveDisplacementTexture; // Wave displacement texture (for Wave Tracer)

    // Constants
    const float PI = 3.14159265359;
    const float MARSHMALLOW_SOUP = 0.0;
    const float WAVE_TRACER = 1.0;

    //-----------------------------
    // SHARED UTILITY FUNCTIONS  
    //-----------------------------
    
    // Helper functions
    vec2 rotate(vec2 uv, float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c) * uv;
    }
    
    //-----------------------------
    // MARSHMALLOW SOUP STYLE CODE
    //-----------------------------
    
    // Generate animated wave pattern directly for Marshmallow Soup
    float animatedWaveMarshmallow(vec2 uv, float time, vec2 freq, float amp, float phase) {
      // Create wave pattern with direct sine calculation
      float wave = sin(uv.x * freq.x + time * 2.0 + phase) * 
                   sin(uv.y * freq.y + time * 1.7) * amp;
      return wave;
    }
    
    // Apply layered wave distortion to coordinates for Marshmallow Soup style
    vec2 distortCoordsMarshmallow(vec2 uv, float time) {
      // Basic wave patterns (more visible)
      float wave1 = animatedWaveMarshmallow(uv, time, u_waveFreq * 0.5, u_waveAmp.x * 2.0, 0.0);
      float wave2 = animatedWaveMarshmallow(uv * 1.5, time * 0.7, u_waveFreq * 0.8, u_waveAmp.y * 2.0, PI * 0.5);
      
      // Sample texture for additional organic distortion
      vec2 waveUV = uv * u_waveFreq * 0.2 + vec2(time * 0.1, time * 0.05);
      vec4 texWave = texture2D(u_waveTexture, waveUV);
      
      // Combine procedural waves with texture-based distortion
      vec2 displacement;
      displacement.x = wave1 + (texWave.r - 0.5) * u_waveAmp.x;
      displacement.y = wave2 + (texWave.g - 0.5) * u_waveAmp.y;
      
      return uv + displacement;
    }
    
    // Render the Marshmallow Soup style
    float renderMarshmallowSoup(vec2 uv, float time) {
      // Base layer: animated background texture
      vec2 bgUV = rotate(uv - 0.5, time * 0.05) + 0.5;
      bgUV = bgUV * (0.8 + sin(time * 0.1) * 0.1) + vec2(time * 0.05, 0.0);
      vec3 bgColor = texture2D(u_bgTexture, bgUV).rgb;
      
      // Apply wave distortions to coordinates
      vec2 distortedUV = distortCoordsMarshmallow(uv, time);
      
      // Create visible wave boundaries for clearer wave effect
      float wave1 = animatedWaveMarshmallow(uv, time, u_waveFreq, 1.0, 0.0);
      float wave2 = animatedWaveMarshmallow(uv * 1.2, time * 0.8, u_waveFreq * 1.5, 1.0, PI/3.0);
      float wavePattern = (wave1 + wave2) * 0.5 + 0.5; // Normalized to 0-1
      
      // Sample noise texture with distorted coordinates
      vec3 noiseColor = texture2D(u_noiseTexture, distortedUV).rgb;
      
      // Create dynamic blend factor based on time and wave pattern
      float blendFactor = 0.5 + sin(time * 0.2) * 0.2;
      
      // Blend noise, background and wave pattern
      float lightness = mix(noiseColor.r, bgColor.r, blendFactor) * 0.7 + wavePattern * 0.3;
      
      // Apply second wave distortion layer
      vec2 wave2UV = distortCoordsMarshmallow(uv * 1.5, time * 1.3);
      float wave2Factor = texture2D(u_noiseTexture, wave2UV).g * 0.2;
      
      // Create final gradient input value with clear wave patterns
      return mix(lightness, wavePattern, 0.3) + wave2Factor;
    }
    
    //-----------------------------
    // WAVE TRACER STYLE CODE
    //-----------------------------
    
    ${waveTracerShader}
    
    void main() {
      // Normalize coordinates and fix aspect ratio
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspectRatio = u_resolution.x / u_resolution.y;
      uv.x *= aspectRatio;
      
      // Animate time 
      float time = u_time * u_speed;
      
      // Calculate final lightness based on selected style
      float lightness;
      
      // Choose rendering style based on u_style uniform
      if (u_style == MARSHMALLOW_SOUP) {
        lightness = renderMarshmallowSoup(uv, time);
      } else {
        lightness = renderWaveTracer(uv, time, u_waveFreq, u_waveAmp);
      }
      
      // Sample the gradient with the final lightness value
      vec3 finalColor = texture2D(u_gradient, vec2(lightness, 0.5)).rgb;
      
      // Output the final color
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  return shader;
};

export default createFragmentShader;
