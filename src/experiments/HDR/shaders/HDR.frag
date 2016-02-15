uniform sampler2D envMap;
uniform float exposure;
varying vec2 vUV;
varying vec3 vN;

#pragma glslify: degamma = require(../../common/color/degamma)
#pragma glslify: gamma = require(../../common/color/gamma)
#pragma glslify: envMapLookup = require(../../common/ibl/envMapEquirect)
#pragma glslify: rgbdToRgb = require(../../common/color/rgbdToRgb)

void main() {
  vec3 N = normalize(vN);
  vec3 envMapColor = rgbdToRgb(texture2D(envMap, envMapLookup(-N)));
  vec3 finalColor = exposure * envMapColor.rgb;
  gl_FragColor = vec4(gamma(finalColor), 1.0);
}
