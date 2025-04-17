// Define the structure for shader uniforms if needed elsewhere
// export interface FragmentShaderUniforms {
//   [key: string]: any; // Placeholder, adjust as needed
// }

// Update the function type signature
export type CreateFragmentShader = () => string;
// export type CreateFragmentShader = (options?: Partial<FragmentShaderUniforms>) => {
//   shader: string;
//   uniforms: FragmentShaderUniforms;
// };