var Experiment = require('../../core/Experiment');
var ShaderParameter = require('../../core/ShaderParameter');
var Trigger = require('../../core/Trigger');
var Parameter = require('../../core/Parameter');
var ParameterGroup = require('../../core/ParameterGroup');
var THREE = require('../../lib/three');
var DisplayFrag = require('./shaders/Display.frag');
var ComputeFrag = require('./shaders/Compute.frag');
var SharedVert = require('./shaders/Shared.vert');

var exp = new Experiment("Reaction Diffusion");

var SIM_RESOLUTION = 512;
var SYMMETRY_MODES = {
  NONE: {name:'No Symmetry', value:0},
  HORIZONTAL: {name:'Horizontal Symmetry', value:1},
  VERTICAL: {name:'Vertical Symmetry', value:2},
  RADIAL_SYMMETRY: {name:'Radial Symmetry', value: 3},
};
var DEFAULT_SYMMETRY_MODE=SYMMETRY_MODES.RADIAL_SYMMETRY;

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
    "hilight_color": {
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

var compute = {
  camera: null,
  scene: null,
  material: null,
  mesh: null,
  data: null,
  initialTexture: null,
  renderTexture: null,
  buffer: [],
  renderTextureParameters: {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RenderTargetWrapping,
    wrapT: THREE.RenderTargetWrapping,
    format: THREE.RGBFormat,
    stencilBuffer: false,
    depthBuffer: false,
    type: THREE.FloatType
  },
  shaderParameters: {
    "time": {
      type: 'f',
      value: 0.0,
      hidden: true
    },
    "delta_time": {
      type: 'f',
      value: 0.0,
      hidden: true
    },
    "resolution": {
      type: 'i',
      value: SIM_RESOLUTION,
      hidden: true
    },
    "brush_softness": {
      type: 'f',
      value: 0.0,
      min: 0.0,
      max: 1.0
    },
    "brush_width": {
      type: 'f',
      value: 10.0,
      min: 1.0,
      max: SIM_RESOLUTION/5.0
    },
    "brush_position": {
      type: 'v2',
      value: new THREE.Vector2(),
      hidden: true
    },
    "brush_active": {
      type: 'i',
      value: false,
      hidden: true
    },
    "A_diffuse": {
      type: 'f',
      min: 0.0,
      max: 1.0,
      value: 1.0
    },
    "B_diffuse": {
      type: 'f',
      min: 0.0,
      max: 1.0,
      value: 0.5
    },
    "A_feed_rate": {
      type: 'f',
      min: 0.0,
      max: 0.1,
      value: 0.0545
    },
    "B_kill_rate": {
      type: 'f',
      min: 0.0,
      max: 0.1,
      value: 0.062
    },
    "symmetry_mode": {
      type: 'i',
      value: DEFAULT_SYMMETRY_MODE.value,
      hidden: true
    },
    "data_texture": {
      type: 't',
      value: null
    }
  }
};

function clearSimulation() {
  clearBuffers(compute.buffer);
}

function clearCanvas() {
  clearBuffers(compute.buffer);
  clearBuffers(display.buffer);
}

function floodCanvas() {
  clearBuffers(display.buffer, display.shaderParameters.brush_color.value);
}

function capture() {
  exp.context.renderer.render( exp.context.scene, compute.camera, display.renderTexture, true );
  swapBuffers(display.buffer);
  exp.context.renderer.render( exp.context.scene, compute.camera, display.renderTexture, true );

  display.renderTexture = display.buffer[0];
  display.shaderParameters.background_texture.value = display.buffer[1];
  clearSimulation();
}



exp.setup = function(context) {
  this.context = context;
  initCompute();
  initDisplay(context);

  var canvas = context.container;
  $(canvas).mousemove(onMouseMove);
  $(canvas).mouseup(onMouseUp);
  $(canvas).mousedown(onMouseDown);
};

exp.dispose = function(context) {
  this.context = null;
};

exp.update = function(dt) {
  vector.set(mouse.x, mouse.y, 0.1).unproject(display.camera);
  raycaster.ray.set(display.camera.position,  vector.sub(display.camera.position).normalize());
  var intersections = raycaster.intersectObject(display.mesh);
  var intersection = intersections.length > 0 && intersections[0];
  if (intersection) {
    // TODO: do brush in separate shader?
    compute.shaderParameters.brush_position.value = intersection.point;
    compute.shaderParameters.brush_position.needsUpdate = true;

    if (mouse.pressed) {
      compute.shaderParameters.brush_active.value = true;
      compute.shaderParameters.brush_active.needsUpdate = true;
    }
  }

  if (!mouse.pressed) {
    compute.shaderParameters.brush_active.value = false;
    compute.shaderParameters.brush_active.needsUpdate = true;
  }

  compute.shaderParameters.time.value += 0.01;
  compute.shaderParameters.time.needsUpdate = true;

  compute.shaderParameters.delta_time.value = 1.0; // KS says dt = 1.0 works well. may want to scale up actual dt
  compute.shaderParameters.delta_time.needsUpdate = true;
};

exp.render = function(context) {
  // update computation
  for(var steps=0; steps<speedParam.getValue(); steps++) {
    stepSim(context.renderer);
  }
  context.renderer.render(context.scene, context.camera);
}

///

function initDisplay(context) {
  display.camera = context.camera;
  context.camera.position.z = 1;
  var geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  geo.computeTangents();
  geo.computeVertexNormals();
  display.shaderParameters.data_texture.value = compute.renderTexture;
  display.material = new THREE.MeshBasicMaterial({color:0xFF0000});
  display.material = new THREE.ShaderMaterial({
    uniforms: display.shaderParameters,
    vertexShader: SharedVert,
    fragmentShader: DisplayFrag
  });

  display.mesh = new THREE.Mesh(geo, display.material);
  context.scene.add(display.mesh);

  display.buffer.push(new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, compute.renderTextureParameters));
  display.buffer.push(new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, compute.renderTextureParameters));
  display.renderTexture = display.buffer[0];
  display.shaderParameters.background_texture.value = display.buffer[1];

  clearBuffers(display.buffer);

  // DEBUG
  /*
  var geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });
  display.mesh = new THREE.Mesh(geo, material);
  context.scene.add(display.mesh);
  */
}

