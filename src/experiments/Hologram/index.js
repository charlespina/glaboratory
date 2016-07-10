import Experiment from '../../core/Experiment';
import BloomFrag from './shaders/Bloom.frag';
import BloomVert from '../common/Standard.vert';
import HologramFrag from './shaders/Hologram.frag';
import HologramVert from '../common/StandardTBN.vert';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import OBJLoader from '../../lib/OBJLoader';
import modelUrl from 'file!./geometry/KingKong.obj';
import THREE from 'three';
import thumbnail from './hologram.png';

/*
import '../../lib/postprocessing/EffectComposer';
import '../../lib/postprocessing/RenderPass';
import '../../lib/postprocessing/ShaderPass';
*/

class Hologram extends Experiment {
  constructor() {
    super("Hologram");
    this.thumbnail = thumbnail;
    this.description = "A hologram shader";
    this.uniforms = {
      time: {
        type: 'f',
        value: 0.0,
        hidden: true,
      },
      fresnelIntensity: {
        type: 'f',
        value: 1.0,
        min: 0.0,
        max: 10.0,
      },
      fresnelColor: {
        type: 'c',
        value: new THREE.Color(0x1664DC), //0x6E1FDC), //0x08D7CE),
      },
      lightIntensity: {
        type: 'f',
        value: 0.4,
        min: 0.0,
        max: 10.0,
      },
      lightColor: {
        type: 'c',
        value: new THREE.Color(0xFF4F36), // 0xFFAC41),
      },
      diffuseColor: {
        type: 'c',
        value: new THREE.Color(0xFFFFFF),
      }
    };
  }

  setup(context) {
    var material = new THREE.ShaderMaterial({
      fragmentShader: HologramFrag,
      vertexShader: HologramVert,
      uniforms: this.uniforms,
    });

    const loader = new OBJLoader();
    loader.load(modelUrl, (object)=> {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
          child.geometry.computeVertexNormals();
        }
      });
      object.position.x = -100;
      object.position.y = -100;
      object.scale.x = 2;
      object.scale.y = 2;
      object.scale.z = 2;
      context.scene.add(object);
    },
    ()=> {
      /* progress */
    },
    (err)=> {
      /* error */
      console.error("error loading object:", error);
    });

    this.addParameters(ShaderParameter.fromUniformHash(this.uniforms));

    /*
    this.composer = new THREE.EffectComposer(context.renderer);
    this.passes = {
      renderPass: new THREE.RenderPass(context.scene, context.camera),
      bloom: new THREE.ShaderPass({
        vertexShader: BloomVert,
        fragmentShader: BloomFrag,
        uniforms: {
          tDiffuse: {
            type: 't',
            value: null,
          }
        },
      })
    }
    this.composer.addPass(this.passes.renderPass);
    this.composer.addPass(this.passes.bloom);
    */
  }

  update(dt) {
    this.uniforms.time.value += dt;
    // this.uniforms.time;
  }

  /* render() {
    this.composer.render();
  } */
}


module.exports = new Hologram();
