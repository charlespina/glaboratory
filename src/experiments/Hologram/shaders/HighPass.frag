uniform sampler2D texture;
uniform float threshold;

#pragma glslify: gamma = require(../../common/color/gamma)
#pragma glslify: degamma = require(../../common/color/degamma)

varying vec2 vUV;

void main() {
  vec4 color = texture2D(texture, vUV);
  vec3 linearColor = degamma(color.rgb);
  float luminance = dot(linearColor, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor = vec4(gamma(linearColor * step(threshold, luminance)), color.a);
}
