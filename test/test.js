var GFX = require('../js/gfx.js');
var should = require('chai').should();

var GFXSub = function() {
    this.funCount = 0;
}

GFXSub.prototype = Object.create(GFX.prototype);

GFXSub.prototype.drawPixel = function() {
    this.funCount++;
}

describe("GFX", function() {
   describe(".drawCircle()", function() {
       it("should call drawPixel 4 times when given no args", function() {
           var subClass = new GFXSub();
           subClass.drawCircle({x:0, y:0});
           subClass.funCount.should.equal(4);
       });
       it("should call drawPixel 2x8 + 4 times when radius is 3", function() {
           var subClass = new GFXSub();
           subClass.drawCircle({x:10, y:10}, 3);
           subClass.funCount.should.equal(20);
       });
   });
   describe(".fillCircle()", function() {
      it('should call drawPixel n times', function() {
           var subClass = new GFXSub();
           subClass.fillCircle({x:10, y:10}, 3);
           subClass.funCount.should.equal(47);
      });
   });
   describe(".fillRoundRect()", function() {
      it('should call drawPixel n times', function() {
           var subClass = new GFXSub();
           subClass.fillRoundRect(10, 10, 10, 10, 3, "blue");
           subClass.funCount.should.equal(104);
      });
   });
   describe(".fillRect()", function() {
      it('should call drawPixel n times', function() {
           var subClass = new GFXSub();
           subClass.fillRect(10, 10, 10, 15, "blue");
           subClass.funCount.should.equal(150);
      });
   });
   describe(".drawTriangle()", function() {
      it('should call drawPixel n times', function() {
           var subClass = new GFXSub();
           subClass.drawTriangle({x:1, y:1}, {x:10,y:10}, {x:20,y:20}, "blue");
           subClass.funCount.should.equal(41);
      });
   });
   describe(".fillTriangle()", function() {
      it('should call drawPixel n times', function() {
           var subClass = new GFXSub();
           subClass.fillTriangle({x:1, y:4}, {x:3,y:1}, {x:4,y:4}, "blue");
           subClass.funCount.should.equal(10);
      });
   });
});