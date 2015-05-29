varying vec3 vNormal;
varying vec3 vP;
varying vec2 vUV;

uniform float F0;
uniform sampler2D normal_map;
uniform sampler2D roughness_map;
uniform sampler2D base_color_map;

void main() {
  gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
}
