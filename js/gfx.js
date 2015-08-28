/*
FROM: adafruit/Adafruit-GFX-Library

This is the core graphics library for all our displays, providing a common
set of graphics primitives (points, lines, circles, etc.).  It needs to be
paired with a hardware-specific library for each display device we carry
(to handle the lower-level functions).

Adafruit invests time and resources providing this open source code, please
support Adafruit & open-source hardware by purchasing products from Adafruit!
 
Copyright (c) 2013 Adafruit Industries.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/

var GFX = function() {
	this.rotation = 0;
	this.cursor = {
		x: 0,
		y: 0
	}
	this.textSize = 1;
	this.textColor = this.textBgColor = 0xFFFF;
	this.wrap = true;
	this.cp437 = false;
  this.width = this.WIDTH;
  this.height = this.HEIGHT;
}

// Override these in subclass
// This is the actual size of the device
GFX.prototype.WIDTH = 0;
GFX.prototype.HEIGHT = 0;

// Virtual function that gets implemented
// in specific graphics driver
GFX.prototype.drawPixel = function() {
	console.log('Implement in subclass');
}

GFX.prototype.drawCircle = function(rect0, r, color) {
	console.log('drawCircle');
	var f = 1 - r;
	var ddF_x = 1;
	var ddF_y = -2 * r;
	var x = 0;
	var y = r;
	
	this.drawPixel(rect0.x, rect0.y+r, color);
  	this.drawPixel(rect0.x  , rect0.y-r, color);
  	this.drawPixel(rect0.x+r, rect0.y  , color);
  	this.drawPixel(rect0.x-r, rect0.y  , color);
	
	while (x < y) {
		if (f >= 0) {
			y--;
			ddF_y += 2;
			f += ddF_y;
		}
		x++;
		ddF_x += 2;
		f += ddF_x;
	
		this.drawPixel(rect0.x + x, rect0.y + y, color);
		this.drawPixel(rect0.x - x, rect0.y + y, color);
		this.drawPixel(rect0.x + x, rect0.y - y, color);
		this.drawPixel(rect0.x - x, rect0.y - y, color);
		this.drawPixel(rect0.x + y, rect0.y + x, color);
		this.drawPixel(rect0.x - y, rect0.y + x, color);
		this.drawPixel(rect0.x + y, rect0.y - x, color);
		this.drawPixel(rect0.x - y, rect0.y - x, color);
	}
}

GFX.prototype.drawCircleHelper = function(rect0, r, cornername, color) {
  var f     = 1 - r;
  var ddF_x = 1;
  var ddF_y = -2 * r;
  var x     = 0;
  var y     = r;

  while (x<y) {
    if (f >= 0) {
      y--;
      ddF_y += 2;
      f     += ddF_y;
    }
    x++;
    ddF_x += 2;
    f     += ddF_x;
    if (cornername & 0x4) {
      this.drawPixel(rect0.x + x, rect0.y + y, color);
      this.drawPixel(rect0.x + y, rect0.y + x, color);
    } 
    if (cornername & 0x2) {
      this.drawPixel(rect0.x + x, rect0.y - y, color);
      this.drawPixel(rect0.x + y, rect0.y - x, color);
    }
    if (cornername & 0x8) {
      this.drawPixel(rect0.x - y, rect0.y + x, color);
      this.drawPixel(rect0.x - x, rect0.y + y, color);
    }
    if (cornername & 0x1) {
      this.drawPixel(rect0.x - y, rect0.y - x, color);
      this.drawPixel(rect0.x - x, rect0.y - y, color);
    }
  }
}

GFX.prototype.fillCircle = function(rect0, r, color) {
  this.drawFastVLine(rect0.x, rect0.y-r, 2*r+1, color);
  this.fillCircleHelper(rect0.x, rect0.y, r, 3, 0, color);
}

// Used to do circles and roundrects
 GFX.prototype.fillCircleHelper = function( rect0,  r,
     cornername,  delta,  color) {

  var f     = 1 - r;
  var ddF_x = 1;
  var ddF_y = -2 * r;
  var x     = 0;
  var y     = r;

  while (x<y) {
    if (f >= 0) {
      y--;
      ddF_y += 2;
      f     += ddF_y;
    }
    x++;
    ddF_x += 2;
    f     += ddF_x;

    if (cornername & 0x1) {
      this.drawFastVLine(rect0.x+x, rect0.y-y, 2*y+1+delta, color);
      this.drawFastVLine(rect0.x+y, rect0.y-x, 2*x+1+delta, color);
    }
    if (cornername & 0x2.y) {
      this.drawFastVLine(rect0.x-x, rect0.y-y, 2*y+1+delta, color);
      this.drawFastVLine(rect0.x-y, rect0.y-x, 2*x+1+delta, color);
    }
  }
}

// Bresenham's algorithm - thx wikpedia
 GFX.prototype.drawLine = function(rect0, rect1, color) {
  var steep = abs(rect1.y - rect0.y) > abs(rect1.x - rect0.x);
  if (steep) {
    swap(rect0.x, rect0.y);
    swap(rect1.x, rect1.y);
  }

  if (rect0.x > rect1.x) {
    swap(rect0.x, rect1.x);
    swap(rect0.y, rect1.y);
  }

  var dx, dy;
  dx = rect1.x - rect0.x;
  dy = abs(rect1.y - rect0.y);

  var err = dx / 2;
  var ystep;

  if (rect0.y < rect1.y) {
    ystep = 1;
  } else {
    ystep = -1;
  }

  for (; rect0.x<=rect1.x; rect0.x++) {
    if (steep) {
      this.drawPixel(rect0.y, rect0.x, color);
    } else {
      this.drawPixel(rect0.x, rect0.y, color);
    }
    err -= dy;
    if (err < 0) {
      rect0.y += ystep;
      err += dx;
    }
  }
}

// Draw a rectangle
 GFX.prototype.drawRect = function( x,  y,
			     w,  h,
			     color) {
  this.drawFastHLine(x, y, w, color);
  this.drawFastHLine(x, y+h-1, w, color);
  this.drawFastVLine(x, y, h, color);
  this.drawFastVLine(x+w-1, y, h, color);
}

 GFX.prototype.drawFastVLine = function ( x,  y,
				  h,  color) {
  // Update in subclasses if desired!
  drawLine(x, y, x, y+h-1, color);
}

 GFX.prototype.drawFastHLine = function ( x,  y,
				  w,  color) {
  // Update in subclasses if desired!
  drawLine(x, y, x+w-1, y, color);
}

 GFX.prototype.fillRect = function ( x,  y,  w,  h,
			     color) {
  // Update in subclasses if desired!
  for (var i=x; i<x+w; i++) {
    this.drawFastVLine(i, y, h, color);
  }
}

 GFX.prototype.fillScreen = function ( color) {
  this.fillRect(0, 0, this.width, this.height, color);
}

// Draw a rounded rectangle
 GFX.prototype.drawRoundRect = function ( x,  y,  w,
   h,  r,  color) {
  // smarter version
  this.drawFastHLine(x+r  , y    , w-2*r, color); // Top
  this.drawFastHLine(x+r  , y+h-1, w-2*r, color); // Bottom
  this.drawFastVLine(x    , y+r  , h-2*r, color); // Left
  this.drawFastVLine(x+w-1, y+r  , h-2*r, color); // Right
  // draw four corners
  this.drawCircleHelper(x+r    , y+r    , r, 1, color);
  this.drawCircleHelper(x+w-r-1, y+r    , r, 2, color);
  this.drawCircleHelper(x+w-r-1, y+h-r-1, r, 4, color);
  this.drawCircleHelper(x+r    , y+h-r-1, r, 8, color);
}

// Fill a rounded rectangle
 GFX.prototype.fillRoundRect = function ( x,  y,  w,
				  h,  r,  color) {
  // smarter version
  this.fillRect(x+r, y, w-2*r, h, color);

  // draw four corners
  fillCircleHelper(x+w-r-1, y+r, r, 1, h-2*r-1, color);
  fillCircleHelper(x+r    , y+r, r, 2, h-2*r-1, color);
}

// Draw a triangle
 GFX.prototype.drawTriangle = function ( rect0, rect1, rect2,  color) {
  drawLine(rect0.x, rect0.y, rect1.x, rect1.y, color);
  drawLine(rect1.x, rect1.y, rect2.y, rect2.y, color);
  drawLine(rect2.y, rect2.y, rect0.x, rect0.y, color);
}

// Fill a triangle
 GFX.prototype.fillTriangle  = function (  rect0, rect1, rect2,  color) {

  var a, b, y, last;

  // Sort coordinates by Y order (rect2.y >= rect1.y >= rect0.y)
  if (rect0.y > rect1.y) {
    swap(rect0.y, rect1.y); swap(rect0.x, rect1.x);
  }
  if (rect1.y > rect2.y) {
    swap(rect2.y, rect1.y); swap(rect2.y, rect1.x);
  }
  if (rect0.y > rect1.y) {
    swap(rect0.y, rect1.y); swap(rect0.x, rect1.x);
  }

  if(rect0.y == rect2.y) { // Handle awkward all-on-same-line case as its own thing
    a = b = rect0.x;
    if(rect1.x < a)      a = rect1.x;
    else if(rect1.x > b) b = rect1.x;
    if(rect2.y < a)      a = rect2.y;
    else if(rect2.y > b) b = rect2.y;
    this.drawFastHLine(a, rect0.y, b-a+1, color);
    return;
  }

  var
    dx01 = rect1.x - rect0.x,
    dy01 = rect1.y - rect0.y,
    dx02 = rect2.y - rect0.x,
    dy02 = rect2.y - rect0.y,
    dx12 = rect2.y - rect1.x,
    dy12 = rect2.y - rect1.y,
    sa   = 0,
    sb   = 0;

  // For upper part of triangle, find scanline crossings for segments
  // 0-1 and 0-2.  If rect1.y=rect2.y (flat-bottomed triangle), the scanline rect1.y
  // is included here (and second loop will be skipped, avoiding a /0
  // error there), otherwise scanline rect1.y is skipped here and handled
  // in the second loop...which also avoids a /0 error here if rect0.y=rect1.y
  // (flat-topped triangle).
  if(rect1.y == rect2.y) last = rect1.y;   // Include rect1.y scanline
  else         last = rect1.y-1; // Skip it

  for(y=rect0.y; y<=last; y++) {
    a   = rect0.x + sa / dy01;
    b   = rect0.x + sb / dy02;
    sa += dx01;
    sb += dx02;
    /* longhand:
    a = x0 + (x1 - x0) * (y - rect0.y) / (rect1.y - rect0.y);
    b = x0 + (rect2.y - x0) * (y - rect0.y) / (rect2.y - rect0.y);
    */
    if(a > b) swap(a,b);
    this.drawFastHLine(a, y, b-a+1, color);
  }

  // For lower part of triangle, find scanline crossings for segments
  // 0-2 and 1-2.  This loop is skipped if rect1.y=rect2.y.
  sa = dx12 * (y - rect1.y);
  sb = dx02 * (y - rect0.y);
  for(; y<=rect2.y; y++) {
    a   = rect1.x + sa / dy12;
    b   = rect0.x + sb / dy02;
    sa += dx12;
    sb += dx02;
    /* longhand:
    a = x1 + (rect2.y - x1) * (y - rect1.y) / (rect2.y - rect1.y);
    b = x0 + (rect2.y - x0) * (y - rect0.y) / (rect2.y - rect0.y);
    */
    if(a > b) swap(a,b);
    this.drawFastHLine(a, y, b-a+1, color);
  }
}

 GFX.prototype.drawBitmap = function ( x,  y,
			       bitmap,  w,  h,
			       color) {

  var i, j, byteWidth = (w + 7) / 8;

  for(j=0; j<h; j++) {
    for(i=0; i<w; i++ ) {
      if(pgm_read_byte(bitmap + j * byteWidth + i / 8) & (128 >> (i & 7))) {
        this.drawPixel(x+i, y+j, color);
      }
    }
  }
}

