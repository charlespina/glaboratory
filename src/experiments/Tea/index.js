import Experiment from '../../core/Experiment';
import Trigger from '../../core/Trigger';
import THREE from 'three';
import simpleVert from './shaders/simple.vert';
import cupFrag from './shaders/cup.frag';
import glowFrag from './shaders/glow.frag';
import fluidFrag from './shaders/fluid.frag';
import $ from 'jquery';

var Solver = require('./Solver');
var ColorMap = require('./ColorMap');

Number.prototype.clamp = function(low, high) {
    return Math.min(Math.max(low, this), high);
}

Number.prototype.lerp = function(low, high) {
    return (1.0-this)*low + this * high;
}

// TODO: keyboard controls
// cup shading
// more lights
// PBR shading, why not!
// spoon
// ice cubes
var mouseX = null, mouseY = null;


function updateTexture(solver, texture, colorMap, imageData) {
    for(var i=1; i<=solver.N; i++) {
        for(var j=1; j<=solver.N; j++) {
            var x = i-1;
            var y = j-1;
            var color = colorMap.sample(solver.density.values[i][j]);
            imageData[(x + solver.N * y)*3 + 0] = color[0];
            imageData[(x + solver.N * y)*3 + 1] = color[1];
            imageData[(x + solver.N * y)*3 + 2] = color[2];
        }
    }

    texture.needsUpdate = true;
}

class Tea extends Experiment {
  constructor() {
    super("Tea Cup");
    this.thumbnail = "images/tea.png";
    this.description = "A fluid dynamic simulation of Thai Iced Tea.";
  }

  onMouseMove(event) {
    var bbox = event.target.getBoundingClientRect();
    var newMouseX = (event.clientX - bbox.left)/(bbox.right - bbox.left);
    var newMouseY = (event.clientY - bbox.top)/(bbox.bottom - bbox.top);

    // remap to fit cup area
    var startX = 0.33;
    var endX = 0.66;
    newMouseX = ((newMouseX.clamp(startX, endX) - startX)/(endX-startX)).lerp(0.22, 0.52);

    mouseX = mouseX || newMouseX;
    mouseY = mouseY || newMouseY;

    var dx = newMouseX - mouseX;
    var dy = newMouseY - mouseY;

    mouseX = newMouseX;
    mouseY = newMouseY;

    var x = Math.floor(mouseX * this.solver.N);
    var y = Math.floor(mouseY * this.solver.N);
    this.solver.inject(x, y, 0.0, 50.0, dx*this.solver.N, dy*this.solver.N);
  }

  initData() {
    this.solver.reset();

    var size = (this.solver.N+2)^2;
    for(var i=0; i<this.solver.N+2; i++) {
      for(var j=0; j<this.solver.N+2; j++) {
        var t = 1.0 - j/this.solver.N;
        this.solver.density.values[i][j] = this.densityColorMap.sample(t)[0];
      }
    }
  }

  setup(context) {
    var N = 128; // resolution of sim
    this.imageData = new Float32Array(N*N*3);

    this.scene = context.scene;
    this.context = context;
    this.context.camera = new THREE.PerspectiveCamera(30, context.getWidth() / context.getHeight(), 1, 10);
    this.context.camera.position.z = 2;

    // compute setup
    this.cameraRTT = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    this.cameraRTT.position.z = 2;
    this.sceneRTT = new THREE.Scene();
    this.renderTexture = new THREE.WebGLRenderTarget(512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
    this.dataTexture = new THREE.DataTexture(this.imageData, N, N, THREE.RGBFormat, THREE.FloatType);
    this.dataTexture.needsUpdate = true;
    this.solver = new Solver(N, 0.0, 0.0005);

    {
      var dataMaterial = new THREE.MeshBasicMaterial({ map: this.dataTexture });
      var plane = new THREE.PlaneGeometry(1, 1, 1, 1); // TODO: make this resize on screen resize
      var quad = new THREE.Mesh(plane, dataMaterial);
      this.sceneRTT.add(quad);
    }

    // Background
    {
        var bgTex = THREE.ImageUtils.loadTexture("textures/rainbow-nebula-big.jpg");
        var scale = 2.5;
        var aspect = 1.6/scale;

        var bgGeo = new THREE.PlaneGeometry(500, 500); //scale, scale*aspect);
        // var bgGeo = new THREE.SphereGeometry(100, 64, 64);

        var bgMaterial = new THREE.MeshBasicMaterial({
          map: bgTex,
          depthWrite: false,
          side: THREE.DoubleSide
        });

        //var bgMesh = new THREE.Mesh(bgGeo, bgMaterial);
        var bgMesh = new THREE.Mesh(bgGeo, bgMaterial);
        context.scene.add(bgMesh);
    }

    // Glow
    {
        var size = 500;
        var glowMat = new THREE.ShaderMaterial({
            vertexShader: simpleVert,
            fragmentShader: glowFrag,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });
        var glowGeo = new THREE.PlaneGeometry(size, size, 1, 1);
        var glowMesh = new THREE.Mesh(glowGeo, glowMat);
        context.scene.add(glowMesh);
    }

    // Tea
    {
      var teaMat = new THREE.ShaderMaterial({
          vertexShader: simpleVert,
          fragmentShader: fluidFrag,
          uniforms: {
              "texture": {
                  type: "t",
                  value: this.renderTexture
              },
              "reflection": {
                  type: "t",
                  value: THREE.ImageUtils.loadTexture("textures/rainbow-nebula-sphere-blur.jpg")
              }
          }
      });

      var teaGeo = new THREE.CylinderGeometry(0.3, 0.2, 0.8, 32, 2, true);
      var teaMesh = new THREE.Mesh(teaGeo, teaMat);
      teaMesh.rotation.y = 180;
      context.scene.add(teaMesh);
    }

    // Cup
    {
      var cupMaterial = new THREE.ShaderMaterial({
          vertexShader: simpleVert,
          fragmentShader: cupFrag,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          uniforms: {
              "texture": {
                  type: "t",
                  value: THREE.ImageUtils.loadTexture("textures/rainbow-nebula-sphere.jpg")
              }
          }
      });
      var cupGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.82, 32, 2, true);
      var cupMesh = new THREE.Mesh(cupGeo, cupMaterial);
      context.scene.add(cupMesh);
    }

    // Create color map for the tea/milk gradient
    this.vizColorMap = new ColorMap();
    this.vizColorMap.addColorStop(0.0, 0, 0, 0);
    this.vizColorMap.addColorStop(0.3, 69.0/255.0, 36.0/255.0, 7.0/255.0);
    this.vizColorMap.addColorStop(1.0, 1.0, 1.0, 1.0);

    // Create color map defining initial data breakdown
    this.densityColorMap = new ColorMap();
    this.densityColorMap.addColorStop(0.0, 0, 0, 0);
    this.densityColorMap.addColorStop(0.8, 0.5, 0.5, 0.5);
    this.densityColorMap.addColorStop(0.803, 1.0, 1.0, 1.0);

    this.initData();

    this.addParameter(new Trigger("Reset Simulation", ()=>this.initData(), 'r'));

    // Events
    // TODO: figure out mouse/keyboard events for Experiments
    document.addEventListener('mousemove', (e)=>this.onMouseMove(e), false);
  }

  render(context) {
    context.renderer.clear();
    context.renderer.render(this.sceneRTT, this.cameraRTT, this.renderTexture, true);
    context.renderer.render(this.scene, this.context.camera);
  }

  update(dt) {
    this.solver.step(dt);
    updateTexture(this.solver, this.dataTexture, this.vizColorMap, this.imageData);
  }
}

module.exports = new Tea();
