// ============================================================================
// MOUSE EVENT EXTENSIONS
// ============================================================================
// Same as event.clientX or event.clientY but with direction (+x, -x, +y, -y) specifiable
MouseEvent.prototype.clientXYDirectional =
  MouseEvent.prototype.clientXYDirectional || function (axis, sign)
{
  sign = sign === undefined ? +1 : sign;

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

// ============================================================================
// DOM ELEMENT EXTENSIONS
// ============================================================================
// Same as element.offsetLeft or element.offsetTop but with all four directions (left, right, top, bottom) specifiable
Element.prototype.offsetDirectional =
  Element.prototype.offsetDirectional || function (axis, sign)
{
  sign = sign === undefined ? +1 : sign;

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
Element.prototype.clientXYDirectional =
  Element.prototype.clientXYDirectional || function (axis, sign)
{
  sign = sign === undefined ? +1 : sign;
  
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
Element.prototype.clientLength =
  Element.prototype.clientLength || function (axis)
{
  var rect = this.getBoundingClientRect();
  switch( axis )
  {
    default:
    case 'x': return rect.width;
    case 'y': return rect.height;
  }
}

// ============================================================================
// CANVAS EXTENSIONS
// ============================================================================
// Canvas Clearing method
CanvasRenderingContext2D.prototype.clear = 
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform)
{
  if(preserveTransform)
  {
    this.save();
    this.setTransform(1, 0, 0, 1, 0, 0);
  }

  this.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if(preserveTransform)
  {
    this.restore();
  }           
};

// Rounded Rectangles
CanvasRenderingContext2D.prototype.roundRect = 
  CanvasRenderingContext2D.prototype.roundRect || function (x1, y1, x2, y2, radius, fill, stroke)
{
  this.beginPath();
  this.moveTo(+0.5 + x1 + radius, +0.5 + y1);
  this.lineTo(-0.5 + x2 - radius, +0.5 + y1);
  this.quadraticCurveTo(-0.5 + x2, +0.5 + y1, -0.5 + x2, +0.5 + y1 + radius);
  this.lineTo(-0.5 + x2, -0.5 + y2 - radius);
  this.quadraticCurveTo(-0.5 + x2, -0.5 + y2, -0.5 + x2 - radius, -0.5 + y2);
  this.lineTo(+0.5 + x1 + radius, -0.5 + y2);
  this.quadraticCurveTo(+0.5 + x1, -0.5 + y2, +0.5 + x1, -0.5 + y2 - radius);
  this.lineTo(+0.5 + x1, +0.5 + y1 + radius);
  this.quadraticCurveTo(+0.5 + x1, +0.5 + y1, +0.5 + x1 + radius, +0.5 + y1);
  this.closePath();
  if (stroke) this.stroke();
  if (fill) this.fill();
};