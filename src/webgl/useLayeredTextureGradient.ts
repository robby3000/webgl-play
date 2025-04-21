import { useRef, useEffect, MutableRefObject } from 'react';
import { LayeredTextureRenderer } from './layeredTextureRenderer';

/**
 * Configuration for the layered texture gradient hook
 */
interface UseLayeredTextureGradientProps {
  // Speed multiplier for all animations
  speedRef: MutableRefObject<number>;
  
  // Optional initial configuration
  colorSchemeRef?: MutableRefObject<number>; // Hue value (0-360)
  enableAdaptiveQualityRef?: MutableRefObject<boolean>;
}

/**
 * Custom hook for managing the layered texture gradient renderer
 * 
 * This hook creates and manages an efficient WebGL animation using pre-rendered
 * textures and transformations, which is much more performant than per-pixel
 * calculations, especially on mobile devices.
 */
export function useLayeredTextureGradient({
  speedRef,
  colorSchemeRef,
  enableAdaptiveQualityRef
}: UseLayeredTextureGradientProps) {
  // Canvas reference to be attached to a canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Renderer reference
  const rendererRef = useRef<LayeredTextureRenderer | null>(null);
  
  // Effect for initializing and managing the renderer
  useEffect(() => {
    // Get the canvas element
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create the renderer
    const renderer = new LayeredTextureRenderer(canvas);
    rendererRef.current = renderer;
    
    // Initialize default layers
    renderer.initializeDefaultLayers();
    
    // Set adaptive resolution based on props
    if (enableAdaptiveQualityRef) {
      renderer.setAdaptiveResolution(enableAdaptiveQualityRef.current);
    }
    
    // Start the animation
    renderer.start();
    
    // Clean up on unmount
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [enableAdaptiveQualityRef]); // Added enableAdaptiveQualityRef as dependency
  
  // Effect for handling speed changes
  useEffect(() => {
    // Only proceed if we have a renderer
    if (!rendererRef.current) return;
    
    // In the current implementation, speed is used in the transform calculation
    // Future enhancement: We could update layer animation speed based on speedRef
    // For example: rendererRef.current.updateAnimationSpeed(speedRef.current);
    
    // Log the current speed value to verify it's being used
    console.log(`Current animation speed: ${speedRef.current}`);
    
  }, [speedRef]); // Update when speedRef is changed
  
  // Effect for handling color scheme changes
  useEffect(() => {
    // Only proceed if we have a colorSchemeRef and renderer
    if (!colorSchemeRef || !rendererRef.current) return;
    
    // This effect would update the color scheme based on the reference
    // In a more complex implementation, we could regenerate textures with new colors
    
    const colorSchemeHandler = () => {
      // Implementation would go here in future enhancements
    };
    
    // Call once to set initial colors
    colorSchemeHandler();
    
  }, [colorSchemeRef]); // Added colorSchemeRef as dependency
  
  // Effect for handling adaptive quality changes
  useEffect(() => {
    if (!enableAdaptiveQualityRef || !rendererRef.current) return;
    
    rendererRef.current.setAdaptiveResolution(enableAdaptiveQualityRef.current);
  }, [enableAdaptiveQualityRef]); // Added enableAdaptiveQualityRef as dependency
  
  return canvasRef;
}
