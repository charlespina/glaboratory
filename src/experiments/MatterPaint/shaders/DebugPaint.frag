precision highp float;
precision highp int;

uniform sampler2D channel_one;
uniform sampler2D channel_two;
uniform sampler2D channel_three;

varying vec2 v_uv;

void main() {
  float r = texture2D(channel_one, v_uv).r;
  float g = texture2D(channel_two, v_uv).r;
  float b = texture2D(channel_three, v_uv).r;
  gl_FragColor = vec4(r, g, b, 1.0);
}
