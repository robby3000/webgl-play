import React from "react";
import ControlSlider from "../controls/ControlSlider";
import ControlSection from "../controls/ControlSection";
import { PARAMETER_CONSTRAINTS } from "@/state/gradientState";

interface NoisePanelProps {
  noiseScale: number;
  noiseVerticalStretch: number;
  noiseSwirlSpeed: number;
  noiseFlowSpeed: number;
  
  handleNoiseScaleChange: (value: number[]) => void;
  handleNoiseVerticalStretchChange: (value: number[]) => void;
  handleNoiseSwirlSpeedChange: (value: number[]) => void;
  handleNoiseFlowSpeedChange: (value: number[]) => void;
  
  resetNoiseParameters: () => void;
}

/**
 * Panel for noise-related controls
 */
export const NoisePanel: React.FC<NoisePanelProps> = ({
  noiseScale,
  noiseVerticalStretch,
  noiseSwirlSpeed,
  noiseFlowSpeed,
  
  handleNoiseScaleChange,
  handleNoiseVerticalStretchChange,
  handleNoiseSwirlSpeedChange,
  handleNoiseFlowSpeedChange,
  
  resetNoiseParameters,
}) => {
  return (
    <ControlSection onReset={resetNoiseParameters}>
      <ControlSlider
        id="noiseScale"
        label="Pattern Scale"
        value={noiseScale}
        min={PARAMETER_CONSTRAINTS.noiseScale.min}
        max={PARAMETER_CONSTRAINTS.noiseScale.max}
        step={PARAMETER_CONSTRAINTS.noiseScale.step}
        onValueChange={handleNoiseScaleChange}
        tooltip="Controls the overall size/zoom of the noise pattern"
      />
      
      <ControlSlider
        id="noiseVerticalStretch"
        label="Vertical Stretch"
        value={noiseVerticalStretch}
        min={PARAMETER_CONSTRAINTS.noiseVerticalStretch.min}
        max={PARAMETER_CONSTRAINTS.noiseVerticalStretch.max}
        step={PARAMETER_CONSTRAINTS.noiseVerticalStretch.step}
        onValueChange={handleNoiseVerticalStretchChange}
        tooltip="Controls how much the noise is stretched vertically"
      />
      
      <ControlSlider
        id="noiseSwirlSpeed"
        label="Swirl Speed"
        value={noiseSwirlSpeed}
        min={PARAMETER_CONSTRAINTS.noiseSwirlSpeed.min}
        max={PARAMETER_CONSTRAINTS.noiseSwirlSpeed.max}
        step={PARAMETER_CONSTRAINTS.noiseSwirlSpeed.step}
        onValueChange={handleNoiseSwirlSpeedChange}
        tooltip="Controls the speed at which the noise pattern evolves over time"
      />
      
      <ControlSlider
        id="noiseFlowSpeed"
        label="Flow Speed"
        value={noiseFlowSpeed}
        min={PARAMETER_CONSTRAINTS.noiseFlowSpeed.min}
        max={PARAMETER_CONSTRAINTS.noiseFlowSpeed.max}
        step={PARAMETER_CONSTRAINTS.noiseFlowSpeed.step}
        onValueChange={handleNoiseFlowSpeedChange}
        tooltip="Controls the horizontal drift speed of the noise pattern"
      />
    </ControlSection>
  );
};

export default NoisePanel;
