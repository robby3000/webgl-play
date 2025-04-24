/**
 * Wave Tracer Shader Module
 * 
 * Implements a visually rich wave animation inspired by the original example
 * but using pre-computed textures and optimized wave calculations for better performance.
 */

/**
 * Creates fragment shader code for the Wave Tracer effect
 * Optimized version with reduced GPU load but visually interesting
 */
export const createWaveTracerShader = () => {
  // The actual GLSL shader code
  const shader = /* glsl */ `
    // Enhanced smoothstep for better wave edges
    float waveTracerSmoothstep(float edge0, float edge1, float x) {
      float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }
    
    // Fast sine approximation for interesting waves that's more GPU-friendly
    float fastSine(float x) {
      // This approximates sin(x) but is faster to compute
      x = mod(x, 2.0 * PI);
      return 4.0 * (x / (2.0 * PI) - (x / (2.0 * PI)) * (x / (2.0 * PI)));
    }
    
    // Enhanced noise function using texture sampling
    float enhancedNoise(vec2 uv, float time, vec4 patternData) {
      // Use texture data as noise base but add interesting sine patterns
      float noise = patternData.r * 0.7 + patternData.g * 0.3;
      
      // Add sine-wave details for interesting fluid patterns
      float s1 = sin(uv.x * 10.0 + time * 0.5) * sin(uv.y * 8.0 + time * 0.4) * 0.1;
      float s2 = sin(uv.x * 5.0 - time * 0.3) * sin(uv.y * 7.0 + time * 0.2) * 0.08;
      
      return noise + s1 + s2;
    }
    
    // Render the Wave Tracer style
    float renderWaveTracer(vec2 uv, float time, vec2 freq, vec2 amp) {
      // Fix aspect ratio for consistent wave appearance
      float aspectRatio = u_resolution.x / u_resolution.y;
      vec2 aspectUV = vec2(uv.x * aspectRatio, uv.y);
      
      // Create multiple overlapping texture samples for rich background
      vec2 bgUV1 = aspectUV + vec2(
        sin(time * 0.1) * 0.02 + time * 0.03, 
        cos(time * 0.08) * 0.02 + time * 0.02
      );
      vec2 bgUV2 = aspectUV * 1.3 + vec2(
        cos(time * 0.12) * 0.02 - time * 0.02, 
        sin(time * 0.09) * 0.02 + time * 0.01
      );
      
      // Sample background textures with different scales and offsets
      vec3 bgColor1 = texture2D(u_bgTexture, bgUV1).rgb;
      vec3 bgColor2 = texture2D(u_bgTexture, bgUV2).rgb;
      
      // Create multiple animated wave patterns with varied scales and speeds
      vec2 patternUV1 = aspectUV * vec2(freq.x * 0.2, freq.y * 0.2) + vec2(time * 0.12, time * 0.07);
      vec2 patternUV2 = aspectUV * vec2(freq.y * 0.15, freq.x * 0.25) + vec2(-time * 0.09, time * 0.08);
      vec2 patternUV3 = aspectUV * vec2(freq.x * 0.3, freq.y * 0.1) + vec2(time * 0.05, -time * 0.06);
      
      // Sample wave displacement patterns
      vec4 wavePattern1 = texture2D(u_waveDisplacementTexture, patternUV1);
      vec4 wavePattern2 = texture2D(u_waveDisplacementTexture, patternUV2);
      vec4 wavePattern3 = texture2D(u_waveDisplacementTexture, patternUV3);
      
      // Sample wave colors with interesting offsets and blends
      vec2 colorUV1 = aspectUV + vec2(time * 0.07, time * 0.05) + (wavePattern1.rg - 0.5) * 0.1;
      vec2 colorUV2 = aspectUV * 1.2 + vec2(-time * 0.06, time * 0.04) + (wavePattern2.gb - 0.5) * 0.1;
      vec3 waveColor1 = texture2D(u_noiseTexture, colorUV1).rgb;
      vec3 waveColor2 = texture2D(u_noiseTexture, colorUV2).rgb;
      
      // ===== CREATE INTERESTING WAVE PATTERNS =====
      
      // Generate multiple sine-based wave layers with texture influence
      float baseFreq1 = enhancedNoise(aspectUV, time, wavePattern1) * 0.5 + 0.5;
      float baseFreq2 = enhancedNoise(aspectUV, time * 0.8, wavePattern2) * 0.5 + 0.5;
      
      // Calculate multiple animated wave positions with sine-based curves
      float wave1Y = 0.3 + sin(time * 0.2) * 0.05 + sin(aspectUV.x * 3.0 + time) * 0.04;
      wave1Y += (wavePattern1.r - 0.5) * amp.x * 0.4 * (1.0 + sin(time * 0.3) * 0.2);
      
      float wave2Y = 0.6 + sin(time * 0.15 + 1.0) * 0.06 + sin(aspectUV.x * 2.0 - time * 0.7) * 0.05;
      wave2Y += (wavePattern2.g - 0.5) * amp.y * 0.35 * (1.0 + cos(time * 0.25) * 0.2);
      
      float wave3Y = 0.15 + sin(time * 0.1 + 2.0) * 0.04 + sin(aspectUV.x * 4.0 + time * 0.5) * 0.03;
      wave3Y += (wavePattern3.b - 0.5) * amp.x * 0.3 * (1.0 + sin(time * 0.4) * 0.2);
      
      float wave4Y = 0.75 + sin(time * 0.25 + 3.0) * 0.05 + sin(aspectUV.x * 5.0 - time * 0.6) * 0.03;
      wave4Y += (wavePattern1.a - 0.5) * amp.y * 0.25 * (1.0 + cos(time * 0.35) * 0.2);
      
      // Calculate distances to wave boundaries with curved profiles
      float dist1 = wave1Y - uv.y + sin(aspectUV.x * 10.0 + time) * 0.01;
      float dist2 = wave2Y - uv.y + sin(aspectUV.x * 8.0 - time * 0.7) * 0.015;
      float dist3 = wave3Y - uv.y + sin(aspectUV.x * 12.0 + time * 0.5) * 0.008;
      float dist4 = wave4Y - uv.y + sin(aspectUV.x * 6.0 - time * 0.4) * 0.012;
      
      // Edge width varies with time and texture for organic appearance
      float timeScale = 0.7 + sin(time * 0.2) * 0.3;
      float edgeWidth1 = (0.04 + wavePattern1.a * 0.03 + baseFreq1 * 0.01) * timeScale;
      float edgeWidth2 = (0.035 + wavePattern2.a * 0.025 + baseFreq2 * 0.01) * timeScale;
      float edgeWidth3 = (0.03 + wavePattern3.a * 0.02 + baseFreq1 * 0.008) * timeScale;
      float edgeWidth4 = (0.025 + wavePattern1.a * 0.015 + baseFreq2 * 0.007) * timeScale;
      
      // Calculate alpha with smooth edges
      float wave1Alpha = waveTracerSmoothstep(edgeWidth1, -edgeWidth1, dist1) * 0.8;
      float wave2Alpha = waveTracerSmoothstep(edgeWidth2, -edgeWidth2, dist2) * 0.7;
      float wave3Alpha = waveTracerSmoothstep(edgeWidth3, -edgeWidth3, dist3) * 0.6;
      float wave4Alpha = waveTracerSmoothstep(edgeWidth4, -edgeWidth4, dist4) * 0.5;
      
      // ===== BLEND COLORS FOR RICH VISUAL EFFECT =====
      
      // Create animated base color from background blend
      float baseBlend = sin(time * 0.1) * 0.5 + 0.5;
      float baseBg = mix(bgColor1.r, bgColor2.g, baseBlend) * 0.7;
      
      // Add subtle sine wave pattern to background
      float bgPattern = sin(aspectUV.x * 8.0 + time) * sin(aspectUV.y * 6.0 + time * 0.7) * 0.1;
      float lightness = baseBg + bgPattern + 0.2;
      
      // Layer waves with color variation
      lightness = mix(lightness, waveColor1.b * (0.7 + sin(time * 0.2) * 0.3), wave4Alpha);
      lightness = mix(lightness, waveColor2.r * (0.8 + cos(time * 0.15) * 0.2), wave3Alpha);
      lightness = mix(lightness, waveColor1.g * (0.6 + sin(time * 0.25) * 0.4), wave2Alpha);
      lightness = mix(lightness, waveColor2.b * (0.9 + cos(time * 0.3) * 0.1), wave1Alpha);
      
      // Add subtle ripple patterns to wave areas
      float rippleX = sin(aspectUV.x * 20.0 + time * 0.5) * 0.5 + 0.5;
      float rippleY = sin(aspectUV.y * 15.0 + time * 0.4) * 0.5 + 0.5;
      float ripple = rippleX * rippleY * 0.06;
      
      // Apply ripple highlights to wave areas
      lightness += ripple * (wave1Alpha + wave2Alpha);
      
      return clamp(lightness, 0.0, 1.0);
    }
  `;
  
  return shader;
};
