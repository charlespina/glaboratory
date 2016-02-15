#ifndef PI
#define PI 3.1415926
#endif

vec2 envMapEquirect(vec3 R) {
  float theta = atan(-R.x, R.z) + PI;
  theta /= 2.0 * PI;

  float phi = acos(-R.y);
  phi /= PI;
  return vec2(theta, phi);
}

#pragma glslify: export(envMapEquirect)
