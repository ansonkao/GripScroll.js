function GripScrollbar(container, direction) {
    if (this.container = container, this.canvas = container.appendChild(document.createElement("canvas")), 
    this.canvasContext = this.canvas.getContext("2d"), this.canvas.className = "bar " + direction, 
    this.direction = direction, this.perpendicular = {
        x: "y",
        y: "x"
    }[direction], this.smallestZoom = .125, this.model = {
        min: 0,
        max: 0
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
            switch (this.canvasContext.clear(), this.canvasContext.strokeStyle = "rgba(96,96,96,0.64)", 
            this.canvasContext.fillStyle = "rgba(96,96,96,0.60)", this.direction) {
              case "x":
                this.canvasContext.roundRect(this.width * newMin + .5, .5, this.width * (1 - newMin - newMax) - 1, this.height - 1, 5, !0, !0);
                break;

              case "y":
                this.canvasContext.roundRect(.5, this.height * newMin + .5, this.width - 1, this.height * (1 - newMin - newMax) - 1, 5, !0, !0);
            }
        }, $.save = function(newValue, minOrMax) {
            this.model[minOrMax] = newValue;
        }, $.calculatePosition = function(e, minOrMax) {
            switch (minOrMax) {
              case "min":
                var thisSide = "min", thatSide = "max", sign = 1;
                break;

              case "max":
                var thisSide = "max", thatSide = "min", sign = -1;
                break;

              default:
                console.warn("GripScrollbar.calculatePosition(): invalid minOrMax");
            }
            var perpendicularOffset = this.canvas.clientXYDirectional(this.perpendicular, sign), perpendicularMousePixels = e.clientXYDirectional(this.perpendicular, sign);
            if (Math.abs(perpendicularMousePixels - perpendicularOffset) > 150) return this.model[thisSide];
            var offset = this.canvas.clientXYDirectional(this.direction, sign), mousePixels = e.clientXYDirectional(this.direction, sign), mouseRange = this.canvas.clientLength(this.direction), newPosition = (mousePixels - offset) / mouseRange;
            return "min" == minOrMax && 0 > newPosition && (newPosition = 0), "min" == minOrMax && newPosition > 1 - this.model[thatSide] - this.smallestZoom && (newPosition = 1 - this.model[thatSide] - this.smallestZoom), 
            "max" == minOrMax && newPosition < 0 + this.model[thatSide] + this.smallestZoom && (newPosition = 0 + this.model[thatSide] + this.smallestZoom), 
            "max" == minOrMax && newPosition > 1 && (newPosition = 1), newPosition;
        };
    }
    this.init();
    var that = this;
    return window.addEventListener("resize", function() {
        that.init();
    }), [ "min" ].forEach(function(minOrMax) {
        DragonDrop.addHandler(that.canvas, function() {}, function(e) {
            var newPosition = that.calculatePosition(e, minOrMax);
            that.draw(newPosition, that.model.max);
        }, function(e) {
            var newPosition = that.calculatePosition(e, minOrMax);
            that.draw(newPosition, that.model.max), that.save(newPosition, minOrMax);
        });
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
            isDragging() && e.which > ignoreLeftClick | 0 && (e.startX = startX, e.startY = startY, 
            dropHandlers[currentTarget](e), currentTarget = null, startX = null, startY = null);
        };
    }
    var currentTarget = null, targetCounter = 0, gripHandlers = [], dragHandlers = [], dropHandlers = [], startX = null, startY = null, getCurrentTarget = function() {
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
        isDragging() && (e.startX = startX, e.startY = startY, dragHandlers[currentTarget](e));
    }), document.addEventListener("mouseup", rootDropHandler(!1)), document.addEventListener("mousedown", rootDropHandler(!0)), 
    {
        getCurrentTarget: getCurrentTarget,
        isDragging: isDragging,
        addHandler: addHandler
    };
}();

MouseEvent.prototype.clientXYDirectional = function(axis, sign) {
    switch (axis) {
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
    switch (axis) {
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
}, CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x, y, width, height, radius, fill, stroke) {
    this.beginPath(), this.moveTo(x + radius, y), this.lineTo(x + width - radius, y), 
    this.quadraticCurveTo(x + width, y, x + width, y + radius), this.lineTo(x + width, y + height - radius), 
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height), this.lineTo(x + radius, y + height), 
    this.quadraticCurveTo(x, y + height, x, y + height - radius), this.lineTo(x, y + radius), 
    this.quadraticCurveTo(x, y, x + radius, y), this.closePath(), stroke && this.stroke(), 
    fill && this.fill();
};