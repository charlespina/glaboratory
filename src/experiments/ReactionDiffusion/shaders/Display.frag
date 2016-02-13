#extension GL_OES_standard_derivatives : enable

uniform sampler2D background_texture;
uniform sampler2D data_texture;
uniform vec3 layer_tint;
uniform vec3 brush_color;
uniform int resolution;
uniform vec3 highlight_color;
uniform float highlight_strength;
uniform float specular_power;
uniform int show_brush_preview;
uniform sampler2D brush_texture;

varying vec2 v_uv;
varying vec2 v_P;

float getValue(vec2 uv) {
  vec3 data = texture2D(data_texture, uv).rgb;
  return smoothstep(0.0, 0.4, data.g);
}

float brushValue( vec2 uv ) {
  float iso_threshold = 0.03;
  return (texture2D(brush_texture, uv).r - iso_threshold);
}

#pragma glslify: calculateNormal = require(../../common/math/calculateNormal, fn = getValue)
#pragma glslify: contour = require(../../common/math/contour, fn = brushValue)

float brushPreview( vec2 x ) {
  return contour(resolution, x);
}

void main() {
  vec3 bg_color = texture2D(background_texture, v_uv).rgb;
  vec3 color = mix(bg_color*layer_tint, brush_color, getValue(v_uv));
  vec3 spec = highlight_color * highlight_strength * pow(clamp(dot(calculateNormal(resolution, v_uv), normalize(vec3(1.0, 1.0, 1.2))), 0.0, 1.0), specular_power);

  vec3 image = spec + color;

  float brush_alpha = 0.0;
  if (show_brush_preview == 1) {
    float brush_preview = brushPreview(v_uv);
    brush_alpha = 1.0 * brush_preview;
  }

  vec3 display = mix(image, vec3(1.0), brush_alpha);
  gl_FragColor = vec4(display, 1.0);
}
