import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ControlSectionProps {
  children: React.ReactNode;
  onReset?: () => void;
}

/**
 * Section wrapper for controls with optional reset button
 */
export const ControlSection: React.FC<ControlSectionProps> = ({
  children,
  onReset,
}) => {
  return (
    <div className="space-y-4">
      {onReset && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-foreground/90 bg-black/[0.07] hover:bg-black/[0.15] transition-colors rounded-sm"
            title="Reset to defaults"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default ControlSection;
