import React, { RefObject } from "react";

interface CanvasContainerProps {
  // Allow the ref to potentially be null initially
  canvasRef: RefObject<HTMLCanvasElement | null>; 
}

/**
 * Container for the WebGL canvas that ensures proper sizing
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({ canvasRef }) => {
  return (
    <div className="absolute inset-0 min-w-0">
      <canvas
        // The ref can be null initially, React handles this
        ref={canvasRef} 
        className="w-full h-full block"
        // Set initial size; ResizeObserver in the hook will adjust later
        width={window.innerWidth}
        height={window.innerHeight} 
      />
    </div>
  );
};

export default CanvasContainer;
