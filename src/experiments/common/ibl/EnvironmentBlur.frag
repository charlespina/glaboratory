precision highp float;
precision highp int;

uniform float roughness_constant;

uniform sampler2D reflection_map;
uniform sampler2D vdc_map;

varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;

#ifndef PI
#define PI 3.14159
#endif

#pragma glslify: uvToNormal = require(./envMapEquirectInverse)
#pragma glslify: envMapEquirect = require(./envMapEquirect)
#pragma glslify: gamma = require(../color/gamma)
#pragma glslify: degamma = require(../color/degamma)
#pragma glslify: rgbToRgbd = require(../color/rgbToRgbd)

/*vec3 uvToNormal(vec2 uv) {
  // create hemisphere from uv's, to use for ray testing
  vec3 N;

  vec2 uv2 = 2.0 * uv - vec2(1.0);

  N.x = sin(uv2.x*PI); //uv2.x;
  N.y = uv2.y * 0.59; // sin(uv2.y*PI); //1.0; // sin(uv.x*PI);
  N.z = cos(uv2.x*PI); //2.0 * uv.y - 1.0;
  return N;
}*/

vec3 ImportanceSampleGGX( vec2 Xi, float Roughness, vec3 N ) {
  float a = Roughness * Roughness;
  float Phi = 2.0 * PI * Xi.x;
  float CosTheta = sqrt( (1.0 - Xi.y) / ( 1.0 + (a*a - 1.0) * Xi.y ) );
  float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );
  vec3 H;
  H.x = SinTheta * cos( Phi );
  H.y = SinTheta * sin( Phi );
  H.z = CosTheta;
  vec3 UpVector = abs(N.z) < 0.999 ? vec3(0.0,0.0,1.0) : vec3(1.0,0.0,0.0);
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
  return texture2D(reflection_map, envMapEquirect(N)).rgb;
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
  vec3 N = uvToNormal(vUV);
  //vec2 debugColor = Hammersley((int)(P.x*1024.0), 1024);
  //vec3 color = texture2D(vdc_map, vec2(vUV.x, 0.5)).rgb;
  //vec3 color = vec3(Hammersley(int((N.x*0.5+0.5)*1024.0), 1024).rg, 0.0, 0.0);
  gl_FragColor = rgbToRgbd((PrefilterEnvMap(roughness_constant, N)));
}
