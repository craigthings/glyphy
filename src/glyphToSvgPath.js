export default function getSvgPath (path, scale, offset, roundDecimal) {
  return path.commands.map(function (command) {
    let s = scale || 1;
    let offsetX = offset.x;
    let offsetY = offset.y;
    var xNum = round((command.x * s) + offsetX, roundDecimal);
    var yNum = round((-command.y * s) + offsetY, roundDecimal);
    var xAnchor1 = round((command.x1 * s) + offsetX, roundDecimal);
    var yAnchor1 = round((-command.y1 * s) + offsetY, roundDecimal);
    var xAnchor2 = round((command.x2 * s) + offsetX, roundDecimal);
    var yAnchor2 = round((-command.y2 * s) + offsetY, roundDecimal);
    var x = String(xNum);
    var y = String(yNum);
    var type = command.type;
    switch (type) {
      case 'Z':
        return type;
      case 'M':
        return [ type + x, y ].join(' ');
      case 'L':
        return [ type + x, y ].join(' ');
      case 'Q':
        return [ type + String(xAnchor1), String(yAnchor1), x, y ].join(' ');
      case 'C':
        return [ type +
          String(xAnchor1), String(yAnchor1),
          String(xAnchor2), String(yAnchor2),
          x, y
        ].join(' ');
      default:
        throw new Error('invalid glyph path type: ' + type);
    }
  }).join(' ');
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
