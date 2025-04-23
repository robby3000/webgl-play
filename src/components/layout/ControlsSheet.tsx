import React from "react";
import { Button } from "@/components/ui/button";
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";

import GradientPanel from "../panels/GradientPanel";
import { ColorStop } from "@/webgl/types";

interface ControlsSheetProps {
  // State values
  parameters: {
    speed: number;
    waveFreqX: number;
    waveFreqY: number;
    waveAmpX: number;
    waveAmpY: number;
    noiseScale: number;
    noiseVerticalStretch: number;
    noiseSwirlSpeed: number;
    noiseFlowSpeed: number;
    blurAmount: number;
    blurSharpnessMin: number;
    blurSharpnessMax: number;
    blurNoiseScale: number;
    blurNoiseSpeed: number;
    blurPulsingSpeed: number;
  };
  colorStops: ColorStop[];
  
  // Event handlers
  handlers: {
    handleSpeedChange: (value: number[]) => void;
    handleWaveFreqXChange: (value: number[]) => void;
    handleWaveFreqYChange: (value: number[]) => void;
    handleWaveAmpXChange: (value: number[]) => void;
    handleWaveAmpYChange: (value: number[]) => void;
    handleNoiseScaleChange: (value: number[]) => void;
    handleNoiseVerticalStretchChange: (value: number[]) => void;
    handleNoiseSwirlSpeedChange: (value: number[]) => void;
    handleNoiseFlowSpeedChange: (value: number[]) => void;
    handleBlurAmountChange: (value: number[]) => void;
    handleBlurSharpnessMinChange: (value: number[]) => void;
    handleBlurSharpnessMaxChange: (value: number[]) => void;
    handleBlurNoiseScaleChange: (value: number[]) => void;
    handleBlurNoiseSpeedChange: (value: number[]) => void;
    handleBlurPulsingSpeedChange: (value: number[]) => void;
    handleColorStopChange: (id: number, field: 'position' | 'color', value: string | number) => void;
    addColorStop: () => void;
    removeColorStop: (id: number) => void;
  };
  
  // Reset handlers
  resetHandlers: {
    resetBaseParameters: () => void;
    resetNoiseParameters: () => void;
    resetBlurParameters: () => void;
    resetColorStops: () => void;
    resetAllParameters: () => void;
    randomizeAllParameters: () => void;
  };
  
  // WebGL texture randomize function
  randomize: () => void;
}

/**
 * Sheet component containing gradient controls
 */
export const ControlsSheet: React.FC<ControlsSheetProps> = ({
  // We keep parameters in the props for interface compatibility, but it's not used
  // in the simplified UI. It might be used in future updates.
  colorStops,
  handlers,
  resetHandlers,
  randomize
}) => {
  const {
    handleColorStopChange,
    addColorStop,
    removeColorStop,
  } = handlers;
  
  const {
    resetColorStops,
    randomizeAllParameters,
  } = resetHandlers;
  
  // Combined randomize function that updates both state and textures
  const handleRandomize = () => {
    randomizeAllParameters(); // Update state with random values
    randomize();              // Regenerate WebGL textures
  };
  
  return (
    <SheetContent side="right" className="w-[350px] sm:w-[400px] bg-background/30 backdrop-blur-sm overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Gradient Controls</SheetTitle>
      </SheetHeader>
      
      {/* Randomize Button */}
      <div className="py-4">
        <Button 
          onClick={handleRandomize} 
          className="w-full mb-2 bg-black/[0.07] hover:bg-black/[0.15] text-foreground/90 transition-colors border-none"
        >
          Randomize
        </Button>
      </div>
      
      {/* Gradient Color Controls */}
      <div className="rounded-md overflow-hidden bg-black/[0.03] p-4">
        <h3 className="text-foreground/90 font-medium text-sm mb-4">Gradient Colors</h3>
        <GradientPanel
          colorStops={colorStops}
          handleColorStopChange={handleColorStopChange}
          addColorStop={addColorStop}
          removeColorStop={removeColorStop}
          resetColorStops={resetColorStops}
        />
      </div>
    </SheetContent>
  );
};

export default ControlsSheet;
