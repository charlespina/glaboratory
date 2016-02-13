float safeDot(vec3 u, vec3 v) {
  return max(dot(u,v), 0.0);
}

#pragma glslify: export(safeDot)
