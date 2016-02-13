struct Material {
  float metalicity;
  float roughness;
  vec3 base_color;
  vec3 specular_color; // F0
};

#pragma glslify: export(Material)
