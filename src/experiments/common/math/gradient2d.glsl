/* param fn (in require): gradient2d will produce the gradient of fn.
 */

vec2 gradient2d( int resolution, vec2 x ) {
    float epsilon = 1.0 / float(resolution);
    vec2 h = vec2( epsilon, 0.0 );
    return vec2( fn(x+h.xy) - fn(x-h.xy),
                 fn(x+h.yx) - fn(x-h.yx) )/(2.0*h.x);
}

#pragma glslify: export(gradient2d)
