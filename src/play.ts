import { noiseUtils } from "./utils/noiseUtils";
import { simplex_noise } from "./utils/simplexNoise";
import { CreateFragmentShader } from "./types";

const createFragmentShader: CreateFragmentShader = () => {
  const shader = /* glsl */ `
    precision mediump float;

    uniform float u_time;         // Time in seconds
    uniform vec2 u_resolution;    // Canvas size (width, height)
    uniform float u_speed;        // Animation speed multiplier
    uniform vec2 u_waveFreq;      // Frequency of waves (x, y components)
    uniform vec2 u_waveAmp;       // Amplitude of waves (x, y components for two waves)
    uniform vec3 u_color1;        // First color for blending
    uniform vec3 u_color2;        // Second color for blending

    const float PI = 3.14159;

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

    float wave_alpha_part(float dist, float blur_fac, float t) {
      float exp = mix(0.9, 1.2, t);
      float v = pow(blur_fac, exp);
      v = ease_in(v);
      v = smoothstep_(v);
      v = clamp(v, 0.008, 1.0);
      v *= 345.0; 
      float alpha = clamp(0.5 + dist / v, 0.0, 1.0);
      alpha = smoothstep_(alpha);
      return alpha;
    }

    float background_noise(float offset) {
      const float S_base = 0.064;
      const float L_base = 0.00085;
      const float F_base = 0.04;

      float L = L_base * u_waveFreq.x; 
      float S = S_base * u_speed;      
      float F = F_base * u_speed;

      const float L1 = 1.5, L2 = 0.9, L3 = 0.6;
      const float LY1 = 1.00, LY2 = 0.85, LY3 = 0.70;
      const float Y_SCALE = 1.0 / 0.27;

      float x = get_x() * L;
      float y = gl_FragCoord.y * L * Y_SCALE * (u_waveFreq.y / u_waveFreq.x); 
      float time = u_time * u_speed + offset; 
      float x_shift = time * F;
      float sum = 0.5;
      sum += simplex_noise(vec3(x * L1 +  x_shift * 1.1, y * L1 * LY1, time * S)) * 0.30;
      sum += simplex_noise(vec3(x * L2 + -x_shift * 0.6, y * L2 * LY2, time * S)) * 0.25;
      sum += simplex_noise(vec3(x * L3 +  x_shift * 0.8, y * L3 * LY3, time * S)) * 0.20;
      return sum;
    }

    float wave_y_noise(float offset) {
      const float L_base = 0.000845;
      const float S_base = 0.075;
      const float F_base = 0.026;

      float L = L_base * u_waveFreq.x; 
      float S = S_base * u_speed;      
      float F = F_base * u_speed;

      float time = u_time * u_speed + offset;
      float x = get_x() * L;
      float y = time * S;
      float x_shift = time * F;

      float sum = 0.0;
      sum += simplex_noise(vec2(x * 1.30 + x_shift, y * 0.54)) * 0.85;
      sum += simplex_noise(vec2(x * 1.00 + x_shift, y * 0.68)) * 1.15;
      sum += simplex_noise(vec2(x * 0.70 + x_shift, y * 0.59)) * 0.60;
      sum += simplex_noise(vec2(x * 0.40 + x_shift, y * 0.48)) * 0.40;
      return sum;
    }

    float calc_blur_bias() {
      const float S_base = 0.261;
      float S = S_base * u_speed;
      float bias_t = (sin(u_time * S) + 1.0) * 0.5;
      return lerp(-0.17, -0.04, bias_t);
    }

    float calc_blur(float offset) {
      const float L_base = 0.0011;
      const float S_base = 0.07;
      const float F_base = 0.03;

      float L = L_base * u_waveFreq.x;
      float S = S_base * u_speed;
      float F = F_base * u_speed;

      float time = u_time * u_speed + offset;

      float x = get_x() * L;
      float blur_fac = calc_blur_bias();
      blur_fac += simplex_noise(vec2(x * 0.60 + time * F *  1.0, time * S * 0.7)) * 0.5;
      blur_fac += simplex_noise(vec2(x * 1.30 + time * F * -0.8, time * S * 1.0)) * 0.4;
      blur_fac = (blur_fac + 1.0) * 0.5;
      blur_fac = clamp(blur_fac, 0.0, 1.0);
      return blur_fac;
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
        sum += wave_alpha_part(dist, blur_fac, t) * PART;
      }
      return sum;
    }

    vec3 calc_color(float lightness) {
      lightness = clamp(lightness, 0.0, 1.0);
      return mix(u_color1, u_color2, lightness);
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