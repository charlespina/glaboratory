var Experiment = require('./Experiment');
var ShaderParameter = require('./ShaderParameter');
var Parameter = require('./Parameter');
var OBJLoader = require('../lib/OBJLoader');
var THREE = require('../lib/three');
var vertShader = require('./shaders/pbr.vert');
var fragShader = require('./shaders/pbr.frag');

var uniforms = {
  "t": {
    type: 'f',
    value: 0.0,
    hidden: true,
  },
  "normal_map": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/fuse_char_Normal.png")
  },
  "use_textures": {
    type: 'i',
    value: 0,
    min: 0,
    max: 1,
    step: 1,
  },
  "roughness_constant": {
    type: 'f',
    value: 0.5,
    min: 0.0,
    max: 1.0
  },
  "roughness_boost": {
    type: 'f',
    hidden: true,
    value: 0,
    min: 0,
    max: 1
  },
  "roughness_gain": {
    type: 'f',
    value: 1,
    hidden: true,
    min: 0,
    max: 2
  },
  "roughness_map": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/fuse_char_Roughness.png")
  },
  "metalicity": {
    type: 'f',
    min: 0,
    max: 1,
    value: 0
  },
  "specular_level": {
    type: 'f',
    min: 0,
    max: 0.08,
    value: 0.04
  },
  "base_color_map": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/fuse_char_BaseColor.png")
  },
  "base_color_constant": {
    type: 'c',
    value: (new THREE.Color(0x49389B))
  },
  "light_intensity": {
    type: 'f',
    min: 0,
    max: 10,
    value: 1
  },
  "light_color": {
    type: 'c',
    value: new THREE.Color(0xFFFFFF) //(new THREE.Color(0x0064aa))
  },
  "light_direction": {
    type: 'c',
    value: (new THREE.Color(0xFFFFFF))
  },
};

var exp = new Experiment("Physically Based Rendering");

exp.addParameters(ShaderParameter.fromUniformHash(uniforms));
exp.setup = function(context) {
  // context.camera = new THREE.PerspectiveCamera( 20, context.getWidth() / context.getHeight(), 0.1, 100);
  // context.camera.position.z = 1;
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
  });

  var geo = new THREE.SphereGeometry(100, 64, 46);
  geo.computeTangents();

  /*context.camera = new THREE.PerspectiveCamera(70,
    context.getWidth() / context.getHeight(), 1, 300);*/
  context.camera.position.z = 200;

  this.mesh = new THREE.Mesh(geo, material);
  context.scene.add(this.mesh);
};

exp.update = function(dt) {
  this.mesh.rotation.y += 0.010;
};

module.exports = exp;