// Draw a 1-bit color bitmap at the specified x, y position from the
// provided bitmap buffer (must be PROGMEM memory) using color as the
// foreground color and bg as the background color.
 GFX.prototype.drawBitmap = function ( x,  y,
             bitmap,  w,  h,
             color,  bg) {

  var i, j, byteWidth = (w + 7) / 8;
  
  for(j=0; j<h; j++) {
    for(i=0; i<w; i++ ) {
      if(pgm_read_byte(bitmap + j * byteWidth + i / 8) & (128 >> (i & 7))) {
        this.drawPixel(x+i, y+j, color);
      }
      else {
       this.drawPixel(x+i, y+j, bg);
      }
    }
  }
}

//Draw XBitMap Files (*.xbm), exported from GIMP,
//Usage: Export from GIMP to *.xbm, rename *.xbm to *.c and open in editor.
//C Array can be directly used with this function
 GFX.prototype.drawXBitmap = function ( x,  y,
                               bitmap,  w,  h,
                               color) {
  
  var i, j, byteWidth = (w + 7) / 8;
  
  for(j=0; j<h; j++) {
    for(i=0; i<w; i++ ) {
      if(pgm_read_byte(bitmap + j * byteWidth + i / 8) & (1 << (i % 8))) {
        this.drawPixel(x+i, y+j, color);
      }
    }
  }
}

 GFX.prototype.write = function (c) {
  if (c == '\n') {
    this.cursor.y += this.textSize*8;
    this.cursor.x  = 0;
  } else if (c == '\r') {
    // skip em
  } else {
    drawChar(this.cursor.x, this.cursor.y, c, textcolor, textbgcolor, this.textSize);
    this.cursor.x += this.textSize*6;
    if (wrap && (this.cursor.x > (this.width - this.textSize*6))) {
      this.cursor.y += this.textSize*8;
      this.cursor.x = 0;
    }
  }
  return 1;
}

