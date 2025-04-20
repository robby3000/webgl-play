# Product Development Plan: Interactive WebGL Gradient Controls

This plan combines the original parameter control ideas with enhancements for usability, accessibility, and extensibility. It includes a development roadmap for staged implementation.

---

## 1. Core Animation & Appearance

- **Overall Speed:** Slider to control the master speed of all animations (`u_time` multiplier).
- **Gradient Colors:** Color pickers or presets to change the gradient lookup.
  - Option A: 3-5 key colors with color pickers, regenerating the `u_gradient` texture in JS.
  - Option B: Presets to load different pre-generated gradient textures.

## 2. Wave Controls (Separate for Wave 1 & Wave 2)

- **Wave Y Position:** Slider for vertical position (`WAVE1_Y`, `WAVE2_Y`).
- **Wave Amplitude:** Slider for height/intensity (`WAVE1_HEIGHT`, `WAVE2_HEIGHT`).
- **Wave Shape Scale:** Slider for horizontal scale/frequency of noise (`L` in `wave_y_noise`).
- **Wave Shape Speed:** Slider for how fast the wave shape changes (`S` in `wave_y_noise`).
- **Wave Flow Speed:** Slider for horizontal drift speed (`F` in `wave_y_noise`).

## 3. Background Noise Controls

- **Noise Pattern Scale:** Sliders for size/zoom of noise layers (`L1`, `L2`, `L3` in `background_noise`).
- **Noise Vertical Stretch:** Slider for vertical stretching (`Y_SCALE`).
- **Noise Swirl Speed:** Sliders for time evolution speed of each noise layer (`S`).
- **Noise Flow Speed:** Sliders for horizontal drift speed for each noise layer (`F`).

## 4. Blur Controls

- **Blur Amount:** Slider for max blur radius (`blurAmount`).
- **Blur Sharpness/Bias:** Sliders for `blurExponentRange` to adjust blur sharpness/transition.
- **Dynamic Blur Pattern:** Sliders for scale (`L`) and speed (`S`, `F`) of noise in `calc_blur`.
- **Blur Pulsing Speed:** Slider for speed of blur bias oscillation (`S` in `calc_blur_bias`).

## 5. Randomization

- **Randomize Seeds/Offsets:** Button to randomize offsets in noise functions.
- **Randomize Parameters:** Button to randomize multiple parameters for new effects.

-
## 6. Enhanced Usability & UX

- **Grouping & Collapsibility:** Group related controls (e.g., Waves, Noise, Blur) and allow collapsing/expanding.
- **Presets System:** Allow saving/loading favorite parameter sets.
- **Live Preview & Reset:** Show live numeric values next to sliders and provide reset buttons for groups/all.
- **Performance Monitoring:** Add an FPS counter and/or a 'Performance Mode' toggle.
- **Accessibility:** Ensure controls are keyboard-accessible and have ARIA labels.
- **Mobile Responsiveness:** Ensure the control panel works well on mobile devices.
- **Undo/Redo:** Allow users to step back/forward through parameter changes.
- **Documentation/Tooltips:** Add tooltips or inline help for each control.
- **Animation Lock:** Prevent parameter changes during randomization if needed.
- **Shader Hot Reload:** Enable GLSL code hot-reload for rapid shader dev.
- **Export Button:** Allow users to export a standalone HTML file of the current gradient pattern, including all necessary shader code and parameters, so the result can be viewed independently without the app.

---

## Implementation Approach

1. **Modify `src/play.ts`:**
    - Introduce new `uniform` variables for each parameter to control. Replace hardcoded constants in GLSL with these uniforms.
2. **Update `src/App.tsx`:**
    - Use `React.useState` (or `useReducer` for many controls) for control state.
    - Add UI elements (sliders, color pickers, buttons) in `#control-section`.
    - Connect handlers to update React state.
    - In `useEffect`, get uniform locations with `gl.getUniformLocation`.
    - In the render loop, update uniforms with `gl.uniform*` using current state.
    - For gradient changes, update the `u_gradient` texture with `gl.texImage2D` as needed.
    - Consider a utility for batch uniform updates.

---

## Development Roadmap

**Phase 1: Core Controls & Functionality**
- Add sliders for overall speed, wave positions, amplitudes, and colors.
- Implement React state and uniform updates.
- Basic randomization buttons.

**Phase 2: Advanced Controls & UI/UX**
- Add controls for noise and blur parameters.
- Implement grouping, collapsibility, and tooltips.
- Add live value display and reset buttons.

**Phase 3: Presets, Accessibility & Performance**
- Preset save/load system.
- Keyboard and ARIA accessibility.
- FPS counter and performance mode.
- Mobile responsiveness.

**Phase 4: Power Features**
- Undo/redo for parameter changes.
- Animation lock during randomization.
- Shader hot-reload for development.
- Export Button functionality.

---

## Export Button Implementation

### Architecture

1. **UI Component**
   - Add an "Export" button to the main control panel
   - Include a tooltip explaining the feature
   - Implement loading state during export generation

2. **State Serialization**
   - Create utility functions to serialize all gradient parameters:
     ```typescript
     // src/utils/exportUtils.ts
     export function serializeGradientState(state: GradientState): string {
       return JSON.stringify({
         colors: state.colorStops,
         animation: state.animationParams,
         noise: state.noiseParams,
         blur: state.blurParams
       });
     }
     ```

