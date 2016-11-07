uniform int resolution;

uniform int brush_active;
uniform vec2 brush_position;
uniform float brush_width;
uniform float brush_softness;

uniform int symmetry_mode;
uniform vec2 axis_of_symmetry;

uniform int pulse_active;
uniform float pulse_frequency;
uniform float pulse_magnitude;

uniform float delta_time;
uniform float time;

varying vec2 v_uv;

float getDistanceFromBrush(vec2 p) {
  return distance(v_uv.xy, p + vec2(0.5, 0.5));
}

void main() {

  float intensity = getDistanceFromBrush(brush_position);

  if (symmetry_mode == 1) {
    float sym = getDistanceFromBrush(reflect(brush_position, vec2(1.0, 0.0)));
    intensity = min(intensity, sym);
  }

  if (symmetry_mode == 2) {
    float sym = getDistanceFromBrush(reflect(brush_position, vec2(0.0, 1.0)));
    intensity = min(intensity, sym);
  }

  if (symmetry_mode == 3) {
    float sym = getDistanceFromBrush(reflect(brush_position, normalize(vec2(1.0, -1.0))));
    intensity = min(intensity, sym);
    float sym2 = getDistanceFromBrush(reflect(brush_position, normalize(vec2(1.0, 1.0))));
    intensity = min(intensity, sym2);
    float sym3 = getDistanceFromBrush(reflect(brush_position, normalize(vec2(-1.0, 1.0))));
    intensity = min(intensity, sym3);
    float sym4 = getDistanceFromBrush(brush_position * vec2(-1.0, -1.0));
    intensity = min(intensity, sym4);
  }

  if (pulse_active == 1) {
    intensity *= 1.0 + pulse_magnitude * sin(pulse_frequency*time);
  }

  float brush_width_normalized = brush_width/float(resolution);
  float hard = smoothstep(brush_width_normalized, 0.0, intensity);
  float soft = hard; // TODO

  float value = mix(hard, soft, brush_softness);

  gl_FragColor = vec4(value, 0.0, 0.0, 0.0);
}
