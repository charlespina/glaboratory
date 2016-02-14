struct Material {
  float metalicity;
  float roughness;
  vec3 base_color;
  vec3 F0; // specular color if metal, else specular_level [0.2, 0.8]
};

#pragma glslify: export(Material)
