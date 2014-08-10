DragonDrop =
  { currentTarget: null // Whether or not something is being dragged, value is a UID that maps to corresponding event handlers
  , targetCounter: 0
  , dataBuffers: []
  , dragHandlers: []
  , dropHandlers: []
  , addHandler: function( target      // Element to be dragged
                        , gripHandler // Takes a mousedown event argument, calculates and returns some data to be used by the drag and drop handlers
                        , dragHandler // Takes a mousemove event argument, performs some action during the dragging
                        , dropHandler // Takes a mouseup   event argument, Performs some action during the drop event
                        )
    {
      // Track the drag status upon mouse down
      var mousedownHandler = function( uid ){
        return function(e) {
          if( e.which == 1 )
          {
            console.log('Drag started!');
            DragonDrop.currentTarget = uid; // use this.targetCounter to generate a uid
            DragonDrop.dataBuffers[uid] = gripHandler(e);
          }
        };
      }(this.targetCounter);  // Use function expression to avoid infamous closure loop problem
      target.addEventListener('mousedown', mousedownHandler);

      // Add drag and drop handlers to the stack
      this.dragHandlers[this.targetCounter] = dragHandler;
      this.dropHandlers[this.targetCounter] = dropHandler;
      this.targetCounter++;
    }
  , init: function(){
      // Drag handling
      document.onmousewheel = function(e){ e.preventDefault(); }; // Cancel all scroll events during a drag (http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily)
      document.addEventListener('mousemove', function(e){ // Catch all mousemove events as drags
        if( DragonDrop.currentTarget !== null )
          DragonDrop.dragHandlers[ DragonDrop.currentTarget ](e);
      });

      // Drop handling
      document.addEventListener('mouseup'  , rootDropHandler(false) ); // Catch all mouseup events as drops
      document.addEventListener('mousedown', rootDropHandler(true ) ); // Catch all mousedown events during a drag (i.e. right clicks) as drops
      function rootDropHandler( ignoreLeftClick ){
        return function(e) {
          if( DragonDrop.currentTarget !== null && e.which > ignoreLeftClick|0 )
          {
            console.log('Drag ended!');
            DragonDrop.dropHandlers[DragonDrop.currentTarget](e);
            DragonDrop.currentTarget = null;
          }
        };
      };
    }
  };
  DragonDrop.init();