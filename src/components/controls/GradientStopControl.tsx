import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import { ColorStop } from "@/webgl/types";

interface GradientStopControlProps {
  stop: ColorStop;
  index: number;
  totalStops: number;
  onColorChange: (id: number, color: string) => void;
  onPositionChange: (id: number, position: number) => void;
  onRemove: (id: number) => void;
}

/**
 * Control for a single gradient color stop
 */
export const GradientStopControl: React.FC<GradientStopControlProps> = ({
  stop,
  index,
  totalStops,
  onColorChange,
  onPositionChange,
  onRemove,
}) => {
  const isFirst = index === 0;
  const isLast = index === totalStops - 1;
  const canRemove = totalStops > 2 && !isFirst && !isLast;

  return (
    <div className="flex items-center space-x-2 p-2 border rounded">
      {/* Color Picker */}
      <Input
        type="color"
        value={stop.color}
        onChange={(e) => onColorChange(stop.id, e.target.value)}
        className="w-10 h-10 p-0 border-none cursor-pointer rounded"
        title="Stop Color"
      />
      
      {/* Position Display/Slider */}
      <div className="flex-grow space-y-1">
        <Label htmlFor={`pos-${stop.id}`} className="text-xs">
          Pos: {stop.position.toFixed(2)}
        </Label>
        
        {/* Conditionally render Slider based on index */}
        {!isFirst && !isLast ? (
          <Slider
            id={`pos-${stop.id}`}
            min={0}
            max={1}
            step={0.01}
            value={[stop.position]}
            onValueChange={(val) => onPositionChange(stop.id, val[0])}
          />
        ) : (
          // Render placeholder div to maintain layout height
          <div className="h-[20px]" /> 
        )}
      </div>
      
      {/* Conditionally render Remove Button */}
      {canRemove ? (
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(stop.id)}
          title="Remove Stop"
          className="w-8 h-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        // Add spacer div if button is not rendered to maintain layout
        <div className="w-8 h-8" />
      )}
    </div>
  );
};

export default GradientStopControl;
