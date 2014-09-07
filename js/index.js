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
                       , max: 1
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
      if( newMax === undefined )  // Accept an object of the form {min:AAA, max:BBB}
      {
        newMax = newMin['max'];
        newMin = newMin['min'];
      }

      this.canvasContext.clear();
      this.canvasContext.strokeStyle = 'rgba(96,96,96,0.64)';
      this.canvasContext.fillStyle   = 'rgba(96,96,96,0.60)';
      switch( this.direction )
      {
        case 'x': this.canvasContext.roundRect(this.width*newMin,  0, this.width*newMax, this.height, 5, true, true); break;
        case 'y': this.canvasContext.roundRect(0, this.height*newMin, this.width, this.height*newMax, 5, true, true); break;
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
     * @return    Decimal value between 0.0 and 1.0
     */
    $.calculatePosition = function (e, minOrMax)
    {
      var offset = this.canvas.clientXYDirectional( this.direction );
      var mousePixels = e.clientXYDirectional( this.direction );
      var mouseRange = this.canvas.clientLength( this.direction );
      var newPosition = ( mousePixels - offset ) / mouseRange;

      return newPosition;
    }

    $.isOutsideDragZone = function (e)
    {
      var perpendicularOffset = this.canvas.clientXYDirectional( this.perpendicular, +1 );
      var perpendicularMousePixels = e.clientXYDirectional( this.perpendicular, +1 );
      if( Math.abs( perpendicularMousePixels - perpendicularOffset ) > 150 )
        return true;
    }
    // Escape to existing value if cursor drawn too far out
    // return this.model[otherEnd];

    // Stop at either end or when you are too far zoomed
    $.validatePosition = function (newPosition, minOrMax)
    {
      // Initialize Context
      var originalPosition = newPosition;
      switch( minOrMax )
      {
        case 'min':
               if( newPosition < 0 ) newPosition = 0;
          else if( newPosition > this.model['max'] - this.smallestZoom ) newPosition = this.model['max'] - this.smallestZoom;
          break;
        case 'max':
               if( newPosition > 1 ) newPosition = 1;
          else if( newPosition < this.model['min'] + this.smallestZoom ) newPosition = this.model['min'] + this.smallestZoom;
          break;
        default:
          // TODO.... error minOrMax checking?
      }
      console.log( originalPosition, newPosition );

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
  var thisGrip = null;
  var thatGrip = null;
  DragonDrop.addHandler(
    // targetElement
    that.canvas,
    // gripHandler
    function(e){
      var newPosition = that.calculatePosition(e);
           if( Math.abs( newPosition - that.model.min ) < 0.01 ) { thisGrip = 'min'; thatGrip = 'max'; }
      else if( Math.abs( newPosition - that.model.max ) < 0.01 ) { thisGrip = 'max'; thatGrip = 'min'; }
      else                                                       { thisGrip =  null; thatGrip =  null; }
    },
    // dragHandler
    function(e){
      if( thisGrip )
      {
        var newPosition = that.calculatePosition(e, thisGrip);
            newPosition = that.validatePosition(newPosition, thisGrip);
        var bothPositions = {};
            bothPositions[thisGrip] = newPosition;
            bothPositions[thatGrip] = that.model[thatGrip];
        that.draw( bothPositions );
      }
    },
    // dropHandler
    function(e){
      if( thisGrip )
      {
        var newPosition = that.calculatePosition(e, thisGrip);
            newPosition = that.validatePosition(newPosition, thisGrip);
        var bothPositions = {};
            bothPositions[thisGrip] = newPosition;
            bothPositions[thatGrip] = that.model[thatGrip];
        that.draw( bothPositions );
        that.save( newPosition, thisGrip );
      }
    }
  );

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