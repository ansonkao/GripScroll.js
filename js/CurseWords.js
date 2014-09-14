/* A cursor state manager. Manages priority of multiple state types.
 * - Implicit states via mouse hover, e.g. specific parts of a canvas (lower priority)
 * - Explicit states via explicit calls, e.g. dragging of an entity on that same canvas (higher priority)
 */
var CurseWords = (function(){

  // ==========================================================================
  // Private Variables
  // ==========================================================================
  var currentTarget = null;
  var targetCounter = 0;
  var targets       = [];
  var enterHandlers = [];
  var hoverHandlers = [];
  var  exitHandlers = [];
  var currentCursor = [];
  var body = document.getElementsByTagName('body')[0];

  // ========================================================================
  // Private Methods
  // ========================================================================
  var addTarget = function(targetElement, enterHandler, hoverHandler, exitHandler )
    {
      targets[targetCounter] = targetElement;
      enterHandlers[targetCounter] = enterHandler;
      hoverHandlers[targetCounter] = hoverHandler;
       exitHandlers[targetCounter] =  exitHandler;
      targetCounter++;
      return;
    };

  var applyCursor = function(newCursor)
    {
      var classes = body.className.split(' ');
      classes = classes.filter(function(c){ return c.lastIndexOf('curse-words-', 0) !== 0; });
      classes.push('curse-words-'+newCursor);
      body.className = classes.join(' ');
      currentCursor = newCursor;
    };


  // ========================================================================
  // Initialization
  // ========================================================================
  // Invoke respective handlers upon mouse activity
  document.addEventListener('mouseover', function(e){
    for( var i = 0; i < targets.length; i++ )
    {
      if( e.toElement == targets[i] )
      {
        // invoke exitHandler from previous target
        if( currentTarget != null )
          exitHandlers[currentTarget](e);

        // invoke enterHandler for new target
        currentTarget = i;
        enterHandlers[currentTarget](e);
        return;
      }
    }

    // If we get here, we've entered a benign element
    if( currentTarget != null )
      exitHandlers[currentTarget](e);
    applyCursor('default');
    currentTarget = null;
  });

  document.addEventListener('mousemove', function(e){
    if( currentTarget != null )
    {
      var newCursor = hoverHandlers[currentTarget](e);
      if( newCursor != currentCursor )
        applyCursor( newCursor );
    }
  });


  // ========================================================================
  // Public Methods
  // ========================================================================
  return  { addTarget: addTarget
          };
})();