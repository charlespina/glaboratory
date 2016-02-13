vec3 degamma(vec3 color) {
  return pow(color, vec3(2.2, 2.2, 2.2));
}

#pragma glslify: export(degamma)
