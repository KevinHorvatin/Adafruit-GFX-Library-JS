
var CanvasGFX = function(canvasId) {
    this.canvasElem = document.getElementById(canvasId);
	this.context = this.canvasElem.getContext("2d");
	this.WIDTH = this.canvasElem.width;
	this.HEIGHT = this.canvasElem.height;
}

CanvasGFX.prototype = Object.create(GFX.prototype);

CanvasGFX.prototype.drawPixel = function(x, y, color) {
	console.log('drawPixel: ('+x+','+y+')');
	this.context.fillStyle = color;
	this.context.fillRect(x, y, 1, 1);
}

CanvasGFX.prototype.drawBitmap = function(x, y, files) {
  for (var i=0; i < files.length; i++) {
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    var buffer = reader.readAsBinaryString(file);
    var bmObj = new BmpDecoder(buffer);
    this.drawImageFromArray(x, y, bmpObj.data, bmpObj.height, bmpObj.width);
  }
}
