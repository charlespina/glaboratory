#extension GL_OES_standard_derivatives : enable

precision highp float;
precision highp int;

uniform int brush_mode;
uniform float brush_height;
uniform sampler2D brush_texture;
uniform sampler2D canvas_texture;

varying vec2 vUV;


#define BRUSH_MODE_SET 0
#define BRUSH_MODE_ADD 1

void main() {
  float brush_value = texture2D(brush_texture, vUV).r;
  vec4 canvas_color = texture2D(canvas_texture, vUV);
  float height;

  if (brush_mode == BRUSH_MODE_SET) { // set brush value
    height = brush_height;
  } else if (brush_mode == BRUSH_MODE_ADD) { // add to existing value
    height = canvas_color.a + brush_height;
  }

  float h = mix(canvas_color.a, height, brush_value);

  float dx = dFdx(h);
  float dy = dFdy(h);
  float z = sqrt(dx * dx + dy * dy);
  // float z = h;
  vec3 N = normalize(vec3(dx, dy, z));

  gl_FragColor = vec4(N, h);
}
