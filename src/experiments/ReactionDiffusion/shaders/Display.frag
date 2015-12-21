uniform sampler2D background_texture;
uniform sampler2D data_texture;
uniform vec3 layer_tint;
uniform vec3 brush_color;
uniform int resolution;
uniform vec3 highlight_color;
uniform float highlight_strength;
uniform float specular_power;

varying vec2 v_uv;

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

void main() {
    vec3 bg_color = texture2D(background_texture, v_uv).rgb;
    vec3 color = mix(bg_color*layer_tint, brush_color, getValue(v_uv));

    vec3 spec = highlight_color * highlight_strength * pow(clamp(dot(calculateNormal(), normalize(vec3(1.0, 1.0, 1.2))), 0.0, 1.0), specular_power);
    gl_FragColor = vec4(spec + color, 1.0);
}
