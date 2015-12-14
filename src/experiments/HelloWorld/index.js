import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
var THREE = require('../../lib/three');

var helloWorld = new Experiment("Testing");

helloWorld.addParameter(new Parameter("Test param", { type: 'i', value: 1 }));
helloWorld.addParameter(new Parameter("Test paramaamamama", { type: 'f', value: 2 }));

helloWorld.setup = function(context) {
  var geo = new THREE.SphereGeometry(100, 64, 64);
  var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });
  this.mesh = new THREE.Mesh(geo, material);
  context.scene.add(this.mesh);
};

helloWorld.update = function(dt) {
  this.t = (this.t||0) + dt;
  this.mesh.position.y = Math.sin(this.t/5000 * Math.PI) * 20;
};

module.exports = helloWorld;
