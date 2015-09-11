/* GripScroll takes a container and injects scrollbars.
 * One for the x-axis and/or one for the y-axis 
 */
GripScroll = (function(key){

  var GripScrollStack = [];

  /* Initializes a new GripScroll around the specified container
   */
  var add = function(container, params)
    {
      // If this container was already added previously, skip
      for( var i = 0; i < GripScrollStack.length; i++ )
      {
        if( GripScrollStack[i].container == container )
          return false;
      }

      // Okay let's add it
      params = validateParams(params);
      var xParams = { direction: 'x', min: params.x.min, max: params.x.max, smallestZoom: params.smallestZoomX };
      var yParams = { direction: 'y', min: params.y.min, max: params.y.max, smallestZoom: params.smallestZoomY };
      GripScrollStack.push(
        { container: container
        , x: params.x ? new Scrollbar( container, xParams ) : null
        , y: params.y ? new Scrollbar( container, yParams ) : null
        }
      );

      // Initialize Appearance      
      container.classList.add('gripscroll');

      // Pass on individual scrollbar updates as full gripscroll updates
      if( params.x ) container.addEventListener('gripscroll-update-x', function(e){ triggerUpdate( container, {xMin: e.gripScrollMin, xMax: e.gripScrollMax} ); } );
      if( params.y ) container.addEventListener('gripscroll-update-y', function(e){ triggerUpdate( container, {yMin: e.gripScrollMin, yMax: e.gripScrollMax} ); } );

      // Scrollwheel handling
      var currentGripScroll = GripScrollStack[ GripScrollStack.length - 1 ];
      container.addEventListener("wheel", function(e){
        // Zoom
        if( key.ctrl )
        {
          // Use deltaY for both axes in Zoom
          currentGripScroll.x.zoomByAmount( e, 'x' );
          currentGripScroll.y.zoomByAmount( e, 'y' );
        }
        // Scroll
        else
        {
          // Use deltaX and deltaY respectively for scrolling
          currentGripScroll.x.moveByAmount( e.deltaX, 'x' );
          currentGripScroll.y.moveByAmount( e.deltaY, 'y' );
        }
        e.preventDefault();
      });
    

      return true;
    };

  /* Validate the incoming parameters and enforce defaults as appropriate. Make sure it is in the following form:
   * {
   *   x: {min: 0.25, max: 0.75},
   *   y: {min: 0.25, max: 0.75}
   * }
   * 
   * x can be either null or {min: 0.000, max: 1.000} or custom
   * y can be either null or {min: 0.000, max: 1.000} or custom
   */
  var validateParams = function(params)
    {
      if( ! params ) params = {};

      // x defaults: either null or {min: 0.000, max: 1.000} or custom
      if( params.x === undefined )
        params.x = { min: 0.000, max: 1.000 };
      else if( params.x )
      {
        if( params.x.min === undefined ) params.x.min = 0.000;
        if( params.x.max === undefined ) params.x.max = 1.000;
      }

      // y defaults: either null or {min: 0.000, max: 1.000} or custom
      if( params.y === undefined )
        params.y = { min: 0.000, max: 1.000 };
      else if( params.y )
      {
        if( params.y.min === undefined ) params.y.min = 0.000;
        if( params.y.max === undefined ) params.y.max = 1.000;
      }

      return params;
    };

  /* Triggers a 'gripscroll-update' event for the specified container
   */
  var triggerUpdate = function(container, overrideValues)
    {
      // Make sure this is an existing GripScroll container
      for( var i = 0; i < GripScrollStack.length; i++ )
        if( GripScrollStack[i].container == container )
          var thisGripScroll = GripScrollStack[i];
      if( ! thisGripScroll )
        return false;

      // It is, now let's trigger the update event!
      var event = new CustomEvent('gripscroll-update');
          event.gripScrollX = {};
          event.gripScrollX.min = ( typeof overrideValues === 'object' && overrideValues.xMin !== undefined ) ? overrideValues.xMin : thisGripScroll.x.model.min;
          event.gripScrollX.max = ( typeof overrideValues === 'object' && overrideValues.xMax !== undefined ) ? overrideValues.xMax : thisGripScroll.x.model.max;
          event.gripScrollY = {};
          event.gripScrollY.min = ( typeof overrideValues === 'object' && overrideValues.yMin !== undefined ) ? overrideValues.yMin : thisGripScroll.y.model.min;
          event.gripScrollY.max = ( typeof overrideValues === 'object' && overrideValues.yMax !== undefined ) ? overrideValues.yMax : thisGripScroll.y.model.max;
      container.dispatchEvent(event);
      return true;
    };

  // ==========================================================================
  // Scrollbar definition
  // ==========================================================================
  /* A scrollbar with 3 grips:
   * - min, which resizes the end of the scrollbar closer to 0% limit
   * - max, which resizes the end of the scrollbar closer to 100% limit
   * - mid, which drags the entire scrollbar between either limit
   */
  function Scrollbar(container, params)
  {
    // ------------------------------------------------------------------------
    // Members
    // ------------------------------------------------------------------------
    // DOM element references
    this.container     = container;
    this.canvas        = container.appendChild( document.createElement('canvas') );
    this.canvasContext = this.canvas.getContext("2d");
    this.canvas.className = 'bar '+params.direction;
      
    // Model
    this.direction     = params.direction;
    this.perpendicular = ({x:'y', y:'x'})[this.direction];
    this.smallestZoom  = params.smallestZoom || 0.125;
    this.isHovering    = false;
    this.isDragging    = false;
    this.wasHovering   = null;
    this.wasDragging   = null;
    this.pixelScale    = window.devicePixelRatio || 1;
    this.width         = null;
    this.height        = null;
    this.model         = { min: params.min || 0.000
                         , max: params.max || 1.000
                         };
    this.oldDrawModel  = { min: null
                         , max: null
                         };

    // ------------------------------------------------------------------------
    // Construction of each Scrollbar instance
    // ------------------------------------------------------------------------
    var that = this;

    // Initialize!
    that.init();
    window.addEventListener('resize', function (e){
      that.init();
    });

    // ------------------------------------------------------------------------
    // Drag and Drop of grips
    // ------------------------------------------------------------------------
    var whichGrip = null;
    var startPosition = null;
    var gripHandler = function(e)
      {
        that.isDragging = true;
        startPosition = that.calculateCursorPosition(e);
        whichGrip = that.whichGrip(startPosition);

        // Set explicit cursor state if drag is beginning
        if( whichGrip == 'mid' ) CurseWords.setExplicitCursor('grabbing');
        else if( whichGrip )     CurseWords.setExplicitCursor(that.direction+'resize');
      };
    var dragHandler = function(e)
      {
        that.recalculateModel(e, whichGrip, startPosition);
      };
    var dropHandler = function(e)
      {
        that.isDragging = false;
        CurseWords.clearExplicitCursor();
        var newModel = that.recalculateModel(e, whichGrip, startPosition);
        if( newModel )
        {
          that.save( newModel.min, 'min' );
          that.save( newModel.max, 'max' );
        }
      };
    DragKing.addHandler( that.canvas, gripHandler, dragHandler, dropHandler );

    // ------------------------------------------------------------------------
    // Hovering / Cursor management
    // ------------------------------------------------------------------------
    var enterHandler = function(e)
      {
        that.isHovering = true;
        if( ! that.isDragging )
          that.render();
      };
    var hoverHandler = function(e)
      {
        var newPosition = that.calculateCursorPosition(e);
        var hoverGrip = that.whichGrip(newPosition);
        var newCursor = null;
        switch( hoverGrip )
        {
          case 'min': that.isHovering =  true; newCursor = that.direction+'resize'; break;
          case 'max': that.isHovering =  true; newCursor = that.direction+'resize'; break;
          case 'mid': that.isHovering =  true; newCursor = 'grab'; break;
             default: that.isHovering = false; newCursor = 'default';
        }
        if( ! that.isDragging )
          that.render();
        return newCursor;
      };
    var exitHandler = function(e)
      {
        that.isHovering = false;
        if( ! that.isDragging )
          that.render();
      };
    CurseWords.addImplicitCursorHandler(  that.canvas, enterHandler, hoverHandler, exitHandler );
  }

  // ------------------------------------------------------------------------
  // Prototype Methods
  // ------------------------------------------------------------------------
  // Initialize dimensions
  Scrollbar.prototype.init = function ()
    {
      // Canvas Dimensions
      switch( this.direction )
      {
        case 'x':
          this.canvas.width  = this.width  = this.pixelScale * (this.container.clientWidth  - 20);
          this.canvas.height = this.height = this.pixelScale * 10;
          break;
        case 'y':
          this.canvas.width  = this.width  = this.pixelScale * 10;
          this.canvas.height = this.height = this.pixelScale * (this.container.clientHeight - 20);
          break;
      }

      // Clear state tracking
      this.wasHovering = null;
      this.wasDragging = null;
      this.oldDrawModel.min = null;
      this.oldDrawModel.max = null;

      // Refresh the canvas
      this.render( this.model.min, this.model.max );
    };

  // Render to the screen with new values (not necessarily persistent ones)
  Scrollbar.prototype.render = function (newMin, newMax)
    {
      if( typeof newMin === "undefined" )  // No arguments - just draw the current model
      {
        newMin = this.model.min;
        newMax = this.model.max;
      }
      else if( typeof newMax === "undefined" )  // No second argument - accept an object of the form {min:AAA, max:BBB} for the first argument
      {
        newMax = newMin['max'];
        newMin = newMin['min'];
      }

      // Only redraw if necessary
      if( newMin == this.oldDrawModel.min && this.wasHovering == this.isHovering
       && newMax == this.oldDrawModel.max && this.wasDragging == this.isDragging
      )
        return;

      // Redraw everything
      else
      {
        this.canvasContext.clear();

        if( this.isHovering || this.isDragging )
          this.canvas.classList.add('is-mouseover');
        else
          this.canvas.classList.remove('is-mouseover');

        this.canvasContext.strokeStyle = 'rgb(64,64,64)';
        this.canvasContext.fillStyle   = 'rgb(96,96,96)';

        switch( this.direction )
        {
          case 'x': this.canvasContext.roundRect(this.width*newMin,  0, this.width*newMax, this.height, 5 * this.pixelScale, true, true); break;
          case 'y': this.canvasContext.roundRect(0, this.height*newMin, this.width, this.height*newMax, 5 * this.pixelScale, true, true); break;
        }
      }

      // Dispatch update event
      if( newMin != this.oldDrawModel.min
       || newMax != this.oldDrawModel.max
      )
      {
        var event = new CustomEvent('gripscroll-update-'+this.direction);
            event.gripScrollMin = newMin;
            event.gripScrollMax = newMax;
        this.container.dispatchEvent(event);
      }

      // Update state tracking
      this.wasHovering = this.isHovering;
      this.wasDragging = this.isDragging;
      this.oldDrawModel.min = newMin;
      this.oldDrawModel.max = newMax;
    };

  // Persist the values to the local model
  Scrollbar.prototype.save = function (newValue, minOrMax)
    {
      this.model[minOrMax] = newValue;
    };

  /* Calculates a new position based on a mouse event
   * @e         A mouse event, probably from a drag handler
   * @return    Decimal value between 0.0 and 1.0
   */
  Scrollbar.prototype.calculateCursorPosition = function (e)
    {
      var offset = this.canvas.clientXYDirectional( this.direction );
      var mousePixels = e.clientXYDirectional( this.direction );
      var mouseRange = this.canvas.clientLength( this.direction );
      var newPosition = ( mousePixels - offset ) / mouseRange;

      return newPosition;
    };

  /* Determines which of the scrollbar's 3 possible grips were dragged (if any)
   * @cursorPosition  The position along the length of the scrollbar where the drag event took place
   * @return          'min', 'max', 'mid', or null
   */
  Scrollbar.prototype.whichGrip = function (cursorPosition)
    {
           if( Math.abs( cursorPosition - this.model.min ) < this.pxToPct(5)      ) { return 'min'; }
      else if( Math.abs( cursorPosition - this.model.max ) < this.pxToPct(5)      ) { return 'max'; }
      else if( cursorPosition > this.model.min && cursorPosition < this.model.max ) { return 'mid'; }
      else                                                                          { return  null; }      
    };

  // Snap back to the previous position if dragging orthogonally too far away from the scrollbar
  Scrollbar.prototype.isOutsideDragZone = function (e)
    {
      var perpendicularOffset = this.canvas.clientXYDirectional( this.perpendicular, +1 );
      var perpendicularMousePixels = e.clientXYDirectional( this.perpendicular, +1 );
      if( Math.abs( perpendicularMousePixels - perpendicularOffset ) > 150 )
        return true;

      return false;
    };

  /* Stop at either end or when you trying to drag either end and you are too far zoomed
   * @newPosition   The attempted position to validate (decimal number between 0.0 and 1.0)
   * @minOrMax      Which end are we validating? 'min' or 'max'
   * @return        The validated position (decimal number between 0.0 and 1.0)
   */
  Scrollbar.prototype.validateEndPosition = function (newPosition, minOrMax)
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
    };

  /* Stop at either end or when you are trying to drag the entire bar
   * @changePosition  The attempted change in position (decimal number between 0.0 and 1.0)
   * @return          The closest valid model of both ends in the form of: Object{min:0.0,max:1.0}
   */
  Scrollbar.prototype.validateBothEndPositions = function (changePosition)
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
    };

  /* Recalculate and draw the scrollbar model based on an attempted drag action on one of the grips.
   * @e               A mouse event from the attempted drag
   * @whichGrip       The grip being dragged
   * @startPosition   The position at which the drag event started
   * @return          A copy of the new model of both ends in the form of: Object{min:0.0,max:1.0}
   */
  Scrollbar.prototype.recalculateModel = function(e, whichGrip, startPosition)
    {
      // Cursor was dragged too far - revert to starting point
      if( whichGrip && this.isOutsideDragZone(e) )
      {
        this.render( this.model );
        return null;
      }

      // Scrollbar 'mid' grip was dragged
      if( whichGrip == 'mid' )
      {
        var newPosition = this.calculateCursorPosition(e);
        var newModel = this.validateBothEndPositions(newPosition - startPosition);
        this.render( newModel );
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
        this.render( newModel );
        return newModel;
      }

      return null;
    };

  // Attempt to move the scrollbar by a number of pixels
  Scrollbar.prototype.moveByAmount = function(amount, direction)
    {
      var mouseRange = this.canvas.clientLength( direction );
      var deltaPercent = amount / ( 3 * mouseRange );
      this.model = this.validateBothEndPositions( deltaPercent );
      this.render( this.model );
    };

  // Attempt to zoom the scrollbar by a number of pixels in both upper and lower limits
  Scrollbar.prototype.zoomByAmount = function(e, direction)
    {
      var deltaPercent = e.deltaY * 0.001; // Might need to adjust the 1000x scale depending on hardware...?
      var zoomTarget = this.calculateCursorPosition(e); // Try to centre the focal point around the cursor
      this.model.min = this.validateEndPosition(this.model.min + deltaPercent*(0 + 2*zoomTarget), 'min');
      this.model.max = this.validateEndPosition(this.model.max - deltaPercent*(2 - 2*zoomTarget), 'max');
      this.render( this.model );
    };

  // Return pixels as percent units
  Scrollbar.prototype.pxToPct = function()
    {
      switch( this.direction )
      {
        case 'x': return 5 / this.width;
        case 'y': return 5 / this.height;
      }
    };
  //
  // End of Scrollbar definition
  // ==========================================================================

  // Return the public singleton methods
  return { add: add
         , triggerUpdate: triggerUpdate
         };

})(key);
