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
                clientSize: "clientWidth",
                side: {
                    a: "left",
                    b: "right"
                },
                clientXY: {
                    a: "clientX",
                    b: "clientY"
                },
                clientSide: {
                    a: "clientLeft",
                    b: "clientRight"
                }
            }, {
                x: "y",
                y: "x",
                clientSize: "clientHeight",
                side: {
                    a: "top",
                    b: "bottom"
                },
                clientXY: {
                    a: "clientY",
                    b: "clientX"
                },
                clientSide: {
                    a: "clientTop",
                    b: "clientBottom"
                }
            } ].forEach(function(g) {
                var h = g.x, i = g.y, j = g.clientSize;
                [ {
                    ab: "a",
                    sign: 1
                }, {
                    ab: "b",
                    sign: -1
                } ].forEach(function(k) {
                    var l = k.ab, m = g.side[l], n = k.sign;
                    e[h][l].addEventListener("dragstart", function(c) {
                        return c.dataTransfer.effectAllowed = "move", f = d[h].style[m], a = c.clientXYDirectional(h, n) - d[h].offsetDirectional(h, n), 
                        b = c.clientXYDirectional(i, n), !1;
                    }), e[h][l].addEventListener("drag", function(e) {
                        if (e.clientXYDirectional(h, n) > 0 && e.clientXYDirectional(i, n) > 0) if (Math.abs(e.clientXYDirectional(i, n) - b) < 100) {
                            var g = (e.clientXYDirectional(h, n) - a) / c[h][j];
                            0 > g && (g = 0), g > 1 && (g = 1), d[h].style[m] = 100 * g + "%";
                        } else d[h].style[m] = f;
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
};