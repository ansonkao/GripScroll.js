function GripScrollbar(a, b, c, d, e) {
    if (this.gutter = a, this.bar = b, this.grip = {
        min: c,
        max: d
    }, this.direction = e, this.perpendicular = {
        x: "y",
        y: "x"
    }[e], this.model = {
        min: 0,
        max: 0
    }, !GripScrollbar.prototype.initialized) {
        var f = GripScrollbar.prototype;
        f.initialized = !0, f.draw = function(a, b) {
            switch (this.direction) {
              case "x":
                "min" == b && (this.bar.style.left = 100 * a + "%"), "max" == b && (this.bar.style.right = 100 * a + "%");
                break;

              case "y":
                "min" == b && (this.bar.style.top = 100 * a + "%"), "max" == b && (this.bar.style.bottom = 100 * a + "%");
                break;

              default:
                console.warn("GripScrollbar.draw(): invalid direction");
            }
        }, f.save = function(a, b) {
            this.model[b] = a;
        }, f.calculatePosition = function(a, b) {
            switch (b) {
              case "min":
                var c = "min", d = "max", e = 1;
                break;

              case "max":
                var c = "max", d = "min", e = -1;
                break;

              default:
                console.warn("GripScrollbar.calculatePosition(): invalid minOrMax");
            }
            var f = this.gutter.clientXYDirectional(this.perpendicular, e), g = a.clientXYDirectional(this.perpendicular, e);
            if (console.log(f, g, this.direction, this.perpendicular, e), Math.abs(g - f) > 150) return this.model[c];
            var h = this.gutter.clientXYDirectional(this.direction, e), i = a.clientXYDirectional(this.direction, e), j = this.gutter.clientLength(this.direction), k = (i - h) / j;
            return console.log("newPosition:", k, i, h, j), 0 > k && (k = 0), k > 1 && (k = 1), 
            k + this.model[d] > 1 && (k = 1 - this.model[d]), k;
        };
    }
    var g = this;
    [ "min", "max" ].forEach(function(a) {
        DragonDrop.addHandler(g.grip[a], function() {}, function(b) {
            var c = g.calculatePosition(b, a);
            console.log("drag", c), g.draw(c, a);
        }, function(b) {
            var c = g.calculatePosition(b, a);
            console.log("drop", c), g.draw(c, a), g.save(c, a);
        });
    });
}

function GripScroll(a) {
    var b = document.getElementById(a), c = {
        x: b.appendChild(document.createElement("div")),
        y: b.appendChild(document.createElement("div"))
    }, d = {
        x: c.x.appendChild(document.createElement("div")),
        y: c.y.appendChild(document.createElement("div"))
    }, e = {
        x: {
            a: d.x.appendChild(document.createElement("div")),
            b: d.x.appendChild(document.createElement("div"))
        },
        y: {
            a: d.y.appendChild(document.createElement("div")),
            b: d.y.appendChild(document.createElement("div"))
        }
    };
    if (!GripScroll.prototype.initialized) {
        var f = GripScroll.prototype;
        f.initialized = !0, f.getContainer = function() {
            return b;
        }, f.getGutter = function(a) {
            return c[a];
        }, f.getBar = function(a) {
            return d[a];
        }, f.getGrip = function(a, b) {
            return e[a][b];
        }, f.initDOM = function() {
            b.className = "gripscroll-container", c.x.className = "gripscroll-gutter x", c.y.className = "gripscroll-gutter y", 
            d.x.className = "gripscroll-bar x", d.y.className = "gripscroll-bar y", e.x.a.className = "gripscroll-grip x a", 
            e.x.b.className = "gripscroll-grip x b", e.y.a.className = "gripscroll-grip y a", 
            e.y.b.className = "gripscroll-grip y b", d.x.setAttribute("draggable", "false"), 
            d.y.setAttribute("draggable", "false"), e.x.a.setAttribute("draggable", "false"), 
            e.x.b.setAttribute("draggable", "false"), e.y.a.setAttribute("draggable", "false"), 
            e.y.b.setAttribute("draggable", "false");
        }, f.initDragAndDrop = function() {
            new GripScrollbar(c.y, d.y, e.y.a, e.y.b, "y"), new GripScrollbar(c.x, d.x, e.x.a, e.x.b, "x");
        };
    }
    this.initDOM(), this.initDragAndDrop();
}

var DragonDrop = function() {
    function a(a) {
        return function(c) {
            j() && c.which > a | 0 && (c.startX = g, c.startY = h, f[b](c), b = null, g = null, 
            h = null);
        };
    }
    var b = null, c = 0, d = [], e = [], f = [], g = null, h = null, i = function() {
        return b;
    }, j = function() {
        return null !== b;
    }, k = function(a, g, h, i) {
        var j = function(a) {
            return function(c) {
                1 == c.which && (b = a, d[a](c), c.preventDefault());
            };
        }(c);
        a.addEventListener("mousedown", j), d[c] = g, e[c] = h, f[c] = i, c++;
    };
    return document.onmousewheel = function(a) {
        a.preventDefault();
    }, document.addEventListener("mousemove", function(a) {
        j() && (a.startX = g, a.startY = h, e[b](a));
    }), document.addEventListener("mouseup", a(!1)), document.addEventListener("mousedown", a(!0)), 
    {
        getCurrentTarget: i,
        isDragging: j,
        addHandler: k
    };
}();

MouseEvent.prototype.clientXYDirectional = function(a, b) {
    switch (a) {
      case "x":
        switch (b > 0) {
          case !0:
            return this.clientX;

          case !1:
            return window.innerWidth - this.clientX;
        }

      case "y":
        switch (b > 0) {
          case !0:
            return this.clientY;

          case !1:
            return window.innerHeight - this.clientY;
        }

      default:
        return null;
    }
}, Element.prototype.offsetDirectional = function(a, b) {
    switch (a) {
      case "x":
        switch (b > 0) {
          case !0:
            return this.offsetLeft;

          case !1:
            return this.parentElement.offsetWidth - this.offsetWidth - this.offsetLeft;
        }

      case "y":
        switch (b > 0) {
          case !0:
            return this.offsetTop;

          case !1:
            return this.parentElement.offsetHeight - this.offsetHeight - this.offsetTop;
        }

      default:
        return null;
    }
}, Element.prototype.clientXYDirectional = function(a, b) {
    var c = this.getBoundingClientRect();
    switch (a) {
      case "x":
        switch (b > 0) {
          case !0:
            return c.left;

          case !1:
            return window.innerWidth - c.left - c.width;
        }

      case "y":
        switch (b > 0) {
          case !0:
            return c.top;

          case !1:
            return window.innerHeight - c.top - c.height;
        }

      default:
        return null;
    }
}, Element.prototype.clientLength = function(a) {
    var b = this.getBoundingClientRect();
    switch (a) {
      default:
      case "x":
        return b.width;

      case "y":
        return b.height;
    }
};