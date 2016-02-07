import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import THREE from 'three';
import simulationVertShader from './shaders/Simulation.vert';
import simulationFragShader from './shaders/Simulation.frag';
import displayVertShader from './shaders/Display.vert';
import displayFragShader from './shaders/Display.frag';

class Simulation {
  constructor(context, dim, numParticles) {
    this.dim = dim;
    this.numParticles = numParticles;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, -10);
    this.particleCursor = 1;
    this.context = context;

    const framebufferSettings = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RenderTargetWrapping,
      wrapT: THREE.RenderTargetWrapping,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      depthBuffer: false,
      type: THREE.FloatType
    };


    this.buffers = {
      previous: new THREE.WebGLRenderTarget(this.dim, this.dim, framebufferSettings),
      current:  new THREE.WebGLRenderTarget(this.dim, this.dim, framebufferSettings)
    };

    const quadGeo = new THREE.PlaneBufferGeometry(1, 1, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader: simulationVertShader,
      fragmentShader: simulationFragShader,
      uniforms: {
        uParticleData: {
          type: 't',
          value: null,
        },
        uAttractor: {
          type: 'v3',
          value: new THREE.Vector3(0., 0.25, 0.0),
        },
        uAttractionForce: {
          type: 'f',
          value: -0.1,
        },
      }
    });

    this.clearBuffers();
    this.initializeData();

    this.quad = new THREE.Mesh(quadGeo, this.material);
    this.scene.add(this.quad);

    // render once to stamp initial data into framebuffers
    this.render();
  }

  initializeData() {
    if (this.initialDataTexture === undefined) {
      const dataSize = 4 * this.dim * this.dim;
      const data = new Float32Array(dataSize);

      for(let x = 0; x < this.dim; x++) {
        for(let y = 0; y < this.dim; y++) {
          const index = (x*this.dim + y) * 4;
          data[index + 0] = x/this.dim * 2.0 - 1.0;
          data[index + 1] = y/this.dim * 2.0 - 1.0;
          data[index + 2] = 0.0; // ignore z for now
          data[index + 3] = 0.0; // ignore w for now
        }
      }
      this.initialDataTexture = new THREE.DataTexture(data, this.dim, this.dim, THREE.RGBAFormat, THREE.FloatType)
      this.initialDataTexture.needsUpdate = true;
    }

    this.setParticleData(this.initialDataTexture);
  }

  setParticleData(texture) {
    this.material.uniforms.uParticleData.value = texture;
    this.material.uniforms.uParticleData.needsUpdate = true;
  }

  update(dt) {
    this.setParticleData(this.buffers.current);
    this.render();
  }

  render() {
    this.context.renderer.render(this.scene, this.camera, this.buffers.previous);
    this.swapBuffers();
  }

  clearBuffer(buffer, clearColor) {
    const previousClearColor = this.context.renderer.getClearColor();
    if (clearColor) this.context.renderer.setClearColor(clearColor);
    this.context.renderer.clearTarget(buffer, true);
    if (clearColor) this.context.renderer.setClearColor(previousClearColor);
  }

  clearBuffers() {
    this.clearBuffer(this.buffers.current, 0x000000);
    this.clearBuffer(this.buffers.previous, 0x000000);
  }

  swapBuffers() {
    const tmp = this.buffers.current;
    this.buffers.current = this.buffers.previous;
    this.buffers.previous = tmp;
  }
}

class ParticleSystem extends Experiment {
  constructor() {
    super("Particle System");
    this.thumbnail = "images/test.png";
    this.description = "A test showing basic experiment functionality.";
  }

  setup(context) {
    const floatExtension = context.renderer.context.getExtension('OES_texture_float');
    const drawBuffersExtension = context.renderer.context.getExtension('WEBGL_draw_buffers');

    console.log('float extension: ', floatExtension);
    console.log('draw buffers extension: ', drawBuffersExtension); // not using yet, but one day

    const PARTICLE_DIM = 128;
    const NUM_PARTICLES = PARTICLE_DIM * PARTICLE_DIM;

    this.context = context;
    this.simulation = new Simulation(context, PARTICLE_DIM);
    this.display = {
      geo: new THREE.BufferGeometry(),
      vertices: {
        buffer: new Float32Array(NUM_PARTICLES * 3),
        location: null,
      },
      material: null,
      mesh: null,
    };

    const vertexBuffer = this.display.vertices.buffer;
    for (let x = 0; x < PARTICLE_DIM; x++) {
      for (let y = 0; y < PARTICLE_DIM; y++) {
        const index = (x * PARTICLE_DIM + y) * 3;
        vertexBuffer[index + 0] = x/PARTICLE_DIM;
        vertexBuffer[index + 1] = y/PARTICLE_DIM;
        vertexBuffer[index + 2] = 0.0;
      }
    }

    // draw vertices as points. lookup position in vertex shader
    //
    //
    this.display.geo.addAttribute('position', new THREE.BufferAttribute(this.display.vertices.buffer, 3));
    this.display.material = new THREE.ShaderMaterial({
      vertexShader: displayVertShader,
      fragmentShader: displayFragShader,
      uniforms: {
        uParticleData: {
          type: 't',
          value: null,
        },
      },
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.display.mesh = new THREE.Points(this.display.geo, this.display.material);
    this.display.mesh.frustumCulled = false;

    this.display.material.uniforms.uParticleData.value = this.simulation.buffers.current;
    this.display.material.uniforms.uParticleData.value.needsUpdate = true;

    context.scene.add(this.display.mesh);
  }

  update(dt) {
    this.simulation.update(dt);

    this.display.material.uniforms.uParticleData.value = this.simulation.buffers.current;
    this.display.material.uniforms.uParticleData.value.needsUpdate = true;
    this.display.material.uniforms.uParticleData.needsUpdate = true;
    // this.display.material.needsUpdate = true;

    // this.context.renderer.render(this.simulation.scene, this.simulation.camera);
  }

  render() {
    // do nothing
    // this.context.renderer.clear()
    this.context.renderer.render(this.context.scene, this.context.camera);
  }
}

module.exports = new ParticleSystem();
