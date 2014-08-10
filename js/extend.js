// Same as event.clientX or event.clientY but with direction (+x, -x, +y, -y) specifiable
MouseEvent.prototype.clientXYDirectional = function( axis, sign )
{
  // When drag ends, coordinates jump to (0,0). Return it as such (the code below will invert it to non-zero and break the consistency)
  if( this.clientX == 0 & this.clientY == 0 )
    return 0;

  switch( axis )
  {
    default:
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
  }
}

// Same as element.offsetLeft or element.offsetTop but with all four directions (left, right, top, bottom) specifiable
Element.prototype.offsetDirectional = function( axis, sign )
{
  switch( axis )
  {
    default:
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
  }
}

// Same as element.clientWidth or element.clientHeight but with axes specifiable (width, height)
Element.prototype.clientLength = function( axis )
{
  switch( axis )
  {
    default:
    case 'x': return this.clientWidth;
    case 'y': return this.clientHeight;
  }
}
