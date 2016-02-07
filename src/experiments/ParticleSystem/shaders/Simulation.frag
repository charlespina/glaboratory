uniform sampler2D uParticleData; // xy = position.xy, zw = velocity.xy

varying vec2 vUV;

uniform float uAttractionForce;
uniform vec3 uAttractor;

void main() {
  vec4 data = texture2D(uParticleData, vUV);

  // debug:
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

  const float t = 0.01;

  // distance from attractor
  vec2 p0 = data.xy;
  vec2 tmp = p0 - uAttractor.xy;
  tmp *= tmp;
  float dist2 = tmp.x + tmp.y;

  vec2 a = vec2(0.0);
  // vec2 v0 = data.zw;
  vec2 v0 = p0;
  vec2 v = v0 + a * t;
  vec2 p = p0 + v * t;

  gl_FragColor = vec4(p, v);
}
