uniform sampler2D density_texture;
uniform sampler2D velocity_x_texture;
uniform sampler2D velocity_y_texture;
uniform float dt;
uniform float resolution;

varying vec2 v_uv;

float sample(float step, float x, float y, sampler2D tex) {
  float step_u = step * x;
  float step_v = step * y;
  return texture2D(tex, v_uv+vec2(step_u, step_v)).r;
}

void main() {
  float step = 1.0/resolution;

  float dt0 = dt*resolution;
  float velocity_x = texture2D(velocity_x_texture, v_uv).x;
  float velocity_y = texture2D(velocity_y_texture, v_uv).y;
  float x = (v_uv.x * resolution) - dt0 * velocity_x;
  float y = (v_uv.y * resolution) - dt0 * velocity_y;
  x = clamp(x, 0.5, resolution+0.5);
  y = clamp(y, 0.5, resolution+0.5);

  float i0 = x
  float j0 = y;
  float i1 = x+1.0;
  float j1 = y+1.0);

  float s1 = x-i0;
  float s0 = 1.0-s1;
  float t1 = y-j0;
  float t0 = 1.0-t1;

  float new_density =
    s0 * (t0 * sample(step, i0, j0, density_texture) +
          t1 * sample(step, i0, j1, density_texture)) +
    s1 * (t0 * sample(step, i1, j0, density_texture) +
          t1 * sample(step, i1, j1, density_texture));

  gl_FragColor = vec4(new_density, 0.0, 0.0, 1.0);
}