function clearBuffers(buffers, clearColor) {
  buffers.forEach(function(RTT) {
    var previousClearColor = exp.context.renderer.getClearColor();
    if (clearColor)
      exp.context.renderer.setClearColor(clearColor);
    exp.context.renderer.clearTarget(RTT, true);
    if (clearColor)
      exp.context.renderer.setClearColor(previousClearColor);
  });
}

function swapBuffers(buffers) {
  var tmp = buffers[1];
  buffers[1] = buffers[0];
  buffers[0] = tmp;
}

function createMesh() {
  if (compute.mesh) {
    compute.scene.remove(compute.mesh);
  }

  compute.material = new THREE.ShaderMaterial({
    uniforms: compute.shaderParameters,
    vertexShader: SharedVert,
    fragmentShader: ComputeFrag
  });

  // compute.material = new THREE.MeshBasicMaterial({color: new THREE.Color(0xFF0000)});

  var geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  geometry.computeTangents();
  geometry.computeVertexNormals();

  // geometry.computeTangents();
  compute.mesh = new THREE.Mesh(geometry, compute.material);
  compute.scene.add(compute.mesh);
}

function initData() {
  compute.data = new Float32Array(SIM_RESOLUTION*SIM_RESOLUTION*3);
  for(var x=0; x<SIM_RESOLUTION; x++) {
    for(var y=0; y<SIM_RESOLUTION; y++) {
      var s = x/SIM_RESOLUTION;
      var t = y/SIM_RESOLUTION;
      var middle = Math.sqrt(Math.pow(0.5-s, 2) + Math.pow(0.5-t, 2)) < 0.03;
      compute.data[(x + SIM_RESOLUTION * y)*3 + 0] = 1.0;
      compute.data[(x + SIM_RESOLUTION * y)*3 + 1] = middle? 1.0 : 0.0;
      compute.data[(x + SIM_RESOLUTION * y)*3 + 2] = 0.0;
    }
  }
  return new THREE.DataTexture(compute.data, SIM_RESOLUTION, SIM_RESOLUTION, THREE.RGBFormat, THREE.FloatType);
}

function stepSim(renderer) {
  renderer.render( compute.scene, compute.camera, compute.renderTexture, true );
  swapBuffers(compute.buffer);
  compute.renderTexture = compute.buffer[0];
  display.shaderParameters.data_texture.value = compute.buffer[0];
  compute.shaderParameters.data_texture.value = compute.buffer[1];
}

function initCompute() {
  // create data for sim, attach to shader input
  compute.initialTexture = initData();

  compute.buffer[0]  = new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, compute.renderTextureParameters);
  compute.buffer[1] = new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, compute.renderTextureParameters);
  compute.renderTexture = compute.buffer[0];

  compute.shaderParameters.data_texture.value = compute.initialTexture;
  compute.initialTexture.needsUpdate = true;

  compute.renderTexture = compute.buffer[0];
  compute.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
  compute.camera.position.z = 2;
  compute.scene = new THREE.Scene();
  createMesh();
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

var displayGroupParams = ShaderParameter.fromUniformHash(display.shaderParameters);
var computeGroupParams = ShaderParameter.fromUniformHash(compute.shaderParameters);
{
  var speedParam = new Parameter("Speed", {type:'i', value:5, min:1, max:20});
  computeGroupParams.push(speedParam);
  computeGroupParams.push(new Trigger("New Layer", capture, 'space'));
  computeGroupParams.push(new Trigger("Clear Current Layer", clearSimulation, 'c'));
  computeGroupParams.push(new Trigger("Clear Canvas", clearCanvas, 'x'));
}

// Parameter groups
var brushParams = [];
{
  displayGroupParams = displayGroupParams.filter(function(param) {
    if (param.name.startsWith('brush'))
      brushParams.push(param);
    else return true;
  });

  computeGroupParams = computeGroupParams.filter(function(param) {
    if (param.name.startsWith('brush'))
      brushParams.push(param);
    else return true;
  });

  brushParams.push(new Trigger('Flood Canvas', floodCanvas, 'f'));

  brushParams.push(new Parameter("Axis of Symmetry", {
    value: DEFAULT_SYMMETRY_MODE,
    type: 'choice',
    choices: [
      SYMMETRY_MODES.NONE,
      SYMMETRY_MODES.HORIZONTAL,
      SYMMETRY_MODES.VERTICAL,
      SYMMETRY_MODES.RADIAL_SYMMETRY
    ],
    onChange: function(newValue) {
      compute.shaderParameters.symmetry_mode.value = newValue.value;
      compute.shaderParameters.symmetry_mode.needsUpdate;
    }
  }));
}

var brushGroup = new ParameterGroup("Brush", {active: true, parameters: brushParams});
exp.addParameter(brushGroup);

var displayGroup = new ParameterGroup("Display", {active: true, parameters: displayGroupParams});
exp.addParameter(displayGroup);

var computeGroup = new ParameterGroup("Simulation", {active: true, parameters: computeGroupParams});
exp.addParameter(computeGroup);

module.exports = exp;
