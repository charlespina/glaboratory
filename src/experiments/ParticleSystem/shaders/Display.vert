uniform sampler2D uParticleData; // rgb = position xyz
varying vec2 vUV;

void main() {
  // use the position attribute to look up the actual position of the vertex
  vUV = position.xy;
  vec2 P = texture2D(uParticleData, position.xy).rg;
  gl_PointSize = 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0, 1.0);

  // vec3 tmp = vec3(position.xy, 0.0);
  // gl_Position = vec4(simToScreen(tmp), 1.0);
}
