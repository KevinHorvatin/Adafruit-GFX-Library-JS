
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