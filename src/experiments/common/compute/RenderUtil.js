import THREE from 'three';

/**
 * A utility class, housing a handful of useful texture and image functions.
 */
export default class RenderUtil {
  /**
   * @param {Number} width
   * @param {Number} height
   * @return {THREE.WebGLRenderTarget}
   */
  static createRenderTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
      }
    );
  }

  /**
   * @param {ThreeJsRenderSystem} renderSystem
   * @param {THREE.WebGLRenderTarget} texture - the texture which will be used to
   * create the resulting image.
   * @param {Number} width - the width of the texture.
   * @param {Number} height - the height of the texture.
   * @return {ImageData} - an ImageData object, which is compatible with canvas, and WebGL
   */
  static createImage(renderSystem, texture, width, height) {
    const webglProperties = new THREE.WebGLProperties();
    const renderTargetProperties = webglProperties.get(texture);
    // Read the contents of the framebuffer
    const data = new Uint8Array(width * height * 4);
    renderSystem.renderer.readRenderTargetPixels(texture, 0, 0, width, height, data);

    // This looks crazy.
    // gl.texImage2D takes a canvas or an image as its pixel buffer.
    // Using an Image is a bit hairy as well. You will need to create a Blob
    // from Uint8Array, and create a data URL from the Blob using
    // window.URL.createObjectURL then, create a new Image, and set its src to
    // the URL. finally, in a promise or callback, once src is loaded, return
    // the image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);
    imageData.data.set(data);

    return imageData;
  }
}
