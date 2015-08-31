uniform vec3 base_color_constant;
uniform sampler2D base_color_map;

uniform int use_textures;
uniform float roughness_constant;
uniform float roughness_boost;
uniform float roughness_gain;
uniform sampler2D roughness_map;

uniform sampler2D normal_map;

uniform float light_intensity;
uniform vec3 light_color;
uniform vec3 light_direction;

uniform float metalicity;
uniform float specular_level;

uniform float t;

varying mat4 v_model_view_matrix;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 P;

varying mat3 TBN;

vec3 getNormal() {
    vec3 Nm = texture2D(normal_map, v_uv).xyz;
    Nm *= 2.0;
    Nm -= vec3(1.0);
    return normalize(TBN * Nm);
}

#define PI 3.14159
#define MIN 0.0001
#define NUM_LIGHTS 3

// Unreal GGX implementation (Unreal SIGGRAPH 2013)
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf

// Schlick approximation
vec3 FresnelTerm(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0)-F0) * pow(2.0, (-5.55473*VdH-6.98316)*VdH);
}

// Disney's Fresnel doesn't use an approximation, but it is quite a bit higher
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

// WebGL
vec3 degamma(vec3 color) {
  return pow(color, vec3(2.2, 2.2, 2.2));
}

vec3 gamma(vec3 color) {
  return pow(color, vec3(0.4545, 0.4545, 0.4545));
}

struct Light {
  vec3 dir;
  vec3 color;
  float intensity;
};

Light lights[NUM_LIGHTS];

void main() {
  vec3 color_to_light_dir = 2.0 * light_direction - vec3(1.0, 1.0, 1.0);
  lights[0] = Light(normalize(
      (v_model_view_matrix * vec4(color_to_light_dir, 0.0)).xyz
    ),
    light_color,
    light_intensity);
  lights[1] = Light(normalize((v_model_view_matrix * vec4(1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(1.0, 1.0, 0.5),
    0.5);
  lights[2] = Light(normalize((v_model_view_matrix * vec4(-1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(0.5, 1.0, 1.0),
    0.5);

  vec3 base_color;
  vec3 N;
  float roughness;

  if (use_textures == 1) {
    base_color = degamma(texture2D(base_color_map, v_uv).rgb);
    N = getNormal();
    roughness = roughness_gain*texture2D(roughness_map, v_uv).r + roughness_boost;
  } else {
    base_color = degamma(base_color_constant);
    N = normalize(v_normal);
    roughness = roughness_constant;
  }

  vec3 V = normalize(-P);
  float NdV = max(dot(N,V), 0.0);

  float alpha = roughness* roughness;
  float alpha2 = alpha * alpha;

  // Dielectrics have an F0 between 0.2 - 0.5. 0.04 is a reasonable default
  // it is often exposed as a parameter called "specular level."
  // It might make sense to plug an existing specular map into this, and remap
  // it to the 0-0.8 range, which are the bounds used by Unreal.
  // Many implementations simply expose the value as a scalar on a per-material
  // basis.
  vec3 F0 = vec3(specular_level, specular_level, specular_level);

  // metals use their base color as their specular color.
  F0 = mix(F0, base_color, metalicity);

  vec3 accumulated_light = vec3(0.0, 0.0, 0.0);

  // ambient lighting, to fake an image based map
  accumulated_light += base_color * vec3(0.1, 0.1, 0.1);

  for(int i=0; i < NUM_LIGHTS; i++) {
    vec3 L = lights[i].dir;
    vec3 H = normalize(V+L);

    float VdH = max(dot(V, H), 0.0);
    float NdH = max(dot(N, H), 0.0);
    float NdL = max(dot(N, L), 0.0);

    float D = DistributionTerm(NdH, alpha2);
    float Gl = GeometryTerm(roughness, L, N, H);
    float Gv = GeometryTerm(roughness, V, N, H);
    vec3 F = FresnelTerm(VdH, F0);

    vec3 specular_contribution = F*(Gl*Gv*D/(4.0*NdL*NdV + 0.001));

    // metals don't have a diffuse contribution, so turn off the diffuse color
    // when the material is metallic
    vec3 diffuse_color = base_color * (1.0 - metalicity);

    // use reflectance to calculate energy conservation
    diffuse_color *= vec3(1.0, 1.0, 1.0) - F0;

    accumulated_light += (specular_contribution + diffuse_color)
      * NdL * lights[i].color * lights[i].intensity;
  }

  gl_FragColor = vec4(gamma(accumulated_light), 1.0);
}
