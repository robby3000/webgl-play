import React from "react";
import ControlSection from "../controls/ControlSection";
import GradientStopControl from "../controls/GradientStopControl";
import { Button } from "@/components/ui/button";
import { ColorStop } from "@/webgl/types";

interface GradientPanelProps {
  colorStops: ColorStop[];
  handleColorStopChange: (id: number, field: 'position' | 'color', value: string | number) => void;
  addColorStop: () => void;
  removeColorStop: (id: number) => void;
  resetColorStops: () => void;
}

/**
 * Panel for gradient color stop controls
 */
export const GradientPanel: React.FC<GradientPanelProps> = ({
  colorStops,
  handleColorStopChange,
  addColorStop,
  removeColorStop,
  resetColorStops,
}) => {
  // Handle color change specifically
  const handleColorChange = (id: number, color: string) => {
    handleColorStopChange(id, 'color', color);
  };
  
  // Handle position change specifically
  const handlePositionChange = (id: number, position: number) => {
    handleColorStopChange(id, 'position', position);
  };
  
  // Sort stops by position for display
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
  
  return (
    <ControlSection onReset={resetColorStops}>
      <div className="space-y-4">
        {sortedStops.map((stop, index) => (
          <GradientStopControl
            key={stop.id}
            stop={stop}
            index={index}
            totalStops={sortedStops.length}
            onColorChange={handleColorChange}
            onPositionChange={handlePositionChange}
            onRemove={removeColorStop}
          />
        ))}
        
        {/* Add Stop Button */}
        <Button 
          onClick={addColorStop} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Add Color Stop
        </Button>
      </div>
    </ControlSection>
  );
};

export default GradientPanel;
