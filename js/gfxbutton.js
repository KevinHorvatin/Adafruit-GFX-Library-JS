/***************************************************************************/
// code for the GFX button UI element
var GFXButton = function() {
	this.gfx = 0;
}

GFXButton.prototype.initButton = function(gfx,
					   x,  y, 
					  w, h, 
					   outline,  fill, 
					   textcolor,
					  label, textsize)
{
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.outlinecolor = outline;
  this.fillcolor = fill;
  this.textcolor = textcolor;
  this.textsize = textsize;
  this.gfx = gfx;
  strncpy(this.label, label, 9);
  this.label[9] = 0;
}

 

 GFXButton.prototype.drawButton = function(inverted) {
    var fill, outline, text;

   if (! inverted) {
     fill = this.fillcolor;
     outline = this.outlinecolor;
     text = this.textcolor;
   } else {
     fill =  this.textcolor;
     outline = this.outlinecolor;
     text = this.fillcolor;
   }

   this.gfx.fillRoundRect(this.x - (this.w/2), this.y - (this.h/2), this.w, this.h, min(this.w,this.h)/4, fill);
   this.gfx.drawRoundRect(this.x - (this.w/2), this.y - (this.h/2), this.w, this.h, min(this.w,this.h)/4, outline);
   
   
   this.gfx.setCursor(this.x - strlen(this.label)*3*this.textsize, this.y-4*this.textsize);
   this.gfx.setTextColor(text);
   this.gfx.setTextSize(this.textsize);
   this.gfx.print(this.label);
 }

GFXButton.prototype.contains = function( x,  y) {
   if ((x < (this.x - this.w/2)) || (x > (this.x + this.w/2))) return false;
   if ((y < (this.y - this.h/2)) || (y > (this.y + this.h/2))) return false;
   return true;
 }


GFXButton.prototype.press = function(p) {
   this.laststate = this.currstate;
   this.currstate = p;
 }
 
GFXButton.prototype.isPressed = function() { return this.currstate; }
GFXButton.prototype.justPressed = function() { return (this.currstate && !this.laststate); }
GFXButton.prototype.justReleased = function() { return (!this.currstate && this.laststate); }

module.exports = GFXButton;