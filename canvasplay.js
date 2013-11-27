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

window.onload = function() {
  setCanvasProperties();
  window.onresize = setCanvasProperties;
  canvas.addEventListener("click", testCanvasListener);
};

function testCanvasListener (e){
  console.log("Clicked", this, e);
  showPt(e.x, e.y, pts.length % 4 == 2 && "pink");
  addSplinePoint(e.x, e.y);
}

function showPt(x,y,fillStyle) {
  console.log("showPt", x, y);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2*Math.PI);
  if (fillStyle) {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  }
  else {
    ctx.fill();
  }
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
function addSplinePoint(x, y){
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