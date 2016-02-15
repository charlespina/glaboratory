#extension GL_EXT_shader_texture_lod : enable
precision highp float;
precision highp int;

uniform mat4 modelViewMatrix;

// material uniforms
uniform vec3 base_color_constant;
uniform float roughness_constant;
uniform float metalicity;
uniform float specular_level;

// optional textures
uniform int use_textures;
uniform sampler2D base_color_map;
uniform sampler2D roughness_map;
uniform sampler2D normal_map;

// lighting
uniform sampler2D brdf_map;
uniform sampler2D ibl_map;
uniform float light_intensity;
uniform vec3 light_color;
uniform vec3 light_direction;

// varying
varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying mat3 vTBN;

#define MIN 0.0001
#define NUM_LIGHTS 3

// 2^8 = 256 texture resolution. 0-indexed, so subtract 1.
#define IBL_MAX_LEVELS 7.0

#pragma glslify: normalToUv = require(./envMapEquirect)
#pragma glslify: linearToGamma = require(../color/gamma)
#pragma glslify: gammaToLinear = require(../color/degamma)
#pragma glslify: getNormal = require(../normals/getNormal)

#ifndef PI
#define PI 3.14159
#endif

vec3 sampleEnvironment(vec3 N, float roughness) {
  vec2 env_uv = normalToUv(N);
  return gammaToLinear(texture2DLodEXT(ibl_map, env_uv, (roughness)*IBL_MAX_LEVELS).rgb);
}

vec3 getSpecularIBL(vec3 specular_color, float roughness, vec3 N, vec3 V, vec3 vertex_normal) {
  const float horizon_amount = 1.3;
  float NdV = clamp(dot(N,V), 0.0, 1.0);
  vec3 R = N; // reflect(N, V);

  // Horizon correction, per http://marmosetco.tumblr.com/post/81245981087
  vec3 reflected = normalize(reflect(N,V));
  float horizon = clamp(1.0 + horizon_amount * dot(reflected, vertex_normal), 0.0, 1.0);
  horizon *= horizon;

  // Note: our environment map is a reflection map (from a reflection probe),
  // so sample ray is just the normal, as it's already been reflected
  vec3 color = sampleEnvironment(R, roughness);
  vec2 brdf_uv = vec2(roughness, 1.0-NdV);
  vec2 brdf = texture2D(brdf_map, brdf_uv).xy;
  return color * (specular_color * brdf.x + brdf.y); // * horizon;
}


// Unreal GGX implementation (Unreal SIGGRAPH 2013)
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
float geometryTerm(float roughness, vec3 V, vec3 N, vec3 H) {
  // remapped roughness, to be used for the geometry term calculations,
  // per Disney [16], Unreal [3]. N.B. don't do this in IBL
  float roughness_remapped = 0.5 + roughness/2.0;

  float NdV = max(0.0, dot(N,V));

  float k = pow(roughness_remapped + 1.0, 2.0)/8.0;
  return NdV/((NdV)*(1.0-k)+k);
}

float distributionTerm(float NdH, float alpha2) {
  float D_denominator = PI * ((NdH*NdH)*(alpha2-1.0)+1.0);
  return alpha2/(D_denominator * D_denominator);
}

// Schlick approximation
vec3 fresnelTerm(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0) - F0) * pow(2.0, (-5.55473*VdH-6.98316)*VdH);
}

// Disney's Fresnel doesn't use an approximation, but it is quite a bit higher
// intensity than Unity's Schlick approximation
// https://disney-animation.s3.amazonaws.com/library/s2012_pbs_disney_brdf_notes_v2.pdf
vec3 fresnelTermDisney(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0) - F0) * pow(5.0, 1.0 - VdH);
}

// Schlick, more accurate but more expensive
vec3 fresnelTermSchlick(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0) - F0) * pow(1.0-VdH, 5.0);
}

vec3 reflectLight(vec3 L, vec3 N, vec3 V, vec3 F0, float roughness, float alpha2) {
  vec3 H = normalize(V+L);
  float NdL = clamp(dot(N, L), 0.0, 1.0);
  float NdH = clamp(dot(N, H), 0.0, 1.0);
  float VdH = clamp(dot(V, H), 0.0, 1.0);
  float NdV = clamp(dot(N, V), 0.0, 1.0);

  float D = distributionTerm(NdH, alpha2);
  float Gl = geometryTerm(roughness, L, N, H);
  float Gv = geometryTerm(roughness, V, N, H);
  vec3 F = fresnelTerm(VdH, F0);

  return F * (Gl*Gv*D/(4.0 * NdL * NdV + 0.001));
}

struct Light {
  vec3 dir;
  vec3 color;
  float intensity;
  float radius;
};

Light lights[NUM_LIGHTS];

void main() {
  vec3 color_to_light_dir = 2.0 * light_direction - vec3(1.0, 1.0, 1.0);
  lights[0] = Light(normalize(
      (modelViewMatrix * vec4(color_to_light_dir, 0.0)).xyz
    ),
    light_color,
    light_intensity,
    0.003);
  lights[1] = Light(normalize((modelViewMatrix * vec4(1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(1.0, 192.0/255.0, 99.0/255.0),
    1.5,
    0.1);
  lights[2] = Light(normalize((modelViewMatrix * vec4(-1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(159.0/255.0, 193.0/255.0, 230.0/255.0),
    1.5,
    0.1);

  vec3 base_color;
  vec3 N;
  vec3 Ninit = normalize(vN);
  float roughness; // reparameterized to roughness^2, for better control of lower values
  float roughness_raw; // holds the original roughness value, unmodified

  if (use_textures == 1) {
    base_color = gammaToLinear(texture2D(base_color_map, vUV).rgb);
    N = getNormal(normal_map, vTBN, vUV);
    roughness_raw = roughness = texture2D(roughness_map, vUV).r;
  } else {
    base_color = gammaToLinear(base_color_constant);
    N = Ninit;
    roughness_raw = roughness = roughness_constant;
  }

  vec3 V = normalize(-vP);
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

  vec3 diffuse_light = vec3(0.0, 0.0, 0.0);
  vec3 specular_light = vec3(0.0, 0.0, 0.0);

  for(int i=0; i < NUM_LIGHTS; i++) {
    vec3 L = lights[i].dir;
    float NdL = max(dot(N, L), 0.0);
    vec3 reflected_light = reflectLight(L, N, V, F0, roughness, alpha2 + lights[i].radius);

    diffuse_light += lights[i].color * lights[i].intensity * NdL / PI;
    specular_light += reflected_light * lights[i].color * lights[i].intensity * NdL;
  }

  // IBL contribution
  diffuse_light += sampleEnvironment(N, 0.9) / PI;
  specular_light += getSpecularIBL(F0, roughness_raw, N, V, Ninit);

  vec3 final = base_color
    * diffuse_light * (vec3(1.0) - F0)
    * (1.0 - metalicity) + specular_light;

  final = linearToGamma(final);

  // gl_FragColor = vec4(getSpecularIBL(F0, roughness_raw, N, V, Ninit), 1.0); //N, 0.9), 1.0);
  // gl_FragColor = vec4(getSpecular, 0.0, 1.0);
  gl_FragColor = vec4(final, 1.0);
}
