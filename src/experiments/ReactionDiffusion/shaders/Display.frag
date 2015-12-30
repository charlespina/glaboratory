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

float iso_threshold = 0.03;

// samples around a 3x3 grid with x,y being grid coordinates, at a step of step
vec3 sample(float step, float x, float y) {
    float step_u = step * (x-1.0);
    float step_v = step * (y-1.0);
    return texture2D(data_texture, v_uv+vec2(step_u, step_v)).rgb;
}

float getValue(vec2 uv) {
    vec3 data = texture2D(data_texture, uv).rgb;
    return smoothstep(0.0, 0.4, data.g);
}

vec3 calculateNormal() {
    float step = 1.0/float(resolution);

    float dx = ( sample(step, 1.0, 0.0).g - sample(step, 1.0, 2.0).g);
    float dy = ( sample(step, 2.0, 1.0).g - sample(step, 0.0, 1.0).g );

    return normalize(vec3(dx, dy, getValue(v_uv) - 0.5));
}

float brushValue( vec2 uv ) {
    return (texture2D(brush_texture, uv).r - iso_threshold);
}

vec2 gradient( vec2 x ) {
    float epsilon = 2.0 / float(resolution);
    vec2 h = vec2( epsilon, 0.0 );
    return vec2( brushValue(x+h.xy) - brushValue(x-h.xy),
                 brushValue(x+h.yx) - brushValue(x-h.yx) )/(2.0*h.x);
}

float brushPreview( vec2 x ) {
    float v = brushValue( x );
    vec2  g = gradient( x );
    float de = abs(v)/length(g);
    return max(0.0, 1.0 - smoothstep( 0.0, 0.002, de ));
}

void main() {

    vec3 bg_color = texture2D(background_texture, v_uv).rgb;
    vec3 color = mix(bg_color*layer_tint, brush_color, getValue(v_uv));
    vec3 spec = highlight_color * highlight_strength * pow(clamp(dot(calculateNormal(), normalize(vec3(1.0, 1.0, 1.2))), 0.0, 1.0), specular_power);

    vec3 image = spec + color;

    float brush_alpha = 0.0;
    if (show_brush_preview == 1) {
      float brush_preview = brushPreview(v_uv);
      brush_alpha = 1.0 * brush_preview;
    }

    vec3 display = mix(image, vec3(1.0), brush_alpha);
    gl_FragColor = vec4(display, 1.0);
}
