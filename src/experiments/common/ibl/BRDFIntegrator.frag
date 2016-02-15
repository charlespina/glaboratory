precision highp float;
precision highp int;

#define PI 3.14159

uniform sampler2D vdc_map;

varying vec2 vUV;

// Van der Corput pseudo-random sequence - http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
float randomNumber(int i, int numSamples) {
  vec2 uv = vec2((float(i)+0.5) / float(numSamples), 0.5); // First row pixel
  return texture2D(vdc_map, uv).r;
}

vec2 Hammersley(int i, int numSamples) {
  return vec2(float(i)/float(numSamples), randomNumber(i, numSamples));
}

// Unreal SIGGRAPH 2013
vec3 ImportanceSampleGGX( vec2 Xi, float Roughness, vec3 N ) {
  float a = Roughness * Roughness;
  float Phi = 2.0 * PI * Xi.x;
  float CosTheta = sqrt( (1.0 - Xi.y) / ( 1.0 + (a*a - 1.0) * Xi.y + 0.00001) );
  float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );
  vec3 H;
  H.x = SinTheta * cos( Phi );
  H.y = SinTheta * sin( Phi );
  H.z = CosTheta;
  vec3 UpVector = N.z < 0.999 ? vec3(0.0,0.0,1.0) : vec3(1.0,0.0,0.0);
  vec3 TangentX = normalize( cross( UpVector, N ) );
  vec3 TangentY = cross( N, TangentX );
  // Tangent to world space
  return TangentX * H.x + TangentY * H.y + N * H.z;
}

float G_1(float k, float NdV) {
  return NdV/((NdV)*(1.0-k)+k+0.00001);
}

float G_Smith(float roughness, float NdV, float NdL) {
  // remapped roughness, to be used for the geometry term calculations,
  // per Disney [16], Unreal [3]. N.B. don't do this in IBL
  //float roughness_remapped = 0.5 + roughness/2.0;
  float k = roughness * roughness; //pow(roughness + 1.0, 2.0)/8.0;
  return G_1(k, NdV) * G_1(k, NdL);
}

// Unreal SIGGRAPH 2013
vec2 IntegrateBRDF( float Roughness, float NoV )
{
  vec3 N = vec3(0.0,0.0,1.0);
  vec3 V;
  V.x = sqrt( 1.0 - NoV * NoV ); // sin
  V.y = 0.0;
  V.z = NoV; // cos
  float A = 0.0;
  float B = 0.0;

  const int NumSamples = 1024;
  for( int i = 0; i < NumSamples; i++ )
  {
    vec2 Xi = Hammersley( i, NumSamples );
    vec3 H = ImportanceSampleGGX( Xi, Roughness, N );
    vec3 L = 2.0 * dot( V, H ) * H - V;

    float NoL = clamp( L.z, 0.0, 1.0);
    float NoH = clamp( H.z, 0.0, 1.0);
    float VoH = clamp( dot( V, H ), 0.0, 1.0);

    if( NoL > 0.0 )
    {
      float G = G_Smith( Roughness, NoV, NoL );
      float G_Vis = G * VoH / (NoH * NoV + 0.0001);
      float Fc = pow( 1.0 - VoH, 5.0 );
      A += (1.0 - Fc) * G_Vis;
      B += Fc * G_Vis;
    }
  }
  return vec2( A, B ) / float(NumSamples);
}

void main() {
  gl_FragColor = vec4(IntegrateBRDF(vUV.x, vUV.y), 0.0, 1.0);
}
