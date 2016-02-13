/ Disney's Fresnel doesn't use an approximation, but it is quite a bit higher
// intensity than Unity's Schlick approximation
// https://disney-animation.s3.amazonaws.com/library/s2012_pbs_disney_brdf_notes_v2.pdf
vec3 FresnelTerm_Disney(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0) - F0) * pow(5.0, 1.0 - VdH);
}

float GeometryTerm(float roughness, vec3 V, vec3 N, vec3 H) {
  // remapped roughness, to be used for the geometry term calculations,
  // per Disney [16], Unreal [3]. N.B. don't do this in IBL
  float roughness_remapped = 0.5 + roughness/2.0;

  float NdV = max(0.0, dot(N,V));

  float k = pow(roughness_remapped + 1.0, 2.0)/8.0;
  return NdV/((NdV)*(1.0-k)+k);
}

float DistributionTerm(float NdH, float alpha2) {
  float D_denominator = PI * ((NdH*NdH)*(alpha2-1.0)+1.0);
  return alpha2/(D_denominator * D_denominator);
}

// Alternate GGX implementation
// http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx
float Chi(float x)
{
  return x > 0.0 ? 1.0 : 0.0;
}

float GeometryTerm_Alternate(float Roughness, vec3 V, vec3 N, vec3 H)
{
  float alpha = Roughness * Roughness;
  float VdH = max(0.0, (dot(V, H)));
  float VdH2 = VdH*VdH;
  float x = Chi(VdH/max(0.00001, (dot(V,N))));
  float tan2 = (1.0-VdH2)/VdH2;
  return (x*2.0)/(1.0+sqrt(1.0+alpha*alpha*tan2));
}

float DistributionTerm_Alternate(float NdH, float alpha2)
{
	float NdH2 = NdH*NdH;
	float D_denominator = (NdH2*alpha2)+(1.0-NdH2);
	return (Chi(NdH)*alpha2)/(3.141592653*D_denominator*D_denominator);
}

vec3 FresnelTerm_Schlick(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0)-F0) * pow(1.0-VdH, 5.0);
}
