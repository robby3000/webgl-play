import React, { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback
import createFragmentShader from "./play";
import './App.css';

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Needed for color inputs
import { Trash2 } from 'lucide-react'; // Icon for remove button

// --- Helper Function: Hex to RGB ---
const hexToRgb = (hex: string): [number, number, number] => {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', ''); // Remove '#' if present
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
};

// --- Helper Function: Linear Interpolation for Color ---
const lerpColor = (color1: [number, number, number], color2: [number, number, number], t: number): [number, number, number] => {
    return [
        color1[0] * (1 - t) + color2[0] * t,
        color1[1] * (1 - t) + color2[1] * t,
        color1[2] * (1 - t) + color2[2] * t
    ];
};


// --- Interface for Color Stops ---
interface ColorStop {
  id: number; // For React key prop
  position: number; // 0.0 to 1.0
  color: string; // Hex color string (e.g., "#ff0000")
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null); // Ref to store GL context
  const programRef = useRef<WebGLProgram | null>(null); // Ref to store program
  const gradientTextureRef = useRef<WebGLTexture | null>(null); // Ref for texture
  const animationFrameId = useRef<number | null>(null); // Ref for animation frame

  // --- State for Controls ---
  const [speed, setSpeed] = useState<number>(0.4);
  const [waveFreqX, setWaveFreqX] = useState<number>(5.0);
  const [waveFreqY, setWaveFreqY] = useState<number>(3.0);
  const [waveAmpX, setWaveAmpX] = useState<number>(0.05);
  const [waveAmpY, setWaveAmpY] = useState<number>(0.05);

  // --- Refs for Animation Loop State Access ---
  const speedRef = useRef(speed);
  const waveFreqXRef = useRef(waveFreqX);
  const waveFreqYRef = useRef(waveFreqY);
  const waveAmpXRef = useRef(waveAmpX);
  const waveAmpYRef = useRef(waveAmpY);

  // --- State for Gradient Color Stops ---
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: 1, position: 0.0, color: "#ff0000" }, // Red
    { id: 2, position: 0.5, color: "#ffff00" }, // Yellow
    { id: 3, position: 1.0, color: "#0000ff" }, // Blue
  ]);

  // Refs to store uniform locations (using useRef to avoid recreating)
  const uniformLocations = useRef<Record<string, WebGLUniformLocation | null>>({});

  // --- Gradient Texture Generation Function ---
  const generateGradientTextureData = useCallback((stops: ColorStop[], width: number = 256): Uint8Array => {
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
  }, []); // No dependencies needed as logic is self-contained

  // --- Effect to keep Refs updated with latest state ---
  useEffect(() => {
    speedRef.current = speed;
    waveFreqXRef.current = waveFreqX;
    waveFreqYRef.current = waveFreqY;
    waveAmpXRef.current = waveAmpX;
    waveAmpYRef.current = waveAmpY;
  }, [speed, waveFreqX, waveFreqY, waveAmpX, waveAmpY]);


  // --- WebGL Initialization Effect (runs once) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Unable to initialize WebGL.");
      return;
    }
    glRef.current = gl; // Store context

    const shaderSource = createFragmentShader(); // Get shader source

    const vertexShaderSource = `attribute vec4 a_position; void main() { gl_Position = a_position; }`;
    const fragmentShaderSource = shaderSource;

    // --- Shader Compilation & Linking ---
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex Shader Error:", gl.getShaderInfoLog(vertexShader)); return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
     if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("Fragment Shader Error:", gl.getShaderInfoLog(fragmentShader)); console.log("Shader Source:", fragmentShaderSource); return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Linker Error:", gl.getProgramInfoLog(program)); return;
    }
    programRef.current = program; // Store program
    gl.useProgram(program); // Use the program early

    // --- Vertex Buffer Setup ---
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // --- Get Uniform Locations ---
    uniformLocations.current = {
        u_time: gl.getUniformLocation(program, "u_time"),
        u_resolution: gl.getUniformLocation(program, "u_resolution"),
        u_speed: gl.getUniformLocation(program, "u_speed"),
        u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
        u_waveAmp: gl.getUniformLocation(program, "u_waveAmp"),
        u_gradient: gl.getUniformLocation(program, "u_gradient"), // Get gradient texture location
    };

    // --- Create Initial Gradient Texture ---
    gradientTextureRef.current = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0); // Use texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, gradientTextureRef.current);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Linear filtering is good for gradients
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial texture data upload (will be updated by the other effect)
    const initialGradientData = generateGradientTextureData(colorStops);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, initialGradientData.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialGradientData);
    gl.uniform1i(uniformLocations.current.u_gradient, 0); // Tell shader to use texture unit 0


    // --- Resize Observer ---
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if(glRef.current) {
            canvas.width = width;
            canvas.height = height;
            glRef.current.viewport(0, 0, width, height);
        }
      }
    });
    resizeObserver.observe(canvas);

    // --- Start Render Loop ---
    let startTime = Date.now();
    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      if (!gl || !program || !canvas) return; // Ensure everything is valid

      const { u_time, u_resolution, u_speed, u_waveFreq, u_waveAmp } = uniformLocations.current;

      // Update Time-based Uniforms
      const currentTime = (Date.now() - startTime) * 0.001;
      gl.useProgram(program); // Ensure program is active
      if(u_time) gl.uniform1f(u_time, currentTime);
      if(u_resolution) gl.uniform2f(u_resolution, canvas.width, canvas.height);
      // --- Read from Refs for state values used in render loop ---
      if(u_speed) gl.uniform1f(u_speed, speedRef.current); 
      if(u_waveFreq) gl.uniform2f(u_waveFreq, waveFreqXRef.current, waveFreqYRef.current); 
      if(u_waveAmp) gl.uniform2f(u_waveAmp, waveAmpXRef.current, waveAmpYRef.current); 

      // Texture is assumed to be bound to TEXTURE0 from initialization/updates

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId.current = requestAnimationFrame(render); // Store ID
    };

    render(); // Start the loop

    // --- Cleanup Function ---
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // Stop render loop
      }
      resizeObserver.unobserve(canvas);
      const gl = glRef.current;
      if(gl) {
        gl.deleteProgram(programRef.current);
        // Shaders are implicitly deleted with the program
        gl.deleteBuffer(positionBuffer);
        gl.deleteTexture(gradientTextureRef.current);
      }
      glRef.current = null;
      programRef.current = null;
      gradientTextureRef.current = null;
      uniformLocations.current = {};
    };
    // Run this effect only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateGradientTextureData]); // This effect should ideally only run once. `colorStops` was removed as initial texture is now handled by the other effect.


  // --- Effect to Update Gradient Texture When Stops Change --- (Separate effect)
  useEffect(() => {
    const gl = glRef.current;
    const texture = gradientTextureRef.current;
    if (!gl || !texture) return; // Ensure GL context and texture exist

    const gradientData = generateGradientTextureData(colorStops);
    const textureWidth = gradientData.length / 4;

    gl.activeTexture(gl.TEXTURE0); // Ensure texture unit 0 is active
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Use texSubImage2D for potentially faster updates if width hasn't changed
    // But texImage2D is safer if width *could* change (though unlikely for our 1D case)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, gradientData);

    // No need to re-bind or set uniform1i, it's already set to unit 0

  }, [colorStops, generateGradientTextureData]); // Re-run only when colorStops change

  // --- Control Handlers (Keep existing ones) ---
  const handleSpeedChange = (value: number[]) => setSpeed(value[0]);
  const handleWaveFreqXChange = (value: number[]) => setWaveFreqX(value[0]);
  const handleWaveFreqYChange = (value: number[]) => setWaveFreqY(value[0]);
  const handleWaveAmpXChange = (value: number[]) => setWaveAmpX(value[0]);
  const handleWaveAmpYChange = (value: number[]) => setWaveAmpY(value[0]);

  // --- Handlers for Color Stops ---
  const handleColorStopChange = (id: number, field: 'position' | 'color', value: string | number) => {
      setColorStops(prevStops =>
          prevStops.map(stop =>
              stop.id === id ? { ...stop, [field]: value } : stop
          )
      );
  };

  const addColorStop = () => {
      setColorStops(prevStops => {
          // Find a position between the last two stops or add at the end
          const lastPos = prevStops.length > 0 ? prevStops[prevStops.length - 1].position : 0;
          const secondLastPos = prevStops.length > 1 ? prevStops[prevStops.length - 2].position : 0;
          const newPos = Math.min(1.0, (lastPos + secondLastPos) / 2 + 0.1); // Simple heuristic
          return [
              ...prevStops,
              { id: Date.now(), position: newPos, color: "#ffffff" } // Add white stop
          ].sort((a,b) => a.position - b.position); // Keep sorted
      });
  };

  const removeColorStop = (id: number) => {
      setColorStops(prevStops => prevStops.filter(stop => stop.id !== id));
  };


  const randomizeParameters = () => {
      setSpeed(Math.random() * 2 + 0.1); // 0.1 to 2.1
      setWaveFreqX(Math.random() * 15 + 1); // 1 to 16
      setWaveFreqY(Math.random() * 15 + 1); // 1 to 16
      setWaveAmpX(Math.random() * 0.2 + 0.01); // 0.01 to 0.21
      setWaveAmpY(Math.random() * 0.2 + 0.01); // 0.01 to 0.21

      // Randomize Gradient Stops (e.g., 3 random stops)
      const numStops = 3; // Or randomize this too
      const randomStops: ColorStop[] = [];
      for (let i = 0; i < numStops; i++) {
          randomStops.push({
              id: Date.now() + i,
              position: i === 0 ? 0 : (i === numStops - 1 ? 1 : Math.random()), // Ensure start/end
              color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
          });
      }
      setColorStops(randomStops.sort((a,b) => a.position - b.position));
  };


  return (
    <div id="main-container" className="flex h-screen">
      <canvas ref={canvasRef} className="flex-grow h-full min-w-0" />
      <div id="control-section" className="w-96 h-full overflow-y-auto p-4 border-l bg-card text-card-foreground"> {/* Increased width for gradient controls */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Speed Slider */}
            <div className="space-y-2">
              <Label htmlFor="speed">Speed: {speed.toFixed(2)}</Label>
              <Slider id="speed" min={0.1} max={5} step={0.05} value={[speed]} onValueChange={handleSpeedChange} />
            </div>

            {/* Wave Frequency Sliders */}
            <div className="space-y-2">
              <Label htmlFor="waveFreqX">Wave Freq X: {waveFreqX.toFixed(2)}</Label>
              <Slider id="waveFreqX" min={0.5} max={20} step={0.1} value={[waveFreqX]} onValueChange={handleWaveFreqXChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waveFreqY">Wave Freq Y: {waveFreqY.toFixed(2)}</Label>
              <Slider id="waveFreqY" min={0.5} max={20} step={0.1} value={[waveFreqY]} onValueChange={handleWaveFreqYChange} />
            </div>

             {/* Wave Amplitude Sliders */}
             <div className="space-y-2">
              <Label htmlFor="waveAmpX">Wave Amp X: {waveAmpX.toFixed(3)}</Label>
              <Slider id="waveAmpX" min={0} max={0.3} step={0.005} value={[waveAmpX]} onValueChange={handleWaveAmpXChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waveAmpY">Wave Amp Y: {waveAmpY.toFixed(3)}</Label>
              <Slider id="waveAmpY" min={0} max={0.3} step={0.005} value={[waveAmpY]} onValueChange={handleWaveAmpYChange} />
            </div>

            {/* --- Gradient Stop Controls --- */}
            <div className="space-y-4 border-t pt-4 mt-4">
                <Label className="text-lg font-semibold">Gradient Colors</Label>
                {[...colorStops].sort((a, b) => a.position - b.position).map((stop, index, sortedStops) => {
                    const isFirst = index === 0;
                    const isLast = index === sortedStops.length - 1;

                    return (
                    <div key={stop.id} className="flex items-center space-x-2 p-2 border rounded">
                         {/* Color Picker */}
                         <Input
                            type="color"
                            value={stop.color}
                            onChange={(e) => handleColorStopChange(stop.id, 'color', e.target.value)}
                            className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                            title={`Stop Color`}
                         />
                         {/* Position Display/Slider */}
                         <div className="flex-grow space-y-1">
                           <Label htmlFor={`pos-${stop.id}`} className="text-xs">Pos: {stop.position.toFixed(2)}</Label>
                           {/* --- Conditionally render Slider based on INDEX --- */}
                           {!isFirst && !isLast ? (
                               <Slider
                                   id={`pos-${stop.id}`}
                                   min={0} max={1} step={0.01}
                                   value={[stop.position]}
                                   onValueChange={(val) => handleColorStopChange(stop.id, 'position', val[0])}
                               />
                           ) : (
                               // Render placeholder div to maintain layout height like the slider
                               <div className="h-[20px]" /> 
                           )}
                         </div>
                         {/* --- Conditionally render Remove Button based on INDEX --- */}
                         {/* Button visible if > 2 stops AND it's not the first or last stop */}
                         {sortedStops.length > 2 && !isFirst && !isLast && (
                            <Button variant="destructive" size="icon" onClick={() => removeColorStop(stop.id)} title="Remove Stop" className="w-8 h-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                         )}
                         {/* Add spacer div if button is not rendered to maintain layout */}
                         {/* Spacer visible if <= 2 stops OR it IS the first or last stop */}
                         {(sortedStops.length <= 2 || isFirst || isLast) && (
                            <div className="w-8 h-8" /> // Spacer to align items when no button
                         )}
                    </div>
                    );
                })}
                {/* Add Stop Button */}
                <Button onClick={addColorStop} variant="outline" size="sm" className="w-full">Add Color Stop</Button>
            </div>


            {/* Randomize Button */}
            <Button onClick={randomizeParameters} className="w-full mt-4">
                Randomize All
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
