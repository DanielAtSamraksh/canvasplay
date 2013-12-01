

      function mousePositionOnCanvas(e) {
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
