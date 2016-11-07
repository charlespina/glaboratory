precision highp float;
precision highp int;

uniform vec3 brush_color;
uniform sampler2D brush_texture;
uniform sampler2D canvas_texture;

varying vec2 vUV;

vec3 gammaToLinear(vec3 color) {
  return pow(color, vec3(2.2, 2.2, 2.2));
}

vec3 linearToGamma(vec3 color) {
  return pow(color, vec3(0.4545, 0.4545, 0.4545));
}

void main() {
  float brush_value = texture2D(brush_texture, vUV).r;
  vec3 current_color = (texture2D(canvas_texture, vUV).rgb);
  vec3 new_color = mix(current_color, (brush_color), brush_value);
  gl_FragColor = vec4((new_color), 1.0);
}
