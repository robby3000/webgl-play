/**
 * Noise-related shader functions
 */
export const noiseShaderFunctions = /* glsl */ `
// Background noise calculation with configurable parameters
float background_noise(float offset, float waveFreqX, float waveFreqY, float speed, float noiseScale, float verticalStretch, float swirlSpeed, float flowSpeed) {
  const float S_base = 0.064;
  const float L_base = 0.00085;
  const float F_base = 0.04;

  float L = L_base * waveFreqX * noiseScale; 
  float S = S_base * speed * swirlSpeed;      
  float F = F_base * speed * flowSpeed;

  const float L1 = 1.5, L2 = 0.9, L3 = 0.6;
  float Y_SCALE = 1.0 / 0.27 * verticalStretch;

  float x = get_x() * L;
  float y = gl_FragCoord.y * L * Y_SCALE * (waveFreqY / waveFreqX); 
  float time = u_time * speed + offset; 
  float x_shift = time * F;
  float sum = 0.5;
  sum += simplex_noise(vec3(x * L1 +  x_shift * 1.1, y * L1 * LY1, time * S)) * 0.30;
  sum += simplex_noise(vec3(x * L2 + -x_shift * 0.6, y * L2 * LY2, time * S)) * 0.25;
  sum += simplex_noise(vec3(x * L3 +  x_shift * 0.8, y * L3 * LY3, time * S)) * 0.20;
  return sum;
}

// Wave Y-coordinate noise with configurable parameters
float wave_y_noise(float offset, float waveFreqX, float speed, float noiseScale, float flowSpeed) {
  const float L_base = 0.000845;
  const float S_base = 0.075;
  const float F_base = 0.026;

  float L = L_base * waveFreqX * noiseScale; 
  float S = S_base * speed;      
  float F = F_base * speed * flowSpeed;

  float time = u_time * speed + offset;
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
`;
