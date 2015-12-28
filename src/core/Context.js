var THREE = require('./../lib/three');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

// events:
// scene-setup - called once when the context is first initialized
// update(delta_time, context) - called once per frame, with time since last update, and context
// render(context) - called once per frame
// dispose - called when the context is about to be destroyed

class Context extends EventEmitter {
  constructor(container) {
    super();
    this.container = container;
    this.isPaused = false;

    this.init();

    this.renderer = new THREE.WebGLRenderer();
    $(this.container).append(this.renderer.domElement);
    this.resize();

    this.time = new Date();

    this.emit('scene-setup');

    // setup render callbacks
    this.animate();
  }

  init() {
    var aspect = this.getWidth()/this.getHeight();
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    this.camera.position.z = 400;
    this.scene = new THREE.Scene();
  }

  setPaused(v) {
    this.isPaused = v;
  }

  dispose() {
    this.emit('dispose', this);
    this.removeAllListeners();
    this.disposed = true;
    this.renderer.dispose();
  }

  resize() {
    this.renderer.setSize(this.getWidth(), this.getHeight());
    this.camera.aspect = this.getWidth()/this.getHeight();
    this.camera.updateProjectionMatrix();
  }

  renderDefaultCamera() {
    if (this.renderer)
      this.renderer.render(this.scene, this.camera);
  }

  animate() {
    if (this.disposed)
      return;

    requestAnimationFrame(this.animate.bind(this));

    if (this.isPaused)
      return;

    var now = new Date();
    this.emit('update', (now - this.time)/1000.0, this);

    if (!this.emit('render', this))
      this.renderDefaultCamera();

    this.time = now;
  }

  getWidth() {
    return $(this.container).innerWidth();
  }

  getHeight() {
    return $(this.container).innerHeight();
  }
}

export default Context;
