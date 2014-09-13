/* A scrollbar with 3 grips:
 * - min, which resizes the end of the scrollbar closer to 0% limit
 * - max, which resizes the end of the scrollbar closer to 100% limit
 * - mid, which drags the entire scrollbar between either limit
 *
 * This scrollbar is injected into a container. Either or both direction(s)
 * (x-axis or the y-axis) can be injected individually.
 */
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

  var testerVar = direction;
  

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
     * @return    Decimal value between 0.0 and 1.0
     */
    $.calculateCursorPosition = function (e)
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

    /* Stop at either end or when you trying to drag either end and you are too far zoomed
     * @newPosition   The attempted position to validate (decimal number between 0.0 and 1.0)
     * @minOrMax      Which end are we validating? 'min' or 'max'
     * @return        The validated position (decimal number between 0.0 and 1.0)
     */
    $.validateEndPosition = function (newPosition, minOrMax)
    {
      switch( minOrMax )
      {
        case 'min':
               if( newPosition < 0 ) newPosition = 0;
          else if( newPosition > this.model.max - this.smallestZoom ) newPosition = this.model.max - this.smallestZoom;
          break;
        case 'max':
               if( newPosition > 1 ) newPosition = 1;
          else if( newPosition < this.model.min + this.smallestZoom ) newPosition = this.model.min + this.smallestZoom;
          break;
        default:
          // TODO.... error minOrMax checking?
      }

      return newPosition;
    }

    /* Stop at either end or when you are trying to drag the entire bar
     * @changePosition  The attempted change in position (decimal number between 0.0 and 1.0)
     * @return          The closest valid model of both ends in the form of: Object{min:0.0,max:1.0}
     */
    $.validateBothEndPositions = function(changePosition)
    {
      // Check the min end first
      var newMin = this.model.min + changePosition;
      if( newMin < 0 )
        changePosition -= newMin;

      // Check the max end next
      var newMax = this.model.max + changePosition;
      if( newMax > 1 )
        changePosition -= (newMax - 1);

      var newModel =  {};
          newModel.min = changePosition + this.model.min;
          newModel.max = changePosition + this.model.max;
      return newModel;
    }

    /* Recalculate and draw the scrollbar model based on an attempted drag action on one of the grips.
     * @e               A mouse event from the attempted drag
     * @whichGrip       The grip being dragged
     * @startPosition   The position at which the drag event started
     * @return          A copy of the new model of both ends in the form of: Object{min:0.0,max:1.0}
     */
    $.recalculateModel = function(e, whichGrip, startPosition)
    {
      // Cursor was dragged too far - revert to starting point
      if( whichGrip && this.isOutsideDragZone(e) )
      {
        this.draw( this.model );
        return null;
      }

      // Scrollbar 'mid' grip was dragged
      if( whichGrip == 'mid' )
      {
        var newPosition = this.calculateCursorPosition(e);
        var newModel = this.validateBothEndPositions(newPosition - startPosition);
        this.draw( newModel );
        return newModel;
      }

      // Scrollbar end-grip was resized
      if( whichGrip == 'min' || whichGrip == 'max' )
      {
        var newPosition = this.calculateCursorPosition(e);
            newPosition = this.validateEndPosition(newPosition, whichGrip);
        var otherGrip = ({min:'max', max:'min'})[whichGrip];
        var newModel = {};
            newModel[whichGrip] = newPosition;
            newModel[otherGrip] = this.model[otherGrip];
        this.draw( newModel );
        return newModel;
      }

      return null;
    }

    // Return pixels as percent units
    $.pxToPct = function()
    {
      switch( this.direction )
      {
        case 'x': return 5 / this.width;
        case 'y': return 5 / this.height;
      }
    }
  }

  // ==========================================================================
  // Construction of each Instance
  // ==========================================================================
  var that = this;

  // Initialize!
  that.init();
  window.addEventListener('resize', function (e){
    that.init();
  });

  // Drag and Drop of grips
  var whichGrip = null;
  var startPosition = null;
  DragonDrop.addHandler(
    // targetElement
    that.canvas,
    // gripHandler
    function(e){
      startPosition = that.calculateCursorPosition(e);
           if( Math.abs( startPosition - that.model.min ) < that.pxToPct(5)     ) { whichGrip = 'min'; }
      else if( Math.abs( startPosition - that.model.max ) < that.pxToPct(5)     ) { whichGrip = 'max'; }
      else if( startPosition > that.model.min && startPosition < that.model.max ) { whichGrip = 'mid'; }
      else                                                                        { whichGrip =  null; }
    },
    // dragHandler
    function(e){
      that.recalculateModel(e, whichGrip, startPosition);
    },
    // dropHandler
    function(e){
      var newModel = that.recalculateModel(e, whichGrip, startPosition);
      if( newModel )
      {
        that.save( newModel.min, 'min' );
        that.save( newModel.max, 'max' );
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