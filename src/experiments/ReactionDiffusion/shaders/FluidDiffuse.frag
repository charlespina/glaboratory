uniform sampler2D data_texture;
uniform sampler2D data_texture_prev;
uniform float viscosity;
uniform float diffusion_rate;
uniform float dt;
uniform float resolution;

varying vec2 v_uv;

float sample(float step, float x, float y, sampler2D tex) {
  float step_u = step * x;
  float step_v = step * y;
  return texture2D(tex, v_uv+vec2(step_u, step_v)).r;
}

void main() {
  float x0 = texture2D(data_texture_prev, v_uv);
  float step = 1.0/resolution;
  float a = dt*diffusion_rate*resolution*resolution;
  float x = x0 +
    a * ( sample(step, -1.0,  0.0,  data_texture) +
          sample(step, 1.0,   0.0,  data_texture) +
          sample(step, 0.0,   -1.0, data_texture) +
          sample(step, 0.0,   1.0,  data_texture) ) / (1.0+4.0*a);

  gl_FragColor = vec4(x, 0.0, 0.0, 1.0);
}
