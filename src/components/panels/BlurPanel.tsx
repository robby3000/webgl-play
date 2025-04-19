import React from "react";
import ControlSlider from "../controls/ControlSlider";
import ControlSection from "../controls/ControlSection";
import { PARAMETER_CONSTRAINTS } from "@/state/gradientState";

interface BlurPanelProps {
  blurAmount: number;
  blurSharpnessMin: number;
  blurSharpnessMax: number;
  blurNoiseScale: number;
  blurNoiseSpeed: number;
  blurPulsingSpeed: number;
  
  handleBlurAmountChange: (value: number[]) => void;
  handleBlurSharpnessMinChange: (value: number[]) => void;
  handleBlurSharpnessMaxChange: (value: number[]) => void;
  handleBlurNoiseScaleChange: (value: number[]) => void;
  handleBlurNoiseSpeedChange: (value: number[]) => void;
  handleBlurPulsingSpeedChange: (value: number[]) => void;
  
  resetBlurParameters: () => void;
}

/**
 * Panel for blur-related controls
 */
export const BlurPanel: React.FC<BlurPanelProps> = ({
  blurAmount,
  blurSharpnessMin,
  blurSharpnessMax,
  blurNoiseScale,
  blurNoiseSpeed,
  blurPulsingSpeed,
  
  handleBlurAmountChange,
  handleBlurSharpnessMinChange,
  handleBlurSharpnessMaxChange,
  handleBlurNoiseScaleChange,
  handleBlurNoiseSpeedChange,
  handleBlurPulsingSpeedChange,
  
  resetBlurParameters,
}) => {
  return (
    <ControlSection onReset={resetBlurParameters}>
      <ControlSlider
        id="blurAmount"
        label="Blur Amount"
        value={blurAmount}
        min={PARAMETER_CONSTRAINTS.blurAmount.min}
        max={PARAMETER_CONSTRAINTS.blurAmount.max}
        step={PARAMETER_CONSTRAINTS.blurAmount.step}
        onValueChange={handleBlurAmountChange}
        tooltip="Controls the maximum blur radius"
      />
      
      <ControlSlider
        id="blurSharpnessMin"
        label="Blur Sharpness Min"
        value={blurSharpnessMin}
        min={PARAMETER_CONSTRAINTS.blurSharpnessMin.min}
        max={PARAMETER_CONSTRAINTS.blurSharpnessMin.max}
        step={PARAMETER_CONSTRAINTS.blurSharpnessMin.step}
        onValueChange={handleBlurSharpnessMinChange}
        tooltip="Lower limit for blur sharpness/transition"
      />
      
      <ControlSlider
        id="blurSharpnessMax"
        label="Blur Sharpness Max"
        value={blurSharpnessMax}
        min={PARAMETER_CONSTRAINTS.blurSharpnessMax.min}
        max={PARAMETER_CONSTRAINTS.blurSharpnessMax.max}
        step={PARAMETER_CONSTRAINTS.blurSharpnessMax.step}
        onValueChange={handleBlurSharpnessMaxChange}
        tooltip="Upper limit for blur sharpness/transition"
      />
      
      <ControlSlider
        id="blurNoiseScale"
        label="Blur Pattern Scale"
        value={blurNoiseScale}
        min={PARAMETER_CONSTRAINTS.blurNoiseScale.min}
        max={PARAMETER_CONSTRAINTS.blurNoiseScale.max}
        step={PARAMETER_CONSTRAINTS.blurNoiseScale.step}
        onValueChange={handleBlurNoiseScaleChange}
        tooltip="Controls the scale of the dynamic blur pattern"
      />
      
      <ControlSlider
        id="blurNoiseSpeed"
        label="Blur Pattern Speed"
        value={blurNoiseSpeed}
        min={PARAMETER_CONSTRAINTS.blurNoiseSpeed.min}
        max={PARAMETER_CONSTRAINTS.blurNoiseSpeed.max}
        step={PARAMETER_CONSTRAINTS.blurNoiseSpeed.step}
        onValueChange={handleBlurNoiseSpeedChange}
        tooltip="Controls how fast the blur pattern changes"
      />
      
      <ControlSlider
        id="blurPulsingSpeed"
        label="Blur Pulsing Speed"
        value={blurPulsingSpeed}
        min={PARAMETER_CONSTRAINTS.blurPulsingSpeed.min}
        max={PARAMETER_CONSTRAINTS.blurPulsingSpeed.max}
        step={PARAMETER_CONSTRAINTS.blurPulsingSpeed.step}
        onValueChange={handleBlurPulsingSpeedChange}
        tooltip="Controls the speed of blur bias oscillation"
      />
    </ControlSection>
  );
};

export default BlurPanel;
