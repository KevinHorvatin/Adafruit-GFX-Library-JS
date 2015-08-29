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

GFX.prototype.drawCircle = function(point0, r, color) {
	console.log('drawCircle');
	var f = 1 - r;
	var ddF_x = 1;
	var ddF_y = -2 * r;
	var x = 0;
	var y = r;
	
	this.drawPixel(point0.x, point0.y+r, color);
  	this.drawPixel(point0.x  , point0.y-r, color);
  	this.drawPixel(point0.x+r, point0.y  , color);
  	this.drawPixel(point0.x-r, point0.y  , color);
	
	while (x < y) {
		if (f >= 0) {
			y--;
			ddF_y += 2;
			f += ddF_y;
		}
		x++;
		ddF_x += 2;
		f += ddF_x;
	
		this.drawPixel(point0.x + x, point0.y + y, color);
		this.drawPixel(point0.x - x, point0.y + y, color);
		this.drawPixel(point0.x + x, point0.y - y, color);
		this.drawPixel(point0.x - x, point0.y - y, color);
		this.drawPixel(point0.x + y, point0.y + x, color);
		this.drawPixel(point0.x - y, point0.y + x, color);
		this.drawPixel(point0.x + y, point0.y - x, color);
		this.drawPixel(point0.x - y, point0.y - x, color);
	}
}

GFX.prototype.drawCircleHelper = function(point0, r, cornername, color) {
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
      this.drawPixel(point0.x + x, point0.y + y, color);
      this.drawPixel(point0.x + y, point0.y + x, color);
    } 
    if (cornername & 0x2) {
      this.drawPixel(point0.x + x, point0.y - y, color);
      this.drawPixel(point0.x + y, point0.y - x, color);
    }
    if (cornername & 0x8) {
      this.drawPixel(point0.x - y, point0.y + x, color);
      this.drawPixel(point0.x - x, point0.y + y, color);
    }
    if (cornername & 0x1) {
      this.drawPixel(point0.x - y, point0.y - x, color);
      this.drawPixel(point0.x - x, point0.y - y, color);
    }
  }
}

GFX.prototype.fillCircle = function(point0, r, color) {
  this.drawFastVLine(point0.x, point0.y-r, 2*r+1, color);
  this.fillCircleHelper(point0, r, 3, 0, color);
}

