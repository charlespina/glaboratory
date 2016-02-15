import request from 'superagent';
import parseHdr from './parseHdr';
import THREE from 'three';

export default function loadHdrTexture(url) {
  request.parse['application/octet-stream'] = (obj) => {
    return obj;
  };

  const promise = new Promise((resolve, reject) => {
    request.get(url)
    .on('request', function () {
      this.xhr.responseType = 'arraybuffer'; 
    })
    .end((err, res) => {
      if (err) {
        return reject(err);
      }

      const hdr = parseHdr(res.body);
      const tex = new THREE.DataTexture(hdr.data, hdr.shape[0], hdr.shape[1], THREE.RGBAFormat, THREE.FloatType)
      resolve(tex);
    });
  });

  return promise;
};
