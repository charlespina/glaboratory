import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
var THREE = require('../../lib/three');

class HelloWorld extends Experiment {
  constructor() {
    super("Hello World");
    this.addParameter(new Parameter("Test param", { type: 'i', value: 1 }));
    this.addParameter(new Parameter("Test paramaamamama", { type: 'f', value: 2 }));
    this.thumbnail = "images/test.png";
    this.description = "A test showing basic experiment functionality.";
  }

  setup(context) {
    var geo = new THREE.SphereGeometry(100, 64, 64);
    var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF00FF) });
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
  }

  update(dt) {
    this.t = (this.t||0) + dt;
    this.mesh.position.y = Math.sin(this.t/5000 * Math.PI) * 20;
  }
}


module.exports = new HelloWorld();
