#ifndef PI
#define PI 3.1415926
#endif

vec3 envMapEquirectInverse(vec2 uv) {
  vec3 N;

  vec2 uvRange = uv;

  float theta = uvRange.x*2.0*PI;
  float phi = uvRange.y * PI;

  N.x = cos(theta) * sin(phi);
  N.z = sin(theta) * sin(phi);
  N.y = -cos(phi);
  return N;
}

#pragma glslify: export(envMapEquirectInverse)
