var DragonDrop = (function(){

  // ==========================================================================
  // Private Variables
  // ==========================================================================
  var currentTarget = null;
  var targetCounter = 0;
  var gripHandlers = [];
  var dragHandlers = [];
  var dropHandlers = [];
  var startX = null;
  var startY = null;

  // ========================================================================
  // Private Methods
  // ========================================================================
  var getCurrentTarget = function(){ return currentTarget; }
  var isDragging       = function(){ return currentTarget !== null; };

  // @target        Element to be dragged
  // @gripHandler   Takes a mousedown event argument + data argument, performs some action during the grip (drag begin)
  // @dragHandler   Takes a mousemove event argument + data argument, performs some action during the dragging
  // @dropHandler   Takes a mouseup   event argument + data argument, Performs some action during the drop (drag end)
  var addHandler = function( target, gripHandler, dragHandler, dropHandler )
    {
      // Track the drag status upon mouse down
      var mousedownHandler = function( uid ){
        return function(e) {
          if( e.which == 1 ) // Left Click
          {
            currentTarget = uid; // use targetCounter to generate a uid
            gripHandlers[uid](e);
          }
        };
      }(targetCounter);  // Use function expression to avoid infamous closure loop problem
      target.addEventListener('mousedown', mousedownHandler);

      // Add drag and drop handlers to the stack
      gripHandlers[targetCounter] = gripHandler;
      dragHandlers[targetCounter] = dragHandler;
      dropHandlers[targetCounter] = dropHandler;
      targetCounter++;
    };


  // ========================================================================
  // Initialization
  // ========================================================================
  // Drag handling
  document.onmousewheel = function(e){ e.preventDefault(); }; // Cancel all scroll events during a drag (http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily)
  document.addEventListener('mousemove', function(e){ // Catch all mousemove events as drags
    if( isDragging() )
    {
      e.startX = startX;
      e.startY = startY;
      dragHandlers[currentTarget](e);
    }
  });

  // Drop handling
  document.addEventListener('mouseup'  , rootDropHandler( false ) ); // Catch all mouseup events as drops
  document.addEventListener('mousedown', rootDropHandler( true  ) ); // Catch all mousedown events during a drag (i.e. right clicks) as drops
  function rootDropHandler( ignoreLeftClick ){
    return function(e) {
      if( isDragging() && e.which > ignoreLeftClick|0 ) // > ignoreLeftClick|0  is a hack to toggle between all mouse buttons or ignoring the left button
      {
        e.startX = startX;
        e.startY = startY;
        dropHandlers[currentTarget](e);
        currentTarget = null;
        startX = null;
        startY = null;
      }
    };
  };


  // ========================================================================
  // Public Methods
  // ========================================================================
  return  { getCurrentTarget:   getCurrentTarget
          , isDragging:         isDragging
          , addHandler:         addHandler
          };
})();