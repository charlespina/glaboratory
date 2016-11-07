precision highp float;
precision highp int;

uniform int resolution;

uniform int brush_active;
uniform int brush_connected;

uniform vec2 brush_position;
uniform vec2 brush_position_previous;

uniform float brush_width;
uniform float brush_softness;

varying vec2 vUV;

float dist2(vec2 A, vec2 B) {
    vec2 d2 = A - B;
    d2 *= d2;
    return d2.x + d2.y;
}

float distToLineSegment(vec2 A, vec2 B, vec2 P) {
    float AB2 = dist2(A, B);
    if (AB2 == 0.0) return distance(A, P);

    float t = clamp(dot(P-A, B-A)/AB2, 0.0, 1.0);

    vec2 proj = A + t * (B - A);
    return distance(P, proj);

}

float getDistanceFromBrushLine(vec2 B0, vec2 B1, vec2 P) {
  float d = distToLineSegment(B0, B1, P);
  return d;
}

float getDistanceFromBrush(vec2 B, vec2 P) {
  return distance(B, P);
}

float getBrushFalloff(float intensity) {
  float brush_width_normalized = brush_width/float(resolution);
  float hard = smoothstep(brush_width_normalized, 0.0, intensity);
  float soft = hard; // TODO
  float value = mix(hard, soft, brush_softness);
  return value;
}

void main() {


  vec2 P = vUV.xy - vec2(0.5, 0.5);

  float intensity, value;
  if (brush_connected == 1) {
    intensity = getDistanceFromBrushLine(brush_position, brush_position_previous, P);
    float intensity_prev = getDistanceFromBrush(brush_position_previous, P);
    value = getBrushFalloff(intensity); // - 0.5 *getBrushFalloff(intensity_prev);
  } else {
    intensity = getDistanceFromBrush(brush_position, P);
    value = getBrushFalloff(intensity);
  }


  gl_FragColor = vec4(brush_active == 1 ? value : 0.0, 0.0, 0.0, 0.0);
}
