import { noiseUtils } from "../../utils/noiseUtils";
import { simplex_noise } from "../../utils/simplexNoise";
import { noiseShaderFunctions } from "./noiseShader";
import { blurShaderFunctions } from "./blurShader";
import { CreateFragmentShader } from "../types";

/**
 * Creates the WebGL fragment shader with all necessary uniform declarations
 * and utility functions
 */
const createFragmentShader: CreateFragmentShader = () => {
  const shader = /* glsl */ `
    precision mediump float;

    // Basic uniforms
    uniform float u_time;         // Time in seconds
    uniform vec2 u_resolution;    // Canvas size (width, height)
    uniform float u_speed;        // Animation speed multiplier
    uniform vec2 u_waveFreq;      // Frequency of waves (x, y components)
    uniform vec2 u_waveAmp;       // Amplitude of waves (x, y components for two waves)
    uniform sampler2D u_gradient; // Use a 1D texture for the gradient
    
    // New uniforms for Phase 2
    uniform float u_noiseScale;           // Overall scale for noise patterns
    uniform float u_noiseVerticalStretch; // Vertical stretching for noise
    uniform float u_noiseSwirlSpeed;      // Speed of time evolution for noise
    uniform float u_noiseFlowSpeed;       // Horizontal drift speed for noise
    
    uniform float u_blurAmount;          // Maximum blur radius
    uniform vec2 u_blurSharpnessRange;   // Range for blur sharpness/bias
    uniform float u_blurNoiseScale;      // Scale for dynamic blur pattern
    uniform float u_blurNoiseSpeed;      // Speed of blur noise
    uniform float u_blurPulsingSpeed;    // Speed of blur bias oscillation

    const float PI = 3.14159;
    const float LY1 = 1.00, LY2 = 0.85, LY3 = 0.70;

    float WAVE1_Y() { return 0.45 * u_resolution.y; }
    float WAVE2_Y() { return 0.9 * u_resolution.y; }

    ${noiseUtils}
    ${simplex_noise}

    float get_x() {
      return 900.0 + gl_FragCoord.x - u_resolution.x / 2.0;
    }

    float smoothstep_(float t) 
      { return t * t * t * (t * (6.0 * t - 15.0) + 10.0); }

    float lerp(float a, float b, float t)
      { return a * (1.0 - t) + b * t; }

    float ease_in(float x)
      { return 1.0 - cos((x * PI) * 0.5); }

    ${noiseShaderFunctions}
    ${blurShaderFunctions}

    // Simplified background_noise adaptation to use uniforms
    float background_noise(float offset) {
      return background_noise(
        offset, 
        u_waveFreq.x, 
        u_waveFreq.y, 
        u_speed, 
        u_noiseScale, 
        u_noiseVerticalStretch, 
        u_noiseSwirlSpeed, 
        u_noiseFlowSpeed
      );
    }

    // Simplified wave_y_noise adaptation to use uniforms
    float wave_y_noise(float offset) {
      return wave_y_noise(
        offset, 
        u_waveFreq.x, 
        u_speed, 
        u_noiseScale, 
        u_noiseFlowSpeed
      );
    }

    // Simplified calc_blur adaptation to use uniforms
    float calc_blur(float offset) {
      return calc_blur(
        offset, 
        u_waveFreq.x, 
        u_speed, 
        u_blurNoiseScale, 
        u_blurNoiseSpeed
      );
    }

    float wave_alpha(float Y, float wave_height, float offset) {
      float wave_y = Y + wave_y_noise(offset) * wave_height;
      float dist = wave_y - gl_FragCoord.y;
      float blur_fac = calc_blur(offset);

      const int blurQuality = 7;
      const float PART = 1.0 / float(blurQuality);
      float sum = 0.0;
      for (int i = 0; i < blurQuality; i++) {
        float t = blurQuality == 1 ? 0.5 : PART * float(i);
        sum += wave_alpha_part(dist, blur_fac, t, u_blurSharpnessRange, u_blurAmount) * PART;
      }
      return sum;
    }

    vec3 calc_color(float lightness) {
      lightness = clamp(lightness, 0.0, 1.0);
      return texture2D(u_gradient, vec2(lightness, 0.5)).rgb;
    }

    void main() {
      float bg_lightness = background_noise(-192.4);
      float w1_lightness = background_noise( 273.3);
      float w2_lightness = background_noise( 623.1);

      float w1_alpha = wave_alpha(WAVE1_Y(), u_waveAmp.x * u_resolution.y, 112.5 * 48.75);
      float w2_alpha = wave_alpha(WAVE2_Y(), u_waveAmp.y * u_resolution.y, 225.0 * 36.00);

      float lightness = bg_lightness;
      lightness = lerp(lightness, w2_lightness, w2_alpha);
      lightness = lerp(lightness, w1_lightness, w1_alpha);

      gl_FragColor = vec4(calc_color(lightness), 1.0);
    }
  `;
  return shader;
};

export default createFragmentShader;
