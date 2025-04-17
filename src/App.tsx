import React, { useEffect, useRef, useState } from "react";
import createFragmentShader from "./play";
import './App.css'; // Ensure CSS is imported

// Import shadcn components
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- State for Controls ---
  const [speed, setSpeed] = useState<number>(1.0);
  const [waveFreqX, setWaveFreqX] = useState<number>(5.0);
  const [waveFreqY, setWaveFreqY] = useState<number>(3.0);
  const [waveAmpX, setWaveAmpX] = useState<number>(0.1);
  const [waveAmpY, setWaveAmpY] = useState<number>(0.05);
  const [color1, setColor1] = useState<string>("#ff0000"); // Red
  const [color2, setColor2] = useState<string>("#0000ff"); // Blue

  // Refs to store uniform locations
  const uniformLocations = useRef<Record<string, WebGLUniformLocation | null>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    // --- Pass no arguments now ---
    const shader = createFragmentShader();

    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    const fragmentShaderSource = shader;

    // --- Shader Compilation & Linking (remains mostly the same) ---
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex Shader Error:", gl.getShaderInfoLog(vertexShader));
      return;
    }
    gl.compileShader(fragmentShader);
     if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      // Log the shader source for debugging
      console.error("Fragment Shader Error:", gl.getShaderInfoLog(fragmentShader));
      console.log("Fragment Shader Source:\n", fragmentShaderSource);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Linker Error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // --- Vertex Buffer Setup (remains the same) ---
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // --- Get Uniform Locations --- 
    uniformLocations.current = {
        u_time: gl.getUniformLocation(program, "u_time"),
        u_resolution: gl.getUniformLocation(program, "u_resolution"), // Combine width/height
        u_speed: gl.getUniformLocation(program, "u_speed"),
        u_waveFreq: gl.getUniformLocation(program, "u_waveFreq"), // vec2
        u_waveAmp: gl.getUniformLocation(program, "u_waveAmp"),   // vec2
        u_color1: gl.getUniformLocation(program, "u_color1"),   // vec3
        u_color2: gl.getUniformLocation(program, "u_color2"),   // vec3
        // Remove gradient texture uniform for now
        // u_gradient: gl.getUniformLocation(program, "u_gradient"),
    };

    // --- Remove old gradient texture setup ---
    /*
    const gradientTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gradientTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255, 0, 0, 255, 255])); // Example: red gradient
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uniformLocations.current.u_gradient, 0); // Use texture unit 0
    */

    // Helper to convert hex color string to [r, g, b] array (0.0 - 1.0)
    const hexToRgb = (hex: string): [number, number, number] => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return [r / 255, g / 255, b / 255];
    };

    const startTime = Date.now(); // Fix: Use const
    const render = () => {
      const currentTime = (Date.now() - startTime) * 0.001;
      const { u_time, u_resolution, u_speed, u_waveFreq, u_waveAmp, u_color1, u_color2 } = uniformLocations.current;

      // Update Uniforms
      gl.uniform1f(u_time, currentTime);
      gl.uniform2f(u_resolution, canvas.width, canvas.height); // Use actual canvas dimensions
      gl.uniform1f(u_speed, speed);
      gl.uniform2f(u_waveFreq, waveFreqX, waveFreqY);
      gl.uniform2f(u_waveAmp, waveAmpX, waveAmpY);
      gl.uniform3fv(u_color1, hexToRgb(color1));
      gl.uniform3fv(u_color2, hexToRgb(color2));

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };

    // Resize observer setup (no changes needed here)
    const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) { // Fix: Use const
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height); // Update WebGL viewport
        }
    });
    resizeObserver.observe(canvas);

    render();

    // Cleanup function
    return () => {
        resizeObserver.unobserve(canvas);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
        // gl.deleteTexture(gradientTexture); // No longer needed
    };
  }, [speed, waveFreqX, waveFreqY, waveAmpX, waveAmpY, color1, color2]); // Re-run effect if controls change (for shader recompilation if needed - maybe not necessary here)

  // --- Control Handlers ---
  const handleSpeedChange = (value: number[]) => setSpeed(value[0]);
  const handleWaveFreqXChange = (value: number[]) => setWaveFreqX(value[0]);
  const handleWaveFreqYChange = (value: number[]) => setWaveFreqY(value[0]);
  const handleWaveAmpXChange = (value: number[]) => setWaveAmpX(value[0]);
  const handleWaveAmpYChange = (value: number[]) => setWaveAmpY(value[0]);
  const handleColor1Change = (event: React.ChangeEvent<HTMLInputElement>) => setColor1(event.target.value);
  const handleColor2Change = (event: React.ChangeEvent<HTMLInputElement>) => setColor2(event.target.value);

  const randomizeParameters = () => {
      setSpeed(Math.random() * 2 + 0.1); // 0.1 to 2.1
      setWaveFreqX(Math.random() * 15 + 1); // 1 to 16
      setWaveFreqY(Math.random() * 15 + 1); // 1 to 16
      setWaveAmpX(Math.random() * 0.2 + 0.01); // 0.01 to 0.21
      setWaveAmpY(Math.random() * 0.2 + 0.01); // 0.01 to 0.21

      // Random Hex Colors
      const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      setColor1(randomHex());
      setColor2(randomHex());
  };


  return (
    <div id="main-container" className="flex h-screen">
      {/* Add min-w-0 to allow canvas to shrink if needed */}
      <canvas ref={canvasRef} className="flex-grow h-full min-w-0" /> 
      {/* Restore original control section */}
      <div id="control-section" className="w-80 h-full overflow-y-auto p-4 border-l bg-card text-card-foreground"> 
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Speed Slider */}
            <div className="space-y-2">
              <Label htmlFor="speed">Speed: {speed.toFixed(2)}</Label>
              <Slider
                id="speed"
                min={0.1}
                max={5}
                step={0.05}
                value={[speed]}
                onValueChange={handleSpeedChange}
              />
            </div>

            {/* Wave Frequency Sliders */}
            <div className="space-y-2">
              <Label htmlFor="waveFreqX">Wave Freq X: {waveFreqX.toFixed(2)}</Label>
              <Slider
                id="waveFreqX"
                min={0.5}
                max={20}
                step={0.1}
                value={[waveFreqX]}
                onValueChange={handleWaveFreqXChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waveFreqY">Wave Freq Y: {waveFreqY.toFixed(2)}</Label>
              <Slider
                id="waveFreqY"
                min={0.5}
                max={20}
                step={0.1}
                value={[waveFreqY]}
                onValueChange={handleWaveFreqYChange}
              />
            </div>

             {/* Wave Amplitude Sliders */}
             <div className="space-y-2">
              <Label htmlFor="waveAmpX">Wave Amp X: {waveAmpX.toFixed(3)}</Label>
              <Slider
                id="waveAmpX"
                min={0}
                max={0.3}
                step={0.005}
                value={[waveAmpX]}
                onValueChange={handleWaveAmpXChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waveAmpY">Wave Amp Y: {waveAmpY.toFixed(3)}</Label>
              <Slider
                id="waveAmpY"
                min={0}
                max={0.3}
                step={0.005}
                value={[waveAmpY]}
                onValueChange={handleWaveAmpYChange}
              />
            </div>

             {/* Color Pickers */}
             <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center space-y-1">
                    <Label htmlFor="color1">Color 1</Label>
                    <input
                        id="color1"
                        type="color"
                        value={color1}
                        onChange={handleColor1Change}
                        className="w-10 h-10 border-none cursor-pointer p-0 rounded"
                        style={{ backgroundColor: color1 }} // Show selected color
                    />
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <Label htmlFor="color2">Color 2</Label>
                    <input
                        id="color2"
                        type="color"
                        value={color2}
                        onChange={handleColor2Change}
                        className="w-10 h-10 border-none cursor-pointer p-0 rounded"
                        style={{ backgroundColor: color2 }} // Show selected color
                    />
                </div>
             </div>

            {/* Randomize Button */}
            <Button onClick={randomizeParameters} className="w-full">
                Randomize
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
