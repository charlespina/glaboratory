import Compute from "../common/compute/Compute";
import ImageBasedLightGenerator from "../common/ibl/ImageBasedLightGenerator";
import Painter from "./Painter";
import HeightPainter from "./HeightPainter";
import BrushMode from "./BrushMode";
import BrushTip from "./BrushTip";
import envMapSource from '../HDR/textures/Newport_Loft_Ref.hdr';
import standardVert from "../common/StandardRaw.vert";
import displayFrag from "./shaders/Texture.frag";
import normalMap from "./textures/rocky-NM.jpg";
import paintNormalFrag from "./shaders/PaintNormal.frag";
import pbrFrag from "./shaders/PhysicallyBased.frag";
import pbrVert from "./shaders/PhysicallyBased.vert";


import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import THREE from 'three';

class MatterPaint extends Experiment {
  constructor() {
    super("Matter Paint");
    /* TODO: add parameters
    this.addParameter(new Parameter("Test param", { type: 'i', value: 1 }));
    this.addParameter(new Parameter("Test paramaamamama", { type: 'f', value: 2 }));
    */
    this.thumbnail = "images/test.png";
    this.description = "Painting";
  }

  setup(context) {
    context.camera = this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    this.renderSystem = context;
    this.camera.position.z = 2;
    this.resolution = 1024;
    this.mouse = {
      x: 0, y: 0, pressed: false,
    };
    this.raycaster = new THREE.Raycaster();
    this.vector = new THREE.Vector3();
    this.vector2 = new THREE.Vector2();

    // Display
    const plane = new THREE.PlaneGeometry(1, 1, 1, 1);
    plane.computeVertexNormals();
    this.displayUniforms = {
      use_textures: { type: 'i', value: 1 },
      roughness_map: { type: 't', value: undefined },
      metalicity_map: { type: 't', value: undefined },
      base_color_map: { type: 't', value: undefined },
      normal_map: { type: 't', value: THREE.ImageUtils.loadTexture(normalMap) },
      brdf_map: { type: 't', value: undefined },
      ibl_map: { type: 't', value: undefined },
      roughness_gain: { type: 'f', value: 1.0 },
      roughness_boost: { type: 'f', value: 0 },
      light_intensity: { type: 'f', value: 1.0 },
      light_color: { type: 'c', value: new THREE.Color(0xFFFFFF) },
      light_direction: { type: 'c', value: new THREE.Color(0xccFF00)},
      specular_level: { type: 'f', value: 0.04 },
    };
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: pbrFrag,
      vertexShader: pbrVert,
      uniforms: this.displayUniforms,
    });

    // generate IBL, BRDF
    const iblGen = new ImageBasedLightGenerator(this.renderSystem, envMapSource);
    iblGen.promise.then((result)=> {
      const uniforms = this.material.uniforms;
      uniforms.ibl_map.value = result;
      uniforms.ibl_map.needsUpdate = true;
      uniforms.brdf_map.value = iblGen.brdf;
      uniforms.brdf_map.needsUpdate = true;
    }).catch((e) => {
      console.error(e);
      throw e;
    });

    this.quad = new THREE.Mesh(plane, this.material);
    context.scene.add(this.quad);


    // Brush tip which feeds all painters
    this.brushTip = new BrushTip(this.renderSystem, this.resolution);

    // Create painters, and map to corresponding textures
    const baseColorPainter = new Painter(this.brushTip, this.renderSystem, this.resolution, {
      initialColor: new THREE.Color(0xFFFFFF),
      brushColor: new THREE.Color(0xFFFFFF)
    });

    const roughnessPainter = new Painter(this.brushTip, this.renderSystem, this.resolution, {
      initialColor: new THREE.Color(0xFF0000),
      brushColor: new THREE.Color(0x000000),
    });

    const metalPainter = new Painter(this.brushTip, this.renderSystem, this.resolution, {
      initialColor: new THREE.Color(0x000000),
      brushColor: new THREE.Color(0xFF0000),
    });

    const heightPainter = new HeightPainter(this.brushTip, this.renderSystem, this.resolution, {
      initialColor: new THREE.Color(0x000000),
      initialAlpha: 0.0,
      brushHeight: 0.05,
      brushMode: BrushMode.ADD
    });

    const normalPainter = new Painter(this.brushTip, this.renderSystem, this.resolution, {
      initialColor: new THREE.Color(0x000000),
      fragmentShader: paintNormalFrag,
    });

    this.painters = [
      baseColorPainter,
      roughnessPainter,
      metalPainter,
      // normalPainter,
      // heightPainter,
    ];
    // this.painters = this.heightPainters;

    this.uniformPaintMap = {
      base_color_map: baseColorPainter,
      roughness_map: roughnessPainter,
      metalicity_map: metalPainter,
      // normal_map: normalPainter,
      // normal_map: heightPainter,
    };

    this.setTexturesToCurrentPaintValues();

    var canvas = context.container;
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  setTexturesToCurrentPaintValues() {
    Object.keys(this.uniformPaintMap).forEach((uniformName) => {
      const painter = this.uniformPaintMap[uniformName];
      this.displayUniforms[uniformName].value = painter.output;
      this.displayUniforms[uniformName].needsUpdate = true;
    });
  }

  update(dt) {
    if (this.mouse.dirty) {
      this.updateBrushPosition();
      this.brushTip.update();
      this.mouse.dirty = false;


      this.painters.forEach((painter)=> {
        painter.run();
      });


      this.setTexturesToCurrentPaintValues();
    }
    // this.displayUniforms.texture_map.value = this.painters[0].output;
    // this.displayUniforms.texture_map.needsUpdate = true;
    // this.painters[0].compute.renderToScreen();
    // this.brushTip.compute.renderToScreen();
  }

  render(context) {
    // super.render(context);
    this.painters[2].compute.renderToScreen();
    // do nossink!
  }

  onMouseDown(e) {
    e.preventDefault();
    this.mouse.pressed = true;
    this.brushTip.beginStroke();
  }

  onMouseUp(e) {
    e.preventDefault();
    this.mouse.pressed = false;
    this.brushTip.endStroke();
  }

  onMouseMove(e) {
    e.preventDefault();
    this.mouse.x = (e.offsetX / e.target.clientWidth) * 2 - 1;
    this.mouse.y =  - (e.offsetY / e.target.clientHeight) * 2 + 1;
    this.mouse.dirty = true;
  }

  updateBrushPosition() {
    this.vector.set(this.mouse.x/2, this.mouse.y/2, 0.1);
    this.brushTip.setBrushPosition(this.vector);
  }
}

export default new MatterPaint();
