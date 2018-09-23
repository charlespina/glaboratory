import Experiment from '../../core/Experiment';
import ShaderParameter from '../../core/ShaderParameter';
import Trigger from '../../core/Trigger';
import Parameter from '../../core/Parameter';
import ParameterGroup from '../../core/ParameterGroup';
import TextureUtils from '../common/TextureUtils';
import BrushTip from '../common/painting/BrushTip';
import ReactionDiffusionBrush from './sim-brushes/ReactionDiffusionBrush';
import PaintBrush from '../common/painting/PaintBrush';
import THREE from 'three';
var DisplayFrag = require('./shaders/Display.frag');
var SharedVert = require('../common/painting/shaders/Shared.vert');

var SIM_RESOLUTION = 512;
var IMAGE_RESOLUTION = 1024;

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
    "brush_texture": {
      type: 't',
      value: null
    },
    "show_brush_preview": {
      type: 'i',
      value: 1,
      hidden: true
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


class ReactionDiffusion extends Experiment {
  constructor() {
    super("Reaction Diffusion");
    this.thumbnail = "images/reaction-diffusion.png";
    this.description = "A painting application using a reaction diffusion simulation.";
  }

  clearSimulation() {
    this.brush.reset();
  }

  clearCanvas() {
    this.brush.reset();
    TextureUtils.clearBuffers(this.context, display.buffer);
  }

  floodCanvas() {
    TextureUtils.clearBuffers(this.context, display.buffer, display.shaderParameters.brush_color.value);
  }

  showBrushPreview(val) {
    display.shaderParameters.show_brush_preview.value = val ? 1 : 0;
    display.shaderParameters.show_brush_preview.needsUpdate = true;
  }

  capture() {
    this.showBrushPreview(false);
    this.context.renderer.render( this.context.scene, this.brush.camera, display.renderTexture, true );
    TextureUtils.swapBuffers(display.buffer);
    display.renderTexture = display.buffer[0];
    display.shaderParameters.background_texture.value = display.buffer[1];
    this.clearSimulation();
  }

  setup(context) {
    this.context = context;
    this.brush = new ReactionDiffusionBrush(context, SIM_RESOLUTION);
    // this.brush = new PaintBrush(context, SIM_RESOLUTION);
    this.brushTip = new BrushTip(context, SIM_RESOLUTION);
    this.brush.connectBrushTip(this.brushTip);

    this.setupParameters();

    this.initDisplay(context);

    var canvas = context.container;
    $(canvas).on('mousemove', onMouseMove);
    $(canvas).on('mouseup', onMouseUp);
    $(canvas).on('mousedown', onMouseDown);
  }

  dispose(context) {
    var canvas = context.container;
    $(canvas).off('mousemove', onMouseMove);
    $(canvas).off('mouseup', onMouseUp);
    $(canvas).off('mousedown', onMouseDown);

    this.context = null;

    this.brushTip.dispose();
    this.brushTip = null;

    this.brush.dispose();
    this.brush = null;
  }

  update(dt) {
    vector.set(mouse.x, mouse.y, 0.1).unproject(display.camera);
    raycaster.ray.set(display.camera.position,  vector.sub(display.camera.position).normalize());
    var intersections = raycaster.intersectObject(display.mesh);
    var intersection = intersections.length > 0 && intersections[0];

    if (intersection) {
      this.brushTip.isDrawing = mouse.pressed
      this.brushTip.draw(intersection.point);
      this.brush.isDrawing = mouse.pressed;
      this.brush.draw(intersection.point);
    }

    if (!mouse.pressed) {
      this.brushTip.isDrawing = mouse.pressed;
      this.brush.isDrawing = mouse.pressed;
    }

    this.showBrushPreview(intersection && !mouse.pressed);

    this.brushTip.update(dt);
    this.brush.update(dt);
    display.shaderParameters.data_texture.value = this.brush.output;
  }

  render(context) {
    context.renderer.render(context.scene, context.camera);
  }

  initDisplay(context) {
    display.camera = context.camera;
    context.camera.position.z = 1;
    var geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    geo.computeVertexNormals();
    display.shaderParameters.data_texture.value = this.brush.output;
    display.shaderParameters.data_texture.needsUpdate = true;

    display.shaderParameters.brush_texture.value = this.brushTip.output;
    display.shaderParameters.brush_texture.needsUpdate = true;

    display.material = new THREE.MeshBasicMaterial({color:0xFF0000});
    display.material = new THREE.ShaderMaterial({
      uniforms: display.shaderParameters,
      vertexShader: SharedVert,
      fragmentShader: DisplayFrag
    });

    display.mesh = new THREE.Mesh(geo, display.material);
    context.scene.add(display.mesh);

    if (display.buffer.length == 0) {
      display.buffer.push(new THREE.WebGLRenderTarget(IMAGE_RESOLUTION, IMAGE_RESOLUTION, TextureUtils.renderTextureSettings));
      display.buffer.push(new THREE.WebGLRenderTarget(IMAGE_RESOLUTION, IMAGE_RESOLUTION, TextureUtils.renderTextureSettings));
    }
    display.renderTexture = display.buffer[0];
    display.shaderParameters.background_texture.value = display.buffer[1];

    TextureUtils.clearBuffers(this.context, display.buffer);
  }

  setupParameters() {
    this.clearParameters();
    var displayGroupParams = ShaderParameter.fromUniformHash(display.shaderParameters);

    // Parameter groups
    var brushParams = [];
    {
      displayGroupParams = displayGroupParams.filter(function(param) {
        if (param.name.startsWith('brush'))
          brushParams.push(param);
        else return true;
      });

      brushParams = brushParams.concat(this.brushTip.parameters);
      brushParams = brushParams.concat(this.brush.parameters);
      brushParams.push(new Trigger("New Layer", ()=> this.capture(), 'space'));
      brushParams.push(new Trigger("Clear Current Layer", ()=> this.clearSimulation(), 'c'));
      brushParams.push(new Trigger("Clear Canvas", ()=> this.clearCanvas(), 'x'));
      brushParams.push(new Trigger('Flood Canvas', ()=> this.floodCanvas(), 'f'));
    }

    var brushGroup = new ParameterGroup("Brush", {active: true, parameters: brushParams});
    this.addParameter(brushGroup);

    var displayGroup = new ParameterGroup("Display", {active: true, parameters: displayGroupParams});
    this.addParameter(displayGroup);
  }
}

export default new ReactionDiffusion();
