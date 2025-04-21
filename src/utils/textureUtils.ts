/**
 * Utilities for generating and managing textures for efficient WebGL gradient animation
 */

/**
 * Configuration for generating a linear gradient texture
 */
export interface LinearGradientConfig {
  width: number;
  height: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  colors: string[];
  stops?: number[]; // Optional color stop positions (0-1)
}

/**
 * Generate a canvas with a linear gradient
 * @param config The gradient configuration
 * @returns Canvas element with the gradient
 */
export function createGradientCanvas(config: LinearGradientConfig): HTMLCanvasElement {
  const { width, height, direction, colors, stops } = config;
  
  // Create canvas and context
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context for gradient canvas');
    return canvas;
  }
  
  // Create gradient based on direction
  let gradient: CanvasGradient;
  
  switch (direction) {
    case 'horizontal':
      gradient = ctx.createLinearGradient(0, 0, width, 0);
      break;
    case 'vertical':
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      break;
    case 'diagonal':
      gradient = ctx.createLinearGradient(0, 0, width, height);
      break;
    case 'radial':
      gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      break;
    default:
      gradient = ctx.createLinearGradient(0, 0, width, 0);
  }
  
  // Add color stops
  if (stops && stops.length === colors.length) {
    // Use provided stops
    colors.forEach((color, index) => {
      gradient.addColorStop(stops[index], color);
    });
  } else {
    // Distribute colors evenly
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
  }
  
  // Fill canvas with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}

/**
 * Create a noise texture canvas
 * @param width Width of the noise texture
 * @param height Height of the noise texture
 * @param scale Scale of the noise (higher = more detailed)
 * @param opacity Maximum opacity of the noise
 * @returns Canvas element with the noise pattern
 */
export function createNoiseCanvas(
  width: number,
  height: number,
  scale: number = 1,
  opacity: number = 0.3
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context for noise canvas');
    return canvas;
  }
  
  // Create an empty ImageData object
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  // Generate Perlin-like noise for smoother results
  const frequency = 0.01 * scale; // Lower frequency = smoother noise
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Use Perlin-inspired noise (simplified)
      const nx = x * frequency;
      const ny = y * frequency;
      const value = Math.abs(Math.sin(nx) * Math.cos(ny) * 
                   Math.sin(nx * 0.1 + ny * 0.3) * 
                   Math.cos(nx * 0.2 - ny * 0.15));
      
      const normalizedValue = Math.floor(value * 255);
      const alpha = value * opacity * 255;
      
      data[i] = normalizedValue;     // R
      data[i + 1] = normalizedValue; // G
      data[i + 2] = normalizedValue; // B
      data[i + 3] = alpha;           // A
    }
  }
  
  // Put the image data back on the canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Apply blur for a smoother look
  ctx.filter = `blur(${1 + scale}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
  
  return canvas;
}

/**
 * Create a WebGL texture from a canvas with proper filtering
 * @param gl WebGL context
 * @param canvas Canvas to use as texture source
 * @returns WebGL texture
 */
export function createTextureFromCanvas(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Upload the canvas to the texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  
  // Generate mipmaps for better quality when scaling down
  gl.generateMipmap(gl.TEXTURE_2D);
  
  // Set texture parameters for ultra-smooth gradients
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // Trilinear filtering
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  // Try to enable anisotropic filtering if available
  try {
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
      const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
    }
  } catch {
    console.warn('Anisotropic filtering not supported');
  }
  
  return texture;
}

/**
 * Create a simple but guaranteed smooth gradient texture
 * @param width Width of the gradient texture
 * @param height Height of the gradient texture
 * @param hue Hue for the gradient (0-360)
 * @returns Canvas with gradient
 */
export function createSmoothGradient(
  width: number,
  height: number,
  hue: number = Math.random() * 360
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context for smooth gradient');
    return canvas;
  }
  
  // Create a simple but guaranteed smooth radial gradient
  const gradient = ctx.createRadialGradient(
    width * 0.5, 
    height * 0.5, 
    0,
    width * 0.5, 
    height * 0.5, 
    width * 0.7
  );
  
  // Use high saturation, different lightness for visual interest
  gradient.addColorStop(0, `hsl(${hue}, 90%, 70%)`);
  gradient.addColorStop(0.5, `hsl(${(hue + 40) % 360}, 85%, 60%)`);
  gradient.addColorStop(1, `hsl(${(hue + 80) % 360}, 80%, 50%)`);
  
  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}

/**
 * Create a circular gradient texture
 * @param width Width of the texture
 * @param height Height of the texture
 * @param hue Base hue for the gradient
 * @returns Canvas with circular gradient
 */
export function createCircularGradient(
  width: number,
  height: number,
  hue: number = Math.random() * 360
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context for circular gradient');
    return canvas;
  }
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw a circle with a gradient
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4;
  
  // Create gradient
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  
  // Add colors
  gradient.addColorStop(0, `hsla(${hue}, 100%, 65%, 1)`);
  gradient.addColorStop(0.7, `hsla(${(hue + 60) % 360}, 90%, 55%, 0.8)`);
  gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 80%, 45%, 0)`);
  
  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas;
}
