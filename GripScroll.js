function GripScrollbar(container, direction) {
    if (this.container = container, this.canvas = container.appendChild(document.createElement("canvas")), 
    this.canvasContext = this.canvas.getContext("2d"), this.canvas.className = "bar " + direction, 
    this.direction = direction, this.perpendicular = {
        x: "y",
        y: "x"
    }[direction], this.smallestZoom = .125, this.model = {
        min: 0,
        max: 1
    }, !GripScrollbar.prototype.initialized) {
        var $ = GripScrollbar.prototype;
        $.initialized = !0, $.init = function() {
            switch (this.direction) {
              case "x":
                this.canvas.width = this.width = this.container.clientWidth - 20, this.canvas.height = this.height = 10;
                break;

              case "y":
                this.canvas.width = this.width = 10, this.canvas.height = this.height = this.container.clientHeight - 20;
            }
            this.draw(this.model.min, this.model.max);
        }, $.draw = function(newMin, newMax) {
            switch (void 0 === newMax && (newMax = newMin.max, newMin = newMin.min), this.canvasContext.clear(), 
            this.canvasContext.strokeStyle = "rgba(96,96,96,0.64)", this.canvasContext.fillStyle = "rgba(96,96,96,0.60)", 
            this.direction) {
              case "x":
                this.canvasContext.roundRect(this.width * newMin, 0, this.width * newMax, this.height, 5, !0, !0);
                break;

              case "y":
                this.canvasContext.roundRect(0, this.height * newMin, this.width, this.height * newMax, 5, !0, !0);
            }
        }, $.save = function(newValue, minOrMax) {
            this.model[minOrMax] = newValue;
        }, $.calculatePosition = function(e) {
            var offset = this.canvas.clientXYDirectional(this.direction), mousePixels = e.clientXYDirectional(this.direction), mouseRange = this.canvas.clientLength(this.direction), newPosition = (mousePixels - offset) / mouseRange;
            return newPosition;
        }, $.isOutsideDragZone = function(e) {
            var perpendicularOffset = this.canvas.clientXYDirectional(this.perpendicular, 1), perpendicularMousePixels = e.clientXYDirectional(this.perpendicular, 1);
            return Math.abs(perpendicularMousePixels - perpendicularOffset) > 150 ? !0 : void 0;
        }, $.validateEndPosition = function(newPosition, minOrMax) {
            switch (minOrMax) {
              case "min":
                0 > newPosition ? newPosition = 0 : newPosition > this.model.max - this.smallestZoom && (newPosition = this.model.max - this.smallestZoom);
                break;

              case "max":
                newPosition > 1 ? newPosition = 1 : newPosition < this.model.min + this.smallestZoom && (newPosition = this.model.min + this.smallestZoom);
            }
            return newPosition;
        }, $.validateBothEndPositions = function(changePosition) {
            var a = changePosition, newMin = this.model.min + changePosition;
            0 > newMin && (changePosition -= newMin);
            var b = changePosition, newMax = this.model.max + changePosition;
            newMax > 1 && (changePosition -= newMax - 1);
            var newModel = {};
            return newModel.min = changePosition + this.model.min, newModel.max = changePosition + this.model.max, 
            console.log(newMin, newMax, a, b, changePosition, this.model, newModel), newModel;
        };
    }
    this.init();
    var that = this;
    window.addEventListener("resize", function() {
        that.init();
    });
    var whichGrip = null, otherGrip = null, startPosition = null;
    return DragonDrop.addHandler(that.canvas, function(e) {
        startPosition = that.calculatePosition(e), Math.abs(startPosition - that.model.min) < .01 ? (whichGrip = "min", 
        otherGrip = "max") : Math.abs(startPosition - that.model.max) < .01 ? (whichGrip = "max", 
        otherGrip = "min") : startPosition > that.model.min && startPosition < that.model.max ? (whichGrip = "mid", 
        otherGrip = null) : (whichGrip = null, otherGrip = null), console.log("model:", that.model);
    }, function(e) {
        if (whichGrip && that.isOutsideDragZone(e)) return void that.draw(that.model);
        if ("mid" == whichGrip) {
            var newPosition = that.calculatePosition(e), newModel = that.validateBothEndPositions(newPosition - startPosition);
            that.draw(newModel);
        } else if ("min" == whichGrip || "max" == whichGrip) {
            var newPosition = that.calculatePosition(e);
            newPosition = that.validateEndPosition(newPosition, whichGrip);
            var newModel = {};
            newModel[whichGrip] = newPosition, newModel[otherGrip] = that.model[otherGrip], 
            that.draw(newModel);
        }
    }, function(e) {
        if (whichGrip && that.isOutsideDragZone(e)) return void that.draw(that.model);
        if ("mid" == whichGrip) {
            var newPosition = that.calculatePosition(e), newModel = that.validateBothEndPositions(newPosition - startPosition);
            that.draw(newModel), that.save(newModel.min, "min"), that.save(newModel.max, "max");
        } else if ("min" == whichGrip || "max" == whichGrip) {
            var newPosition = that.calculatePosition(e);
            newPosition = that.validateEndPosition(newPosition, whichGrip);
            var newModel = {};
            newModel[whichGrip] = newPosition, newModel[otherGrip] = that.model[otherGrip], 
            that.draw(newModel), that.save(newPosition, whichGrip);
        }
    }), this.canvas;
}

