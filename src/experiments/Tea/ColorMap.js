function lerp(a, b, t) {
  return (1-t)*a+t*b;
}

var ColorMap = function() {
  this.stops = [];
};

ColorMap.prototype.addColorStop = function(pos, r, g, b) {
  for(var i=0; i<this.stops.length; i++) {
    if (this.stops[i].pos > pos) {
      i++;
      break;
    }
  }

  this.stops[i] = {
    pos: pos,
    r: r,
    g: g,
    b: b
  };
}

ColorMap.prototype.sample = function(t) {
  var a=0, b=0;
  t = Math.min(1, Math.max(0, t));

  for(var i=0; i<this.stops.length; i++) {
    if (t < this.stops[i].pos) {
      a=i>0? i-1 : 0;
      b=i;
      break;
    }
  }

  if (b == 0) {
    a = b = this.stops.length - 1;
  }

  if (a==b) {
    return [this.stops[a].r, this.stops[a].g, this.stops[a].b];
  }

  var A=this.stops[a];
  var B=this.stops[b];
  var t1 = (t-A.pos)/(B.pos-A.pos);
  return [lerp(A.r, B.r, t1), lerp(A.g, B.g, t1), lerp(A.b, B.b, t1)];
};

module.exports = ColorMap;
