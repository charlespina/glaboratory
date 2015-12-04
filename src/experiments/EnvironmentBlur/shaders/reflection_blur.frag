uniform float roughness_constant;

uniform sampler2D reflection_map;
uniform sampler2D vdc_map;

varying mat4 v_model_view_matrix;
varying vec3 v_normal;
varying vec2 v_uv;

varying vec3 P;

#define PI 3.14159

vec3 degamma(vec3 color) {
  //return color;
  return pow(color, vec3(2.2, 2.2, 2.2));
}

vec3 gamma(vec3 color) {
  //return color;
  return pow(color, vec3(0.4545));
}

vec3 ImportanceSampleGGX( vec2 Xi, float Roughness, vec3 N ) {
  float a = Roughness * Roughness;
  float Phi = 2.0 * PI * Xi.x;
  float CosTheta = sqrt( (1.0 - Xi.y) / ( 1.0 + (a*a - 1.0) * Xi.y  + 0.000001) );
  float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );
  vec3 H;
  H.x = SinTheta * cos( Phi );
  H.y = SinTheta * sin( Phi );
  H.z = CosTheta;
  vec3 UpVector = vec3(0.0, 1.0, 0.0); //abs(N.z) < 0.999 ? vec3(0.0,0.0,1.0) : vec3(1.0,0.0,0.0);
  vec3 TangentX = normalize( cross( UpVector, N ) );
  vec3 TangentY = cross( N, TangentX );
  // Tangent to world space
  return TangentX * H.x + TangentY * H.y + N * H.z;
}

// Van der Corput pseudo-random sequence - http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
float randomNumber(int i, int numSamples) {
  vec2 uv = vec2((float(i)+0.5) / float(numSamples), 0.5); // First row pixel
  return texture2D(vdc_map, uv).r;
}

vec3 getSample(vec3 N) {
  vec2 refl_uv = N.xy * vec2(0.6) + vec2(0.5);
  return degamma(texture2D(reflection_map, refl_uv.xy).rgb);
}

// Unreal SIGGRAPH 2013
vec2 Hammersley(int i, int numSamples) {
  return vec2(float(i)/float(numSamples), randomNumber(i, numSamples));
}

vec3 PrefilterEnvMap( float Roughness, vec3 R ) {
  vec3 N = R;
  vec3 V = R;
  vec3 PrefilteredColor = vec3(0.0);
  float TotalWeight = 0.0;
  const int NumSamples = 1024; // must be hard-coded for for-loop
  for( int i = 0; i < NumSamples; i++ )
  {
    vec2 Xi = Hammersley( i, NumSamples );
    vec3 H = ImportanceSampleGGX( Xi, Roughness, N );
    vec3 L = 2.0 * dot( V, H ) * H - V;
    float NoL = clamp(0.0, 1.0, dot( N, L ) );
    if( NoL > 0.0 ) {
      PrefilteredColor += getSample(L) * NoL;
      TotalWeight += NoL;
    }
  }
  return PrefilteredColor / TotalWeight;
}

void main() {
  vec3 N = normalize(v_normal);
  //vec2 debugColor = Hammersley((int)(P.x*1024.0), 1024);
  //vec3 color = texture2D(vdc_map, N.xy*0.5 + vec2(0.5)).rgb;
  //vec3 color = vec3(Hammersley(int((N.x*0.5+0.5)*1024.0), 1024).rg, 0.0, 0.0);
  vec3 color = gamma(PrefilterEnvMap(roughness_constant, N));
  gl_FragColor = vec4(color, 1.0);
}
