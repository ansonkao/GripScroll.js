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
            newCursor && newCursor != currentImplicitCursor && (currentImplicitCursor = newCursor, 
            drawCursor());
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

GripScroll = function(key) {
    function Scrollbar(container, params) {
        this.container = container, this.canvas = container.appendChild(document.createElement("canvas")), 
        this.canvasContext = this.canvas.getContext("2d"), this.canvas.className = "bar " + params.direction, 
        this.direction = params.direction, this.perpendicular = {
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
        };
        var that = this;
        that.init(), window.addEventListener("resize", function(e) {
            that.init();
        });
        var whichGrip = null, startPosition = null, gripHandler = function(e) {
            that.isDragging = !0, startPosition = that.calculateCursorPosition(e), whichGrip = that.whichGrip(startPosition), 
            "mid" == whichGrip ? CurseWords.setExplicitCursor("grabbing") : whichGrip && CurseWords.setExplicitCursor(that.direction + "resize");
        }, dragHandler = function(e) {
            that.recalculateModel(e, whichGrip, startPosition);
        }, dropHandler = function(e) {
            that.isDragging = !1, CurseWords.clearExplicitCursor();
            var newModel = that.recalculateModel(e, whichGrip, startPosition);
            newModel && (that.save(newModel.min, "min"), that.save(newModel.max, "max"));
        };
        DragKing.addHandler(that.canvas, gripHandler, dragHandler, dropHandler);
        var enterHandler = function(e) {
            that.isHovering = !0, that.isDragging || that.render();
        }, hoverHandler = function(e) {
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
            return that.isDragging || that.render(), newCursor;
        }, exitHandler = function(e) {
            that.isHovering = !1, that.isDragging || that.render();
        };
        CurseWords.addImplicitCursorHandler(that.canvas, enterHandler, hoverHandler, exitHandler);
    }
    var GripScrollStack = [], add = function(container, params) {
        for (var i = 0; i < GripScrollStack.length; i++) if (GripScrollStack[i].container == container) return !1;
        params = validateParams(params), GripScrollStack.push({
            container: container,
            x: params.x ? new Scrollbar(container, {
                direction: "x",
                min: params.x.min,
                max: params.x.max
            }) : null,
            y: params.y ? new Scrollbar(container, {
                direction: "y",
                min: params.y.min,
                max: params.y.max
            }) : null
        }), container.classList.add("gripscroll"), params.x && container.addEventListener("gripscroll-update-x", function(e) {
            triggerUpdate(container, {
                xMin: e.gripScrollMin,
                xMax: e.gripScrollMax
            });
        }), params.y && container.addEventListener("gripscroll-update-y", function(e) {
            triggerUpdate(container, {
                yMin: e.gripScrollMin,
                yMax: e.gripScrollMax
            });
        });
        var currentGripScroll = GripScrollStack[GripScrollStack.length - 1];
        return container.addEventListener("wheel", function(e) {
            key.ctrl ? (currentGripScroll.x.zoomByAmount(e, "x"), currentGripScroll.y.zoomByAmount(e, "y")) : (currentGripScroll.x.moveByAmount(e.deltaX, "x"), 
            currentGripScroll.y.moveByAmount(e.deltaY, "y")), e.preventDefault();
        }), !0;
    }, validateParams = function(params) {
        return params || (params = {}), void 0 === params.x ? params.x = {
            min: 0,
            max: 1
        } : params.x && (void 0 === params.x.min && (params.x.min = 0), void 0 === params.x.max && (params.x.max = 1)), 
        void 0 === params.y ? params.y = {
            min: 0,
            max: 1
        } : params.y && (void 0 === params.y.min && (params.y.min = 0), void 0 === params.y.max && (params.y.max = 1)), 
        params;
    }, triggerUpdate = function(container, overrideValues) {
        for (var i = 0; i < GripScrollStack.length; i++) if (GripScrollStack[i].container == container) var thisGripScroll = GripScrollStack[i];
        if (!thisGripScroll) return !1;
        var event = new CustomEvent("gripscroll-update");
        return event.gripScrollX = {}, event.gripScrollX.min = "object" == typeof overrideValues && void 0 !== overrideValues.xMin ? overrideValues.xMin : thisGripScroll.x.model.min, 
        event.gripScrollX.max = "object" == typeof overrideValues && void 0 !== overrideValues.xMax ? overrideValues.xMax : thisGripScroll.x.model.max, 
        event.gripScrollY = {}, event.gripScrollY.min = "object" == typeof overrideValues && void 0 !== overrideValues.yMin ? overrideValues.yMin : thisGripScroll.y.model.min, 
        event.gripScrollY.max = "object" == typeof overrideValues && void 0 !== overrideValues.yMax ? overrideValues.yMax : thisGripScroll.y.model.max, 
        container.dispatchEvent(event), !0;
    };
    return Scrollbar.prototype.init = function() {
        switch (this.direction) {
          case "x":
            this.canvas.width = this.width = this.container.clientWidth - 20, this.canvas.height = this.height = 10;
            break;

          case "y":
            this.canvas.width = this.width = 10, this.canvas.height = this.height = this.container.clientHeight - 20;
        }
        this.wasHovering = null, this.wasDragging = null, this.oldDrawModel.min = null, 
        this.oldDrawModel.max = null, this.render(this.model.min, this.model.max);
    }, Scrollbar.prototype.render = function(newMin, newMax) {
        if ("undefined" == typeof newMin ? (newMin = this.model.min, newMax = this.model.max) : "undefined" == typeof newMax && (newMax = newMin.max, 
        newMin = newMin.min), newMin != this.oldDrawModel.min || this.wasHovering != this.isHovering || newMax != this.oldDrawModel.max || this.wasDragging != this.isDragging) {
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
                var event = new CustomEvent("gripscroll-update-" + this.direction);
                event.gripScrollMin = newMin, event.gripScrollMax = newMax, this.container.dispatchEvent(event);
            }
            this.wasHovering = this.isHovering, this.wasDragging = this.isDragging, this.oldDrawModel.min = newMin, 
            this.oldDrawModel.max = newMax;
        }
    }, Scrollbar.prototype.save = function(newValue, minOrMax) {
        this.model[minOrMax] = newValue;
    }, Scrollbar.prototype.calculateCursorPosition = function(e) {
        var offset = this.canvas.clientXYDirectional(this.direction), mousePixels = e.clientXYDirectional(this.direction), mouseRange = this.canvas.clientLength(this.direction), newPosition = (mousePixels - offset) / mouseRange;
        return newPosition;
    }, Scrollbar.prototype.whichGrip = function(cursorPosition) {
        return Math.abs(cursorPosition - this.model.min) < this.pxToPct(5) ? "min" : Math.abs(cursorPosition - this.model.max) < this.pxToPct(5) ? "max" : cursorPosition > this.model.min && cursorPosition < this.model.max ? "mid" : null;
    }, Scrollbar.prototype.isOutsideDragZone = function(e) {
        var perpendicularOffset = this.canvas.clientXYDirectional(this.perpendicular, 1), perpendicularMousePixels = e.clientXYDirectional(this.perpendicular, 1);
        return Math.abs(perpendicularMousePixels - perpendicularOffset) > 150 ? !0 : !1;
    }, Scrollbar.prototype.validateEndPosition = function(newPosition, minOrMax) {
        switch (minOrMax) {
          case "min":
            0 > newPosition ? newPosition = 0 : newPosition > this.model.max - this.smallestZoom && (newPosition = this.model.max - this.smallestZoom);
            break;

          case "max":
            newPosition > 1 ? newPosition = 1 : newPosition < this.model.min + this.smallestZoom && (newPosition = this.model.min + this.smallestZoom);
        }
        return newPosition;
    }, Scrollbar.prototype.validateBothEndPositions = function(changePosition) {
        var newMin = this.model.min + changePosition;
        0 > newMin && (changePosition -= newMin);
        var newMax = this.model.max + changePosition;
        newMax > 1 && (changePosition -= newMax - 1);
        var newModel = {};
        return newModel.min = changePosition + this.model.min, newModel.max = changePosition + this.model.max, 
        newModel;
    }, Scrollbar.prototype.recalculateModel = function(e, whichGrip, startPosition) {
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
    }, Scrollbar.prototype.moveByAmount = function(amount, direction) {
        var mouseRange = this.canvas.clientLength(direction), deltaPercent = amount / (3 * mouseRange);
        this.model = this.validateBothEndPositions(deltaPercent), this.render(this.model);
    }, Scrollbar.prototype.zoomByAmount = function(e, direction) {
        var deltaPercent = .001 * e.deltaY, zoomTarget = this.calculateCursorPosition(e);
        this.model.min = this.validateEndPosition(this.model.min + deltaPercent * (0 + 2 * zoomTarget), "min"), 
        this.model.max = this.validateEndPosition(this.model.max - deltaPercent * (2 - 2 * zoomTarget), "max"), 
        this.render(this.model);
    }, Scrollbar.prototype.pxToPct = function() {
        switch (this.direction) {
          case "x":
            return 5 / this.width;

          case "y":
            return 5 / this.height;
        }
    }, {
        add: add,
        triggerUpdate: triggerUpdate
    };
}(key), MouseEvent.prototype.clientXYDirectional = MouseEvent.prototype.clientXYDirectional || function(axis, sign) {
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