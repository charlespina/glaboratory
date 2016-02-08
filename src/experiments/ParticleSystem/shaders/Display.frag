#extension GL_OES_standard_derivatives : enable

uniform sampler2D uParticleData;
uniform sampler2D uBrush;

varying vec2 vUV;
// uniform sampler2D uParticleSprite;




void main() {
  vec4 data = texture2D(uParticleData, vUV);

  // debug
  float brush = texture2D(uBrush, vUV).x;

  // brush gradient

  gl_FragColor = vec4(brush, 0.0, 1.0, 0.3);

  // final:
  // gl_FragColor = vec4(data.rgb, 1.0);
}
