function GripScrollbar( gutter, bar, minGrip, maxGrip, direction )
{
  // ==========================================================================
  // Private Members
  // ==========================================================================
  // DOM element references
  this.gutter  = gutter;
  this.bar     = bar;
  this.grip    = { min: minGrip
                 , max: maxGrip
                 };

  // Model
  this.direction     = direction;
  this.perpendicular = ({x:'y', y:'x'})[direction];
  this.model         = { min: 0
                     , max: 0
                     };

  // Prototype
  if( ! GripScrollbar.prototype.initialized )
  {
    var $ = GripScrollbar.prototype;
    $.initialized = true;

    // ========================================================================
    // Public Members
    // ========================================================================
    // Render to the screen with new values (not necessarily persistent ones)
    $.draw = function( newValue, minOrMax )
    {
      switch( this.direction )
      {
        case 'x':
          if( minOrMax == 'min' ) this.bar.style.left   = newValue*100 + '%';
          if( minOrMax == 'max' ) this.bar.style.right  = newValue*100 + '%';
          break;
        case 'y':
          if( minOrMax == 'min' ) this.bar.style.top    = newValue*100 + '%';
          if( minOrMax == 'max' ) this.bar.style.bottom = newValue*100 + '%';
          break;
        default:
          console.warn( 'GripScrollbar.draw(): invalid direction' );
      }
    };

    // Persist the values to the local model
    $.save = function( newValue, minOrMax )
    {
      this.model[minOrMax] = newValue;
    }

    /* Calculates a new position based on a mouse event
     * @e         A mouse event, probably from a drag handler
     * @minOrMax  'min' or 'max' (indicates which of these 2 positions are being adjusted)
     */
    $.calculatePosition = function( e, minOrMax )
    {
      // Initialize Context
      switch( minOrMax )
      {
        case 'min':
          var thisSide = 'min';
          var thatSide = 'max';
          var sign = +1;
          break;
        case 'max':
          var thisSide = 'max';
          var thatSide = 'min';
          var sign = -1;
          break;
        default:
          console.warn( 'GripScrollbar.calculatePosition(): invalid minOrMax' );
      }

      // Escape to existing value if cursor drawn too far out
      var perpendicularOffset = this.gutter.clientXYDirectional( this.perpendicular, sign );
      var perpendicularMousePixels = e.clientXYDirectional( this.perpendicular, sign );
      if( Math.abs( perpendicularMousePixels - perpendicularOffset ) > 150 )
        return this.model[thisSide];

      // Calculate new value
      var offset = this.gutter.clientXYDirectional( this.direction, sign );
      var mousePixels = e.clientXYDirectional( this.direction, sign );
      var mouseRange = this.gutter.clientLength( this.direction );
      var newPosition = ( mousePixels - offset ) / mouseRange;

      // Validate
      if( newPosition < 0 ) newPosition = 0;
      if( newPosition > 1 ) newPosition = 1;
      if( newPosition + this.model[thatSide] > 1 ) // range created by min and max can't zoom to less than 0
        newPosition = 1 - this.model[thatSide];
      return newPosition;
    }
  }

  // ==========================================================================
  // Initialization of each Instance
  // ==========================================================================
  var that = this;
  ['min', 'max'].forEach(function(minOrMax){   // Add Drag and Drop handlers for each grip
    DragonDrop.addHandler(
      // targetElement
      that.grip[minOrMax],
      // gripHandler
      function(e){},
      // dragHandler
      function(e){
        var newPosition = that.calculatePosition(e, minOrMax);
        that.draw( newPosition, minOrMax );
      },
      // dropHandler
      function(e){
        var newPosition = that.calculatePosition(e, minOrMax);
        that.draw( newPosition, minOrMax );
        that.save( newPosition, minOrMax );
      }
    );
  });
}


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
      bar.x.setAttribute('draggable', 'false');
      bar.y.setAttribute('draggable', 'false');
      grip.x.a.setAttribute('draggable', 'false');
      grip.x.b.setAttribute('draggable', 'false');
      grip.y.a.setAttribute('draggable', 'false');
      grip.y.b.setAttribute('draggable', 'false');
    };

    $.initDragAndDrop = function()
    {
      var yScroll = new GripScrollbar( gutter.y, bar.y, grip.y.a, grip.y.b, 'y' );
      var xScroll = new GripScrollbar( gutter.x, bar.x, grip.x.a, grip.x.b, 'x' );
    };
  }

  // ==========================================================================
  // Constructor execution
  // ==========================================================================
  this.initDOM();
  this.initDragAndDrop();
}