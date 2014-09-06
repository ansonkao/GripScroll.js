function GripScrollbar(container, direction)
{
  // ==========================================================================
  // Private Members
  // ==========================================================================
  // DOM element references
  this.container     = container;
  this.canvas        = container.appendChild( document.createElement('canvas') );
  this.canvasContext = this.canvas.getContext("2d");
  this.canvas.className = 'bar '+direction;
    
  // Model
  this.direction     = direction;
  this.perpendicular = ({x:'y', y:'x'})[direction];
  this.smallestZoom  = 0.125;
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
    // Initialize dimensions
    $.init = function ()
    {
      // Canvas Dimensions
      switch( this.direction )
      {
        case 'x':
          this.canvas.width  = this.width  = this.container.clientWidth  - 20;
          this.canvas.height = this.height = 10;
          break;
        case 'y':
          this.canvas.width  = this.width  = 10;
          this.canvas.height = this.height = this.container.clientHeight - 20;
          break;
      }

      // Do it!
      this.draw( this.model.min, this.model.max );
    }

    // Render to the screen with new values (not necessarily persistent ones)
    $.draw = function (newMin, newMax)
    {
      this.canvasContext.clear();
      this.canvasContext.strokeStyle = 'rgba(96,96,96,0.64)';
      this.canvasContext.fillStyle   = 'rgba(96,96,96,0.60)';
      switch( this.direction )
      {
        case 'x': this.canvasContext.roundRect(this.width*newMin + 0.5,  0.5, this.width*(1-newMin-newMax) - 1, this.height - 1, 5, true, true); break;
        case 'y': this.canvasContext.roundRect(0.5, this.height*newMin + 0.5, this.width - 1, this.height*(1-newMin-newMax) - 1, 5, true, true); break;
      }

    };

    // Persist the values to the local model
    $.save = function (newValue, minOrMax)
    {
      this.model[minOrMax] = newValue;
    }

    /* Calculates a new position based on a mouse event
     * @e         A mouse event, probably from a drag handler
     * @minOrMax  'min' or 'max' (indicates which of these 2 positions are being adjusted)
     */
    $.calculatePosition = function (e, minOrMax)
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
      var perpendicularOffset = this.canvas.clientXYDirectional( this.perpendicular, sign );
      var perpendicularMousePixels = e.clientXYDirectional( this.perpendicular, sign );
      if( Math.abs( perpendicularMousePixels - perpendicularOffset ) > 150 )
        return this.model[thisSide];

      // Calculate new value
      var offset = this.canvas.clientXYDirectional( this.direction, sign );
      var mousePixels = e.clientXYDirectional( this.direction, sign );
      var mouseRange = this.canvas.clientLength( this.direction );
      var newPosition = ( mousePixels - offset ) / mouseRange;

      // Validate
      var originalNewPosition = newPosition;
      if( minOrMax == 'min' && newPosition < 0                                            ) newPosition = 0;
      if( minOrMax == 'min' && newPosition > 1 - this.model[thatSide] - this.smallestZoom ) newPosition = 1 - this.model[thatSide] - this.smallestZoom;
      if( minOrMax == 'max' && newPosition < 0 + this.model[thatSide] + this.smallestZoom ) newPosition = 0 + this.model[thatSide] + this.smallestZoom;
      if( minOrMax == 'max' && newPosition > 1                                            ) newPosition = 1;

      return newPosition;
    }
  }

  // ==========================================================================
  // Construction of each Instance
  // ==========================================================================
  this.init();

  // Event Handling
  var that = this;

  // Resize
  window.addEventListener('resize', function (e){
    that.init();
  });

  // Drag and Drop of grips
  ['min'].forEach(function (minOrMax){   // Add Drag and Drop handlers for each grip
    DragonDrop.addHandler(
      // targetElement
      that.canvas,
      // gripHandler
      function(e){},
      // dragHandler
      function(e){
        var newPosition = that.calculatePosition(e, minOrMax);
        that.draw( newPosition, that.model['max'] );
      },
      // dropHandler
      function(e){
        var newPosition = that.calculatePosition(e, minOrMax);
        that.draw( newPosition, that.model['max'] );
        that.save( newPosition, minOrMax );
      }
    );
  });

  return this.canvas;
}


function GripScroll(targetId, options)
{
  // ==========================================================================
  // Private Variables
  // ==========================================================================
  // Create the necessary DOM elements
  this.container = document.getElementById( targetId );
  this.container.className = 'gripscroll';
  this.bar = { x: new GripScrollbar( this.container, 'x' )
             , y: new GripScrollbar( this.container, 'y' )
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
    $.getContainer = function (  ){ return this.container; }
    $.getBar       = function (xy){ return this.bar[xy]; }

    // ========================================================================
    // Public Methods
    // ========================================================================
    $.init = function()
    {
      // ...
    };

  }

  // ==========================================================================
  // Constructor execution
  // ==========================================================================
  // ...
}