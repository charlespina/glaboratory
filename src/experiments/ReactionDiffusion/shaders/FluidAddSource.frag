uniform sampler2D source_texture;
uniform sampler2D field_texture;
uniform float dt;

varying vec2 v_uv;

void main() {
  float field = texture2D(field, v_uv).r;
  float source = texture2D(source, v_uv).r;
  gl_FragColor = vec4(field + source.r * dt, 0.0, 0.0, 1.0);
}
