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
uniform float ibl_exposure;
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
#define IBL_MAX_LEVELS 9.0

#pragma glslify: normalToUv = require(./envMapEquirect)
#pragma glslify: rgbdToRgb = require(../color/rgbdToRgb)
#pragma glslify: linearToGamma = require(../color/gamma)
#pragma glslify: gammaToLinear = require(../color/degamma)
#pragma glslify: getNormal = require(../normals/getNormal)
#pragma glslify: Material = require(../pbr/Material)
#pragma glslify: shade = require(../pbr/shade)
#pragma glslify: getF0 = require(../pbr/getF0)
#pragma glslify: safeDot = require(../math/safeDot)
#pragma glslify: tonemap = require(../color/tonemap-uncharted)

#ifndef PI
#define PI 3.14159
#endif

vec3 sampleEnvironment(vec3 N, float roughness) {
  vec2 env_uv = normalToUv(N);
  return (rgbdToRgb(texture2DLodEXT(ibl_map, env_uv, roughness*IBL_MAX_LEVELS)));
}

vec3 getSpecularIBL(vec3 specular_color, float roughness, vec3 N, vec3 V, vec3 vertex_normal) {
  const float horizon_amount = 1.3;
  float NdV = safeDot(N, V);
  vec3 R = 2.0 * dot(V, N) * N - V;

  // Horizon correction, per http://marmosetco.tumblr.com/post/81245981087
  vec3 reflected = normalize(reflect(N,V));
  float horizon = clamp(1.0 + horizon_amount * dot(reflected, vertex_normal), 0.0, 1.0);
  horizon *= horizon;

  vec3 color = sampleEnvironment(R, roughness);
  vec2 brdf_uv = vec2(roughness, NdV);
  vec2 brdf = texture2D(brdf_map, brdf_uv).xy;
  return color * (specular_color * brdf.x + brdf.y); // * horizon;
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
    light_intensity,
    0.1);
  lights[2] = Light(normalize((modelViewMatrix * vec4(-1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(159.0/255.0, 193.0/255.0, 230.0/255.0),
    light_intensity,
    0.1);

  vec3 base_color;
  vec3 V = normalize(-vP);
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

  vec3 F0 = getF0(specular_level, metalicity, base_color);

  Material material = Material(
    metalicity,
    roughness,
    base_color,
    F0
  );

  vec3 accumulated_light = vec3(0.0, 0.0, 0.0);

  for(int i=0; i < NUM_LIGHTS; i++) {
    vec3 L = lights[i].dir;
    accumulated_light += shade(L, V, N, material) * lights[i].color * lights[i].intensity;
  }

  // IBL contribution
  // diffuse contribution from environment
  accumulated_light += ibl_exposure * base_color * (sampleEnvironment(N, 0.9) / PI) * (1.0 - metalicity);
  // specular contribution from environment
  accumulated_light += ibl_exposure * getSpecularIBL(F0, roughness_raw, N, V, Ninit);
  vec3 final = accumulated_light;
  final = linearToGamma(tonemap(final));

  // gl_FragColor = vec4(getSpecularIBL(F0, roughness_raw, N, V, Ninit), 1.0); //N, 0.9), 1.0);
  // gl_FragColor = vec4(getSpecular, 0.0, 1.0);
  gl_FragColor = vec4(final, 1.0);
}
