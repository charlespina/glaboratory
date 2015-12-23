uniform float time;
uniform float delta_time;
uniform float A_feed_rate;
uniform float B_kill_rate;
uniform float A_diffuse;
uniform float B_diffuse;

uniform sampler2D data_texture;
uniform sampler2D brush_texture;
uniform int brush_active;
uniform int resolution; // the resolution of the input image


varying vec2 v_uv;


vec3 sample(float step, float x, float y) {
  float step_u = step * (x-1.0);
  float step_v = step * (y-1.0);
  return texture2D(data_texture, v_uv+vec2(step_u, step_v)).rgb;
}

vec3 laplacian() {
  float CONVOLUTION_WEIGHTS[9];
  CONVOLUTION_WEIGHTS[0] = 0.05; CONVOLUTION_WEIGHTS[1] = 0.2; CONVOLUTION_WEIGHTS[2] = 0.05;
  CONVOLUTION_WEIGHTS[3] = 0.2; CONVOLUTION_WEIGHTS[4] = -1.0; CONVOLUTION_WEIGHTS[5] = 0.2;
  CONVOLUTION_WEIGHTS[6] = 0.05; CONVOLUTION_WEIGHTS[7] = 0.2; CONVOLUTION_WEIGHTS[8] = 0.05;

  float uv_step = 1.0/float(resolution);
  vec3 total = vec3(0.0);
  for(float i=0.0; i<3.0; i+=1.0) {
    for(float j=0.0; j<3.0; j+=1.0) {
      total += sample(uv_step, i, j) * CONVOLUTION_WEIGHTS[int(i+j*3.0)];
    }
  }
  return total;
}


void main() {

  vec3 data = texture2D(data_texture, v_uv).rgb;

  vec3 L = laplacian();
  float L_A = L.r;
  float L_B = L.g;

  float A = data.r;
  float B = data.g;

  float A_prime = A;
  float B_prime = B;

  // reaction diffusion
  A_prime = A + (A_diffuse * L_A - A*pow(B,2.0) + A_feed_rate * (1.0-A)) * delta_time;
  B_prime = B + (B_diffuse * L_B + A*pow(B,2.0) - (B_kill_rate+A_feed_rate) * B) * delta_time;

  if (brush_active == 1) {
    float brush = texture2D(brush_texture, v_uv).r;
    B_prime = mix(B_prime, 1.0, brush);
  }

  A_prime = clamp(A_prime, 0.0, 1.0);
  B_prime = clamp(B_prime, 0.0, 1.0);

  gl_FragColor = vec4(A_prime, B_prime, 0.0, 1.0);
}
