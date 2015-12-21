uniform sampler2D data_texture;
uniform int boundary_mode;
uniform float resolution;

varying vec2 v_uv;

float setBoundary() {
  float begin = 1.0/resolution;
  float end = 1.0 - 1.0/resolution;
  float step = 1.0/resolution;

  float vertical_sign = boundary_mode == 1 ? -1.0 : 1.0;
  float horizontal_sign = boundary_mode == 2 ? -1.0 : 1.0;

  float result = 0.0;
  float samples = 0.0;

  // vertical walls
  if (v_uv.x < begin) {
    samples = 1.0;
    result = vertical_sign * sample(step, 1.0, 0.0, velocity_x_texture);
  }

  if (v_uv.x > end) {
    samples = 1.0;
    result = vertical_sign * sample(step, -1.0, 0.0, velocity_x_texture);
  }

  // horizontal walls
  if (v_uv.y < begin) {
    samples += 1.0;
    result += horizontal_sign * sample(step, 0.0, 1.0, velocity_x_texture);
  }

  if (v_uv.y > end) {
    samples += 1.0;
    result += horizontal_sign * sample(step, 0.0, -1.0, velocity_x_texture);
  }

  // corners are average of row and column samples
  if (samples > 0.0) {
    return result/samples;
  }

  // rest of texture is pass-through
  return sample(step, 0.0, 0.0, velocity_x_texture);
}

void main() {
  gl_FragColor = vec4(setBoundary(), 0.0, 0.0, 1.0);
}
