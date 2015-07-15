var Experiment = require('./Experiment');
var ShaderParameter = require('./ShaderParameter');
var Parameter = require('./Parameter');
var THREE = require('../lib/three');
var vertShader = require('./shaders/standard.vert');
var fragShader = require('./shaders/reflection_blur.frag');
var vdc = require('vdc');

var DIM = 32;
var N = DIM*DIM; // 1024

var createVanDerCorputSequenceData = function(N) {
  var vdcData = new Float32Array(N);

  var generator = vdc({n:0, b:2});
  for(var i=0; i<N; i++) {
    vdcData[i] = generator.next();
  }

  return vdcData;
};

var uniforms = {
  "vdc_map":{
    type: 't',
    value: new THREE.DataTexture(createVanDerCorputSequenceData(N), N, 1, THREE.LuminanceFormat, THREE.FloatType)
  },
  "reflection_map": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/reflection.png")
    //value: THREE.ImageUtils.loadTexture("textures/reflection2.gif")
  },
  "roughness_constant": {
    type: 'f',
    value: 0.5,
    min: 0.0,
    max: 1.0
  },
};

var exp = new Experiment("Reflection Blur");

exp.addParameters(ShaderParameter.fromUniformHash(uniforms));



exp.setup = function(context) {
  uniforms.vdc_map.value.needsUpdate = true;

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
  });

  var geo = new THREE.SphereGeometry(100, 64, 46);
  geo.computeTangents();

  context.camera.position.z = 200;

  this.mesh = new THREE.Mesh(geo, material);
  context.scene.add(this.mesh);
};

exp.update = function(dt) {
};

module.exports = exp;
