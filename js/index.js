function GripScroll( targetId, options ){

  // ==========================================================================
  // Private Variables
  // ==========================================================================
  // Create the necessary DOM elements
  var container = document.getElementById( targetId );
  var gutter    = { x: container.appendChild( document.createElement('div') )
                  , y: container.appendChild( document.createElement('div') )
                  };
  var bar       = { x: gutter.x.appendChild( document.createElement('div') )
                  , y: gutter.y.appendChild( document.createElement('div') )
                  };
  var grip = { x: { a: bar.x.appendChild( document.createElement('div') )
                  , b: bar.x.appendChild( document.createElement('div') )
                  }
             , y: { a: bar.y.appendChild( document.createElement('div') )
                  , b: bar.y.appendChild( document.createElement('div') )
                  }
             };

  // ==========================================================================
  // Public Variables
  // ==========================================================================
  //this.variableName = ...

  // Prototype
  if( ! GripScroll.prototype.initialized )
  {
    var $ = GripScroll.prototype;
    
    // ========================================================================
    // Public Static Variables
    // ========================================================================
    $.initialized = true

    // ========================================================================
    // Accessors
    // ========================================================================
    $.getContainer = function(        ){ return  container;     }
    $.getGutter    = function( xy     ){ return gutter[xy];     }
    $.getBar       = function( xy     ){ return    bar[xy];     }
    $.getGrip      = function( xy, ab ){ return   grip[xy][ab]; }

    // ========================================================================
    // Public Methods
    // ========================================================================
    $.initDOM = function()
    {
      // Add class names
      container.className = 'gripscroll-container';
      gutter.x.className  = 'gripscroll-gutter x';
      gutter.y.className  = 'gripscroll-gutter y';
      bar.x.className     = 'gripscroll-bar x';
      bar.y.className     = 'gripscroll-bar y';
      grip.x.a.className  = 'gripscroll-grip x a';
      grip.x.b.className  = 'gripscroll-grip x b';
      grip.y.a.className  = 'gripscroll-grip y a';
      grip.y.b.className  = 'gripscroll-grip y b';

      // Add dragabble
      bar.x.setAttribute('draggable', 'true');
      bar.y.setAttribute('draggable', 'true');
      grip.x.a.setAttribute('draggable', 'true');
      grip.x.b.setAttribute('draggable', 'true');
      grip.y.a.setAttribute('draggable', 'true');
      grip.y.b.setAttribute('draggable', 'true');
    };

    $.initDragAndDrop = function()
    {
      // Buffers
      var dragXStart;
      var dragYStart;
      var oldValue;

      // Add Event handlers
      // Loop through both x and y axes
      [ { x: 'x', y: 'y', side: { a: 'left', b: 'right'  } }
      , { x: 'y', y: 'x', side: { a: 'top' , b: 'bottom' } }
      ].forEach(function(xyParams){
        var x = xyParams.x;
        var y = xyParams.y;

        // Loop through both forwards and backwards directions on each axis
        [ { ab: 'a', sign: +1 }
        , { ab: 'b', sign: -1 }
        ].forEach(function(abParams){
          var ab   = abParams.ab;
          var side = xyParams.side[ab];
          var sign = abParams.sign;

          grip[x][ab].addEventListener('dragstart', function(e){
            oldValue = bar[x].style[side];
            dragXStart = e.clientXYDirectional(x, sign) - bar[x].offsetDirectional(x, sign);
            dragYStart = e.clientXYDirectional(y, sign);
            return false;
          });
          grip[x][ab].addEventListener('drag', function(e){
            // Only take action on non-zero values, (0,0) issometimes  presented when the drag ends and can cause spurious jumps
            if( e.clientXYDirectional(x, sign) > 0 && e.clientXYDirectional(y, sign) > 0 )
            {
              // Grip has been dragged closely (within 100px) - adjust the scrollbar
              if( Math.abs( e.clientXYDirectional(y, sign) - dragYStart ) < 100 )
              {
                var newPosition = ( e.clientXYDirectional(x, sign) - dragXStart ) / gutter[x].clientLength(x);
                if( newPosition < 0 )
                  newPosition = 0;
                if( newPosition > 1 )
                  newPosition = 1;
                bar[x].style[side] = newPosition * 100 + '%';
              }
              // Grip is being dragged but far out, so snap back to original value
              else 
                bar[x].style[side] = oldValue;
            }
            return false;
          });
          gutter[x].addEventListener('dragend', function(e){
            console.log( 'dragend' );
            return false;
          });
        });
      });

    };
  }

  // ==========================================================================
  // Constructor execution
  // ==========================================================================
  this.initDOM();
  this.initDragAndDrop();
}