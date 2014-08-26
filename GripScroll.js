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
            e.y.b.className = "gripscroll-grip y b", d.x.setAttribute("draggable", "true"), 
            d.y.setAttribute("draggable", "true"), e.x.a.setAttribute("draggable", "true"), 
            e.x.b.setAttribute("draggable", "true"), e.y.a.setAttribute("draggable", "true"), 
            e.y.b.setAttribute("draggable", "true");
        }, f.initDragAndDrop = function() {
            var a, b, f;
            [ {
                x: "x",
                y: "y",
                side: {
                    a: "left",
                    b: "right"
                }
            }, {
                x: "y",
                y: "x",
                side: {
                    a: "top",
                    b: "bottom"
                }
            } ].forEach(function(g) {
                var h = g.x, i = g.y;
                [ {
                    ab: "a",
                    sign: 1
                }, {
                    ab: "b",
                    sign: -1
                } ].forEach(function(j) {
                    var k = j.ab, l = g.side[k], m = j.sign;
                    e[h][k].addEventListener("dragstart", function(c) {
                        return f = d[h].style[l], a = c.clientXYDirectional(h, m) - d[h].offsetDirectional(h, m), 
                        b = c.clientXYDirectional(i, m), !1;
                    }), e[h][k].addEventListener("drag", function(e) {
                        if (e.clientXYDirectional(h, m) > 0 && e.clientXYDirectional(i, m) > 0) if (Math.abs(e.clientXYDirectional(i, m) - b) < 100) {
                            var g = (e.clientXYDirectional(h, m) - a) / c[h].clientLength(h);
                            0 > g && (g = 0), g > 1 && (g = 1), d[h].style[l] = 100 * g + "%";
                        } else d[h].style[l] = f;
                        return !1;
                    }), c[h].addEventListener("dragend", function() {
                        return console.log("dragend"), !1;
                    });
                });
            });
        };
    }
    this.initDOM(), this.initDragAndDrop();
}

var DragonDrop = function() {
    function a(a) {
        return function(c) {
            i() && c.which > a | 0 && (c.startX = f, c.startY = g, e[b](c), b = null, f = null, 
            g = null);
        };
    }
    var b = null, c = 0, d = [], e = [], f = null, g = null, h = function() {
        return b;
    }, i = function() {
        return null !== b;
    }, j = function(a, f, g) {
        var h = function(a) {
            return function(c) {
                1 == c.which && (b = a);
            };
        }(c);
        a.addEventListener("mousedown", h), d[c] = f, e[c] = g, c++;
    };
    return document.onmousewheel = function(a) {
        a.preventDefault();
    }, document.addEventListener("mousemove", function(a) {
        i() && (a.startX = f, a.startY = g, d[b](a));
    }), document.addEventListener("mouseup", a(!1)), document.addEventListener("mousedown", a(!0)), 
    {
        getCurrentTarget: h,
        isDragging: i,
        addHandler: j
    };
}();

MouseEvent.prototype.clientXYDirectional = function(a, b) {
    if (0 == this.clientX & 0 == this.clientY) return 0;
    switch (a) {
      default:
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
    }
}, Element.prototype.offsetDirectional = function(a, b) {
    switch (a) {
      default:
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
    }
}, Element.prototype.clientLength = function(a) {
    switch (a) {
      default:
      case "x":
        return this.clientWidth;

      case "y":
        return this.clientHeight;
    }
};