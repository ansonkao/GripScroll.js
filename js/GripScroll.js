/* GripScroll takes a container and injects scrollbars.
 * One for the x-axis and/or one for the y-axis 
 */
GripScroll = (function(){

  var containerStack = [];
  var scrollbarStack = [];

  /* Initializes a new GripScroll around the specified container
   */
  var add = function(container, options)
    {
      // If this container was already added previously, skip
      for( var i = 0; i < containerStack.length; i++ )
      {
        if( containerStack[i] == container )
          return;
      }

      // Okay let's add it
      containerStack.push( container );
      scrollbarStack.push(
          { x: new Scrollbar( container, 'x' )
          , y: new Scrollbar( container, 'y' )
          }
        );
    };

  // ==========================================================================
  // Scrollbar definition
  // ==========================================================================
  /* A scrollbar with 3 grips:
   * - min, which resizes the end of the scrollbar closer to 0% limit
   * - max, which resizes the end of the scrollbar closer to 100% limit
   * - mid, which drags the entire scrollbar between either limit
   */
  function Scrollbar(container, direction)
  {
    // ------------------------------------------------------------------------
    // Members
    // ------------------------------------------------------------------------
    // DOM element references
    this.canvas        = container.appendChild( document.createElement('canvas') );
    this.canvasContext = this.canvas.getContext("2d");
    this.canvas.className = 'bar '+direction;
      
    // Model
    this.direction     = direction;
    this.perpendicular = ({x:'y', y:'x'})[direction];
    this.smallestZoom  = 0.125;
    this.isHovering    = false;
    this.isDragging    = false;
    this.wasHovering   = null;
    this.wasDragging   = null;
    this.model         = { min: 0
                         , max: 1
                         };
    this.oldDrawModel  = { min: null
                         , max: null
                         };

    // ------------------------------------------------------------------------
    // Methods
    // ------------------------------------------------------------------------
    // Initialize dimensions
    this.init = function ()
      {
        // Canvas Dimensions
        switch( this.direction )
        {
          case 'x':
            this.canvas.width  = this.width  = container.clientWidth  - 20;
            this.canvas.height = this.height = 10;
            break;
          case 'y':
            this.canvas.width  = this.width  = 10;
            this.canvas.height = this.height = container.clientHeight - 20;
            break;
        }

        // Clear state tracking
        this.wasHovering = null;
        this.wasDragging = null;
        this.oldDrawModel.min = null;
        this.oldDrawModel.max = null;

        // Refresh the canvas
        this.draw( this.model.min, this.model.max );
      };

    // Render to the screen with new values (not necessarily persistent ones)
    this.draw = function (newMin, newMax)
      {
        if( ! newMin && newMin !== 0 )  // No arguments - just draw the current model
        {
          newMin = this.model.min;
          newMax = this.model.max;
        }
        else if( ! newMax )  // No second argument - accept an object of the form {min:AAA, max:BBB} for the first argument
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
            case 'x': this.canvasContext.roundRect(this.width*newMin,  0, this.width*newMax, this.height, 5, true, true); break;
            case 'y': this.canvasContext.roundRect(0, this.height*newMin, this.width, this.height*newMax, 5, true, true); break;
          }
        }

        // Dispatch update event
        if( newMin != this.oldDrawModel.min
         || newMax != this.oldDrawModel.max
        )
        {
          var eventData = { detail:
                            { min: newMin
                            , max: newMax
                            , direction: this.direction
                            }
                          };
          var event = new CustomEvent('gripscroll-update', eventData);
          container.dispatchEvent(event);
        }

        // Update state tracking
        this.wasHovering = this.isHovering;
        this.wasDragging = this.isDragging;
        this.oldDrawModel.min = newMin;
        this.oldDrawModel.max = newMax;
      };

    // Persist the values to the local model
    this.save = function (newValue, minOrMax)
      {
        this.model[minOrMax] = newValue;
      };

    /* Calculates a new position based on a mouse event
     * @e         A mouse event, probably from a drag handler
     * @return    Decimal value between 0.0 and 1.0
     */
    this.calculateCursorPosition = function (e)
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
    this.whichGrip = function (cursorPosition)
      {
             if( Math.abs( cursorPosition - this.model.min ) < this.pxToPct(5)      ) { return 'min'; }
        else if( Math.abs( cursorPosition - this.model.max ) < this.pxToPct(5)      ) { return 'max'; }
        else if( cursorPosition > this.model.min && cursorPosition < this.model.max ) { return 'mid'; }
        else                                                                          { return  null; }      
      };

    this.isOutsideDragZone = function (e)
      {
        var perpendicularOffset = this.canvas.clientXYDirectional( this.perpendicular, +1 );
        var perpendicularMousePixels = e.clientXYDirectional( this.perpendicular, +1 );
        if( Math.abs( perpendicularMousePixels - perpendicularOffset ) > 150 )
          return true;
      };

    /* Stop at either end or when you trying to drag either end and you are too far zoomed
     * @newPosition   The attempted position to validate (decimal number between 0.0 and 1.0)
     * @minOrMax      Which end are we validating? 'min' or 'max'
     * @return        The validated position (decimal number between 0.0 and 1.0)
     */
    this.validateEndPosition = function (newPosition, minOrMax)
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
    this.validateBothEndPositions = function (changePosition)
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
    this.recalculateModel = function(e, whichGrip, startPosition)
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
      };

    // Return pixels as percent units
    this.pxToPct = function()
      {
        switch( this.direction )
        {
          case 'x': return 5 / this.width;
          case 'y': return 5 / this.height;
        }
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

    // Drag and Drop of grips
    var whichGrip = null;
    var startPosition = null;
    DragKing.addHandler(
      // targetElement
      that.canvas,
      // gripHandler
      function(e)
      {
        that.isDragging = true;
        startPosition = that.calculateCursorPosition(e);
        whichGrip = that.whichGrip(startPosition);

        // 
        if( whichGrip == 'mid' ) CurseWords.setExplicitCursor('grabbing');
        else if( whichGrip )     CurseWords.setExplicitCursor(that.direction+'resize');
      },
      // dragHandler
      function(e)
      {
        that.recalculateModel(e, whichGrip, startPosition);
      },
      // dropHandler
      function(e)
      {
        that.isDragging = false;
        CurseWords.clearExplicitCursor();
        var newModel = that.recalculateModel(e, whichGrip, startPosition);
        if( newModel )
        {
          that.save( newModel.min, 'min' );
          that.save( newModel.max, 'max' );
        }
      }
    );

    // Hovering / Cursor management
    CurseWords.addImplicitCursorHandler(
      // targetElement
      that.canvas,
      // enterHandler
      function(e){
        that.isHovering = true;
        that.draw();
      },
      // hoverHandler
      function(e)
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
        that.draw();
        return newCursor;
      },
      // exitHandler
      function(e){
        that.isHovering = false;
        that.draw();
      }
    );
  }
  // ==========================================================================
  // End of Scrollbar definition
  // ==========================================================================

  // Return the public singleton methods
  return { add: add
         };

})();
