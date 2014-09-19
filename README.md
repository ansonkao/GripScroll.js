# GripScroll.js

_A decoupled scrollbar with end-grips, zooming, and an event API for custom coupling with your target element._

GripScroll works by injecting scrollbar(s) into your target container element, and then triggering update events
whenever the user interacts with the scrollbar(s).

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

## TODO
+ [Live demo](GripScroll.html)
+ Event API documentation
+ jQuery compatibility
+ Mousewheel scroll/zoom support 
+ Options+documentation
+ Promotion
+ Blog post...

* * *

Copyright 2014 Anson Kao
http://www.ansonkao.com/