3. **HTML Template Generation**
   - Create a template function that embeds all necessary code:
     ```typescript
     // src/utils/exportUtils.ts
     export function generateStandaloneHTML(
       params: SerializedParams, 
       shaderSource: string
     ): string {
       return `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="UTF-8">
           <title>WebGL Gradient Animation</title>
           <style>
             body { margin: 0; overflow: hidden; }
             canvas { display: block; width: 100vw; height: 100vh; }
           </style>
         </head>
         <body>
           <canvas id="gradient-canvas"></canvas>
           <script>
             // Embedded renderer code
             ${generateMinimalRenderer()}
             
             // Parameters
             const params = ${params};
             
             // Shader source
             const shaderSource = \`${shaderSource}\`;
             
             // Initialize
             document.addEventListener('DOMContentLoaded', () => {
               initGradient('gradient-canvas', params, shaderSource);
             });
           </script>
         </body>
         </html>
       `;
     }
     ```

4. **Minimal WebGL Renderer**
   - Extract a simplified version of the gradient renderer:
     ```typescript
     // src/utils/exportUtils.ts
     function generateMinimalRenderer(): string {
       return `
         function initGradient(canvasId, params, shaderSource) {
           const canvas = document.getElementById(canvasId);
           const gl = canvas.getContext('webgl');
           
           // WebGL initialization code
           // Shader compilation
           // Buffer setup
           // Animation loop
           // ... (simplified version of current renderer)
         }
       `;
     }
     ```

5. **Download Mechanism**
   - Implement the file creation and download trigger:
     ```typescript
     // src/utils/exportUtils.ts
     export function downloadHTML(htmlContent: string, filename: string): void {
       const blob = new Blob([htmlContent], { type: 'text/html' });
       const url = URL.createObjectURL(blob);
       
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       
       // Cleanup
       setTimeout(() => {
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
       }, 100);
     }
     ```

6. **Integration with Main App**
   - Connect the export functionality to the UI:
     ```typescript
     // src/components/layout/ControlsSheet.tsx
     import { 
       serializeGradientState, 
       generateStandaloneHTML, 
       downloadHTML 
     } from '../../utils/exportUtils';
     
     // In the component
     const handleExport = useCallback(() => {
       setExporting(true);
       
       try {
         const serializedState = serializeGradientState(gradientState);
         const shaderSource = getShaderSource(); // Get from WebGL context
         const html = generateStandaloneHTML(serializedState, shaderSource);
         
         downloadHTML(html, 'gradient-animation.html');
       } catch (error) {
         console.error('Export failed:', error);
         // Show error notification
       } finally {
         setExporting(false);
       }
     }, [gradientState]);
     ```

### Testing Considerations

1. Test export across different browsers (Chrome, Firefox, Safari)
2. Verify the exported file works without internet connection
3. Check performance of the standalone file vs. the app
4. Validate that all parameters are correctly transferred

### Future Enhancements

1. Add option to export as GIF/MP4 (using WebCodecs API)
2. Include customizable dimensions for export
3. Provide option to include controls in the exported file
4. Support exporting only a specific duration of the animation

---

## Advanced WebGL Effects

### Visual Effects

1. **Distortion Effects**
   - Wave distortion with amplitude/frequency controls
   - Ripple effect with center point, radius, and decay
   - Sine-based displacement mapping

2. **Particle Systems**
   - GPU-accelerated particle simulations
   - Parameters for particle count, size, speed, and lifespan
   - Interaction between particles and gradient colors

3. **Lighting Effects**
   - Dynamic light sources with position and color controls
   - Specular highlights on gradient surfaces
   - Ambient occlusion simulation for depth

4. **Advanced Color Transformations**
   - Chromatic aberration with RGB channel splitting
   - Hue rotation over time or space
   - Color grading with customizable LUT (lookup tables)

### Interactive Elements

1. **Mouse/Touch Interaction**
   - Interactive ripple effects on click/touch
   - Cursor-following effects with trail options
   - Force field simulation that responds to movement

2. **Audio Reactivity**
   - Microphone input to drive animation parameters
   - Frequency analysis visualization
   - Beat detection for synchronized animations

### Technical Enhancements

1. **Post-Processing Pipeline**
   - Bloom/glow with intensity and threshold parameters
   - Depth of field simulation
   - Film grain and vignette effects

2. **Geometry Modifications**
   - 3D perspective transformations
   - Mesh deformation based on noise
   - Vertex displacement mapping

3. **Shader Programming UI**
   - Custom shader function editor
   - Live GLSL editing for advanced users
   - Shader graph system for visual programming

4. **Physical Simulations**
   - Fluid simulation for flowing gradients
   - Smoke and fire effects
   - Cloth simulation with gradient textures

Implementation of these effects would follow a modular approach, with each effect having its own parameter panel in the existing UI structure. This maintains the transparent aesthetic while adding significant creative possibilities.

This plan ensures the gradient playground will be powerful, user-friendly, and maintainable. Prioritize Phase 1 for immediate interactivity, then iterate through later phases for a polished, professional tool.
