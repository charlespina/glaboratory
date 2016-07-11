uniform sampler2D textureA;
uniform sampler2D textureB;
uniform float strengthA;
uniform float strengthB;

varying vec2 vUV;

void main() {
  vec4 A = texture2D(textureA, vUV);
  vec4 B = texture2D(textureB, vUV);
  gl_FragColor = vec4(strengthA * A.rgb + strengthB * B.rgb, A.a);
}
