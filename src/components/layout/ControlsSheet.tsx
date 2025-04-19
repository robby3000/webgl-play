import React from "react";
import { Button } from "@/components/ui/button";
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import AnimationPanel from "../panels/AnimationPanel";
import NoisePanel from "../panels/NoisePanel";
import BlurPanel from "../panels/BlurPanel";
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
}

/**
 * Sheet component containing all control panels in accordion layout
 */
export const ControlsSheet: React.FC<ControlsSheetProps> = ({
  parameters,
  colorStops,
  handlers,
  resetHandlers,
}) => {
  const {
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
    blurPulsingSpeed,
  } = parameters;
  
  const {
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
    removeColorStop,
  } = handlers;
  
  const {
    resetBaseParameters,
    resetNoiseParameters,
    resetBlurParameters,
    resetColorStops,
    resetAllParameters,
    randomizeAllParameters,
  } = resetHandlers;
  
  return (
    <SheetContent side="right" className="w-[350px] sm:w-[400px] bg-background/30 backdrop-blur-sm overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Gradient Controls</SheetTitle>
      </SheetHeader>
      
      {/* Randomize Button at the top */}
      <div className="py-4">
        <Button 
          onClick={randomizeAllParameters} 
          className="w-full mb-2 bg-black/[0.07] hover:bg-black/[0.15] text-foreground/90 transition-colors border-none"
        >
          Randomize All
        </Button>
        <Button 
          onClick={resetAllParameters} 
          variant="outline" 
          className="w-full bg-transparent border-border/30 hover:bg-black/[0.07] text-foreground/80 hover:text-foreground/90"
        >
          Reset All
        </Button>
      </div>
      
      {/* Control Panels in Accordion Layout */}
      <Accordion type="multiple" defaultValue={["animation", "noise", "blur", "gradient"]} className="space-y-4">
        <AccordionItem value="animation" className="border-b-0 border-t-0 border-x-0 rounded-md overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-2 px-3 text-foreground/90 bg-black/[0.07] hover:bg-black/[0.15] transition-colors">Animation & Waves</AccordionTrigger>
          <AccordionContent className="px-2 pt-4">
            <AnimationPanel
              speed={speed}
              waveFreqX={waveFreqX}
              waveFreqY={waveFreqY}
              waveAmpX={waveAmpX}
              waveAmpY={waveAmpY}
              handleSpeedChange={handleSpeedChange}
              handleWaveFreqXChange={handleWaveFreqXChange}
              handleWaveFreqYChange={handleWaveFreqYChange}
              handleWaveAmpXChange={handleWaveAmpXChange}
              handleWaveAmpYChange={handleWaveAmpYChange}
              resetBaseParameters={resetBaseParameters}
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="noise" className="border-b-0 border-t-0 border-x-0 rounded-md overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-2 px-3 text-foreground/90 bg-black/[0.07] hover:bg-black/[0.15] transition-colors">Background Noise</AccordionTrigger>
          <AccordionContent className="px-2 pt-4">
            <NoisePanel
              noiseScale={noiseScale}
              noiseVerticalStretch={noiseVerticalStretch}
              noiseSwirlSpeed={noiseSwirlSpeed}
              noiseFlowSpeed={noiseFlowSpeed}
              handleNoiseScaleChange={handleNoiseScaleChange}
              handleNoiseVerticalStretchChange={handleNoiseVerticalStretchChange}
              handleNoiseSwirlSpeedChange={handleNoiseSwirlSpeedChange}
              handleNoiseFlowSpeedChange={handleNoiseFlowSpeedChange}
              resetNoiseParameters={resetNoiseParameters}
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="blur" className="border-b-0 border-t-0 border-x-0 rounded-md overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-2 px-3 text-foreground/90 bg-black/[0.07] hover:bg-black/[0.15] transition-colors">Blur Effects</AccordionTrigger>
          <AccordionContent className="px-2 pt-4">
            <BlurPanel
              blurAmount={blurAmount}
              blurSharpnessMin={blurSharpnessMin}
              blurSharpnessMax={blurSharpnessMax}
              blurNoiseScale={blurNoiseScale}
              blurNoiseSpeed={blurNoiseSpeed}
              blurPulsingSpeed={blurPulsingSpeed}
              handleBlurAmountChange={handleBlurAmountChange}
              handleBlurSharpnessMinChange={handleBlurSharpnessMinChange}
              handleBlurSharpnessMaxChange={handleBlurSharpnessMaxChange}
              handleBlurNoiseScaleChange={handleBlurNoiseScaleChange}
              handleBlurNoiseSpeedChange={handleBlurNoiseSpeedChange}
              handleBlurPulsingSpeedChange={handleBlurPulsingSpeedChange}
              resetBlurParameters={resetBlurParameters}
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="gradient" className="border-b-0 border-t-0 border-x-0 rounded-md overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-2 px-3 text-foreground/90 bg-black/[0.07] hover:bg-black/[0.15] transition-colors">Gradient Colors</AccordionTrigger>
          <AccordionContent className="px-2 pt-4">
            <GradientPanel
              colorStops={colorStops}
              handleColorStopChange={handleColorStopChange}
              addColorStop={addColorStop}
              removeColorStop={removeColorStop}
              resetColorStops={resetColorStops}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SheetContent>
  );
};

export default ControlsSheet;