function GripScroll(targetId) {
    if (this.container = document.getElementById(targetId), this.container.className = "gripscroll", 
    this.bar = {
        x: new GripScrollbar(this.container, "x"),
        y: new GripScrollbar(this.container, "y")
    }, !GripScroll.prototype.initialized) {
        var $ = GripScroll.prototype;
        $.initialized = !0, $.getContainer = function() {
            return this.container;
        }, $.getBar = function(xy) {
            return this.bar[xy];
        }, $.init = function() {};
    }
}

var DragonDrop = function() {
    function rootDropHandler(ignoreLeftClick) {
        return function(e) {
            isDragging() && e.which > ignoreLeftClick | 0 && (dropHandlers[currentTarget](e), 
            currentTarget = null);
        };
    }
    var currentTarget = null, targetCounter = 0, gripHandlers = [], dragHandlers = [], dropHandlers = [], getCurrentTarget = function() {
        return currentTarget;
    }, isDragging = function() {
        return null !== currentTarget;
    }, addHandler = function(target, gripHandler, dragHandler, dropHandler) {
        var mousedownHandler = function(uid) {
            return function(e) {
                1 == e.which && (currentTarget = uid, gripHandlers[uid](e), e.preventDefault());
            };
        }(targetCounter);
        target.addEventListener("mousedown", mousedownHandler), gripHandlers[targetCounter] = gripHandler, 
        dragHandlers[targetCounter] = dragHandler, dropHandlers[targetCounter] = dropHandler, 
        targetCounter++;
    };
    return document.onmousewheel = function(e) {
        e.preventDefault();
    }, document.addEventListener("mousemove", function(e) {
        isDragging() && dragHandlers[currentTarget](e);
    }), document.addEventListener("mouseup", rootDropHandler(!1)), document.addEventListener("mousedown", rootDropHandler(!0)), 
    {
        getCurrentTarget: getCurrentTarget,
        isDragging: isDragging,
        addHandler: addHandler
    };
}();

MouseEvent.prototype.clientXYDirectional = function(axis, sign) {
    switch (sign = void 0 === sign ? 1 : sign, axis) {
      case "x":
        switch (sign > 0) {
          case !0:
            return this.clientX;

          case !1:
            return window.innerWidth - this.clientX;
        }

      case "y":
        switch (sign > 0) {
          case !0:
            return this.clientY;

          case !1:
            return window.innerHeight - this.clientY;
        }

      default:
        return null;
    }
}, Element.prototype.offsetDirectional = function(axis, sign) {
    switch (sign = void 0 === sign ? 1 : sign, axis) {
      case "x":
        switch (sign > 0) {
          case !0:
            return this.offsetLeft;

          case !1:
            return this.parentElement.offsetWidth - this.offsetWidth - this.offsetLeft;
        }

      case "y":
        switch (sign > 0) {
          case !0:
            return this.offsetTop;

          case !1:
            return this.parentElement.offsetHeight - this.offsetHeight - this.offsetTop;
        }

      default:
        return null;
    }
}, Element.prototype.clientXYDirectional = function(axis, sign) {
    sign = void 0 === sign ? 1 : sign;
    var rect = this.getBoundingClientRect();
    switch (axis) {
      case "x":
        switch (sign > 0) {
          case !0:
            return rect.left;

          case !1:
            return window.innerWidth - rect.left - rect.width;
        }

      case "y":
        switch (sign > 0) {
          case !0:
            return rect.top;

          case !1:
            return window.innerHeight - rect.top - rect.height;
        }

      default:
        return null;
    }
}, Element.prototype.clientLength = function(axis) {
    var rect = this.getBoundingClientRect();
    switch (axis) {
      default:
      case "x":
        return rect.width;

      case "y":
        return rect.height;
    }
}, CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function(preserveTransform) {
    preserveTransform && (this.save(), this.setTransform(1, 0, 0, 1, 0, 0)), this.clearRect(0, 0, this.canvas.width, this.canvas.height), 
    preserveTransform && this.restore();
}, CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x1, y1, x2, y2, radius, fill, stroke) {
    this.beginPath(), this.moveTo(.5 + x1 + radius, .5 + y1), this.lineTo(-.5 + x2 - radius, .5 + y1), 
    this.quadraticCurveTo(-.5 + x2, .5 + y1, -.5 + x2, .5 + y1 + radius), this.lineTo(-.5 + x2, -.5 + y2 - radius), 
    this.quadraticCurveTo(-.5 + x2, -.5 + y2, -.5 + x2 - radius, -.5 + y2), this.lineTo(.5 + x1 + radius, -.5 + y2), 
    this.quadraticCurveTo(.5 + x1, -.5 + y2, .5 + x1, -.5 + y2 - radius), this.lineTo(.5 + x1, .5 + y1 + radius), 
    this.quadraticCurveTo(.5 + x1, .5 + y1, .5 + x1 + radius, .5 + y1), this.closePath(), 
    stroke && this.stroke(), fill && this.fill();
};