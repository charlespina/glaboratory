#extension GL_OES_standard_derivatives : enable

precision highp float;
precision highp int;

uniform sampler2D brush_texture;
uniform sampler2D canvas_texture;

varying vec2 vUV;

void main() {
  float brush_value = texture2D(brush_texture, vUV).r;
  float dx = dFdx(brush_value);
  float dy = dFdy(brush_value);
  float z = sqrt(dx * dx + dy * dy);
  vec3 N = normalize(vec3(dx, dy, z));
  vec3 current_color = texture2D(canvas_texture, vUV).rgb;
  vec3 new_color = mix(current_color, N, brush_value);
  gl_FragColor = vec4(new_color, 1.0);
}
