// http://filmicgames.com/archives/75
// Original credit to Jim Hejl and Richard Burgess-Dawson

vec3 tonemap(vec3 rgb, float exposure) {
  vec3 x = max(vec3(0.0),rgb-vec3(0.004));
  return (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06) * exposure / 2.2;
}

#pragma glslify: export(tonemap)
