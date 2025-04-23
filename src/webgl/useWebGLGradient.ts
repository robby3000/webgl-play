import { useEffect, useRef, RefObject, MutableRefObject, useCallback } from "react";
import createFragmentShader from "./shaders/fragmentShader";
import { vertexShaderSource } from "./shaders/vertexShader";
import { ColorStop, UniformLocations } from "./types";

/**
 * Props for the useWebGLGradient hook
 */
interface UseWebGLGradientProps {
  // Refs to parameter values
  speedRef: MutableRefObject<number>;
  waveFreqXRef: MutableRefObject<number>;
  waveFreqYRef: MutableRefObject<number>;
  waveAmpXRef: MutableRefObject<number>;
  waveAmpYRef: MutableRefObject<number>;
  
  // Color stops
  colorStops: ColorStop[];
}

// Texture resolution for performance
const TEXTURE_SIZE = 512;

/**
 * Custom hook to manage WebGL gradient animation
 */
export function useWebGLGradient({
  speedRef,
  waveFreqXRef,
  waveFreqYRef,
  waveAmpXRef,
  waveAmpYRef,
  colorStops,
}: UseWebGLGradientProps): [RefObject<HTMLCanvasElement | null>, () => void] { 
  // Create canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for WebGL context and objects
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  
  // Texture refs
  const gradientTextureRef = useRef<WebGLTexture | null>(null);
  const backgroundTextureRef = useRef<WebGLTexture | null>(null);
  const noiseTextureRef = useRef<WebGLTexture | null>(null);
  const waveTextureRef = useRef<WebGLTexture | null>(null);
  
  const animationFrameId = useRef<number | null>(null);
  
  // Ref to store uniform locations
  const uniformLocations = useRef<UniformLocations>({
    u_time: null,
    u_resolution: null,
    u_speed: null,
    u_waveFreq: null,
    u_waveAmp: null,
    u_gradient: null,
    u_bgTexture: null,
    u_noiseTexture: null,
    u_waveTexture: null
  });

  /**
   * Generate gradient texture data from color stops
   */
  const generateGradientTextureData = (stops: ColorStop[], width: number = 256): Uint8Array => {
    const data = new Uint8Array(width * 4); // width pixels, 4 components (RGBA)
    const sortedStops = [...stops].sort((a, b) => a.position - b.position); // Ensure stops are sorted

    // Add implicit start/end stops if missing
    if (sortedStops.length === 0 || sortedStops[0].position !== 0) {
      sortedStops.unshift({ id: Date.now(), position: 0.0, color: sortedStops[0]?.color || '#000000' });
    }
    if (sortedStops[sortedStops.length - 1].position !== 1.0) {
      sortedStops.push({ id: Date.now() + 1, position: 1.0, color: sortedStops[sortedStops.length - 1]?.color || '#ffffff' });
    }

    let currentStopIndex = 0;
    for (let i = 0; i < width; i++) {
      const t = i / (width - 1); // Normalized position (0 to 1)

      // Find the two stops to interpolate between
      while (currentStopIndex < sortedStops.length - 2 && t > sortedStops[currentStopIndex + 1].position) {
        currentStopIndex++;
      }

      const stop1 = sortedStops[currentStopIndex];
      const stop2 = sortedStops[currentStopIndex + 1];

      // Calculate interpolation factor between the two relevant stops
      const segmentT = (t - stop1.position) / (stop2.position - stop1.position + 1e-6); // Add epsilon for safety
      const clampedSegmentT = Math.max(0.0, Math.min(1.0, segmentT));

      const color1Rgb = hexToRgb(stop1.color);
      const color2Rgb = hexToRgb(stop2.color);
      const interpolatedColor = lerpColor(color1Rgb, color2Rgb, clampedSegmentT);

      data[i * 4 + 0] = Math.round(interpolatedColor[0] * 255); // R
      data[i * 4 + 1] = Math.round(interpolatedColor[1] * 255); // G
      data[i * 4 + 2] = Math.round(interpolatedColor[2] * 255); // B
      data[i * 4 + 3] = 255; // A (fully opaque)
    }
    return data;
  };

  /**
   * Create a WebGL texture
   */
  const createTexture = (gl: WebGLRenderingContext): WebGLTexture | null => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    return texture;
  };

  /**
   * Generate background texture
   */
  const generateBackgroundTexture = (gl: WebGLRenderingContext, texture: WebGLTexture | null): void => {
    if (!texture) return;
    
    const size = TEXTURE_SIZE;
    const data = new Uint8Array(size * size * 4);
    
    // Create a more interesting background gradient pattern
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        
        const nx = x / size;
        const ny = y / size;
        
        // Create radial gradient with color variations
        const cx = nx - 0.5;
        const cy = ny - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy) * 2.0;
        const angle = Math.atan2(cy, cx) / Math.PI;
        
        // Use multiple frequencies for richer appearance
        const radial = Math.sin((dist * 5.0) + Math.cos(angle * 3.0)) * 0.5 + 0.5;
        const spiral = Math.sin(dist * 10.0 + angle * 8.0) * 0.5 + 0.5;
        
        // Create RGB values with good color separation
        const r = Math.floor(255 * (0.7 * radial + 0.3 * spiral));
        const g = Math.floor(255 * (0.6 * spiral + 0.4 * (1.0 - dist)));
        const b = Math.floor(255 * (0.5 * (1.0 - radial) + 0.5 * (nx * ny)));
        
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  };

  /**
   * Generate noise texture
   */
  const generateNoiseTexture = (gl: WebGLRenderingContext, texture: WebGLTexture | null): void => {
    if (!texture) return;
    
    const size = TEXTURE_SIZE;
    const data = new Uint8Array(size * size * 4);
    
    // Create smooth noise with multiple frequency components
    const octaves = 4;  // Number of noise layers to combine
    const persistence = 0.5;  // How quickly amplitude decreases per octave
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        
        const nx = x / size;
        const ny = y / size;
        
        // Combine multiple frequencies of noise
        let noiseValue = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0.0;
        
        for (let i = 0; i < octaves; i++) {
          // Use simple gradient noise approximation
          const fx = nx * frequency;
          const fy = ny * frequency;
          
          // Grid-based coherent noise
          const ix = Math.floor(fx);
          const iy = Math.floor(fy);
          const fx0 = fx - ix;
          const fy0 = fy - iy;
          
          // Pseudo-random gradient based on grid cell
          const h00 = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453 % 1.0;
          const h10 = Math.sin((ix+1) * 12.9898 + iy * 78.233) * 43758.5453 % 1.0;
          const h01 = Math.sin(ix * 12.9898 + (iy+1) * 78.233) * 43758.5453 % 1.0;
          const h11 = Math.sin((ix+1) * 12.9898 + (iy+1) * 78.233) * 43758.5453 % 1.0;
          
          // Interpolate values using smoothstep
          const sx = fx0 * fx0 * (3 - 2 * fx0);
          const sy = fy0 * fy0 * (3 - 2 * fy0);
          
          const vx0 = h00 + sx * (h10 - h00);
          const vx1 = h01 + sx * (h11 - h01);
          const vy = vx0 + sy * (vx1 - vx0);
          
          // Accumulate noise components
          noiseValue += vy * amplitude;
          maxValue += amplitude;
          
          // Next octave
          amplitude *= persistence;
          frequency *= 2.0;
        }
        
        // Normalize the result
        noiseValue /= maxValue;
        
        // Add some swirls to the noise
        const swirl = Math.sin(nx * 5.0 + ny * 5.0 + Math.sin(nx * 3.0 + ny * 10.0) * 2.0) * 0.5 + 0.5;
        noiseValue = noiseValue * 0.7 + swirl * 0.3;
        
        // Set all channels to the same noise value for grayscale
        const value = Math.floor(255 * noiseValue);
        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
        data[idx + 3] = 255;
      }
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  };

  /**
   * Generate wave distortion texture
   */
  const generateWaveTexture = (gl: WebGLRenderingContext, texture: WebGLTexture | null): void => {
    if (!texture) return;
    
    const size = TEXTURE_SIZE;
    const data = new Uint8Array(size * size * 4);
    
    // Create wave distortion map with multiple wave patterns
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        
        const nx = x / size;
        const ny = y / size;
        
        // Generate complex wave patterns
        // R channel: horizontal displacement (based on multiple sine waves)
        const r = Math.floor(
          128 + 127 * Math.sin(nx * 6.0 + ny * 4.0) * Math.cos(nx * 3.0 - ny * 7.0)
        );
        
        // G channel: vertical displacement (different pattern)
        const g = Math.floor(
          128 + 127 * Math.sin(nx * 8.0 - ny * 3.0 + Math.sin(nx * 2.0 + ny * 10.0) * 3.0)
        );
        
        // B channel: additional pattern for complex waves
        const b = Math.floor(
          128 + 127 * Math.sin(nx * 10.0 + ny * 8.0) * Math.sin(nx * ny * 20.0)
        );
        
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  };

  /**
   * Regenerate all textures - called on initialization and randomize
   */
  const regenerateTextures = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    
    // Regenerate background texture
    generateBackgroundTexture(gl, backgroundTextureRef.current);
    
    // Regenerate noise texture
    generateNoiseTexture(gl, noiseTextureRef.current);
    
    // Regenerate wave texture
    generateWaveTexture(gl, waveTextureRef.current);
  }, []); // No dependencies since all accessed refs are stable

  // Initialize WebGL and resources
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    // Create shader program
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    
    gl.shaderSource(fragmentShader, createFragmentShader());
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
      gl.deleteShader(fragmentShader);
      return;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return;
    }
    
    programRef.current = program;

    // Set up vertex buffer with texture coordinates
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Full screen quad with texture coordinates
    const positions = [
      // X, Y, U, V
      -1, -1, 0, 0,
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    // Set up vertex attributes
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(texCoordAttributeLocation);

    // Get uniform locations
    gl.useProgram(program);
    uniformLocations.current = {
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_speed: gl.getUniformLocation(program, 'u_speed'),
      u_waveFreq: gl.getUniformLocation(program, 'u_waveFreq'),
      u_waveAmp: gl.getUniformLocation(program, 'u_waveAmp'),
      u_gradient: gl.getUniformLocation(program, 'u_gradient'),
      u_bgTexture: gl.getUniformLocation(program, 'u_bgTexture'),
      u_noiseTexture: gl.getUniformLocation(program, 'u_noiseTexture'),
      u_waveTexture: gl.getUniformLocation(program, 'u_waveTexture')
    };

    // Create textures
    gradientTextureRef.current = createTexture(gl);
    backgroundTextureRef.current = createTexture(gl);
    noiseTextureRef.current = createTexture(gl);
    waveTextureRef.current = createTexture(gl);
    
    // Initialize textures with data
    const gradientData = generateGradientTextureData(colorStops);
    const textureWidth = gradientData.length / 4;
    
    // Upload gradient texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gradientTextureRef.current);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, gradientData);
    
    // Set texture units for samplers
    gl.uniform1i(uniformLocations.current.u_gradient, 0);     // TEXTURE0
    gl.uniform1i(uniformLocations.current.u_bgTexture, 1);    // TEXTURE1
    gl.uniform1i(uniformLocations.current.u_noiseTexture, 2); // TEXTURE2
    gl.uniform1i(uniformLocations.current.u_waveTexture, 3);  // TEXTURE3
    
    // Generate background, noise and wave textures
    regenerateTextures();
    
    // Set initial animation parameters with more pronounced waves
    if (uniformLocations.current.u_speed) {
      gl.uniform1f(uniformLocations.current.u_speed, speedRef.current);
    }
    
    if (uniformLocations.current.u_waveFreq) {
      // Use higher frequency values for more visible waves
      gl.uniform2f(uniformLocations.current.u_waveFreq, waveFreqXRef.current, waveFreqYRef.current);
    }
    
    if (uniformLocations.current.u_waveAmp) {
      // Use higher amplitude values for more pronounced waves
      gl.uniform2f(uniformLocations.current.u_waveAmp, waveAmpXRef.current, waveAmpYRef.current);
    }

    // Handle canvas resizing
    const resizeObserver = new ResizeObserver(entries => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        
        // On mobile, reduce resolution for better performance
        const isLowPerfDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const scaleFactor = isLowPerfDevice ? 0.5 : 1.0;
        
        const entry = entries[0];
        if (entry && entry.contentRect) {
          const { width, height } = entry.contentRect;
          const w = Math.floor(width * dpr * scaleFactor);
          const h = Math.floor(height * dpr * scaleFactor);
          canvas.width = w;
          canvas.height = h;
          glRef.current?.viewport(0, 0, w, h);
        }
      }
    });
    resizeObserver.observe(canvas);

    // Animation loop
    const startTime = Date.now();
    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      if (!gl || !program || !canvas) return;

      const {
        u_time,
        u_resolution,
      } = uniformLocations.current;

      // Only update time-based uniforms each frame
      const currentTime = (Date.now() - startTime) * 0.001;
      gl.useProgram(program);
      
      // Set basic uniforms
      if (u_time) gl.uniform1f(u_time, currentTime);
      if (u_resolution) gl.uniform2f(u_resolution, canvas.width, canvas.height);

      // Render
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId.current = requestAnimationFrame(render);
    };

    render(); // Start the animation loop

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.unobserve(canvas);
      
      const gl = glRef.current;
      if (gl) {
        gl.deleteProgram(programRef.current);
        gl.deleteBuffer(positionBuffer);
        gl.deleteTexture(gradientTextureRef.current);
        gl.deleteTexture(backgroundTextureRef.current);
        gl.deleteTexture(noiseTextureRef.current);
        gl.deleteTexture(waveTextureRef.current);
      }
      
      glRef.current = null;
      programRef.current = null;
      gradientTextureRef.current = null;
      backgroundTextureRef.current = null;
      noiseTextureRef.current = null;
      waveTextureRef.current = null;
      uniformLocations.current = {
        u_time: null,
        u_resolution: null,
        u_speed: null,
        u_waveFreq: null,
        u_waveAmp: null,
        u_gradient: null,
        u_bgTexture: null,
        u_noiseTexture: null,
        u_waveTexture: null
      };
    };
  }, [colorStops, speedRef, waveFreqXRef, waveFreqYRef, waveAmpXRef, waveAmpYRef, regenerateTextures]); // Include all dependencies

  // Update animation parameters when they change
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    
    gl.useProgram(program);
    
    if (uniformLocations.current.u_speed) {
      gl.uniform1f(uniformLocations.current.u_speed, speedRef.current);
    }
    
    if (uniformLocations.current.u_waveFreq) {
      gl.uniform2f(uniformLocations.current.u_waveFreq, waveFreqXRef.current, waveFreqYRef.current);
    }
    
    if (uniformLocations.current.u_waveAmp) {
      gl.uniform2f(uniformLocations.current.u_waveAmp, waveAmpXRef.current, waveAmpYRef.current);
    }
  }, [speedRef, waveFreqXRef, waveFreqYRef, waveAmpXRef, waveAmpYRef]); // Include dependencies properly

  /**
   * Update gradient texture when color stops change
   */
  useEffect(() => {
    const gl = glRef.current;
    const texture = gradientTextureRef.current;
    if (!gl || !texture) return;

    const gradientData = generateGradientTextureData(colorStops);
    const textureWidth = gradientData.length / 4;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, gradientData);
  }, [colorStops]);

  /**
   * Randomize function to regenerate all textures and animations
   */
  const randomize = () => {
    // Generate stronger wave parameters
    if (speedRef && waveFreqXRef && waveFreqYRef && waveAmpXRef && waveAmpYRef) {
      // Use random values but ensure they're within effective ranges for visible waves
      speedRef.current = 0.5 + Math.random() * 1.5; // 0.5 to 2.0
      waveFreqXRef.current = 3.0 + Math.random() * 5.0; // 3.0 to 8.0
      waveFreqYRef.current = 2.0 + Math.random() * 4.0; // 2.0 to 6.0
      waveAmpXRef.current = 0.05 + Math.random() * 0.15; // 0.05 to 0.2
      waveAmpYRef.current = 0.05 + Math.random() * 0.15; // 0.05 to 0.2
    }
    
    // Regenerate textures with the new parameters
    regenerateTextures();
    
    // Update uniforms with new values
    const gl = glRef.current;
    const program = programRef.current;
    if (gl && program) {
      gl.useProgram(program);
      
      if (uniformLocations.current.u_speed) {
        gl.uniform1f(uniformLocations.current.u_speed, speedRef.current);
      }
      
      if (uniformLocations.current.u_waveFreq) {
        gl.uniform2f(uniformLocations.current.u_waveFreq, waveFreqXRef.current, waveFreqYRef.current);
      }
      
      if (uniformLocations.current.u_waveAmp) {
        gl.uniform2f(uniformLocations.current.u_waveAmp, waveAmpXRef.current, waveAmpYRef.current);
      }
    }
  };

  return [canvasRef, randomize];
}

/**
 * Helper function: Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  hex = hex.replace('#', '');
  
  if (hex.length === 3) { // Handle shorthand hex (#RGB)
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) { // Handle standard hex (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  return [r / 255, g / 255, b / 255]; // Return normalized values (0-1)
}

/**
 * Helper function: Linear interpolation for color
 */
function lerpColor(
  color1: [number, number, number], 
  color2: [number, number, number], 
  t: number
): [number, number, number] {
  return [
    color1[0] * (1 - t) + color2[0] * t,
    color1[1] * (1 - t) + color2[1] * t,
    color1[2] * (1 - t) + color2[2] * t
  ];
}
