var canvas, ctx, width, height;
function setCanvasProperties() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // I'm not sure why the following should be set,
  // but without the following 2 lines this code
  // does not work.
  ctx.canvas.width = width = window.innerWidth;
  ctx.canvas.height = height = window.innerHeight;
};


// see http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function relMouseCoords(event){
   var el=e.target, c=el;
   var scaleX = c.width/c.offsetWidth || 1;
   var scaleY = c.height/c.offsetHeight || 1;

   if (!isNaN(e.offsetX))
      return { x:e.offsetX*scaleX, y:e.offsetY*scaleY };

   var x=e.pageX, y=e.pageY;
   do {
     x -= el.offsetLeft;
     y -= el.offsetTop;
     el = el.offsetParent;
   } while (el);
   return { x: x*scaleX, y: y*scaleY };
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;



window.onload = function() {
  setCanvasProperties();
  window.onresize = setCanvasProperties;
  canvas.addEventListener("click", testCanvasListener);
  canvas.addEventListener("mousemove", showMousePosition);
};

function showMousePosition(e) {
  //console.log(e);
  e = e || window.event;
  var coords = canvas.relMouseCoords(e);
  var m = document.getElementById("mouse");
  m.innerHTML = coords.x + ", " + coords.y;
}

function clear() {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.2)"; // clear screen
  ctx.fillRect(0,0,width,height);
  ctx.restore();
}

function testCanvasListener (e){
  var coords = canvas.relMouseCoords(e);
  var x = coords.x;
  var y = coords.y;
  clear();
  console.log("Clicked", this, e);
  showPt(x, y);
  addSplinePoint(x, y);
}