// Used to do circles and roundrects
 GFX.prototype.fillCircleHelper = function( point0,  r, cornername,  delta,  color) {
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
      this.drawFastVLine(point0.x+x, point0.y-y, 2*y+1+delta, color);
      this.drawFastVLine(point0.x+y, point0.y-x, 2*x+1+delta, color);
    }
    if (cornername & 0x2) {
      this.drawFastVLine(point0.x-x, point0.y-y, 2*y+1+delta, color);
      this.drawFastVLine(point0.x-y, point0.y-x, 2*x+1+delta, color);
    }
  }
}
 
 // Bresenham's algorithm - thx wikpedia
 GFX.prototype.drawLine = function(point0, point1, color) {
  var steep = Math.abs(point1.y - point0.y) > Math.abs(point1.x - point0.x);
  var x0, y0, x1, y1;
  x0 = point0.x;
  y0 = point0.y;
  x1 = point1.x;
  y1 = point1.y;
  
  if (steep) {
    // Swap x and y coordinates
    x0 = point0.y;
    y0 = point0.x;
    
    x1 = point1.y;
    y1 = point1.x;
  }

  if (x0 > x1) {
    var tmp;
    tmp = x0;
    x0 = x1;
    x1 = tmp;
    
    tmp = y0;
    y0 = y1;
    y1 = tmp;
  }

  var dx, dy;
  dx = x1 - x0;
  dy = Math.abs(y1 - y0);

  var err = dx / 2;
  var ystep;

  if (y0 <= y1) {
    ystep = 1;
  } else {
    ystep = -1;
  }

  for (; x0<=x1; x0++) {
    if (steep) {
      this.drawPixel(y0, x0, color);
    } else {
      this.drawPixel(x0, y0, color);
    }
    err -= dy;
    if (err < 0) {
      y0 += ystep;
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

 GFX.prototype.drawFastVLine = function (x,  y, h,  color) {
  // Update in subclasses if desired!
  this.drawLine({x: x, y: y}, {x: x, y: y+h-1}, color);
}

 GFX.prototype.drawFastHLine = function (x,  y, w, color) {
  // Update in subclasses if desired!
  this.drawLine({x: x, y: y}, {x: x+w-1, y: y}, color);
}

 GFX.prototype.fillRect = function (x,  y,  w,  h, color) {
  // Update in subclasses if desired!
  for (var i=x; i<x+w; i++) {
    this.drawFastVLine(i, y, h, color);
  }
}

 GFX.prototype.fillScreen = function (color) {
  this.fillRect(0, 0, this.width, this.height, color);
}

// Draw a rounded rectangle
 GFX.prototype.drawRoundRect = function (x, y, w, h, r, color) {
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
 GFX.prototype.fillRoundRect = function (x, y, w, h, r, color) {
  // smarter version
  this.fillRect(x+r, y, w-2*r, h, color);

  // draw four corners
  this.fillCircleHelper({x: x+w-r-1,y: y+r}, r, 1, h-2*r-1, color);
  this.fillCircleHelper({x: x+r, y: y+r}, r, 2, h-2*r-1, color);
}

// Draw a triangle
 GFX.prototype.drawTriangle = function (point0, point1, point2, color) {
  this.drawLine(point0, point1, color);
  this.drawLine(point1, point2, color);
  this.drawLine(point2, point0, color);
}

// Fill a triangle
 GFX.prototype.fillTriangle  = function (  point0, point1, point2,  color) {
  var a, b, y, last;
  var x0, y0, x1, y1, x2, y2;
  
  x0 = point0.x;
  x1 = point1.x;
  x2 = point2.x;
  y0 = point0.y;
  y1 = point1.y;
  y2 = point2.y;
  
  // Sort coordinates by Y order (point2.y >= point1.y >= point0.y)
  if (y0 > y1) {
    y0 = point1.y;
    y1 = point0.y;
    x0 = point1.x;
    x1 = point0.x;
  }
  if (y1 > y2) {
    var tmp = y1;
    y1 = y2;
    y2 = tmp;
    
    tmp = x1;
    x1 = x2;
    x2 = tmp;
  }
  if (y0 > y1) {
    var tmp = y1;
    y1 = y0;
    y0 = tmp;
    
    tmp = x1;
    x1 = x0;
    x0 = tmp;
  }

  if(y0 == y2) { // Handle awkward all-on-same-line case as its own thing
    a = b = x0;
    if(x1 < a)      a = x1;
    else if(x1 > b) b = x1;
    if(x2 < a)      a = x2;
    else if(x2 > b) b = x2;
    this.drawFastHLine(a, y0, b-a+1, color);
    return;
  }

  var
    dx01 = x1 - x0,
    dy01 = y1 - y0,
    dx02 = x2 - x0,
    dy02 = y2 - y0,
    dx12 = x2 - x1,
    dy12 = y2 - y1,
    sa   = 0,
    sb   = 0;

  // For upper part of triangle, find scanline crossings for segments
  // 0-1 and 0-2.  If point1.y=point2.y (flat-bottomed triangle), the scanline point1.y
  // is included here (and second loop will be skipped, avoiding a /0
  // error there), otherwise scanline point1.y is skipped here and handled
  // in the second loop...which also avoids a /0 error here if point0.y=point1.y
  // (flat-topped triangle).
  if(y1 == y2) last = y1;   // Include point1.y scanline
  else         last = y1-1; // Skip it

  for(y=y0; y<=last; y++) {
    a   = x0 + sa / dy01;
    b   = x0 + sb / dy02;
    sa += dx01;
    sb += dx02;
    /* longhand:
    a = x0 + (x1 - x0) * (y - point0.y) / (point1.y - point0.y);
    b = x0 + (point2.y - x0) * (y - point0.y) / (point2.y - point0.y);
    */
    if(a > b) {
      var tmp = a;
      a = b;
      b = tmp;
    }
    this.drawFastHLine(a, y, b-a+1, color);
  }

  // For lower part of triangle, find scanline crossings for segments
  // 0-2 and 1-2.  This loop is skipped if point1.y=point2.y.
  sa = dx12 * (y - y1);
  sb = dx02 * (y - y0);
  for(; y<=y2; y++) {
    a   = x1 + sa / dy12;
    b   = x0 + sb / dy02;
    sa += dx12;
    sb += dx02;
    /* longhand:
    a = x1 + (point2.y - x1) * (y - point1.y) / (point2.y - point1.y);
    b = x0 + (point2.y - x0) * (y - point0.y) / (point2.y - point0.y);
    */
    if(a > b) {
      var tmp = a;
      a = b;
      b = tmp;
    }
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
    this.drawChar(this.cursor.x, this.cursor.y, c, textcolor, textbgcolor, this.textSize);
    this.cursor.x += this.textSize*6;
    if (this.wrap && (this.cursor.x > (this.width - this.textSize*6))) {
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
  this.textcolor = this.textbgcolor = c;
}

 GFX.prototype.setTextColor = function ( c,  b) {
  this.textcolor   = c;
  this.textbgcolor = b; 
}

 GFX.prototype.setTextWrap = function (w) {
  this.wrap = w;
}

 GFX.prototype.getRotation = function () {
  return this.rotation;
}

 GFX.prototype.setRotation = function (x) {
  this.rotation = (x & 3);
  switch(this.rotation) {
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
