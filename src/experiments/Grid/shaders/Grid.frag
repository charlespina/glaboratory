#extension GL_OES_standard_derivatives : enable

varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying vec3 vPscreen;
varying mat3 vTBN;

uniform float resolution;

#define PI 3.14159
#define NORMALIZE_UV 1
#define NORMALIZE_Z 0

float gridline(float period, float width) {
  float contour_threshold = width * period * period;
  float t = 2.0 * (period);
  vec2 singrid = cos(vUV*PI*t);
  float v = max(singrid.x, singrid.y);
  float grid = smoothstep(1.0 - contour_threshold, 1.0, v);
  return grid;
}

void main() {
  float line_width = 1.0/resolution;
  const float line_intensity = 1.0;
  const float line_intensity_mid = 0.28;
  const float line_intensity_low = 0.065;
  const float zmin = 400.0;
  const float zmax = 600.0;

  float normalized_width = 400.0 * line_width;

#if NORMALIZE_UV
  // compensate for anisotropic distortion
  float dUVx = fwidth(vUV.x);
  float dUVy = fwidth(vUV.y);
  normalized_width *= 0.001 * exp(max(dUVx, dUVy));
#else
  normalized_width *= 0.001;
#endif

#if NORMALIZE_Z
  // compensate for perspective scaling, to keep line width as object is further from camera
  // normalized_width /= 400.0 * gl_FragCoord.w;
  normalized_width *= 0.004 * gl_FragCoord.z / gl_FragCoord.w;
  // normalized_width *= 1.0 * (1.0 - gl_FragCoord.y)/gl_FragCoord.w;
#endif

  float one_unit = line_intensity_low * gridline(20.0, normalized_width);
  float five_unit = line_intensity_mid * gridline(10.0, normalized_width);
  float ten_unit = line_intensity * gridline(2.0, normalized_width);
  float combined = max(one_unit, max(five_unit, ten_unit));

  // float zfade = smoothstep(zmax, zmin, -vP.z);
  float zfade = 1.0;

  gl_FragColor = vec4(vec3(zfade * combined), 1.0);
  // gl_FragColor = vec4(vec3(vPscreen.z/400.0), 1.0);
}
