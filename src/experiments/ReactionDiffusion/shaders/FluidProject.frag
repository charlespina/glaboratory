uniform float resolution;
uniform sampler2D velocity_x_texture;
uniform sampler2D velocity_y_texture;
uniform sampler2D density_texture;

// TODO: make this GPGPU-y

void project ( int N, float * u, float * v, float * p, float * div )
{
int i, j, k;
float h;
h = 1.0/N;
for ( i=1 ; i<=N ; i++ ) {
for ( j=1 ; j<=N ; j++ ) {
div[IX(i,j)] = -0.5*h*(u[IX(i+1,j)]-u[IX(i-1,j)]+
v[IX(i,j+1)]-v[IX(i,j-1)]);
p[IX(i,j)] = 0;
}
}
set_bnd ( N, 0, div ); set_bnd ( N, 0, p );
for ( k=0 ; k<20 ; k++ ) {
for ( i=1 ; i<=N ; i++ ) {
for ( j=1 ; j<=N ; j++ ) {
p[IX(i,j)] = (div[IX(i,j)]+p[IX(i-1,j)]+p[IX(i+1,j)]+
 p[IX(i,j-1)]+p[IX(i,j+1)])/4;
}
}
set_bnd ( N, 0, p );
}
for ( i=1 ; i<=N ; i++ ) {
for ( j=1 ; j<=N ; j++ ) {
u[IX(i,j)] -= 0.5*(p[IX(i+1,j)]-p[IX(i-1,j)])/h;
v[IX(i,j)] -= 0.5*(p[IX(i,j+1)]-p[IX(i,j-1)])/h;
}
}
set_bnd ( N, 1, u ); set_bnd ( N, 2, v );
}
