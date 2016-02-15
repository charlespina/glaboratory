#extension GL_EXT_shader_texture_lod : enable
precision highp float;
precision highp int;

uniform sampler2D texture_map;

varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;

void main() {
  float lod = vUV.y;
  gl_FragColor = vec4(texture2DLodEXT(texture_map, vUV, (1.0 - lod)*7.0).rgb, 1.0);
}
