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

#define PI 3.14159
#define MIN 0.0001
#define NUM_LIGHTS 1

struct Light {
  vec3 dir;
  vec3 color;
  float intensity;
};

Light lights[NUM_LIGHTS];

// noise from https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// -- end of noise


// Unreal GGX implementation (Unreal SIGGRAPH 2013)
// http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf

// Schlick approximation
vec3 FresnelTerm(float VdH, vec3 F0) {
  return F0 + (vec3(1.0, 1.0, 1.0)-F0) * pow(2.0, (-5.55473*VdH-6.98316)*VdH);
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
  float D_denominator = ((NdH*NdH)*(alpha2-1.0)+1.0);
  return alpha2/(PI * D_denominator * D_denominator + 0.0001);
}

vec3 Degamma(vec3 color) {
  return pow(color, vec3(2.2, 2.2, 2.2));
}

vec3 Gamma(vec3 color) {
  return pow(color, vec3(0.4545, 0.4545, 0.4545));
}

void main() {
  vec3 color_to_light_dir = 2.0 * light_direction - vec3(1.0, 1.0, 1.0);
  lights[0] = Light(normalize(
      (vec4(color_to_light_dir, 0.0)).xyz
    ),
    light_color,
    light_intensity);

  vec3 base_color = Degamma(tint) * Degamma(texture2D(base_color_map, v_uv).rgb);
  vec3 N = normalize(v_normal);

  float roughness = roughness_constant;

  // fake photo grain
  roughness += (snoise(v_uv*grain_size)*grain_height);

  vec3 V = normalize(-v_P);
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

  // let's not mess with the photo. we will make it always 100% lit.
  accumulated_light += base_color;

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

    // just ignore the diffuse contribution. we don't want to
    // darken the photo
    vec3 diffuse_color = vec3(0.0, 0.0, 0.0);
    // metals don't have a diffuse contribution, so turn off the diffuse color
    // when the material is metallic
    // diffuse_color = base_color * (1.0 - metalicity);
    // use reflectance to calculate energy conservation
    // diffuse_color *= vec3(1.0, 1.0, 1.0) - F0;

    accumulated_light += (specular_contribution + diffuse_color)
      * NdL * lights[i].color * lights[i].intensity;
  }

  gl_FragColor = vec4(Gamma(accumulated_light), 1.0);
}
