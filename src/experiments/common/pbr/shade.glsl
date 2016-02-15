#pragma glslify: safeDot = require(../math/safeDot)
#pragma glslify: Material = require(./Material)

#ifndef PI
#define PI 3.14159
#endif

// Unreal GGX implementation (Unreal SIGGRAPH 2013)
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf

// Schlick approximation
vec3 fresnelTerm(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0)-F0) * pow(2.0, (-5.55473*VdH-6.98316)*VdH);
}

float geometryTerm(float roughness, vec3 V, vec3 N, vec3 H) {
  // remapped roughness, to be used for the geometry term calculations,
  // per Disney [16], Unreal [3]. N.B. don't do this in IBL
  float roughness_remapped = 0.5 + roughness/2.0;

  float NdV = max(0.0, dot(N,V));

  float k = pow(roughness_remapped + 1.0, 2.0)/8.0;
  return NdV/((NdV)*(1.0-k)+k);
}

float distributionTerm(float NdH, float alpha2) {
  float D_denominator = ((NdH*NdH)*(alpha2-1.0)+1.0);
  return alpha2/(PI * D_denominator * D_denominator + 0.0000001);
}

vec3 shade(vec3 L, float lightRadius, vec3 V, vec3 N, Material material) {
  float alpha2 = material.roughness * material.roughness;
  alpha2 *= alpha2 + lightRadius;

  vec3 H = normalize(V+L);

  float VdH = safeDot(V, H);
  float NdH = safeDot(N, H);
  float NdL = safeDot(N, L);
  float NdV = safeDot(N, V);

  float D = distributionTerm(NdH, alpha2);
  float Gl = geometryTerm(material.roughness, L, N, H);
  float Gv = geometryTerm(material.roughness, V, N, H);
  vec3 F = fresnelTerm(VdH, material.F0);

  vec3 specular_contribution = F*(Gl*Gv*D/(4.0*NdL*NdV + 0.000001));

  // metals don't have a diffuse contribution, so turn off the diffuse color
  // when the material is metallic
  vec3 diffuse_color = material.base_color * (1.0 - material.metalicity) / PI;

  // use reflectance to calculate energy conservation
  // diffuse_color *= vec3(1.0, 1.0, 1.0) - F0;

  return (specular_contribution + diffuse_color) * NdL;
}

vec3 shade(vec3 L, vec3 V, vec3 N, Material material) {
  return shade(L, 0.0, V, N, material);
}

#pragma glslify: export(shade)
