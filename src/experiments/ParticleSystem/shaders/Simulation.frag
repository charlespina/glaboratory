uniform sampler2D uParticleData; // xy = position.xy, zw = velocity.xy

varying vec2 vUV;

uniform float uAttractionForce;
uniform vec3 uAttractor;

const float SCALE_FLOAT = 16.0;

void decodeData(vec4 data, out vec2 p, out vec2 v) {
  p = data.xy * SCALE_FLOAT;
  v = data.zw * SCALE_FLOAT;
}

vec4 encodeData(vec2 p, vec2 v) {
  return vec4(p, v) / SCALE_FLOAT;
}

void main() {
  vec4 data = texture2D(uParticleData, vUV);

  // debug:
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

  const float t = 0.01;

  vec2 p0, v0;
  decodeData(data, p0, v0);

  // acceleration due to attractor
  vec2 attractorP = uAttractor.xy * SCALE_FLOAT;
  float dist2 = distance(attractorP, p0);
  dist2 *= dist2;
  vec2 towardAttractor = normalize(p0-attractorP);
  vec2 a = vec2(uAttractionForce)/(dist2 + 0.01) * towardAttractor * SCALE_FLOAT;

  // integrate
  vec2 v = v0 + a * t;
  vec2 p = p0 + v * t;

  gl_FragColor = encodeData(p, v);
}
