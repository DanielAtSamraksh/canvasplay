function $(id) {
  return document.getElementById(id);
}

var canvas = $("canvas");
var ctx = canvas.getContext("2d");
var mouse = $("mouse");

function drawPt(x,y,color) {
  ctx.save();
  ctx.fillStyle = color || "black";
  ctx.beginPath();
  ctx.arc(x,y,3,0,2*Math.PI);
  ctx.fill();
  ctx.restore();
}

function canvasPos(e) {
  // console.log(e);
  var x = e.pageX;
  var y = e.pageY;
  var el = e.target;
  // if (isNaN(x)) {console.log("not a ");}
  do {
    x -= el.offsetLeft - el.scrollLeft;
    y -= el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  } while (el);
  return {
    rawx:x, rawy:y,
    x:x*(e.target.width/e.target.offsetWidth || 1),
    y:y*(e.target.height/e.target.offsetHeight || 1)
  };
}

canvas.onclick = function(e) {
  console.log(e);
  var p=canvasPos(e);
  console.log(p);
  drawPt(p.x,p.y,"red");
};

canvas.onmousemove = function(e) {
  var p=canvasPos(e);
  mouse.innerHTML = p.x+","+p.y+"<br>"+p.rawx+","+p.rawy;
};


