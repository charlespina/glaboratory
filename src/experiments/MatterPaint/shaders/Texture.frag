precision highp float;
precision highp int;

uniform sampler2D texture_map;

varying vec2 vUV;

void main() {
  gl_FragColor = vec4(texture2D(texture_map, vUV).rgb, 1.0);
}
