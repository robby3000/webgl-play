import { useState, useRef, useCallback, useEffect } from 'react';
import { ColorStop, GradientParameters, GradientStyle } from '../webgl/types';
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
  // Gradient style
  const [style, setStyle] = useState<GradientStyle>(DEFAULT_PARAMETERS.style);
  
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
  const styleRef = useRef(style);
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
    styleRef.current = style;
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
    style, speed, waveFreqX, waveFreqY, waveAmpX, waveAmpY,
    noiseScale, noiseVerticalStretch, noiseSwirlSpeed, noiseFlowSpeed,
    blurAmount, blurSharpnessMin, blurSharpnessMax, 
    blurNoiseScale, blurNoiseSpeed, blurPulsingSpeed
  ]);
  
  // Style change handler
  const handleStyleChange = useCallback((newStyle: GradientStyle) => {
    setStyle(newStyle);
  }, []);
  
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
  
  // Event handlers for color stops
  const handleColorStopChange = useCallback((id: number, field: 'position' | 'color', value: string | number) => {
    setColorStops(prevStops => 
      prevStops.map(stop => 
        stop.id === id ? { ...stop, [field]: value } : stop
      )
    );
  }, []);
  
  const addColorStop = useCallback(() => {
    setColorStops(prevStops => {
      const newId = Date.now();
      // Place the new stop at the middle position if possible
      const positions = prevStops.map(stop => stop.position).sort((a, b) => a - b);
      let newPosition = 0.5;
      
      // Try to find the largest gap between stops
      if (positions.length >= 2) {
        let maxGap = 0;
        let gapPos = 0.5;
        
        for (let i = 0; i < positions.length - 1; i++) {
          const gap = positions[i+1] - positions[i];
          if (gap > maxGap) {
            maxGap = gap;
            gapPos = positions[i] + gap / 2;
          }
        }
        
        newPosition = gapPos;
      }
      
      // Add new stop with a random color
      return [...prevStops, {
        id: newId,
        position: newPosition,
        // Use a semi-random color
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
      }].sort((a, b) => a.position - b.position);
    });
  }, []);
  
  const removeColorStop = useCallback((id: number) => {
    setColorStops(prevStops => {
      // Don't allow removing all stops
      if (prevStops.length <= 2) return prevStops;
      return prevStops.filter(stop => stop.id !== id);
    });
  }, []);
  
  // Reset functions
  const resetBaseParameters = useCallback(() => {
    setStyle(DEFAULT_PARAMETERS.style);
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
    setStyle(randomParams.style);
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
    style,
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
    styleRef,
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
    handleStyleChange,
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
