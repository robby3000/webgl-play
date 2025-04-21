/**
 * Efficient WebGL Gradient Animation using Layered Textures
 * 
 * This approach leverages texture mapping and transformations instead of
 * per-pixel calculations, dramatically improving performance on mobile devices.
 */
import { createTextureFromCanvas } from '../utils/textureUtils';

// Vertex shader for rendering textured quads with transformations
const layeredTextureVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  uniform vec2 u_resolution;
  uniform mat3 u_transform;
  
  varying vec2 v_texCoord;
  
  void main() {
    // Apply transformation matrix to the texture coordinates
    vec2 transformedPosition = (u_transform * vec3(a_position, 1.0)).xy;
    
    // Convert from pixels to clip space (-1 to 1)
    vec2 clipSpace = (transformedPosition / u_resolution) * 2.0 - 1.0;
    clipSpace.y *= -1.0; // Flip Y for WebGL
    
    gl_Position = vec4(clipSpace, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader for blending texture layers
const layeredTextureFragmentShader = `
  precision mediump float;
  
  varying vec2 v_texCoord;
  
  uniform sampler2D u_texture;
  uniform float u_opacity;
  uniform vec4 u_colorFilter;
  uniform int u_blendMode;
  
  void main() {
    vec4 texColor = texture2D(u_texture, v_texCoord);
    
    // Apply color filter (tint)
    texColor.rgb *= u_colorFilter.rgb;
    
    // Apply opacity
    texColor.a *= u_opacity * u_colorFilter.a;
    
    // Different blend modes: 0=normal, 1=add, 2=multiply, 3=screen
    if (u_blendMode == 1) {
      // Additive blend (bright areas get brighter)
      gl_FragColor = texColor; // Will be blended additively
    } else if (u_blendMode == 2) {
      // Multiply blend (darkening effect)
      gl_FragColor = texColor;
    } else if (u_blendMode == 3) {
      // Screen blend (lightening effect)
      gl_FragColor = texColor;
    } else {
      // Normal blend
      gl_FragColor = texColor;
    }
  }
`;

/**
 * WebGL blend modes that can be used for texture layers
 */
export enum BlendMode {
  Normal = 0,
  Add = 1,
  Multiply = 2,
  Screen = 3
}

/**
 * Configuration for a texture layer transformation
 */
export interface TextureTransform {
  translateX: number;
  translateY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  colorFilter: [number, number, number, number]; // RGBA tint
  blendMode: BlendMode;
}

/**
 * Default transformation values
 */
export const DEFAULT_TRANSFORM: TextureTransform = {
  translateX: 0,
  translateY: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  colorFilter: [1, 1, 1, 1],
  blendMode: BlendMode.Normal
};

/**
 * Configuration for a texture layer
 */
export interface TextureLayer {
  texture: WebGLTexture;
  transform: TextureTransform;
  animated: boolean; // Whether this layer should be animated
  animationSpeed: number; // Speed multiplier for animations
}

/**
 * Class that manages efficient gradient rendering using layered textures
 */
export class LayeredTextureRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  
  // Shader locations
  private locations = {
    position: -1,
    texCoord: -1,
    resolution: null as WebGLUniformLocation | null,
    transform: null as WebGLUniformLocation | null,
    texture: null as WebGLUniformLocation | null,
    opacity: null as WebGLUniformLocation | null,
    colorFilter: null as WebGLUniformLocation | null,
    blendMode: null as WebGLUniformLocation | null
  };
  
  // Buffers
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  
  // Texture layers
  private layers: TextureLayer[] = [];
  private animationFrame: number | null = null;
  
  // Settings
  private adaptiveResolution: boolean = true;
  
  /**
   * Create a new layered texture renderer
   * @param canvas The canvas element to render to
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupWebGL();
  }
  
  /**
   * Set up the WebGL context and shaders
   */
  private setupWebGL(): void {
    // Get WebGL context
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false, // Better performance
      depth: false,     // Not needed for 2D
      stencil: false,   // Not needed
      powerPreference: 'high-performance'
    });
    
    if (!this.gl) {
      console.error('Failed to get WebGL context');
      return;
    }
    
    // Create shader program
    const program = this.createShaderProgram(layeredTextureVertexShader, layeredTextureFragmentShader);
    if (!program) {
      console.error('Failed to create shader program');
      return;
    }
    
    this.program = program;
    this.gl.useProgram(program);
    
    // Get attribute and uniform locations
    this.locations.position = this.gl.getAttribLocation(program, 'a_position');
    this.locations.texCoord = this.gl.getAttribLocation(program, 'a_texCoord');
    this.locations.resolution = this.gl.getUniformLocation(program, 'u_resolution');
    this.locations.transform = this.gl.getUniformLocation(program, 'u_transform');
    this.locations.texture = this.gl.getUniformLocation(program, 'u_texture');
    this.locations.opacity = this.gl.getUniformLocation(program, 'u_opacity');
    this.locations.colorFilter = this.gl.getUniformLocation(program, 'u_colorFilter');
    this.locations.blendMode = this.gl.getUniformLocation(program, 'u_blendMode');
    
    // Create buffers
    this.setupBuffers();
    
    // Set up ResizeObserver to handle canvas resizing
    this.setupResizeObserver();
    
    // Set blend function for transparency
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
  
  /**
   * Create a shader program from vertex and fragment shader sources
   */
  private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const gl = this.gl;
    if (!gl) return null;
    
    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return null;
    
    // Compile vertex shader
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
      return null;
    }
    
    // Compile fragment shader
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    
    // Create and link program
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  /**
   * Set up vertex and texture coordinate buffers
   */
  private setupBuffers(): void {
    const gl = this.gl;
    if (!gl) return;
    
    // Full screen quad positions
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      gl.canvas.width, 0,
      0, gl.canvas.height,
      gl.canvas.width, gl.canvas.height
    ]), gl.STATIC_DRAW);
    
    // Texture coordinates
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1
    ]), gl.STATIC_DRAW);
  }
  
  /**
   * Set up resize observer to handle canvas resizing
   */
  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.canvas) {
          this.handleCanvasResize();
        }
      }
    });
    
    resizeObserver.observe(this.canvas);
  }
  
  /**
   * Handle canvas resize by updating buffers and viewport
   */
  private handleCanvasResize(): void {
    const gl = this.gl;
    if (!gl) return;
    
    // Get actual dimensions of the canvas element
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    // Check if the canvas size doesn't match display size
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      // Apply adaptive resolution if enabled
      if (this.adaptiveResolution) {
        // Check if it's a mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const dpr = window.devicePixelRatio || 1;
        
        // Use lower resolution for mobile
        const scaleFactor = isMobile ? Math.min(dpr, 1.0) : Math.min(dpr, 1.5);
        
        // Set canvas drawing size with scaling
        this.canvas.width = Math.floor(displayWidth * scaleFactor);
        this.canvas.height = Math.floor(displayHeight * scaleFactor);
      } else {
        // Set canvas drawing size to match display size
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
      }
      
      // Update viewport
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
      // Update position buffer with new dimensions
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        gl.canvas.width, 0,
        0, gl.canvas.height,
        gl.canvas.width, gl.canvas.height
      ]), gl.STATIC_DRAW);
    }
  }
  
  /**
   * Create and initialize the default texture layers
   */
  public initializeDefaultLayers(): void {
    const gl = this.gl;
    if (!gl) return;
    
    // Clear any existing layers
    this.layers = [];
    
    // Use simple color scheme that looks good
    const hue1 = Math.random() * 360; // Base hue
    const hue2 = (hue1 + 50) % 360;  // Complementary
    
    // Create a single high-resolution texture for better quality
    const textureSize = 1024;
    
    // Layer 1: Create a simple radial gradient (base layer)
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = textureSize;
    baseCanvas.height = textureSize;
    const baseCtx = baseCanvas.getContext('2d');
    
    if (baseCtx) {
      // Create a simple radial gradient
      const gradient = baseCtx.createRadialGradient(
        textureSize * 0.5, textureSize * 0.5, 0,
        textureSize * 0.5, textureSize * 0.5, textureSize * 0.8
      );
      
      // Use fewer color stops for better performance
      gradient.addColorStop(0, `hsla(${hue1}, 90%, 60%, 1)`);
      gradient.addColorStop(1, `hsla(${hue2}, 80%, 40%, 1)`);
      
      // Fill with gradient
      baseCtx.fillStyle = gradient;
      baseCtx.fillRect(0, 0, textureSize, textureSize);
      
      // Create WebGL texture
      const baseTexture = createTextureFromCanvas(gl, baseCanvas);
      
      if (baseTexture) {
        this.layers.push({
          texture: baseTexture,
          transform: {
            ...DEFAULT_TRANSFORM,
            scaleX: 1.2,
            scaleY: 1.2,
            opacity: 1.0,
            blendMode: BlendMode.Normal
          },
          animated: true,
          animationSpeed: 1.0
        });
      }
    }
    
    // Layer 2: Create a second complementary gradient
    const secondCanvas = document.createElement('canvas');
    secondCanvas.width = textureSize;
    secondCanvas.height = textureSize;
    const secondCtx = secondCanvas.getContext('2d');
    
    if (secondCtx) {
      // Create second gradient with different angle
      const gradient = secondCtx.createRadialGradient(
        textureSize * 0.6, textureSize * 0.4, 0,
        textureSize * 0.6, textureSize * 0.4, textureSize * 0.7
      );
      
      // Complementary colors
      gradient.addColorStop(0, `hsla(${(hue1 + 180) % 360}, 90%, 70%, 0.7)`);
      gradient.addColorStop(1, `hsla(${(hue2 + 180) % 360}, 80%, 50%, 0)`);
      
      // Fill with gradient
      secondCtx.fillStyle = gradient;
      secondCtx.fillRect(0, 0, textureSize, textureSize);
      
      // Create WebGL texture
      const secondTexture = createTextureFromCanvas(gl, secondCanvas);
      
      if (secondTexture) {
        this.layers.push({
          texture: secondTexture,
          transform: {
            ...DEFAULT_TRANSFORM,
            scaleX: 1.5,
            scaleY: 1.5,
            opacity: 0.8,
            rotation: Math.PI / 4, // 45 degrees rotation
            blendMode: BlendMode.Screen
          },
          animated: true,
          animationSpeed: 0.7
        });
      }
    }
  }
  
  /**
   * Start the animation loop
   */
  public start(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animate();
  }
  
  /**
   * Stop the animation loop
   */
  public stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Animation loop
   */
  private animate = (time: number = 0): void => {
    this.render(time);
    this.animationFrame = requestAnimationFrame(this.animate);
  };
  
  /**
   * Create a 3x3 transformation matrix
   * @param transform The transform parameters
   * @param time Current animation time
   * @param animationSpeed Speed multiplier
   * @returns Flattened 3x3 matrix for WebGL
   */
  private createTransformMatrix(
    transform: TextureTransform,
    time: number,
    animationSpeed: number
  ): Float32Array {
    // Ultra-simplified animation for guaranteed performance
    // Just a very slow rotation and subtle scale
    const animatedTime = time * 0.00005 * animationSpeed;
    
    // Extremely simple movement pattern - just rotation and gentle scale
    const rotation = transform.rotation + animatedTime;
    const scale = 1.0 + Math.sin(animatedTime * 0.5) * 0.05;
    
    const sx = transform.scaleX * scale;
    const sy = transform.scaleY * scale;
    
    // Very minor translation
    const tx = transform.translateX;
    const ty = transform.translateY;
    
    // Get correct canvas center
    const width = this.gl?.canvas.width || 0;
    const height = this.gl?.canvas.height || 0;
    const cx = width / 2;
    const cy = height / 2;
    
    // Create transformation matrix (translation, rotation, scale)
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    
    // 3x3 matrix in column-major order for WebGL
    return new Float32Array([
      sx * cosR, sx * sinR, 0,
      -sy * sinR, sy * cosR, 0,
      tx + cx, ty + cy, 1
    ]);
  }
  
  /**
   * Render all texture layers with their transformations
   * @param time Current time from requestAnimationFrame
   */
  private render(time: number): void {
    const gl = this.gl;
    if (!gl || !this.program) return;
    
    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use our shader program
    gl.useProgram(this.program);
    
    // Set resolution uniform
    if (this.locations.resolution) {
      gl.uniform2f(this.locations.resolution, gl.canvas.width, gl.canvas.height);
    }
    
    // Set up position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.locations.position);
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);
    
    // Set up texture coordinate attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.locations.texCoord);
    gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    // Set appropriate blend function based on the layer's blend mode
    const setBlendMode = (mode: BlendMode) => {
      switch (mode) {
        case BlendMode.Add:
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          break;
        case BlendMode.Multiply:
          gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
          break;
        case BlendMode.Screen:
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
          break;
        case BlendMode.Normal:
        default:
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          break;
      }
    };
    
    // Render each layer
    for (const layer of this.layers) {
      // Set texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, layer.texture);
      if (this.locations.texture) {
        gl.uniform1i(this.locations.texture, 0);
      }
      
      // Set opacity
      if (this.locations.opacity) {
        gl.uniform1f(this.locations.opacity, layer.transform.opacity);
      }
      
      // Set color filter
      if (this.locations.colorFilter) {
        gl.uniform4fv(this.locations.colorFilter, new Float32Array(layer.transform.colorFilter));
      }
      
      // Set blend mode
      if (this.locations.blendMode) {
        gl.uniform1i(this.locations.blendMode, layer.transform.blendMode);
      }
      
      // Set blend function
      setBlendMode(layer.transform.blendMode);
      
      // Create and set transform matrix
      if (this.locations.transform) {
        const matrix = this.createTransformMatrix(
          layer.transform,
          layer.animated ? time : 0,
          layer.animationSpeed
        );
        gl.uniformMatrix3fv(this.locations.transform, false, matrix);
      }
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  
  /**
   * Enable or disable adaptive resolution
   * @param enable Whether to enable adaptive resolution
   */
  public setAdaptiveResolution(enable: boolean): void {
    this.adaptiveResolution = enable;
    this.handleCanvasResize();
  }
  
  /**
   * Add a custom texture layer
   * @param layer The texture layer to add
   */
  public addLayer(layer: TextureLayer): void {
    this.layers.push(layer);
  }
  
  /**
   * Clean up WebGL resources
   */
  public dispose(): void {
    this.stop();
    
    const gl = this.gl;
    if (!gl) return;
    
    // Delete textures
    for (const layer of this.layers) {
      gl.deleteTexture(layer.texture);
    }
    
    // Delete buffers
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.texCoordBuffer);
    
    // Delete program
    gl.deleteProgram(this.program);
    
    this.layers = [];
  }
}
