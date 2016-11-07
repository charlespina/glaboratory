varying vec2 v_uv;

uniform int brush_active;
uniform int resolution;
uniform float time;
uniform float delta_time;
uniform sampler2D brush_texture;
uniform sampler2D canvas_texture;

void main() {
  float brush_value = 0.0;
  if (brush_active == 1) {
    brush_value = texture2D(brush_texture, v_uv).r;
  }

  float bg_value = texture2D(canvas_texture, v_uv).r;
  float new_value = max(bg_value, brush_value);
  gl_FragColor = vec4(new_value);
}
