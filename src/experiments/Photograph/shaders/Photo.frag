// light settings
uniform float light_intensity;
uniform vec3 light_color;
uniform vec3 light_direction;

// pbr material settings
uniform vec3 tint;
uniform float roughness_constant;
uniform float metalicity;
uniform float specular_level;
uniform sampler2D base_color_map;

// photo grain
uniform float grain_size;
uniform float grain_height;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_P;

varying mat4 v_model_view_matrix;
varying mat3 v_TBN;

// [1] Can't 'require' Material, because type names don't seem to be
// unmangled by glslify loader
struct Material {
  float metalicity;
  float roughness;
  vec3 base_color;
  vec3 specular_color; // F0
};

#pragma glslify: noise = require(glsl-noise/simplex/2d)
#pragma glslify: gamma = require(../../common/color/gamma)
#pragma glslify: degamma = require(../../common/color/degamma)
#pragma glslify: Light = require(../../common/Light)
// [1] : #pragma glslify: Material = require(./pbr/Material)
#pragma glslify: shade = require(../../common/pbr/shade)

#define NUM_LIGHTS 1

Light lights[NUM_LIGHTS];

void main() {
  vec3 color_to_light_dir = 2.0 * light_direction - vec3(1.0, 1.0, 1.0);
  lights[0] = Light(normalize(
      (vec4(color_to_light_dir, 0.0)).xyz
    ),
    light_color,
    light_intensity);

  vec3 base_color = degamma(tint) * degamma(texture2D(base_color_map, v_uv).rgb);
  vec3 N = normalize(v_normal);

  float roughness = roughness_constant;

  // fake photo grain
  roughness += (noise(v_uv*grain_size)*grain_height);

  vec3 V = normalize(-v_P);
  float NdV = max(dot(N,V), 0.0);

  // Dielectrics have an F0 between 0.2 - 0.5. 0.04 is a reasonable default
  // it is often exposed as a parameter called "specular level."
  // It might make sense to plug an existing specular map into this, and remap
  // it to the 0-0.8 range, which are the bounds used by Unreal.
  // Many implementations simply expose the value as a scalar on a per-material
  // basis.
  vec3 F0 = vec3(specular_level, specular_level, specular_level);

  // metals use their base color as their specular color.
  F0 = mix(F0, base_color, metalicity);

  // unlit
  vec3 accumulated_light = vec3(0.0, 0.0, 0.0);

  // make photo 100% illuminated, using photo's full color
  accumulated_light += base_color;

  Material material = Material(
    metalicity,
    roughness,
    vec3(0.0), // ignore photo's base color, we just want the specular contribution
    F0
  );

  for(int i=0; i < NUM_LIGHTS; i++) {
    vec3 L = lights[i].dir;
    accumulated_light += shade(L, V, N,
      material.roughness,
      material.metalicity,
      material.specular_color,
      material.base_color) * lights[i].color * lights[i].intensity;
  }

  gl_FragColor = vec4(gamma(accumulated_light), 1.0);
}