function showPt(x,y,fillStyle) {
  // console.log("showPt", x, y);
  ctx.save();
  ctx.beginPath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  ctx.arc(x, y, 5, 0, 2*Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawLine(x1, y1, x2, y2, strokeStyle){
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  if (strokeStyle) {
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.restore();
  }
  else {
    ctx.save();
    ctx.strokeStyle = "pink";
    ctx.stroke();
    ctx.restore();
  }
}

var pts=[];

// given an array of x,y's, return distance between any two,
// note that i and j are indexes to the points, not directly into the array.
function dista(arr, i, j) {
  return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
}
function va(arr, i, j){
  return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
}
function ctlpts(x1,y1,x2,y2,x3,y3) {
  var t = .5;
  var v = va(arguments, 0, 2);
  var d01 = dista(arguments, 0, 1);
  var d12 = dista(arguments, 1, 2);
  var d012 = d01 + d12;
  return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
          x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
}

var animateTime = 0;
var animateTimeStep = 150;
function animate(f) {
  window.setTimeout(f, animateTime);
  animateTime += animateTimeStep;
}
function addSplinePoint(x, y){
  pts.push(x); pts.push(y);
  // console.log(pts);
  var len = pts.length / 2; // number of points
  if (len < 2) return;
  if (len == 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    ctx.lineTo(pts[2], pts[3]);
    ctx.stroke();
  }
  else {
    cps = []; // There will be two control points for each "middle" point, 1 ... len-2e
    for (var i = 0; i < len - 2; i += 1) {
      cps = cps.concat(ctlpts(pts[2*i], pts[2*i+1], pts[2*i+2], pts[2*i+3], pts[2*i+4], pts[2*i+5]));
    }
    animate(function() {
    for (var i = 0; i < len-2; i += 1) {
      showPt(cps[4*i+0], cps[4*i+1], "pink");
      showPt(cps[4*i+2], cps[4*i+3], "pink");
      drawLine(cps[4*i+0], cps[4*i+1], cps[4*i+2], cps[4*i+3], "pink");
    }
    });
    // console.log("pts", pts, "cps", cps);
    animate(function() { return function() {

    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    // from point 0 to point 1 is a quadratic
    ctx.quadraticCurveTo(cps[0], cps[1], pts[2], pts[3]);
    // for all middle points, connect with bezier
    for (var i = 2; i < len-1; i += 1) {
      // console.log("to", pts[2*i], pts[2*i+1]);
      ctx.bezierCurveTo(cps[(2*(i-1)-1)*2], cps[(2*(i-1)-1)*2+1],
                        cps[(2*(i-1))*2], cps[(2*(i-1))*2+1],
                        pts[i*2], pts[i*2+1]);
    }
    ctx.quadraticCurveTo(cps[(2*(i-1)-1)*2], cps[(2*(i-1)-1)*2+1],
                         pts[i*2], pts[i*2+1]);
    ctx.stroke();
    }; }());
  }

}

function addSplinePoint2(x, y){
  pts.push(x); pts.push(y);
  console.log(pts);
  var len = pts.length;
  if (len < 2*2) return;
  if (len == 2*2) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    ctx.lineTo(pts[2], pts[3]);
    ctx.stroke();
  }
  else if (len == 3*2) {
    var cps = ctlpts.apply(null, pts);
    showPt(cps[0], cps[0+1], "pink"); showPt(cps[2], cps[2+1], "pink");
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    ctx.quadraticCurveTo(cps[0], cps[0+1], pts[2], pts[2+1]);
    ctx.stroke();
  }
  else if (len >= 3*2) {
    var cp1 = ctlpts.apply(null, pts.slice(-4*2, -1*2)).slice(2);
    var cps = ctlpts.apply(null, pts.slice(-3*2));
    var cp2 = cps.slice(0, 2);
    var cp3 = cps.slice(2);
    showPt(cp1[0], cp1[0+1], "pink");
    showPt(cp2[0], cp2[1], "pink");
    showPt(cp3[0], cp3[1], "pink");
    ctx.beginPath();
    ctx.moveTo(pts[len-3*2], pts[len-3*2+1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], pts[len-2*2], pts[len-2*2+1]);
    ctx.quadraticCurveTo(cp3[0], cp3[1], pts[len-2], pts[len-1]);
    ctx.stroke();
  }
}

function addSplinePoint1(x, y){
  pts.push(x); pts.push(y);
  console.log(pts);
  var len = pts.length;
  if (len == 3*2) {
    /* pts = [start, cp1, pt1] */
    ctx.beginPath();
    var start = pts.slice(-6, -4), bez = pts.slice(-4);
    console.log(start, bez);
    ctx.moveTo.apply(ctx, start);
    ctx.quadraticCurveTo.apply(ctx, bez);
    ctx.stroke();
  }
  if (len > 3*2 && (len % (2*2) == 2)) {
    /* at start pts = [start, cp1, pt1, cp2, pt2]
       we need to add a control point before cp2 to set the angle of the line from p1.
       Easiest way to do this is just set a control point to be the mirrored cp1.
       cp1b = p1 - cp1 + p1.
       We want to scale this, so
       dist(start, pt1) + dist(pt1, pt2)
     */
    // set ps = [start, cp1, pt1, cp2, pt2]
    var ps = pts.slice(-5*2);
    var ds1 = Math.sqrt(Math.pow(ps[0] - ps[4], 2) + Math.pow(pts[0+1] - pts[4+1], 2));
    var d12 = Math.sqrt(Math.pow(ps[4] - pts[8], 2) + Math.pow(pts[4+1] - pts[8+1], 2));
    var cp_x = ps[4] - (ps[2] - ps[4]) * d12 / (ds1 || 1);
    var cp_y = ps[4+1] - (ps[2+1] - ps[4+1]) * d12 / (ds1 || 1);
    console.log("cp", cp_x, cp_y, ps);
    showPt(cp_x, cp_y, "pink");
    drawLine(ps[2], ps[2+1], cp_x, cp_y);
    ps.splice(6, 0, cp_x, cp_y);
    // now ps = [start, cp1, pt1, new_cp, cp2, pt2];
    ctx.beginPath();
    var start = ps.slice(-8, -6), bez = ps.slice(-6);
    console.log(start, bez);
    ctx.moveTo.apply(ctx, start);
    ctx.bezierCurveTo.apply(ctx, bez);
    ctx.stroke();
  }
}


