// Helper functions.
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Draw circle in given 2d context.
 * 
 * @param object context
 *   Context for drawing.
 * @param object circle
 *   Circle object, contains following fields:
 *     - x
 *     - y
 *     - radius
 *     - color
 *     - delta
 *       - x
 *       - y
 */
function drawCircle(context, circle) {
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
  context.fillStyle = circle.color;

  context.fill();
}

/**
 * Draw gradient line in given 2d context.
 *
 * @param object context
 *   Context for drawing.
 * @param int x1
 *   X coordinate of the line beginning.
 * @param int y1
 *   Y coordinate of the line beginning.
 * @param int x1
 *   X coordinate of the line ending.
 * @param int y1
 *   Y coordinate of the line ending.
 * @param string color1
 *   Color of the line beginning.
 * @param string color2
 *   Color of the line ending.
 */
function drawLine(context, x1, y1, x2, y2, color1, color2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);

  var gradient=context.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop("0", color1);
  gradient.addColorStop("1.0", color2);
  context.strokeStyle=gradient;

  context.stroke();
}

/**
 * Find nearest circles to given location.
 *
 * @param array circles
 *   Array to search circles in.
 * @param int x
 *   X coordinate of location.
 * @param int y
 *   Y coordinate of location.
 * @param int radius
 *   Max radius for nearest circle.
 *
 * @return array
 *   Array of nearest circles.
 */
function findNearestCircles(circles, x, y, radius) {
  var nearestCircles = [];
  circles.forEach(function(circle, i, array) {
    if ((circle.x != x) && (circle.y != y)) {
      if (distanceBetweenTwoPoints(x, y, circle.x, circle.y) < radius) {
        nearestCircles.push(circle);
      }
    }
  });

  return nearestCircles;
}

/**
 * Find distance between two points.
 *
 * @param int x1
 *   X coordinate of the first point.
 * @param int y1
 *   Y coordinate of the first point.
 * @param int x2
 *   X coordinate of the second point.
 * @param int y2
 *   Y coordinate of the second point.
 *
 * @return float
 *   Distance between two given points.
 */
function distanceBetweenTwoPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Callback for setInterval() function. Renders canvas frames.
 */
function tick(canvas, context, circles) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw connecting lines.
  circles.forEach(function(circle, i, array) {
    var nearestCircles = findNearestCircles(circles, circle.x, circle.y, 125);

    nearestCircles.forEach(function(nearestCircle, i, array2) {
      var distance = distanceBetweenTwoPoints(circle.x, circle.y, nearestCircle.x, nearestCircle.y);
      var brightness = 1 - distance / 125;
      var darkest = hexToRgb('#1d2021');

      var brightest1 = hexToRgb(circle.color);
      var color1 = {
        'r': Math.round((brightest1['r'] - darkest['r']) * brightness) + darkest['r'],
        'g': Math.round((brightest1['g'] - darkest['g']) * brightness) + darkest['g'],
        'b': Math.round((brightest1['b'] - darkest['b']) * brightness) + darkest['b'],
      };
      color1 = rgbToHex(color1['r'], color1['g'], color1['b']);

      var brightest2 = hexToRgb(nearestCircle.color);
      var color2 = {
        'r': Math.round((brightest2['r'] - darkest['r']) * brightness) + darkest['r'],
        'g': Math.round((brightest2['g'] - darkest['g']) * brightness) + darkest['g'],
        'b': Math.round((brightest2['b'] - darkest['b']) * brightness) + darkest['b'],
      };
      color2 = rgbToHex(color2['r'], color2['g'], color2['b']);

      drawLine(context, circle.x, circle.y, nearestCircle.x, nearestCircle.y, color1, color2);
    });
  });

  // Draw circle above lines.
  circles.forEach(function(circle, i, array) {
    if (circle.x < 0 || circle.x > canvas.width) {
      circle.delta.x = -circle.delta.x;
    }
    if (circle.y < 0 || circle.y > canvas.height) {
      circle.delta.y = -circle.delta.y;
    }
    circle.x = circle.x + circle.delta.x;
    circle.y = circle.y + circle.delta.y;

    drawCircle(context, circle);
  });
}

window.onload = function() {
  var canvas = document.getElementById("background-canvas");

  var circles = [];
  var circleColors = ['#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#ebdbb2']

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var context = canvas.getContext("2d");

  // Create 100 circles.
  for (var i = 0; i < 200; ++i) {
    var circle = {
      'x': random(1, window.innerWidth),
      'y': random(1, window.innerHeight),
      'radius': 3,
      'color': circleColors[random(0, circleColors.length - 1)],
      'delta': {
        'x': random(-1, 1),
        'y': random(-1, 1),
      }
    };
    circles.push(circle);
  }

  setInterval(tick, 25, canvas, context, circles);
}
