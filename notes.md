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

This plan ensures the gradient playground will be powerful, user-friendly, and maintainable. Prioritize Phase 1 for immediate interactivity, then iterate through later phases for a polished, professional tool.
