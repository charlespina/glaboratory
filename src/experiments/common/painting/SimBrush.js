import * as THREE from 'three';
import TextureUtils from '../TextureUtils';

class SimBrush {
  constructor(context, resolution) {
    this.resolution = resolution;
    this.context = context;
    this.data;
    this.dataTexture;
    this.scene;
    this.thumbnail;
    this.material;
    this.output;
    this._isDrawing = false;
    this.parameters = [];
    this.buffer = [];
    this.init(context, resolution);
  }

  get isDrawing() {
    return this._isDrawing;
  }

  set isDrawing(val) {
    this._isDrawing = val;
  }

  getInitialValue(x, y) {
    return [0.0, 0.0, 0.0];
  }

  initData() {
    this.data = new Float32Array(this.resolution*this.resolution*3);
    for(var x=0; x<this.resolution; x++) {
      for(var y=0; y<this.resolution; y++) {
        var initVal = this.getInitialValue(x, y);
        this.data[(x + this.resolution * y)*3 + 0] = initVal[0];
        this.data[(x + this.resolution * y)*3 + 1] = initVal[1];
        this.data[(x + this.resolution * y)*3 + 2] = initVal[2];
      }
    }
    this.dataTexture = new THREE.DataTexture(this.data,
      this.resolution, this.resolution, THREE.RGBFormat, THREE.FloatType);
  }

  init(context, resolution, numBuffers = 2, needsInputData = false) {
    this.buffer = [];
    for (let i=0; i<numBuffers; i++) {
      this.buffer[i] = new THREE.WebGLRenderTarget(this.resolution, this.resolution,
        TextureUtils.renderTextureSettings);
    }

    if (needsInputData)
      this.initData();
    this.initUniforms();

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    this.material.derivitives = true;

    const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    geometry.computeVertexNormals()

    this.scene = new THREE.Mesh(geometry, this.material);
    this.output = this.buffer[0];

    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    this.camera.position.z = 2;

  }

  dispose() {
    // break cycle
    this.context = null;
    this.buffer.forEach(function(buffer) {
      buffer.dispose();
    });
    this.buffer = [];
  }

  // sim
  reset() {
    TextureUtils.clearBuffers(this.context, this.buffer);
  }

  setUniform(uniform, value) {
    uniform.value = value;
    uniform.needsUpdate = true;
  }

  // interface
  get uniforms() {
    throw new Error("Not implemented.");
  }

  get vertexShader() {
    throw new Error("Not implemented.");
  }

  get fragmentShader() {
    throw new Error("Not implemented.");
  }

  update(dt) {
    throw new Error("Not implemented.");
  }

  draw(x, y) {
    throw new Error("Not implemented.");
  }

  initUniforms() {
    throw new Error("Not implemented.");
  }

  // presets
  savePreset(name) {
    throw new Error("Not implemented.");
  }

  loadPreset(name) {
    throw new Error("Not implemented.");
  }

  getPresets() {
    throw new Error("Not implemented.");
  }

  removePreset(name) {
    throw new Error("Not implemented.");
  }
}

export default SimBrush;
