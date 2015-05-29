var Experiment = require('./Experiment');
var ShaderParameter = require('./ShaderParameter');
var Parameter = require('./Parameter');
var OBJLoader = require('../lib/OBJLoader');
var THREE = require('../lib/three');
var vertShader = require('./shaders/pbr.vert');
var fragShader = require('./shaders/pbr.frag');

var uniforms = {
  "base_color": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/Brute-BaseColor.png")
  },
  "roughness": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/Brute-Roughness.png")
  },
  "normal_map": {
    type: 't',
    value: THREE.ImageUtils.loadTexture("textures/Brute-Normal.png")
  },
  "F0": { 
    type: 'f', 
    value: 0.04, 
    min: 0.0, 
    max: 0.08
  }
};

var exp = new Experiment("PBR");
var posZ = new Parameter("Z", {min:-1000, max:1000, value:0});
var posY = new Parameter("Y", {min:-1000, max:1000, value:0});
exp.addParameter(posZ);
exp.addParameter(posY);

exp.addParameters(ShaderParameter.fromUniformHash(uniforms));
exp.setup = function(context) {
  // context.camera = new THREE.PerspectiveCamera( 20, context.getWidth() / context.getHeight(), 0.1, 100);
  // context.camera.position.z = 1;
  var bodyMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    // attributes: {},
    vertexShader: vertShader,
    fragmentShader: fragShader
  });
  var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });


  var loader = new OBJLoader();
  loader.load("obj/BruteB.obj", function(obj) {
    var bounds = new THREE.Box3();
    console.log(obj);
    obj.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = bodyMaterial;
        //else if (child.name == "Face")
        //  child.material = faceMaterial;

        // update the character's overall bounding box
        child.geometry.computeBoundingBox();
        bounds.union(child.geometry.boundingBox);
      }
    });

    obj.scale.x = 100.0/(bounds.max.y - bounds.min.y);
    obj.scale.y = 100.0/(bounds.max.y - bounds.min.y);
    obj.scale.z = 100.0/(bounds.max.y - bounds.min.y);

    obj.position.z = -50.0;
    obj.position.y = -0.5;

    context.scene.add(obj);
  });

  var geo = new THREE.SphereGeometry(100, 64, 64);
  var sphere = new THREE.Mesh(geo, bodyMaterial);
  context.scene.add(sphere);

  posZ.onChange = function(value) {
    sphere.position.z = value;
  }

  posY.onChange = function(value) {
    sphere.position.y = value;
  }
};

exp.update = function(dt) {
};

module.exports = exp;
