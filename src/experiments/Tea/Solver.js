var Field = function(N) {
    this.N = N;
    this.values = new Array(N+2);
    for(var i=0; i<this.values.length; i++) {
        this.values[i] = new Array(N+2);
        for (var j=0; j<N+2; j++) {
            this.values[i][j] = 0.0;
        }
    }
};

Field.prototype.swap = function(other) {
    var tmp = other.values;
    other.values = this.values;
    this.values = tmp;
};

Field.prototype.clear = function() {
    for (var i=0; i<this.values.length; i++) {
        for (var j=0; j<this.values.length; j++) {
            this.values[i][j] = 0;
        }
    }

};

Field.prototype.addSource = function(source, dt) {
    for (var i=0; i<this.values.length; i++)
    {
        for (var j=0; j<this.values.length; j++)
        {
            this.values[i][j] += dt*source.values[i][j];
        }
    }
};

Field.prototype.setBoundary = function(b) {
    var N = this.N;

    for (var i=1; i<=N; i++) {
        this.values[0][i]   = (b == 1 ? -1.0: 1.0) * this.values[1][i];
        this.values[N+1][i] = (b == 1 ? -1.0: 1.0) * this.values[N][i];
        this.values[i][0]   = (b == 2 ? -1.0: 1.0) * this.values[i][1];
        this.values[i][N+1] = (b == 2 ? -1.0: 1.0) * this.values[i][N];
    }

    this.values[0][0]     = 0.5 * (this.values[1][ 0 ] + this.values[ 0 ][1]);
    this.values[0][N+1]   = 0.5 * (this.values[1][N+1] + this.values[ 0 ][N]);
    this.values[N+1][0]   = 0.5 * (this.values[N][ 0 ] + this.values[N+1][1]);
    this.values[N+1][N+1] = 0.5 * (this.values[N][N+1] + this.values[N+1][N]);
};

var Solver = function(N, diff, visc) {
    this.N = N;
    this.diff = diff || 0.0;
    this.visc = visc || 0.0;
    this.u  = new Field(this.N);
    this.u_prev = new Field(this.N);
    this.v  = new Field(this.N);
    this.v_prev = new Field(this.N);
    this.density = new Field(this.N);
    this.density_prev = new Field(this.N);
};

Solver.prototype.reset = function() {
    this.u.clear();
    this.u_prev.clear();
    this.v.clear();
    this.v_prev.clear();
    this.density.clear();
    this.density_prev.clear();
};

Solver.prototype.inject = function(x, y, density, force, dx, dy) {
    this.u_prev.values[x][y] = force * dx;
    this.v_prev.values[x][y] = force * dy;
    this.density_prev.values[x][y] = density;
}

Solver.prototype.linearSolve = function(x, x0, b, a, c) {
    for (var k=0; k<20; k++) {
        for (var i=1; i<=this.N; i++) {
            for (var j=1; j<=this.N; j++) {
                x.values[i][j] = (x0.values[i][j] +
                    a*(x.values[i-1][j] + x.values[i+1][j] +
                       x.values[i][j-1] + x.values[i][j+1]))/c;
            }
        }
        x.setBoundary(b);
    }
};

Solver.prototype.diffuse = function(x, x0, b, diff, dt) {
    var a = dt*diff*this.N*this.N;
    this.linearSolve(x, x0, b, a, 1+4*a);
};

Solver.prototype.advect = function(d, d0, u, v, b, dt) {
    var i0, j0, i1, j1;
    var x, y, s0, t0, s1, t1, dt0;
    var N = this.N;

    dt0 = dt*N;

    for(var i=1; i<=this.N; i++) {
        for(var j=1; j<=this.N; j++) {
            x = i - dt0*u.values[i][j];
            y = j - dt0*v.values[i][j];
            if (x<0.5) x=0.5;
            if (x>N+0.5) x=N+0.5;
            i0 = Math.floor(x); i1 = i0+1;

            if (y<0.5) y=0.5;
            if (y>(N+0.5)) y = N+0.5;
            j0 = Math.floor(y); j1 = j0+1;

            s1 = x-i0; s0 = 1-s1; t1 = y-j0; t0 = 1-t1;
            d.values[i][j] = s0*(t0*d0.values[i0][j0] + t1*d0.values[i0][j1]) +
                             s1*(t0*d0.values[i1][j0] + t1*d0.values[i1][j1]);
        }
    }

    d.setBoundary(b);
};

Solver.prototype.project = function(u, v, p, div) {
    var i, j;

    for(i=1; i<=this.N; i++) {
        for(j=1; j<=this.N; j++) {
            div.values[i][j] = -0.5*(u.values[i+1][j]-u.values[i-1][j]+v.values[i][j+1]-v.values[i][j-1])/this.N;
            p.values[i][j] = 0;
        }
    }

    div.setBoundary(0);
    p.setBoundary(0);

    this.linearSolve(p, div, 0, 1, 4);

    for(i=1; i<=this.N; i++) {
        for(j=1; j<=this.N; j++) {
            u.values[i][j] -= 0.5*this.N*(p.values[i+1][j]-p.values[i-1][j]);
            v.values[i][j] -= 0.5*this.N*(p.values[i][j+1]-p.values[i][j-1]);
        }
    }

    u.setBoundary(1);
    v.setBoundary(2);
};

Solver.prototype.densityStep = function(x, x0, u, v, diff, dt) {
    x.addSource(x0, dt);
    x0.swap(x);
    this.diffuse(x, x0, 0, diff, dt);
    x0.swap(x);
    this.advect(x, x0, u, v, 0, dt);
};

Solver.prototype.velocityStep = function(u, v, u0, v0, visc, dt) {
    u.addSource(u0, dt);
    v.addSource(v0, dt);
    u0.swap(u);
    this.diffuse(u, u0, 1, visc, dt);
    v0.swap(v);
    this.diffuse(v, v0, 2, visc, dt);
    this.project(u, v, u0, v0);
    u0.swap(u);
    v0.swap(v);
    this.advect(u, u0, u0, v0, 1, dt);
    this.advect(v, v0, u0, v0, 2, dt);
    this.project(u, v, u0, v0);
};

Solver.prototype.step = function(dt) {
    dt = dt || 0.05;
    this.velocityStep(this.u, this.v, this.u_prev, this.v_prev, this.visc, dt);
    this.densityStep(this.density, this.density_prev, this.u, this.v, this.diff, dt);

    // density_prev must be cleared between runs
    this.density_prev.clear();
    this.u_prev.clear();
    this.v_prev.clear();
};

export default Solver;
