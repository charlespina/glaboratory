uniform sampler2D uParticleData;
varying vec2 vUV;
// uniform sampler2D uParticleSprite;

void main() {
  vec4 data = texture2D(uParticleData, vUV);

  // debug
  vec3 debug = vec3(vUV, 0.0);
  gl_FragColor = vec4(vUV.x/0.5, 0.0, vUV.y/0.5, 0.3);

  // final:
  // gl_FragColor = vec4(data.rgb, 1.0);
}
