#extension GL_OES_standard_derivatives : enable

varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying vec3 vPscreen;
varying mat3 vTBN;

uniform float time;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform vec3 diffuseColor;
uniform vec3 fresnelColor;
uniform float fresnelIntensity;

#pragma glslify: safeDot = require(../../common/math/safeDot)
#pragma glslify: gamma = require(../../common/color/gamma)
#pragma glslify: degamma = require(../../common/color/degamma)

struct Wave {
  float A;
  float period;
  float offset;
};

float posiWave(Wave w, float t) {
  return w.A * (1.0 + sin(w.period * t + w.offset)) / 2.0;
}

float scanline() {
  Wave broad = Wave(
    0.8,
    1.0/20.0,
    time * 2.0
  );

  Wave scan = Wave(
    1.8,
    4.0,
    0.0
  );
  float linesBroad = posiWave(broad, vPscreen.y);
  linesBroad *= linesBroad;
  float linesScan = posiWave(scan, gl_FragCoord.y);
  return linesBroad + linesScan;
}

void main() {
  vec3 linLightColor = degamma(lightColor);
  vec3 linDiffuseColor = degamma(diffuseColor);
  vec3 linFresnelColor = degamma(fresnelColor);

  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);
  float NdV = safeDot(N, V);
  float fresnel = 1.0 - NdV;
  fresnel *= fresnel;
  fresnel *= fresnelIntensity;

  vec3 lightDirection = normalize(vec3(1.0, 1.0, -0.25));

  vec3 diffuse = lightIntensity * linLightColor * safeDot(lightDirection, N) * linDiffuseColor;

  vec3 color = gamma(fresnel * linFresnelColor + diffuse);
  gl_FragColor = vec4(color * scanline(), 1.0);
}
