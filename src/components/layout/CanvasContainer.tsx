import React, { RefObject } from "react";

interface CanvasContainerProps {
  // Allow the ref to potentially be null initially
  canvasRef: RefObject<HTMLCanvasElement | null>; 
}

/**
 * Container for the WebGL canvas that ensures proper sizing
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({ canvasRef }) => {
  const dpr = window.devicePixelRatio || 1;
  return (
    <div className="absolute inset-0 min-w-0">
      <canvas
        // The ref can be null initially, React handles this
        ref={canvasRef} 
        className="w-full h-full block"
        // Set initial size; ResizeObserver in the hook will adjust later
        width={Math.floor(window.innerWidth * dpr)}
        height={Math.floor(window.innerHeight * dpr)} 
      />
    </div>
  );
};

export default CanvasContainer;
