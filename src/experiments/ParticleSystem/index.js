import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import THREE from 'three';
import simulationVertShader from './shaders/Simulation.vert';
import simulationFragShader from './shaders/Simulation.frag';
import displayVertShader from './shaders/Display.vert';
import displayFragShader from './shaders/Display.frag';

class ParticleSystem extends Experiment {
  constructor() {
    super("Particle System");
    this.thumbnail = "images/test.png";
    this.description = "A test showing basic experiment functionality.";
  }

  setup(context) {
    const PARTICLE_BUFFER_DIMENSION = 128;
    const NUM_PARTICLES = PARTICLE_BUFFER_DIMENSION * PARTICLE_BUFFER_DIMENSION;

    const particles = {
      geo: new THREE.BufferGeometry(),
      simulation: {
        particle_cursor: 1,
        material: null,
      },
      vertices: {
        buffer: new Float32Array(NUM_PARTICLES * 3),
        location: null,
      },
      data: {
        buffer: new Float32Array(NUM_PARTICLES * 4),
        location: null,
      }
    };

    for (let i = 0; i< NUM_PARTICLES; i++) {
      particles.vertices[i * 3 + 0] = 0;
      particles.vertices[i * 3 + 1] = 0;
      particles.vertices[i * 3 + 2] = 0;

      particles.data[i * 4 + 0] = 1.0;
      particles.data[i * 4 + 1] = 1.0;
      particles.data[i * 4 + 2] = 1.0;
      particles.data[i * 4 + 3] = 1.0;
    }

    particles.geo.addAttribute('position', new THREE.BufferAttribute(particles.vertices.buffer, 3));
    particles.geo.addAttribute('data', new THREE.BufferAttribute(particles.data.buffer, 4));

    particles.vertices.location = particles.geo.getAttribute('position');
    particles.data.location = particles.geo.getAttribute('data');

    particles.simulation.material = new THREE.ShaderMaterial({
      vertexShader: simulationVertShader,
      fragmentShader: simulationFragShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    particles.mesh = new THREE.Points(particles.geo, particles.simulation.material);

    var geo = new THREE.PlaneGeometry(1, 1, 1);
    var material = new THREE.ShaderMaterial({
      vertexShader: displayVertShader,
      framentShader: displayFragShader,
    });
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
  }

  update(dt) {
  }
}

module.exports = new ParticleSystem();
