// Same as event.clientX or event.clientY but with direction (+x, -x, +y, -y) specifiable
MouseEvent.prototype.clientXYDirectional = function( axis, sign )
{
  switch( axis )
  {
    case 'x':
      switch( sign > 0 )
      {
        case  true: return this.clientX;
        case false: return window.innerWidth - this.clientX;
      }
    case 'y':
      switch( sign > 0 )
      {
        case  true: return this.clientY;
        case false: return window.innerHeight - this.clientY;
      }
    default:
      return null;
  }
}

// Same as element.offsetLeft or element.offsetTop but with all four directions (left, right, top, bottom) specifiable
Element.prototype.offsetDirectional = function( axis, sign )
{
  switch( axis )
  {
    case 'x':
      switch( sign > 0 )
      {
        case  true: return this.offsetLeft;
        case false: return this.parentElement.offsetWidth - this.offsetWidth - this.offsetLeft;
      }
    case 'y':
      switch( sign > 0 )
      {
        case  true: return this.offsetTop;
        case false: return this.parentElement.offsetHeight - this.offsetHeight - this.offsetTop;
      }
    default:
      return null;
  }
}

// Same as event.clientX or event.clientY but with direction (+x, -x, +y, -y) specifiable and for elements
Element.prototype.clientXYDirectional = function( axis, sign )
{
  var rect = this.getBoundingClientRect();
  switch( axis )
  {
    case 'x':
      switch( sign > 0 )
      {
        case  true: return rect.left;
        case false: return window.innerWidth - rect.left - rect.width;
      }
    case 'y':
      switch( sign > 0 )
      {
        case  true: return rect.top;
        case false: return window.innerHeight - rect.top - rect.height;
      }
    default:
      return null;
  }
}

// Same as element.clientWidth or element.clientHeight but with axes specifiable (width, height)
Element.prototype.clientLength = function( axis )
{
  var rect = this.getBoundingClientRect();
  switch( axis )
  {
    default:
    case 'x': return rect.width;
    case 'y': return rect.height;
  }
}
