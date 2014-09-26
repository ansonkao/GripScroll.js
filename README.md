# GripScroll.js

_A decoupled scrollbar with end-grips, zooming, and an event API for custom coupling with your target element._

GripScroll works by injecting scrollbar(s) into your target container element, 
and then triggering update events whenever the user interacts with the scrollbar(s).
See the [Demo](http://ansonkao.github.io/gripscroll/).

+ End-grips for precise windowing
+ Tested in Chrome
+ Tested in FireFox
+ Tested in Safari
+ [COMING SOON] jQuery compatibility
+ [COMING SOON] Mousewheel scroll/zoom support 

## Usage

Setup a target container:
``` html
<div id="target-container">
  ...
</div>
```

Add GripScroll to your target container:
``` js
var target = document.querySelector("#target");
GripScroll.add( target );
```

Update your target whenever the user interacts with the scrollbar(s):
``` js
target.addEventListener('gripscroll-update', function(e){
  // Your update code here...
});
```

The `gripscroll-update` event has the following parameters:
+ `e.gripScrollX.min` - a decimal value between `0.000` and `1.000`
+ `e.gripScrollX.max` - a decimal value between `0.000` and `1.000`
+ `e.gripScrollY.min` - a decimal value between `0.000` and `1.000`
+ `e.gripScrollY.max` - a decimal value between `0.000` and `1.000`

You can also listen to individual scrollbars:
``` js
target.addEventListener('gripscroll-update-x', function(e){
  // Your horizontal update code here...
});

target.addEventListener('gripscroll-update-y', function(e){
  // Your vertical update code here...
});
```

Individual scrollbar events have the following parameters:
+ `e.gripScrollMin` - a decimal value between `0.000` and `1.000`
+ `e.gripScrollMax` - a decimal value between `0.000` and `1.000`

## Contribute
Contributions are welcome!
This is part of my ongoing effort to build browser-based music production software.
Check me out at [http://www.ansonkao.com/](http://www.ansonkao.com/) + more to come.

* * *

Copyright 2014 Anson Kao (MIT Licensed)
http://www.ansonkao.com/