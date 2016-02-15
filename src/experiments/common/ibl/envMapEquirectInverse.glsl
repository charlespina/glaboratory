#ifndef PI
#define PI 3.1415926
#endif

vec3 envMapEquirectInverse(vec2 uv) {
  vec3 N;

  vec2 uvRange = uv;

  float theta = uvRange.x*2.0*PI - PI;
  N.x = -sin(theta);
  N.z = cos(theta);

  float phi = uvRange.y * PI;
  N.y = -cos(phi)*0.59;
  return N;
}

#pragma glslify: export(envMapEquirectInverse)
