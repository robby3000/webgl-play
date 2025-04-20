# Coders Dev Guide: webgl-play

## 1. Overview

`webgl-play` is a web application designed to provide a user interface for controlling and experimenting with complex, animated gradients rendered in a WebGL canvas. Users can manipulate various parameters like colors, animation speed, noise effects, and blur in real-time. The goal is to create a powerful yet intuitive tool for designers and developers, potentially including features to export generated gradients or code snippets.

## 2. Technology Stack

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with PostCSS)
*   **UI Components:** shadcn/ui (inferred from `components/ui` structure and `components.json`)
*   **WebGL:** Custom WebGL implementation (no high-level library like Three.js or Babylon.js detected)
*   **State Management:** Custom hook-based approach (`src/state/useGradientState.ts`), possibly using Zustand or a similar lightweight library internally.
*   **Linting:** ESLint
*   **Potential Deployment:** Firebase (indicated by `firebase.json`)

## 3. File Structure

```
.
├── public/               # Static assets served directly
│   └── vite.svg
├── src/                  # Main application source code
│   ├── assets/           # Static assets imported into the app
│   │   └── react.svg
│   ├── components/       # React UI components
│   │   ├── controls/     # Specific input controls (sliders, color pickers)
│   │   ├── layout/       # Components defining page structure (Canvas, Controls Sheet)
│   │   ├── panels/       # UI Panels grouping controls by feature (Gradient, Noise, etc.)
│   │   └── ui/           # Generic, reusable UI components (shadcn/ui)
│   ├── lib/              # Utility functions (likely shadcn/ui related)
│   │   └── utils.ts
│   ├── state/            # Global state management
│   │   ├── gradientState.ts # State definition/store
│   │   └── useGradientState.ts # Hook to access and modify state
│   ├── utils/            # Core utility functions (noise generation)
│   │   ├── noiseUtils.ts
│   │   └── simplexNoise.ts
│   ├── webgl/            # WebGL rendering logic
│   │   ├── shaders/      # GLSL shader code (as TS template literals)
│   │   ├── types.ts      # TypeScript types for WebGL parts
│   │   └── useWebGLGradient.ts # Core hook managing WebGL context and rendering
│   ├── App.css           # App-specific CSS (minimal)
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global styles & Tailwind directives
│   ├── main.tsx          # Application entry point (renders App)
│   ├── types.ts          # Global TypeScript types
│   └── vite-env.d.ts     # Vite TypeScript environment types
├── .eslintrc.cjs         # ESLint configuration
├── index.html            # Main HTML file (Vite entry point)
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript compiler options
├── vite.config.ts        # Vite configuration
└── ...                   # Other config files (firebase.json, postcss.config.cjs, etc.)
```

## 4. Key Files and Components

### 4.1. Core Application Logic

*   **`src/main.tsx`:** The entry point of the application. Initializes React and renders the main `App` component into the `index.html`'s root element.
*   **`src/App.tsx`:** The root component.
    *   Sets up the main layout, including `CanvasContainer` and `ControlsSheet`.
    *   Likely initializes the `useGradientState` hook to manage application state.
    *   Likely initializes the `useWebGLGradient` hook, passing the canvas reference and state values.
*   **`src/state/useGradientState.ts` & `src/state/gradientState.ts`:**
    *   Manages the global state for all gradient parameters (colors, speed, noise settings, blur, etc.).
    *   Provides a reactive state object that components can subscribe to.
    *   Exposes functions to update the state, which are typically called by the control components.
*   **`index.html`:** The HTML template used by Vite. Contains the root div where the React app is mounted and potentially includes script tags.

### 4.2. WebGL Rendering

*   **`src/webgl/useWebGLGradient.ts`:** This is the central hook for the WebGL rendering.
    *   Takes a `RefObject<HTMLCanvasElement>` as input.
    *   Initializes the WebGL rendering context.
    *   Compiles vertex and fragment shaders (`src/webgl/shaders/*`).
    *   Sets up vertex buffers (likely a simple quad covering the screen).
    *   Manages WebGL textures (e.g., for gradient color lookups, noise patterns).
    *   Runs the main animation loop using `requestAnimationFrame`.
    *   Updates shader uniforms (`u_time`, `u_resolution`, gradient parameters, noise settings, etc.) on each frame based on the application state provided by `useGradientState`.
    *   Handles canvas resizing.
*   **`src/webgl/shaders/vertexShader.ts`:** GLSL code defining how vertices are processed. For a full-screen effect, this is often very simple, passing through coordinates.
*   **`src/webgl/shaders/fragmentShader.ts`:** GLSL code defining the color of each pixel. This is where the core gradient, noise, blur, and animation logic resides, calculated based on screen coordinates (`v_uv`), time (`u_time`), resolution (`u_resolution`), and other uniforms passed in from `useWebGLGradient.ts`.
*   **`src/webgl/shaders/noiseShader.ts`, `src/webgl/shaders/blurShader.ts` (etc.):** May contain reusable GLSL functions imported into the main fragment shader or represent separate shader programs for multi-pass effects.

### 4.3. UI Components

*   **`src/components/layout/CanvasContainer.tsx`:**
    *   A simple wrapper component that holds the `<canvas>` element used for WebGL rendering.
    *   Ensures the canvas is correctly sized and positioned (e.g., full screen).
    *   Provides the `ref` to the `<canvas>` element, which is passed to the `useWebGLGradient` hook.
*   **`src/components/layout/ControlsSheet.tsx`:**
    *   A container (likely using `shadcn/ui`'s `Sheet` component) that holds the various control panels.
    *   Provides the main interface for users to interact with parameters.
*   **`src/components/panels/*.tsx` (e.g., `GradientPanel.tsx`, `NoisePanel.tsx`):**
    *   Each panel groups related controls for a specific feature set.
    *   They access the current state via `useGradientState`.
    *   They render specific control components (`ControlSlider`, etc.) and pass them state values and update functions from `useGradientState`.
*   **`src/components/controls/*.tsx` (e.g., `ControlSlider.tsx`):**
    *   Reusable input components tailored for modifying gradient parameters.
    *   They receive the current value and an update function as props.
    *   When the user interacts (e.g., moves a slider), they call the update function provided by `useGradientState` to change the application state.
*   **`src/components/ui/*.tsx`:**
    *   Generic UI building blocks provided by the `shadcn/ui` library (buttons, sliders, labels, etc.). These are used by the `controls` and `panels` components.

## 5. Development Workflow

1.  **State:** To add a new controllable parameter, first update the state definition in `src/state/gradientState.ts` and the `useGradientState.ts` hook.
2.  **WebGL:** Update the shaders (`src/webgl/shaders/*`) to use the new parameter (passed as a uniform). Modify `src/webgl/useWebGLGradient.ts` to pass the new state value as a uniform to the shader program.
3.  **UI:** Add a new control component (or reuse an existing one like `ControlSlider`) to the appropriate panel in `src/components/panels/`. Connect this control to read the new state value and call the corresponding update function from `useGradientState`.

This structure aims for separation of concerns: state management, WebGL rendering logic, and UI components are kept distinct, making the codebase easier to understand and maintain.
