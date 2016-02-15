#extension GL_EXT_shader_texture_lod : enable
precision highp float;
precision highp int;

uniform sampler2D texture_map;
uniform float texture_lod;
uniform float texture_offset;
uniform float texture_scale;
uniform float texture_exposure;
varying vec2 vUV;

#pragma glslify: rgbdToRgb = require('./color/rgbdToRgb')
#pragma glslify: tonemap = require('./color/tonemap-uncharted')
#pragma glslify: gamma = require('./color/gamma')
#pragma glslify: degamma = require('./color/degamma')

void main() {
  vec2 uv = vec2(vUV.x + texture_offset, vUV.y);
  uv = (uv-vec2(0.5))/texture_scale + vec2(0.5);

  vec4 colorRaw = texture2DLodEXT(texture_map, uv, texture_lod);
  vec3 color = tonemap(texture_exposure * (rgbdToRgb(colorRaw)));

  gl_FragColor = vec4(gamma(color), 1.0);
}
