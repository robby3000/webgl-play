import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ControlSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  onValueChange: (value: number[]) => void;
}

/**
 * Reusable control slider component with label and optional tooltip
 */
export const ControlSlider: React.FC<ControlSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  tooltip,
  onValueChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center">
          {label}: {value.toFixed(2)}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 h-4 w-4 cursor-help opacity-70" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onValueChange}
      />
    </div>
  );
};

export default ControlSlider;
