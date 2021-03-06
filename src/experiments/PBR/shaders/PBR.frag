uniform vec3 base_color_constant;
uniform sampler2D base_color_map;

uniform int use_textures;
uniform float roughness_constant;
uniform float roughness_boost;
uniform float roughness_gain;
uniform sampler2D roughness_map;
uniform sampler2D normal_map;

uniform mat4 modelViewMatrix;

uniform float light_intensity;
uniform vec3 light_color;
uniform vec3 light_direction;

uniform float metalicity;
uniform float specular_level;
uniform float t;

uniform float cloudiness;


varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying mat3 vTBN;

#pragma glslify: Light = require(../../common/Light)
#pragma glslify: getNormal = require(../../common/normals/getNormal)
#pragma glslify: getF0 = require(../../common/pbr/getF0)
#pragma glslify: gamma = require(../../common/color/gamma)
#pragma glslify: degamma = require(../../common/color/degamma)
#pragma glslify: Material = require(../../common/pbr/Material)
#pragma glslify: shade = require(../../common/pbr/shade)
#pragma glslify: safeDot = require(../../common/math/safeDot)

#define NUM_LIGHTS 1

Light lights[NUM_LIGHTS];

void main() {
  vec3 V = normalize(-vP);
  vec3 color_to_light_dir = 2.0 * light_direction - vec3(1.0, 1.0, 1.0);

  lights[0] = Light(
    normalize((modelViewMatrix * vec4(color_to_light_dir, 0.0)).xyz),
    light_color,
    light_intensity
  );

  /*
  lights[1] = Light(
    normalize((modelViewMatrix * vec4(1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(1.0, 1.0, 0.5),
    0.5
  );

  lights[2] = Light(
    normalize((modelViewMatrix * vec4(-1.0, 0.0, 0.2, 0.0)).xyz),
    vec3(0.5, 1.0, 1.0),
    0.5
  );
  */

  vec3 N;
  vec3 base_color;
  float roughness;
  if (use_textures == 1) {
    base_color = degamma(texture2D(base_color_map, vUV).rgb);
    N = getNormal(normal_map, vTBN, vUV);
    roughness = roughness_gain*texture2D(roughness_map, vUV).r + roughness_boost;
  } else {
    base_color = degamma(base_color_constant);
    N = normalize(vN);
    roughness = roughness_constant;
  }

  vec3 F0 = getF0(specular_level, metalicity, base_color);

  // unlit
  vec3 accumulated_light = vec3(0.0, 0.0, 0.0);

  // ambient lighting, to fake an image based map
  accumulated_light += base_color * vec3(0.1, 0.1, 0.1);

  Material material = Material(
    metalicity,
    roughness,
    base_color,
    F0
  );

  for(int i=0; i < NUM_LIGHTS; i++) {
    vec3 L = lights[i].dir;
    accumulated_light += shade(L, cloudiness, V, N, material)
      * lights[i].color * lights[i].intensity;
  }

  // add cloudiness
  float NdU = dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
  accumulated_light += lights[0].color * lights[0].intensity * mix(0.0, cloudiness * cloudiness / 3.1415, NdU);

  gl_FragColor = vec4(gamma(accumulated_light), 1.0);
}
