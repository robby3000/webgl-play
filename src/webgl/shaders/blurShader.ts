/**
 * Blur-related shader functions
 */
export const blurShaderFunctions = /* glsl */ `
// Calculate blur bias with configurable pulse speed
float calc_blur_bias(float speed, float pulsingSpeed) {
  const float S_base = 0.261;
  float S = S_base * speed * pulsingSpeed;
  float bias_t = (sin(u_time * S) + 1.0) * 0.5;
  return lerp(-0.17, -0.04, bias_t);
}

// Calculate blur with configurable parameters
float calc_blur(float offset, float waveFreqX, float speed, float noiseScale, float noiseSpeed) {
  const float L_base = 0.0011;
  const float S_base = 0.07;
  const float F_base = 0.03;

  float L = L_base * waveFreqX * noiseScale;
  float S = S_base * speed * noiseSpeed;
  float F = F_base * speed;

  float time = u_time * speed + offset;

  float x = get_x() * L;
  float blur_fac = calc_blur_bias(speed, u_blurPulsingSpeed);
  blur_fac += simplex_noise(vec2(x * 0.60 + time * F *  1.0, time * S * 0.7)) * 0.5;
  blur_fac += simplex_noise(vec2(x * 1.30 + time * F * -0.8, time * S * 1.0)) * 0.4;
  blur_fac = (blur_fac + 1.0) * 0.5;
  blur_fac = clamp(blur_fac, 0.0, 1.0);
  return blur_fac;
}

// Wave alpha calculation with configurable blur
float wave_alpha_part(float dist, float blur_fac, float t, vec2 blurSharpnessRange, float blurAmount) {
  float exp = mix(blurSharpnessRange.x, blurSharpnessRange.y, t);
  float v = pow(blur_fac, exp);
  v = ease_in(v);
  v = smoothstep_(v);
  v = clamp(v, 0.008, 1.0);
  v *= 345.0 * blurAmount; 
  float alpha = clamp(0.5 + dist / v, 0.0, 1.0);
  alpha = smoothstep_(alpha);
  return alpha;
}
`;
