#define PI 3.1415926

vec2 envMapEquirect(vec3 R) {
  float phi = acos(-R.y);
  float theta = atan(-R.x, R.z) + PI;
  return vec2(theta / (PI * 2.0), phi / PI);
}

#pragma glslify: export(envMapEquirect)
