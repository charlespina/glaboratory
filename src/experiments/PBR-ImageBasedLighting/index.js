import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import THREE from 'three';
import iblMapUrl from '../HDR/textures/Newport_Loft_Ref.hdr';
import { generateImageBasedLight } from '../common/ibl/ImageBasedLightGenerator';
import PBRFrag from '../common/ibl/PhysicallyBased.frag';
import PBRVert from '../common/StandardRawTBN.vert';
import TrackballControls from '../../lib/TrackballControls';

class PBRIBL extends Experiment {
  constructor() {
    super("PBR with IBL");
    this.thumbnail = "images/test.png";
    this.description = "Physically based rendering, with an image based light.";
    this.uniforms = {
      base_color_constant: {
        type: 'c',
        value: new THREE.Color(0x006AA4),
      },
      roughness_constant: {
        type: 'f',
        value: 0.25,
      },
      metalicity: {
        type: 'f',
        value: 0.0,
      },
      specular_level: {
        type: 'f',
        value: 0.04,
        min: 0.02,
        max: 0.08,
      },
      light_color: {
        type: 'c',
        value: new THREE.Color(0xFFFFFF),
      },
      light_direction: {
        type: 'c',
        value: new THREE.Color(0xCCCCCC),
      },
      light_intensity: {
        type: 'f',
        value: 1.0,
      },
      use_textures: {
        type: 'i',
        value: 0,
        min: 0,
        max: 1,
      },
      brdf_map: {
        type: 't',
        value: null,
      },
      ibl_map: {
        type: 't',
        value: null,
      },
      ibl_exposure: {
        type: 'f',
        value: 1.0,
        min: 0.0,
        max: 3.0,
      },
    };
  }

  setup(context) {
    generateImageBasedLight(context, iblMapUrl).then(({ ibl, brdf })=> {
      this.uniforms.ibl_map.value = ibl;
      this.uniforms.ibl_map.needsUpdate = true;

      this.uniforms.brdf_map.value = brdf;
      this.uniforms.brdf_map.needsUpdate = true;
    });


    this.addParameters(ShaderParameter.fromUniformHash(this.uniforms));

    var geo = new THREE.SphereGeometry(100, 64, 64);
    var material = new THREE.RawShaderMaterial({
      vertexShader: PBRVert,
      fragmentShader: PBRFrag,
      uniforms: this.uniforms,
    });
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
    const controls = new TrackballControls( context.camera, context.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    //controls.addEventListener('change', ()=>context.render());
  }

  update(dt) {
    this.t = (this.t||0) + dt;
    this.mesh.position.y = Math.sin(this.t/5000 * Math.PI) * 20;
  }
}


module.exports = new PBRIBL();
