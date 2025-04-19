import { useState, useRef, useCallback, useEffect } from 'react';
import { ColorStop, GradientParameters } from '../webgl/types';
import { 
  DEFAULT_PARAMETERS, 
  DEFAULT_COLOR_STOPS, 
  randomizeParameters,
  randomizeColorStops
} from './gradientState';

/**
 * Custom hook to manage gradient state parameters
 */
export function useGradientState() {
  // Base parameters
  const [speed, setSpeed] = useState<number>(DEFAULT_PARAMETERS.speed);
  const [waveFreqX, setWaveFreqX] = useState<number>(DEFAULT_PARAMETERS.waveFreqX);
  const [waveFreqY, setWaveFreqY] = useState<number>(DEFAULT_PARAMETERS.waveFreqY);
  const [waveAmpX, setWaveAmpX] = useState<number>(DEFAULT_PARAMETERS.waveAmpX);
  const [waveAmpY, setWaveAmpY] = useState<number>(DEFAULT_PARAMETERS.waveAmpY);
  
  // Noise parameters
  const [noiseScale, setNoiseScale] = useState<number>(DEFAULT_PARAMETERS.noiseScale);
  const [noiseVerticalStretch, setNoiseVerticalStretch] = useState<number>(DEFAULT_PARAMETERS.noiseVerticalStretch);
  const [noiseSwirlSpeed, setNoiseSwirlSpeed] = useState<number>(DEFAULT_PARAMETERS.noiseSwirlSpeed);
  const [noiseFlowSpeed, setNoiseFlowSpeed] = useState<number>(DEFAULT_PARAMETERS.noiseFlowSpeed);
  
  // Blur parameters
  const [blurAmount, setBlurAmount] = useState<number>(DEFAULT_PARAMETERS.blurAmount);
  const [blurSharpnessMin, setBlurSharpnessMin] = useState<number>(DEFAULT_PARAMETERS.blurSharpnessMin);
  const [blurSharpnessMax, setBlurSharpnessMax] = useState<number>(DEFAULT_PARAMETERS.blurSharpnessMax);
  const [blurNoiseScale, setBlurNoiseScale] = useState<number>(DEFAULT_PARAMETERS.blurNoiseScale);
  const [blurNoiseSpeed, setBlurNoiseSpeed] = useState<number>(DEFAULT_PARAMETERS.blurNoiseSpeed);
  const [blurPulsingSpeed, setBlurPulsingSpeed] = useState<number>(DEFAULT_PARAMETERS.blurPulsingSpeed);
  
  // Color stops
  const [colorStops, setColorStops] = useState<ColorStop[]>(DEFAULT_COLOR_STOPS);
  
  // Refs for WebGL rendering
  const speedRef = useRef(speed);
  const waveFreqXRef = useRef(waveFreqX);
  const waveFreqYRef = useRef(waveFreqY);
  const waveAmpXRef = useRef(waveAmpX);
  const waveAmpYRef = useRef(waveAmpY);
  
  // Refs for new parameters
  const noiseScaleRef = useRef(noiseScale);
  const noiseVerticalStretchRef = useRef(noiseVerticalStretch);
  const noiseSwirlSpeedRef = useRef(noiseSwirlSpeed);
  const noiseFlowSpeedRef = useRef(noiseFlowSpeed);
  
  const blurAmountRef = useRef(blurAmount);
  const blurSharpnessMinRef = useRef(blurSharpnessMin);
  const blurSharpnessMaxRef = useRef(blurSharpnessMax);
  const blurNoiseScaleRef = useRef(blurNoiseScale);
  const blurNoiseSpeedRef = useRef(blurNoiseSpeed);
  const blurPulsingSpeedRef = useRef(blurPulsingSpeed);
  
  // Update refs when state changes
  useEffect(() => {
    speedRef.current = speed;
    waveFreqXRef.current = waveFreqX;
    waveFreqYRef.current = waveFreqY;
    waveAmpXRef.current = waveAmpX;
    waveAmpYRef.current = waveAmpY;
    
    noiseScaleRef.current = noiseScale;
    noiseVerticalStretchRef.current = noiseVerticalStretch;
    noiseSwirlSpeedRef.current = noiseSwirlSpeed;
    noiseFlowSpeedRef.current = noiseFlowSpeed;
    
    blurAmountRef.current = blurAmount;
    blurSharpnessMinRef.current = blurSharpnessMin;
    blurSharpnessMaxRef.current = blurSharpnessMax;
    blurNoiseScaleRef.current = blurNoiseScale;
    blurNoiseSpeedRef.current = blurNoiseSpeed;
    blurPulsingSpeedRef.current = blurPulsingSpeed;
  }, [
    speed, waveFreqX, waveFreqY, waveAmpX, waveAmpY,
    noiseScale, noiseVerticalStretch, noiseSwirlSpeed, noiseFlowSpeed,
    blurAmount, blurSharpnessMin, blurSharpnessMax, 
    blurNoiseScale, blurNoiseSpeed, blurPulsingSpeed
  ]);
  
  // Update handlers for each parameter
  const handleSpeedChange = useCallback((value: number[]) => setSpeed(value[0]), []);
  const handleWaveFreqXChange = useCallback((value: number[]) => setWaveFreqX(value[0]), []);
  const handleWaveFreqYChange = useCallback((value: number[]) => setWaveFreqY(value[0]), []);
  const handleWaveAmpXChange = useCallback((value: number[]) => setWaveAmpX(value[0]), []);
  const handleWaveAmpYChange = useCallback((value: number[]) => setWaveAmpY(value[0]), []);
  
  const handleNoiseScaleChange = useCallback((value: number[]) => setNoiseScale(value[0]), []);
  const handleNoiseVerticalStretchChange = useCallback((value: number[]) => setNoiseVerticalStretch(value[0]), []);
  const handleNoiseSwirlSpeedChange = useCallback((value: number[]) => setNoiseSwirlSpeed(value[0]), []);
  const handleNoiseFlowSpeedChange = useCallback((value: number[]) => setNoiseFlowSpeed(value[0]), []);
  
  const handleBlurAmountChange = useCallback((value: number[]) => setBlurAmount(value[0]), []);
  const handleBlurSharpnessMinChange = useCallback((value: number[]) => setBlurSharpnessMin(value[0]), []);
  const handleBlurSharpnessMaxChange = useCallback((value: number[]) => setBlurSharpnessMax(value[0]), []);
  const handleBlurNoiseScaleChange = useCallback((value: number[]) => setBlurNoiseScale(value[0]), []);
  const handleBlurNoiseSpeedChange = useCallback((value: number[]) => setBlurNoiseSpeed(value[0]), []);
  const handleBlurPulsingSpeedChange = useCallback((value: number[]) => setBlurPulsingSpeed(value[0]), []);
  
  // Color stop handlers
  const handleColorStopChange = useCallback((id: number, field: 'position' | 'color', value: string | number) => {
    setColorStops(prevStops =>
      prevStops.map(stop =>
        stop.id === id ? { ...stop, [field]: value } : stop
      )
    );
  }, []);
  
  const addColorStop = useCallback(() => {
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
  }, []);
  
  const removeColorStop = useCallback((id: number) => {
    setColorStops(prevStops => prevStops.filter(stop => stop.id !== id));
  }, []);
  
  // Reset functions for parameter groups
  const resetBaseParameters = useCallback(() => {
    setSpeed(DEFAULT_PARAMETERS.speed);
    setWaveFreqX(DEFAULT_PARAMETERS.waveFreqX);
    setWaveFreqY(DEFAULT_PARAMETERS.waveFreqY);
    setWaveAmpX(DEFAULT_PARAMETERS.waveAmpX);
    setWaveAmpY(DEFAULT_PARAMETERS.waveAmpY);
  }, []);
  
  const resetNoiseParameters = useCallback(() => {
    setNoiseScale(DEFAULT_PARAMETERS.noiseScale);
    setNoiseVerticalStretch(DEFAULT_PARAMETERS.noiseVerticalStretch);
    setNoiseSwirlSpeed(DEFAULT_PARAMETERS.noiseSwirlSpeed);
    setNoiseFlowSpeed(DEFAULT_PARAMETERS.noiseFlowSpeed);
  }, []);
  
  const resetBlurParameters = useCallback(() => {
    setBlurAmount(DEFAULT_PARAMETERS.blurAmount);
    setBlurSharpnessMin(DEFAULT_PARAMETERS.blurSharpnessMin);
    setBlurSharpnessMax(DEFAULT_PARAMETERS.blurSharpnessMax);
    setBlurNoiseScale(DEFAULT_PARAMETERS.blurNoiseScale);
    setBlurNoiseSpeed(DEFAULT_PARAMETERS.blurNoiseSpeed);
    setBlurPulsingSpeed(DEFAULT_PARAMETERS.blurPulsingSpeed);
  }, []);
  
  const resetColorStops = useCallback(() => {
    setColorStops(DEFAULT_COLOR_STOPS);
  }, []);
  
  // Reset all parameters
  const resetAllParameters = useCallback(() => {
    resetBaseParameters();
    resetNoiseParameters();
    resetBlurParameters();
    resetColorStops();
  }, [resetBaseParameters, resetNoiseParameters, resetBlurParameters, resetColorStops]);
  
  // Randomize all parameters
  const randomizeAllParameters = useCallback(() => {
    const randomParams = randomizeParameters();
    
    // Apply randomized parameters
    setSpeed(randomParams.speed);
    setWaveFreqX(randomParams.waveFreqX);
    setWaveFreqY(randomParams.waveFreqY);
    setWaveAmpX(randomParams.waveAmpX);
    setWaveAmpY(randomParams.waveAmpY);
    
    setNoiseScale(randomParams.noiseScale);
    setNoiseVerticalStretch(randomParams.noiseVerticalStretch);
    setNoiseSwirlSpeed(randomParams.noiseSwirlSpeed);
    setNoiseFlowSpeed(randomParams.noiseFlowSpeed);
    
    setBlurAmount(randomParams.blurAmount);
    setBlurSharpnessMin(randomParams.blurSharpnessMin);
    setBlurSharpnessMax(randomParams.blurSharpnessMax);
    setBlurNoiseScale(randomParams.blurNoiseScale);
    setBlurNoiseSpeed(randomParams.blurNoiseSpeed);
    setBlurPulsingSpeed(randomParams.blurPulsingSpeed);
    
    // Randomize gradient stops
    setColorStops(randomizeColorStops());
  }, []);

  // Create parameter objects for consumers
  const parameters: GradientParameters = {
    speed,
    waveFreqX,
    waveFreqY,
    waveAmpX,
    waveAmpY,
    noiseScale,
    noiseVerticalStretch,
    noiseSwirlSpeed,
    noiseFlowSpeed,
    blurAmount,
    blurSharpnessMin,
    blurSharpnessMax,
    blurNoiseScale,
    blurNoiseSpeed,
    blurPulsingSpeed
  };

  // Group all refs for WebGL hook
  const parameterRefs = {
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
    blurPulsingSpeedRef
  };
  
  // Group all handlers for UI components
  const handlers = {
    handleSpeedChange,
    handleWaveFreqXChange,
    handleWaveFreqYChange,
    handleWaveAmpXChange,
    handleWaveAmpYChange,
    handleNoiseScaleChange,
    handleNoiseVerticalStretchChange,
    handleNoiseSwirlSpeedChange,
    handleNoiseFlowSpeedChange,
    handleBlurAmountChange,
    handleBlurSharpnessMinChange,
    handleBlurSharpnessMaxChange,
    handleBlurNoiseScaleChange,
    handleBlurNoiseSpeedChange,
    handleBlurPulsingSpeedChange,
    handleColorStopChange,
    addColorStop,
    removeColorStop
  };
  
  // Group all reset functions for UI components
  const resetHandlers = {
    resetBaseParameters,
    resetNoiseParameters,
    resetBlurParameters,
    resetColorStops,
    resetAllParameters,
    randomizeAllParameters
  };
  
  // Return all state, refs, and handlers
  return {
    // State
    parameters,
    colorStops,
    
    // Refs for WebGL
    parameterRefs,
    
    // Handlers for UI
    handlers,
    
    // Reset handlers
    resetHandlers
  };
}
