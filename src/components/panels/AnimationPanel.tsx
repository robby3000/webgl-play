import React from "react";
import ControlSlider from "../controls/ControlSlider";
import ControlSection from "../controls/ControlSection";
import { PARAMETER_CONSTRAINTS } from "@/state/gradientState";

interface AnimationPanelProps {
  speed: number;
  waveFreqX: number;
  waveFreqY: number;
  waveAmpX: number;
  waveAmpY: number;
  
  handleSpeedChange: (value: number[]) => void;
  handleWaveFreqXChange: (value: number[]) => void;
  handleWaveFreqYChange: (value: number[]) => void;
  handleWaveAmpXChange: (value: number[]) => void;
  handleWaveAmpYChange: (value: number[]) => void;
  
  resetBaseParameters: () => void;
}

/**
 * Panel for animation and wave controls
 */
export const AnimationPanel: React.FC<AnimationPanelProps> = ({
  speed,
  waveFreqX,
  waveFreqY,
  waveAmpX,
  waveAmpY,
  
  handleSpeedChange,
  handleWaveFreqXChange,
  handleWaveFreqYChange,
  handleWaveAmpXChange,
  handleWaveAmpYChange,
  
  resetBaseParameters,
}) => {
  return (
    <ControlSection onReset={resetBaseParameters}>
      <ControlSlider
        id="speed"
        label="Animation Speed"
        value={speed}
        min={PARAMETER_CONSTRAINTS.speed.min}
        max={PARAMETER_CONSTRAINTS.speed.max}
        step={PARAMETER_CONSTRAINTS.speed.step}
        onValueChange={handleSpeedChange}
        tooltip="Controls the master speed of all animations"
      />
      
      <ControlSlider
        id="waveFreqX"
        label="Wave Frequency X"
        value={waveFreqX}
        min={PARAMETER_CONSTRAINTS.waveFreqX.min}
        max={PARAMETER_CONSTRAINTS.waveFreqX.max}
        step={PARAMETER_CONSTRAINTS.waveFreqX.step}
        onValueChange={handleWaveFreqXChange}
        tooltip="Controls the horizontal frequency of the waves"
      />
      
      <ControlSlider
        id="waveFreqY"
        label="Wave Frequency Y"
        value={waveFreqY}
        min={PARAMETER_CONSTRAINTS.waveFreqY.min}
        max={PARAMETER_CONSTRAINTS.waveFreqY.max}
        step={PARAMETER_CONSTRAINTS.waveFreqY.step}
        onValueChange={handleWaveFreqYChange}
        tooltip="Controls the vertical frequency of the waves"
      />
      
      <ControlSlider
        id="waveAmpX"
        label="Wave Amplitude X"
        value={waveAmpX}
        min={PARAMETER_CONSTRAINTS.waveAmpX.min}
        max={PARAMETER_CONSTRAINTS.waveAmpX.max}
        step={PARAMETER_CONSTRAINTS.waveAmpX.step}
        onValueChange={handleWaveAmpXChange}
        tooltip="Controls the horizontal amplitude of wave 1"
      />
      
      <ControlSlider
        id="waveAmpY"
        label="Wave Amplitude Y"
        value={waveAmpY}
        min={PARAMETER_CONSTRAINTS.waveAmpY.min}
        max={PARAMETER_CONSTRAINTS.waveAmpY.max}
        step={PARAMETER_CONSTRAINTS.waveAmpY.step}
        onValueChange={handleWaveAmpYChange}
        tooltip="Controls the horizontal amplitude of wave 2"
      />
    </ControlSection>
  );
};

export default AnimationPanel;
