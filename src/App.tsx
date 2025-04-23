import React from "react";
import './App.css';

import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

// Import custom hooks
import { useGradientState } from "./state/useGradientState";
import { useWebGLGradient } from "./webgl/useWebGLGradient";

// Import layout components
import CanvasContainer from "./components/layout/CanvasContainer";
import ControlsSheet from "./components/layout/ControlsSheet";

const App: React.FC = () => {
  // Use the gradient state hook to manage all parameters
  const {
    parameters,
    colorStops,
    parameterRefs,
    handlers,
    resetHandlers
  } = useGradientState();

  // Use the WebGL gradient hook for rendering
  // The hook now returns a tuple with canvas ref and randomize function
  const [canvasRef, randomize] = useWebGLGradient({
    ...parameterRefs,
    colorStops
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Canvas Container - Pass the ref directly */}
      <CanvasContainer canvasRef={canvasRef} />

      {/* Controls Sheet */}
      <Sheet>
        {/* Trigger Button - Positioned top-right */}
        <SheetTrigger asChild>
           <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10">
             <Settings className="h-5 w-5" />
           </Button>
        </SheetTrigger>

        {/* Sheet Content with Controls */}
        <ControlsSheet
          parameters={parameters}
          colorStops={colorStops}
          handlers={handlers}
          resetHandlers={resetHandlers}
          randomize={randomize}
        />
      </Sheet>
    </div>
  );
};

export default App;
