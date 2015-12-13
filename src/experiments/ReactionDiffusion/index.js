var Experiment = require('../../core/Experiment');
var ShaderParameter = require('../../core/ShaderParameter');
var Trigger = require('../../core/Trigger');
var Parameter = require('../../core/Parameter');
var ParameterGroup = require('../../core/ParameterGroup');
var THREE = require('../../lib/three');
var DisplayFrag = require('./shaders/Display.frag');
var ComputeFrag = require('./shaders/Compute.frag');
var SharedVert = require('./shaders/Shared.vert');
import TextureUtils from './TextureUtils';
import ReactionDiffusionBrush from './sim-brushes/ReactionDiffusionBrush';

var exp = new Experiment("Reaction Diffusion");

var SIM_RESOLUTION = 512;

var mouse = { pressed: false, x: 1, y: 1 };
var vector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();

var display = {
  mesh: null,
  camera: null,
  material: null,
  buffer: [],
  shaderParameters: {
    "background_texture": {
      type: 't',
      value: null
    },
    "data_texture": {
      type: 't',
      value: null
    },
    "layer_tint": {
      type: 'c',
      value: (new THREE.Color(0xFFFFFF))
    },
    "brush_color": {
      type: 'c',
      value: (new THREE.Color(0x0064aa))
    },
    "highlight_color": {
      type: 'c',
      value: (new THREE.Color(0x0064aa))
    },
    "resolution": {
      type: 'i',
      value: SIM_RESOLUTION,
      hidden: true
    },
    "specular_power": {
      type: 'f',
      value: 5.0,
      min: 2.0,
      max: 128.0
    },
    "highlight_strength": {
      type: 'f',
      value: 1.0,
      min: 0.0,
      max: 8.0
    },
  }
};

function clearSimulation() {
  exp.brush.reset();
}

function clearCanvas() {
  exp.brush.reset();
  TextureUtils.clearBuffers(exp.context, display.buffer);
}

function floodCanvas() {
  TextureUtils.clearBuffers(exp.context, display.buffer, display.shaderParameters.brush_color.value);
}

function capture() {
  exp.context.renderer.render( exp.context.scene, exp.brush.camera, display.renderTexture, true );
  TextureUtils.swapBuffers(display.buffer);
  display.renderTexture = display.buffer[0];
  display.shaderParameters.background_texture.value = display.buffer[1];
  clearSimulation();
}

exp.setup = function(context) {
  this.context = context;
  this.brush = new ReactionDiffusionBrush();
  this.brush.init(context, SIM_RESOLUTION);

  setupParameters();

  initDisplay(context);

  var canvas = context.container;
  $(canvas).mousemove(onMouseMove);
  $(canvas).mouseup(onMouseUp);
  $(canvas).mousedown(onMouseDown);
};

exp.dispose = function(context) {
  this.context = null;
  this.brush.dispose();
  this.brush = null;
};

exp.update = function(dt) {
  vector.set(mouse.x, mouse.y, 0.1).unproject(display.camera);
  raycaster.ray.set(display.camera.position,  vector.sub(display.camera.position).normalize());
  var intersections = raycaster.intersectObject(display.mesh);
  var intersection = intersections.length > 0 && intersections[0];

  if (intersection) {
    this.brush.isDrawing = mouse.pressed;
    this.brush.draw(intersection.point)
  }

  if (!mouse.pressed)
    this.brush.isDrawing = mouse.pressed;

  this.brush.update(dt);
  display.shaderParameters.data_texture.value = exp.brush.output;
};

exp.render = function(context) {
  context.renderer.render(context.scene, context.camera);
}

function initDisplay(context) {
  display.camera = context.camera;
  context.camera.position.z = 1;
  var geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  geo.computeTangents();
  geo.computeVertexNormals();
  display.shaderParameters.data_texture.value = exp.brush.output;
  display.shaderParameters.data_texture.needsUpdate = true;

  display.material = new THREE.MeshBasicMaterial({color:0xFF0000});
  display.material = new THREE.ShaderMaterial({
    uniforms: display.shaderParameters,
    vertexShader: SharedVert,
    fragmentShader: DisplayFrag
  });

  display.mesh = new THREE.Mesh(geo, display.material);
  context.scene.add(display.mesh);

  display.buffer.push(new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, TextureUtils.renderTextureSettings));
  display.buffer.push(new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, TextureUtils.renderTextureSettings));
  display.renderTexture = display.buffer[0];
  display.shaderParameters.background_texture.value = display.buffer[1];

  TextureUtils.clearBuffers(exp.context, display.buffer);
}

function onMouseUp(event) {
    mouse.pressed = false;
    event.preventDefault();
}

function onMouseDown(event) {
    mouse.pressed = true;
    event.preventDefault();
}

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.offsetX / event.target.clientWidth) * 2 - 1;
    mouse.y =  1 - (event.offsetY / event.target.clientHeight) * 2;
}

/// Parameters
function setupParameters() {
  var displayGroupParams = ShaderParameter.fromUniformHash(display.shaderParameters);

  // Parameter groups
  var brushParams = [];
  {
    displayGroupParams = displayGroupParams.filter(function(param) {
      if (param.name.startsWith('brush'))
        brushParams.push(param);
      else return true;
    });

    brushParams.concat(exp.brush.parameters);
    brushParams.push(new Trigger("New Layer", capture, 'space'));
    brushParams.push(new Trigger("Clear Current Layer", clearSimulation, 'c'));
    brushParams.push(new Trigger("Clear Canvas", clearCanvas, 'x'));
    brushParams.push(new Trigger('Flood Canvas', floodCanvas, 'f'));
  }

  var brushGroup = new ParameterGroup("Brush", {active: true, parameters: brushParams});
  exp.addParameter(brushGroup);

  var displayGroup = new ParameterGroup("Display", {active: true, parameters: displayGroupParams});
  exp.addParameter(displayGroup);
}

module.exports = exp;
