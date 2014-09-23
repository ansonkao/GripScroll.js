# GripScroll.js

_A decoupled scrollbar with end-grips, zooming, and an event API for custom coupling with your target element._

GripScroll works by injecting scrollbar(s) into your target container element, 
and then triggering update events whenever the user interacts with the scrollbar(s).
See [http://ansonkao.github.io/gripscroll/](http://ansonkao.github.io/gripscroll/)

+ End-grips for precise windowing
+ Tested in Chrome
+ Tested in FireFox

## Usage

Add GripScroll to your target container:
``` js
var target = document.querySelector("#target-container");
GripScroll.add( target );
```

Update your target whenever the user interacts with the scrollbar(s):
``` js
target.addEventListener('gripscroll-update', function(e){
  // Your update code here...
});
```

The gripscroll-update has the following parameters:
+ `e.min` - a decimal value between `0.000` and `1.000`
+ `e.max` - a decimal value between `0.000` and `1.000`
+ `e.direction` - `"x"` or `"y"` to indicate which scrollbar has changed

## TODO
+ [Live demo](GripScroll.html)
+ jQuery compatibility
+ Mousewheel scroll/zoom support 
+ Options+documentation
+ Promotion
+ Blog post...

* * *

Copyright 2014 Anson Kao (MIT)
http://www.ansonkao.com/