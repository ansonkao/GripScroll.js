var CurseWords = function() {
    var currentTarget = null, targetCounter = 0, targets = [], enterHandlers = [], hoverHandlers = [], exitHandlers = [], currentImplicitCursor = "default", currentExplicitCursor = null, body = document.getElementsByTagName("body")[0], addImplicitCursorHandler = function(targetElement, enterHandler, hoverHandler, exitHandler) {
        targets[targetCounter] = targetElement, enterHandlers[targetCounter] = enterHandler, 
        hoverHandlers[targetCounter] = hoverHandler, exitHandlers[targetCounter] = exitHandler, 
        targetCounter++;
    }, setExplicitCursor = function(newCursor) {
        currentExplicitCursor = newCursor, drawCursor();
    }, clearExplicitCursor = function() {
        currentExplicitCursor = null, drawCursor();
    }, drawCursor = function() {
        var newCursor = null;
        newCursor = currentExplicitCursor ? currentExplicitCursor : currentImplicitCursor;
        var classes = body.className.split(" ");
        classes = classes.filter(function(c) {
            return 0 !== c.lastIndexOf("curse-words-", 0);
        }), classes.push("curse-words-" + newCursor), body.className = classes.join(" ");
    };
    return document.addEventListener("mouseover", function(e) {
        for (var i = 0; i < targets.length; i++) if (e.target == targets[i]) return null != currentTarget && exitHandlers[currentTarget](e), 
        currentTarget = i, void enterHandlers[currentTarget](e);
        null != currentTarget && exitHandlers[currentTarget](e), currentImplicitCursor = "default", 
        drawCursor(), currentTarget = null;
    }), document.addEventListener("mousemove", function(e) {
        if (null != currentTarget) {
            var newCursor = hoverHandlers[currentTarget](e);
            newCursor != currentImplicitCursor && (currentImplicitCursor = newCursor, drawCursor());
        }
    }), {
        addImplicitCursorHandler: addImplicitCursorHandler,
        setExplicitCursor: setExplicitCursor,
        clearExplicitCursor: clearExplicitCursor
    };
}(), DragKing = function() {
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
        isDragging() && e.preventDefault();
    }, document.addEventListener("mousemove", function(e) {
        isDragging() && dragHandlers[currentTarget](e);
    }), document.addEventListener("mouseup", rootDropHandler(!1)), document.addEventListener("mousedown", rootDropHandler(!0)), 
    {
        getCurrentTarget: getCurrentTarget,
        isDragging: isDragging,
        addHandler: addHandler
    };
}();

