#extension GL_OES_standard_derivatives : enable

uniform sampler2D uParticleData; // xy = position.xy, zw = velocity.xy
uniform sampler2D uForceDistanceField;

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

vec3 sample(float step, float x, float y, sampler2D dataTexture) {
  float step_u = step * (x-1.0);
  float step_v = step * (y-1.0);
  return texture2D(dataTexture, vUV+vec2(step_u, step_v)).rgb;
}

vec3 laplacian(sampler2D dataTexture, float resolution) {
  float CONVOLUTION_WEIGHTS[9];
  CONVOLUTION_WEIGHTS[0] = 0.05; CONVOLUTION_WEIGHTS[1] = 0.2; CONVOLUTION_WEIGHTS[2] = 0.05;
  CONVOLUTION_WEIGHTS[3] = 0.2; CONVOLUTION_WEIGHTS[4] = -1.0; CONVOLUTION_WEIGHTS[5] = 0.2;
  CONVOLUTION_WEIGHTS[6] = 0.05; CONVOLUTION_WEIGHTS[7] = 0.2; CONVOLUTION_WEIGHTS[8] = 0.05;

  float uv_step = 1.0/float(resolution);
  vec3 total = vec3(0.0);
  for(float i=0.0; i<3.0; i+=1.0) {
    for(float j=0.0; j<3.0; j+=1.0) {
      total += sample(uv_step, i, j, dataTexture) * CONVOLUTION_WEIGHTS[int(i+j*3.0)];
    }
  }
  return total;
}

vec2 gradient2d(sampler2D data) {
  float val = texture2D(data, vUV).x;
  float dx = dFdx(val);
  float dy = dFdy(val);
  return vec2(dx, dy);
}

vec2 getForce() {
  /*
  float magn = uAttractionForce / (distFieldValue * distFieldValue + 0.001);
  magn = clamp(magn, 0.0, 1.0);

  vec2 towardF = vec2(dFdx(distFieldValue), dFdy(distFieldValue));
  return magn * towardF;
  */

  return gradient2d(uForceDistanceField);
}

void main() {
  vec4 data = texture2D(uParticleData, vUV);

  // debug:
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

  const float t = 0.04;

  vec2 p0, v0;
  decodeData(data, p0, v0);

  // acceleration due to attractor
  vec2 F = getForce() * SCALE_FLOAT;
  vec2 a = F;

  // integrate
  vec2 v = v0 + a * t;
  vec2 p = p0 + v * t;

  gl_FragColor = encodeData(p, v);
}
