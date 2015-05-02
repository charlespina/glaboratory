var React = require('react');
var THREE = require('./../three');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var Context = function(container) {
  this.container = container;

  var aspect = this.getWidth()/this.getHeight();
  this.camera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
  this.camera.position.z = 400;

  this.renderer = new THREE.WebGLRenderer();
  $(this.container).append(this.renderer.domElement);
  this.resize();

  this.time = new Date();
  this.scene = new THREE.Scene();

  this.emit('scene-setup');

  // setup render callbacks
  $(window).resize(this.resize.bind(this));
  this.animate();
}

Context.prototype = assign(Context.prototype, EventEmitter.prototype);

Context.prototype.resize  = function() {
  this.renderer.setSize(this.getWidth(), this.getHeight());
  this.camera.aspect = this.getWidth()/this.getHeight();
  this.camera.updateProjectionMatrix();
}

Context.prototype.renderDefaultCamera = function() {
  this.renderer.render(this.scene, this.camera);
}

Context.prototype.animate = function() {
  setTimeout(requestAnimationFrame.bind(null, this.animate.bind(this)), 60);
  var now = new Date();
  this.emit('update', (now - this.time));
  if (!this.emit('render')) 
    this.renderDefaultCamera();
  this.time = now;
}

Context.prototype.getWidth = function() {
  return $(this.container).innerWidth();
}

Context.prototype.getHeight = function() {
  return $(this.container).innerHeight();
}

var WebGLView = React.createClass({
  render: function() {
    return <div className="context" ref="context" style={{width:"100%", height:"100%"}}></div>;
  },

  getContext: function() {
    return this.context;
  },

  componentDidMount: function() {
    this.context = new Context(this.refs.context.getDOMNode());
  },
});

module.exports = WebGLView;
