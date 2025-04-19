/**
 * Simple vertex shader for rendering a fullscreen quad
 */
export const vertexShaderSource = `
  attribute vec4 a_position;
  
  void main() {
    gl_Position = a_position;
  }
`;