// Draw a character
 GFX.prototype.drawChar = function ( x,  y, c,
			     color,  bg, size) {

  if((x >= this.width)            || // Clip right
     (y >= this.height)           || // Clip bottom
     ((x + 6 * size - 1) < 0) || // Clip left
     ((y + 8 * size - 1) < 0))   // Clip top
    return;

  if(!this.cp437 && (c >= 176)) c++; // Handle 'classic' charset behavior

  for (var i=0; i<6; i++ ) {
    var line;
    if (i == 5) 
      line = 0x0;
    else 
      line = pgm_read_byte(font+(c*5)+i);
    for (var j = 0; j<8; j++) {
      if (line & 0x1) {
        if (size == 1) // default size
          this.drawPixel(x+i, y+j, color);
        else {  // big size
          this.fillRect(x+(i*size), y+(j*size), size, size, color);
        } 
      } else if (bg != color) {
        if (size == 1) // default size
          this.drawPixel(x+i, y+j, bg);
        else {  // big size
          this.fillRect(x+i*size, y+j*size, size, size, bg);
        }
      }
      line >>= 1;
    }
  }
}

 GFX.prototype.setCursor = function ( x,  y) {
  this.cursor.x = x;
  this.cursor.y = y;
}

 GFX.prototype.getCursorX = function () {
  return this.cursor.x;
}

 GFX.prototype.getCursorY = function () {
  return this.cursor.y;
}

 GFX.prototype.setTextSize = function (s) {
  this.textSize = (s > 0) ? s : 1;
}

 GFX.prototype.setTextColor = function ( c) {
  // For 'transparent' background, we'll set the bg 
  // to the same as fg instead of using a flag
  textcolor = textbgcolor = c;
}

 GFX.prototype.setTextColor = function ( c,  b) {
  textcolor   = c;
  textbgcolor = b; 
}

 GFX.prototype.setTextWrap = function (w) {
  wrap = w;
}

 GFX.prototype.getRotation = function () {
  return rotation;
}

 GFX.prototype.setRotation = function (x) {
  rotation = (x & 3);
  switch(rotation) {
   case 0:
   case 2:
    this.width  = this.WIDTH;
    this.height = this.HEIGHT;
    break;
   case 1:
   case 3:
    this.width  = this.HEIGHT;
    this.height = this.WIDTH;
    break;
  }
}

// Enable (or disable) Code Page 437-compatible charset.
// There was an error in glcdfont.c for the longest time -- one character
// (#176, the 'light shade' block) was missing -- this threw off the index
// of every character that followed it.  But a TON of code has been written
// with the erroneous character indices.  By default, the library uses the
// original 'wrong' behavior and old sketches will still work.  Pass 'true'
// to this function to use correct CP437 character values in your code.
 GFX.prototype.cp437 = function (x) {
  this.cp437 = x;
}

// Return the size of the display (per current rotation)
 GFX.prototype.width = function () {
  return this.width;
}
 
 GFX.prototype.height = function () {
  return this.height;
}

 GFX.prototype.invertDisplay = function (i) {
  // Do nothing, must be subclassed if supported
}

module.exports = GFX;

