import React, { RefObject } from "react";

interface CanvasContainerProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

/**
 * Container for the WebGL canvas that ensures proper sizing
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({ canvasRef }) => {
  return (
    <div className="absolute inset-0 min-w-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default CanvasContainer;
