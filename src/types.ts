export interface FragmentShaderUniforms {
  [key: string]: any;
}

export type CreateFragmentShader = (options: object) => {
  shader: string;
  uniforms: FragmentShaderUniforms;
};