#pragma glslify: blur = require('glsl-fast-gaussian-blur')

uniform sampler2D texture;
uniform vec2 resolution;
uniform float strength;

varying vec2 vUV;

void main() {
  vec4 color = blur(texture, vUV, resolution, vec2(0.0, strength));
  gl_FragColor = color;
}
