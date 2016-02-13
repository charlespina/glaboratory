vec3 gamma(vec3 color) {
  return pow(color, vec3(0.4545, 0.4545, 0.4545));
}

#pragma glslify: export(gamma)
