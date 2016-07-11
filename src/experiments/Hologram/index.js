import Experiment from '../../core/Experiment';
import CompositeAddFrag from './shaders/CompositeAdd.frag';
import GaussianBlurHFrag from './shaders/GaussianBlurH.frag';
import GaussianBlurVFrag from './shaders/GaussianBlurV.frag';
import HighPassFrag from './shaders/HighPass.frag';
import CopyPassFrag from './shaders/CopyPass.frag';
import StandardVert from '../common/Standard.vert';
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

class RenderPipeline {
  constructor(renderer) {
    this.renderer = renderer;
    const {width, height} = this.renderer.getSize();
    this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      maxFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    });
    this.writeBuffer = this.readBuffer.clone();
    this.passes = [];
    this.copyPass = new ShaderPass({
      fragmentShader: CopyPassFrag,
    });
  }

  copy(dest) {
    const tmpWrite = this.writeBuffer;
    this.writeBuffer = dest;
    this.copyPass.render(this, 0);
    this.writeBuffer = tmpWrite;
  }

  addPass(pass) {
    this.passes.push(pass);
  }

  resize(w, h) {
    if (this.width == w && this.height == h) return;

    this.width = w;
    this.height = h;
    this.readBuffer.setSize(this.width, this.height);
    this.writeBuffer.setSize(this.width, this.height);
    this.passes.forEach((pass)=> {
      pass.setSize(this.width, this.height);
    });
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  render(dt) {
    this.passes.forEach((pass) => {
      pass.render(this, dt);
      this.swapBuffers();
    });
  }
}

class RenderPass {
  setSize(w, h) {}
  render(pipeline, dt) {
    throw new Error("Not yet implemented");
  }
}

class SceneRenderPass extends RenderPass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
  }

  render(pipeline, dt) {
    pipeline.renderer.render(this.scene, this.camera, pipeline.writeBuffer);
  }
}

class ShaderPass extends RenderPass {
  constructor({vertexShader=StandardVert, fragmentShader, uniforms, renderToScreen=false, textureName="texture"}) {
    super();
    this.uniforms = uniforms ? uniforms : { texture: { type: 't', value: null }};
    this.material = new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms: this.uniforms});
    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.material);
    this.renderToScreen = renderToScreen;
    this.scene.add(this.quad);
    this.textureName = textureName;
  }

  render(pipeline, dt) {
    this.material.uniforms[this.textureName].value = pipeline.readBuffer;
    this.material.uniforms[this.textureName].needsUpdate = true;
    pipeline.renderer.render(this.scene, this.camera, this.renderToScreen ? null : pipeline.writeBuffer);
  }
}

class HighPass extends ShaderPass {
  constructor(thresholdValue=0.5, ...args) {
    super(Object.assign({}, ...args, {
      fragmentShader: HighPassFrag,
      uniforms: {
        texture: {
          type: 't',
          value: null,
        },
        threshold: {
          type: 'f',
          value: thresholdValue,
        },
      },
    }));
  }
}

class GaussianBlur extends ShaderPass {
  constructor(width, height, type='vertical', ...args) {
    const uniforms = {
      texture: {
        type: 't',
        value: null,
      },
      resolution: {
        type: '2f',
        value: new THREE.Vector2(width, height),
      },
      strength: {
        type: 'f',
        value: 0.0,
      },
    };
    super(Object.assign({}, ...args, {
      fragmentShader: type=='vertical' ? GaussianBlurVFrag : GaussianBlurHFrag,
      uniforms,
    }));
    this.uniforms = uniforms;
  }

  setSize(w, h) {
    this.uniforms.resolution.value.set(w, h);
    this.uniforms.resolution.value.needsUpdate = true;
  }
}

class BloomPass extends ShaderPass {
  constructor(renderer, {renderToScreen=true}) {
    const uniforms = {
      textureA: {
        type: 't',
        value: null,
      },
      textureB: {
        type: 't',
        value: null,
      },
      strengthA: {
        type: 'f',
        value: 1.0,
      },
      strengthB: {
        type: 'f',
        value: 1.0,
      },
    };

    super({
      fragmentShader: CompositeAddFrag,
      uniforms,
      renderToScreen,
      textureName: "textureA"
    });

    this.uniforms = uniforms;
    this.bloomPipeline = new RenderPipeline(renderer);
    this.bloomPipeline.addPass(new HighPass(0.4));
    // this.bloomPipeline.addPass(new GaussianBlur(this.bloomPipeline.width, this.bloomPipeline.height, 'vertical'));
    // this.bloomPipeline.addPass(new GaussianBlur(this.bloomPipeline.width, this.bloomPipeline.height, 'horizontal'));
    this.setSize(renderer.width, renderer.height);
  }

  setSize(w, h) {
    this.bloomPipeline.resize(w, h);
  }

  render(pipeline, dt) {
    pipeline.copy(this.bloomPipeline.readBuffer);
    this.bloomPipeline.render(dt);
    this.uniforms.textureB.value = this.bloomPipeline.readBuffer;
    this.uniforms.textureB.needsUpdate = true;
    super.render(pipeline, dt);
  }
}

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

    this.pipeline = new RenderPipeline(context.renderer);
    this.pipeline.addPass(new SceneRenderPass(context.scene, context.camera));
    this.pipeline.addPass(new BloomPass(context.renderer, { renderToScreen: true, }));
  }

  update(dt) {
    this.dt = dt;
    this.uniforms.time.value += dt;
  }

  resize(context) {
    this.pipeline.resize(context.width, context.height);
  }

  render() {
    this.pipeline.render(this.dt);
  }
}


module.exports = new Hologram();
