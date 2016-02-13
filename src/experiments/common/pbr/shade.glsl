
#define PI 3.14159

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
  return alpha2/(PI * D_denominator * D_denominator + 0.0001);
}

vec3 shade(vec3 L, vec3 V, vec3 N, float roughness, float metalicity, vec3 F0, vec3 base_color) {
  float alpha2 = roughness * roughness;
  alpha2 *= alpha2;

  vec3 H = normalize(V+L);

  float VdH = max(dot(V, H), 0.0);
  float NdH = max(dot(N, H), 0.0);
  float NdL = max(dot(N, L), 0.0);
  float NdV = max(dot(N, V), 0.0);

  float D = distributionTerm(NdH, alpha2);
  float Gl = geometryTerm(roughness, L, N, H);
  float Gv = geometryTerm(roughness, V, N, H);
  vec3 F = fresnelTerm(VdH, F0);

  vec3 specular_contribution = F*(Gl*Gv*D/(4.0*NdL*NdV + 0.001));

  // metals don't have a diffuse contribution, so turn off the diffuse color
  // when the material is metallic
  vec3 diffuse_color = base_color * (1.0 - metalicity);

  // use reflectance to calculate energy conservation
  // diffuse_color *= vec3(1.0, 1.0, 1.0) - F0;

  return (specular_contribution + diffuse_color) * NdL;
}

#pragma glslify: export(shade)
