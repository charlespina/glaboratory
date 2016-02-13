// requires fn to be provided on require.

#pragma glslify: gradient = require('../../common/math/gradient2d.glsl', fn = fn)

float contour( int resolution, vec2 x ) {
    vec2 g = gradient(resolution, x);
    float v = fn( x );
    float de = abs(v)/length(g);
    return max(0.0, 1.0 - smoothstep( 0.0, 0.002, de ));
}

#pragma glslify: export(contour)