GripScroll = function() {
    function Scrollbar(container, params) {
        this.canvas = container.appendChild(document.createElement("canvas")), this.canvasContext = this.canvas.getContext("2d"), 
        this.canvas.className = "bar " + params.direction, this.direction = params.direction, 
        this.perpendicular = {
            x: "y",
            y: "x"
        }[this.direction], this.smallestZoom = .125, this.isHovering = !1, this.isDragging = !1, 
        this.wasHovering = null, this.wasDragging = null, this.width = null, this.height = null, 
        this.model = {
            min: params.min || 0,
            max: params.max || 1
        }, this.oldDrawModel = {
            min: null,
            max: null
        }, this.init = function() {
            switch (this.direction) {
              case "x":
                this.canvas.width = this.width = container.clientWidth - 20, this.canvas.height = this.height = 10;
                break;

              case "y":
                this.canvas.width = this.width = 10, this.canvas.height = this.height = container.clientHeight - 20;
            }
            this.wasHovering = null, this.wasDragging = null, this.oldDrawModel.min = null, 
            this.oldDrawModel.max = null, this.render(this.model.min, this.model.max);
        }, this.render = function(newMin, newMax) {
            if (newMin || 0 === newMin ? newMax || (newMax = newMin.max, newMin = newMin.min) : (newMin = this.model.min, 
            newMax = this.model.max), newMin != this.oldDrawModel.min || this.wasHovering != this.isHovering || newMax != this.oldDrawModel.max || this.wasDragging != this.isDragging) {
                switch (this.canvasContext.clear(), this.isHovering || this.isDragging ? this.canvas.classList.add("is-mouseover") : this.canvas.classList.remove("is-mouseover"), 
                this.canvasContext.strokeStyle = "rgb(64,64,64)", this.canvasContext.fillStyle = "rgb(96,96,96)", 
                this.direction) {
                  case "x":
                    this.canvasContext.roundRect(this.width * newMin, 0, this.width * newMax, this.height, 5, !0, !0);
                    break;

                  case "y":
                    this.canvasContext.roundRect(0, this.height * newMin, this.width, this.height * newMax, 5, !0, !0);
                }
                if (newMin != this.oldDrawModel.min || newMax != this.oldDrawModel.max) {
                    var event = new CustomEvent("gripscroll-update");
                    event.min = newMin, event.max = newMax, event.direction = this.direction, container.dispatchEvent(event);
                }
                this.wasHovering = this.isHovering, this.wasDragging = this.isDragging, this.oldDrawModel.min = newMin, 
                this.oldDrawModel.max = newMax;
            }
        }, this.save = function(newValue, minOrMax) {
            this.model[minOrMax] = newValue;
        }, this.calculateCursorPosition = function(e) {
            var offset = this.canvas.clientXYDirectional(this.direction), mousePixels = e.clientXYDirectional(this.direction), mouseRange = this.canvas.clientLength(this.direction), newPosition = (mousePixels - offset) / mouseRange;
            return newPosition;
        }, this.whichGrip = function(cursorPosition) {
            return Math.abs(cursorPosition - this.model.min) < this.pxToPct(5) ? "min" : Math.abs(cursorPosition - this.model.max) < this.pxToPct(5) ? "max" : cursorPosition > this.model.min && cursorPosition < this.model.max ? "mid" : null;
        }, this.isOutsideDragZone = function(e) {
            var perpendicularOffset = this.canvas.clientXYDirectional(this.perpendicular, 1), perpendicularMousePixels = e.clientXYDirectional(this.perpendicular, 1);
            return Math.abs(perpendicularMousePixels - perpendicularOffset) > 150 ? !0 : void 0;
        }, this.validateEndPosition = function(newPosition, minOrMax) {
            switch (minOrMax) {
              case "min":
                0 > newPosition ? newPosition = 0 : newPosition > this.model.max - this.smallestZoom && (newPosition = this.model.max - this.smallestZoom);
                break;

              case "max":
                newPosition > 1 ? newPosition = 1 : newPosition < this.model.min + this.smallestZoom && (newPosition = this.model.min + this.smallestZoom);
            }
            return newPosition;
        }, this.validateBothEndPositions = function(changePosition) {
            var newMin = this.model.min + changePosition;
            0 > newMin && (changePosition -= newMin);
            var newMax = this.model.max + changePosition;
            newMax > 1 && (changePosition -= newMax - 1);
            var newModel = {};
            return newModel.min = changePosition + this.model.min, newModel.max = changePosition + this.model.max, 
            newModel;
        }, this.recalculateModel = function(e, whichGrip, startPosition) {
            if (whichGrip && this.isOutsideDragZone(e)) return this.render(this.model), null;
            if ("mid" == whichGrip) {
                var newPosition = this.calculateCursorPosition(e), newModel = this.validateBothEndPositions(newPosition - startPosition);
                return this.render(newModel), newModel;
            }
            if ("min" == whichGrip || "max" == whichGrip) {
                var newPosition = this.calculateCursorPosition(e);
                newPosition = this.validateEndPosition(newPosition, whichGrip);
                var otherGrip = {
                    min: "max",
                    max: "min"
                }[whichGrip], newModel = {};
                return newModel[whichGrip] = newPosition, newModel[otherGrip] = this.model[otherGrip], 
                this.render(newModel), newModel;
            }
            return null;
        }, this.pxToPct = function() {
            switch (this.direction) {
              case "x":
                return 5 / this.width;

              case "y":
                return 5 / this.height;
            }
        };
        var that = this;
        that.init(), window.addEventListener("resize", function() {
            that.init();
        });
        var whichGrip = null, startPosition = null;
        DragKing.addHandler(that.canvas, function(e) {
            that.isDragging = !0, startPosition = that.calculateCursorPosition(e), whichGrip = that.whichGrip(startPosition), 
            "mid" == whichGrip ? CurseWords.setExplicitCursor("grabbing") : whichGrip && CurseWords.setExplicitCursor(that.direction + "resize");
        }, function(e) {
            that.recalculateModel(e, whichGrip, startPosition);
        }, function(e) {
            that.isDragging = !1, CurseWords.clearExplicitCursor();
            var newModel = that.recalculateModel(e, whichGrip, startPosition);
            newModel && (that.save(newModel.min, "min"), that.save(newModel.max, "max"));
        }), CurseWords.addImplicitCursorHandler(that.canvas, function() {
            that.isHovering = !0, that.render();
        }, function(e) {
            var newPosition = that.calculateCursorPosition(e), hoverGrip = that.whichGrip(newPosition), newCursor = null;
            switch (hoverGrip) {
              case "min":
                that.isHovering = !0, newCursor = that.direction + "resize";
                break;

              case "max":
                that.isHovering = !0, newCursor = that.direction + "resize";
                break;

              case "mid":
                that.isHovering = !0, newCursor = "grab";
                break;

              default:
                that.isHovering = !1, newCursor = "default";
            }
            return that.render(), newCursor;
        }, function() {
            that.isHovering = !1, that.render();
        });
    }
    var containerStack = [], scrollbarStack = [], add = function(container, params) {
        params = params || {};
        for (var i = 0; i < containerStack.length; i++) if (containerStack[i] == container) return;
        containerStack.push(container), scrollbarStack.push({
            x: new Scrollbar(container, {
                direction: "x",
                min: params.x1 || 0,
                max: params.x2 || 1
            }),
            y: new Scrollbar(container, {
                direction: "y",
                min: params.y1 || 0,
                max: params.y2 || 1
            })
        });
    };
    return {
        add: add
    };
}(), MouseEvent.prototype.clientXYDirectional = MouseEvent.prototype.clientXYDirectional || function(axis, sign) {
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
}, Element.prototype.offsetDirectional = Element.prototype.offsetDirectional || function(axis, sign) {
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
}, Element.prototype.clientXYDirectional = Element.prototype.clientXYDirectional || function(axis, sign) {
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
}, Element.prototype.clientLength = Element.prototype.clientLength || function(axis) {
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