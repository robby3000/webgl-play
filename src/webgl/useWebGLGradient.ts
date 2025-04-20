import { useEffect, useRef, RefObject, MutableRefObject } from "react";
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
  
  // Refs to noise parameters
  noiseScaleRef?: MutableRefObject<number>;
  noiseVerticalStretchRef?: MutableRefObject<number>;
  noiseSwirlSpeedRef?: MutableRefObject<number>;
  noiseFlowSpeedRef?: MutableRefObject<number>;
  
  // Refs to blur parameters
  blurAmountRef?: MutableRefObject<number>;
  blurSharpnessMinRef?: MutableRefObject<number>;
  blurSharpnessMaxRef?: MutableRefObject<number>;
  blurNoiseScaleRef?: MutableRefObject<number>;
  blurNoiseSpeedRef?: MutableRefObject<number>;
  blurPulsingSpeedRef?: MutableRefObject<number>;
  
  // Color stops
  colorStops: ColorStop[];
}

/**
 * Custom hook to manage WebGL gradient animation
 */
export function useWebGLGradient({
  speedRef,
  waveFreqXRef,
  waveFreqYRef,
  waveAmpXRef,
  waveAmpYRef,
  noiseScaleRef,
  noiseVerticalStretchRef,
  noiseSwirlSpeedRef,
  noiseFlowSpeedRef,
  blurAmountRef,
  blurSharpnessMinRef,
  blurSharpnessMaxRef,
  blurNoiseScaleRef,
  blurNoiseSpeedRef,
  blurPulsingSpeedRef,
  colorStops,
}: UseWebGLGradientProps): RefObject<HTMLCanvasElement | null> { // <-- Fixed return type here
  // Create canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for WebGL context and objects
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const gradientTextureRef = useRef<WebGLTexture | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Ref to store uniform locations
  const uniformLocations = useRef<UniformLocations>({
    u_time: null,
    u_resolution: null,
    u_speed: null,
    u_waveFreq: null,
    u_waveAmp: null,
    u_gradient: null,
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
   * Initialize WebGL context, shaders, and resources
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("Unable to initialize WebGL.");
      return;
    }
    glRef.current = gl;

    // Create and compile shaders
    const shaderSource = createFragmentShader();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return;
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex Shader Error:", gl.getShaderInfoLog(vertexShader)); 
      return;
    }
    
    gl.shaderSource(fragmentShader, shaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("Fragment Shader Error:", gl.getShaderInfoLog(fragmentShader)); 
      console.log("Shader Source:", shaderSource); 
      return;
    }

    // Create and link program
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Linker Error:", gl.getProgramInfoLog(program)); 
      return;
    }
    
    programRef.current = program;
    gl.useProgram(program);

    // Set up vertex buffer
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    uniformLocations.current = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_speed: gl.getUniformLocation(program, "u_speed"),
      u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
      u_waveAmp: gl.getUniformLocation(program, "u_waveAmp"),
      u_gradient: gl.getUniformLocation(program, "u_gradient"),
      
      // New uniforms for Phase 2
      u_noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
      u_noiseVerticalStretch: gl.getUniformLocation(program, "u_noiseVerticalStretch"),
      u_noiseSwirlSpeed: gl.getUniformLocation(program, "u_noiseSwirlSpeed"),
      u_noiseFlowSpeed: gl.getUniformLocation(program, "u_noiseFlowSpeed"),
      
      u_blurAmount: gl.getUniformLocation(program, "u_blurAmount"),
      u_blurSharpnessRange: gl.getUniformLocation(program, "u_blurSharpnessRange"),
      u_blurNoiseScale: gl.getUniformLocation(program, "u_blurNoiseScale"),
      u_blurNoiseSpeed: gl.getUniformLocation(program, "u_blurNoiseSpeed"),
      u_blurPulsingSpeed: gl.getUniformLocation(program, "u_blurPulsingSpeed"),
    };

    // Create gradient texture
    gradientTextureRef.current = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gradientTextureRef.current);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial texture data upload
    const initialGradientData = generateGradientTextureData(colorStops);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, initialGradientData.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialGradientData);
    gl.uniform1i(uniformLocations.current.u_gradient, 0);

    // ResizeObserver to handle canvas resizing
    const resizeObserver = new ResizeObserver(entries => {
      const dpr = window.devicePixelRatio || 1;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (glRef.current) {
          const w = Math.floor(width * dpr);
          const h = Math.floor(height * dpr);
          canvas.width = w;
          canvas.height = h;
          glRef.current.viewport(0, 0, w, h);
        }
      }
    });
    resizeObserver.observe(canvas);

    // Animation loop
    let startTime = Date.now();
    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      if (!gl || !program || !canvas) return;

      const {
        u_time,
        u_resolution,
        u_speed,
        u_waveFreq,
        u_waveAmp,
        u_noiseScale,
        u_noiseVerticalStretch,
        u_noiseSwirlSpeed,
        u_noiseFlowSpeed,
        u_blurAmount,
        u_blurSharpnessRange,
        u_blurNoiseScale,
        u_blurNoiseSpeed,
        u_blurPulsingSpeed,
      } = uniformLocations.current;

      // Update time-based uniforms
      const currentTime = (Date.now() - startTime) * 0.001;
      gl.useProgram(program);
      
      // Set basic uniforms
      if (u_time) gl.uniform1f(u_time, currentTime);
      if (u_resolution) gl.uniform2f(u_resolution, canvas.width, canvas.height);
      if (u_speed) gl.uniform1f(u_speed, speedRef.current);
      if (u_waveFreq) gl.uniform2f(u_waveFreq, waveFreqXRef.current, waveFreqYRef.current);
      if (u_waveAmp) gl.uniform2f(u_waveAmp, waveAmpXRef.current, waveAmpYRef.current);
      
      // Set noise uniforms if refs are provided
      if (u_noiseScale && noiseScaleRef) gl.uniform1f(u_noiseScale, noiseScaleRef.current);
      if (u_noiseVerticalStretch && noiseVerticalStretchRef) gl.uniform1f(u_noiseVerticalStretch, noiseVerticalStretchRef.current);
      if (u_noiseSwirlSpeed && noiseSwirlSpeedRef) gl.uniform1f(u_noiseSwirlSpeed, noiseSwirlSpeedRef.current);
      if (u_noiseFlowSpeed && noiseFlowSpeedRef) gl.uniform1f(u_noiseFlowSpeed, noiseFlowSpeedRef.current);
      
      // Set blur uniforms if refs are provided
      if (u_blurAmount && blurAmountRef) gl.uniform1f(u_blurAmount, blurAmountRef.current);
      if (u_blurSharpnessRange && blurSharpnessMinRef && blurSharpnessMaxRef) {
        gl.uniform2f(u_blurSharpnessRange, blurSharpnessMinRef.current, blurSharpnessMaxRef.current);
      }
      if (u_blurNoiseScale && blurNoiseScaleRef) gl.uniform1f(u_blurNoiseScale, blurNoiseScaleRef.current);
      if (u_blurNoiseSpeed && blurNoiseSpeedRef) gl.uniform1f(u_blurNoiseSpeed, blurNoiseSpeedRef.current);
      if (u_blurPulsingSpeed && blurPulsingSpeedRef) gl.uniform1f(u_blurPulsingSpeed, blurPulsingSpeedRef.current);

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
      }
      
      glRef.current = null;
      programRef.current = null;
      gradientTextureRef.current = null;
      uniformLocations.current = {
        u_time: null,
        u_resolution: null,
        u_speed: null,
        u_waveFreq: null,
        u_waveAmp: null,
        u_gradient: null,
      };
    };
  }, [speedRef, waveFreqXRef, waveFreqYRef, waveAmpXRef, waveAmpYRef, noiseScaleRef, noiseVerticalStretchRef, noiseSwirlSpeedRef, noiseFlowSpeedRef, blurAmountRef, blurSharpnessMinRef, blurSharpnessMaxRef, blurNoiseScaleRef, blurNoiseSpeedRef, blurPulsingSpeedRef, colorStops]); // This effect should only run once on mount

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

  return canvasRef;
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
