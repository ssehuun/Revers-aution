function GraphVisu(arg1, arg2, arg3, initNodes, initLinks) {
  // toggle correct menu item
  var menu = (arg1 === false ? 1 : 0) * 2 + (arg2 === false ? 1 : 0) + 1;
  var UNDIRECTED = arg1, UNWEIGHTED = arg2;
  var maxNumberVertex = 100,
      grid = 20,
      width = 640,
      height = 360,
      colors = d3.scale.category10();
  // clear stuff
  d3.select("#drawgraph #viz").selectAll('svg').remove();
  var svg = d3.select('#drawgraph #viz')
              .append('svg')
              .attr('width', width)
              .attr('height', height);
  var countNodeId = new Array(maxNumberVertex);
  for (var i = countNodeId.length; i >= 0; i--)
    countNodeId[i] = 0;
  var nodes = [{id: 0, x: 100, y: 100},
               {id: 1, x: 200, y: 200},
               {id: 2, x: 300, y: 300}], lastNodeId = 3;
  var links;
  if (UNWEIGHTED === true) {
    links = [{source: nodes[0], target: nodes[1]},
             {source: nodes[1], target: nodes[2]}];
  }
  else {
    links = [{source: nodes[0], target: nodes[1], weight: 2},
             {source: nodes[1], target: nodes[2], weight: 2}];
  }

  if (initNodes == undefined || initLinks == undefined) {
    links = [];
    nodes = [];
  }
  else {
    nodes = initNodes;
    links = initLinks;
  }

  lastNodeId = 0;

  // magic function
  lastNodeId = nodes.length;
  for (var i = 0; i < nodes.length; i++) countNodeId[nodes[i].id]++;
  
  for (var i = 0; i < links.length; i++)
    for (var j = 0; j < nodes.length; j++) {
      if (nodes[j].id === links[i].source.id) links[i].source = nodes[j];
      if (nodes[j].id === links[i].target.id) links[i].target = nodes[j];
    }
  // end of magic

  svg.append('svg:defs')
     .append('svg:marker')
     .attr('id', 'end-arrow')
     .attr('viewBox', '0 -5 10 10')
     .attr('refX', 6)
     .attr('markerWidth', 3)
     .attr('markerHeight', 3)
     .attr('orient', 'auto')
     .append('svg:path')
     .attr('d', 'M0,-5L10,0L0,5')
     .attr('fill', '#000');
  var drag_line = svg.append('svg:path')
     .attr('class', 'link dragline hidden')
     .attr('d', 'M0,0L0,0');
  var path;
  var circle;
  var weight;
  var selected_node = null,
      selected_link = null,
      mousedown_link = null,
      mousedown_node = null,
      mouseup_node = null;

  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  function restart() { // redraw everything
    svg.selectAll('g').remove();
    path = svg.append('svg:g').selectAll('path');
    circle = svg.append('svg:g').selectAll('g');
    weight = svg.append('svg:g').selectAll('text');
    circle = circle.data(nodes, function(d) {
      return d.id;
    });
    circle.selectAll('circle')
      .style('fill', function(d) {
        return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
      });
    var g = circle.enter().append('svg:g');
    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', 16)
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; })
      .style('fill', function(d) { return (d === selected_node) ? d3.rgb(255, 138, 39) : d3.rgb(238, 238, 238); })
      .on('mousedown', function(d) {
        if (d3.event.ctrlKey) return;
        mousedown_node = d;
        if (mousedown_node === selected_node)
          selected_node = null;
        else
          selected_node = mousedown_node;
        selected_link = null;
        // reposition drag line
        drag_line.style('marker-end', 'url(#end-arrow)')
          .classed('hidden', false)
          .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
        restart();
      })
      .on('mouseup', function(d) {
        if (!mousedown_node) return;
        drag_line.classed('hidden', true)
          .style('marker-end', '');
        // check for drag-to-self
        mouseup_node = d;
        if (mouseup_node === mousedown_node) {
          resetMouseVars();
          return;
        }

        var source, target, direction;
        source = mousedown_node;
        target = mouseup_node;
        var link;
        if (UNDIRECTED === false) {
          link = links.filter(function(l) {
            return (l.source === source && l.target === target);
          })[0];
        }
        else {
          link = links.filter(function(l) {
            return (l.source === source && l.target === target) || (l.source === target && l.target === source);
          })[0];
        }

        if (!link) {
          if (UNWEIGHTED === false) {
            var dist = parseInt(Math.sqrt(Math.pow(source.x-target.x, 2) + Math.pow(source.y-target.y, 2)) / 100 + 1);
            link = {source: source, target: target, weight: dist};
            links.push(link);
          }
          else {
            link = {source: source, target: target};
            links.push(link);
          }
        }

        // select new link
        selected_link = link;
        selected_node = null;
        restart();
      });

    g.append('svg:text')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y + 16/3; })
      .attr('class', 'id')
      .text(function(d) { return d.id; });

    // drawing paths
    path = path.data(links);
    path.classed('selected', function(d) {
      return d === selected_link;
    });
    path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', function(d) {
        return d === selected_link;
      })
      .style('marker-end', function(d) {
        if (UNDIRECTED === false) return 'url(#end-arrow)';
      })
      .attr('d', function(d) {
        var deltaX = d.target.x-d.source.x,
            deltaY = d.target.y-d.source.y,
            dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY),
            normX = deltaX/dist,
            normY = deltaY/dist,
            sourcePadding = 12,
            targetPadding = 17;
        if (UNDIRECTED === true) targetPadding = 12;
        var sourceX = d.source.x + (sourcePadding*normX),
            sourceY = d.source.y + (sourcePadding*normY),
            targetX = d.target.x - (targetPadding*normX),
            targetY = d.target.y - (targetPadding*normY);
        if (UNDIRECTED === true)
          return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;

        // check if needs to draw curve or not ?
        var link;
        link = links.filter(function(l) {
          return (l.source === d.target && l.target === d.source);
        })[0];

        if (link) {
          // need arrow
          var type;
          if (d.source.id < d.target.id)
            type = 1;
          else
            type = 2;
          // change final point of arrow
          var finalX = arrowXY(sourceX, sourceY, targetX, targetY, type).x;
          var finalY = arrowXY(sourceX, sourceY, targetX, targetY, type).y;
          var beginX = arrowXY(targetX, targetY, sourceX, sourceY, type).x;
          var beginY = arrowXY(targetX, targetY, sourceX, sourceY, type).y;
          return 'M' + beginX + ',' + beginY + 'L' + finalX + ',' + finalY;
        }
        else { // no need
          return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        }
        // end check
      })
      .on('mousedown', function(d) {
        if (d3.event.ctrlKey) return;
        // select link
        mousedown_link = d;
        if (mousedown_link === selected_link)
          selected_link = null;
        else
          selected_link = mousedown_link;
        selected_node = null;
        restart();
      });

    if (UNWEIGHTED === false) { // start weight display
      weight = weight.data(links);
      weight.enter().append('svg:text')
        .attr('class', 'weight')
        .attr('x', function(d) {
          var type;
          if (d.source.id < d.target.id)
            type = 1;
          else
            type = 2;
          var link;
          link = links.filter(function(l) {
            return (l.source === d.target && l.target === d.source);
          })[0];
          var curve = 0;
          if (link)
            curve = 2;
          var x = weightXY(d.source.x, d.source.y, d.target.x, d.target.y, type, curve).x;
          return x;
        })
        .attr('y', function(d) {
          var type;
          if (d.source.id < d.target.id)
            type = 1;
          else
            type = 2;
          var link;
          link = links.filter(function(l) {
            return (l.source === d.target && l.target === d.source);
          })[0];
          var curve = 0;
          if (link)
            curve = 2;
          var y = weightXY(d.source.x, d.source.y, d.target.x, d.target.y, type, curve).y;
          return y;
        })
        .text(function(d) { return d.weight; });
      }

      var maxNodeId = -1;
      var countNode = nodes.length;
      var countEdge = links.length;
      var adjMat = [];
      for (var i = 0; i < nodes.length; i++)
        if (nodes[i].id > maxNodeId)
          maxNodeId = nodes[i].id;
      maxNodeId++;

      // adjacency matrix
      var validNode = new Array(maxNodeId);
      for (var i = 0; i < maxNodeId; i++)
        validNode[i] = false;
      for (var i = 0; i < nodes.length; i++)
        validNode[nodes[i].id] = true;
      for (var i = 0; i < maxNodeId; i++) {
        adjMat[i] = [];
        for (var j = 0; j < maxNodeId; j++)
          if (validNode[i] === true && validNode[j] === true)
            adjMat[i][j] = "0";
          else
            adjMat[i][j] = "x";
      }

      if (UNDIRECTED === true) {
        if (UNWEIGHTED === true) {
          for (var i = 0; i < links.length; i++) {
            adjMat[links[i].source.id][links[i].target.id] = "1";
            adjMat[links[i].target.id][links[i].source.id] = "1";
          }
        }
        else {
          for (var i = 0; i < links.length; i++) {
            adjMat[links[i].source.id][links[i].target.id] = links[i].weight.toString();
            adjMat[links[i].target.id][links[i].source.id] = links[i].weight.toString();
          }
        }
      }
      else {
        if (UNWEIGHTED === true) {
          for (var i = 0; i < links.length; i++)
            adjMat[links[i].source.id][links[i].target.id] = "1";
        }
        else {
          for (var i = 0; i < links.length; i++)
            adjMat[links[i].source.id][links[i].target.id] = links[i].weight.toString();
        }
      }

    // json object
    var json = "{\"vl\":{";

    for (var i = 0; i < nodes.length; i++) { // process nodes
      var first = "\"" + i + "\":";
      var obj = new Object();
      obj.x = nodes[i].x;
      obj.y = nodes[i].y;
      var second = JSON.stringify(obj);
      json += first + second;
      if (i !== nodes.length-1) json += ",";
    }

    var add = "},\"el\":{";
    json = json.concat(add);
      
    for (var i = 0; i < links.length; i++) { // process edges
      var first = "\"" + i + "\":";
      var obj = new Object();
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].id == links[i].source.id) obj.u = j;
        if (nodes[j].id == links[i].target.id) obj.v = j;
      }
      obj.w = 1;
      if (UNWEIGHTED === false)
        obj.w = links[i].weight;
      var second = JSON.stringify(obj);
      json += first + second;
      if (i !== links.length-1) json += ",";
    }

    add = "}}";
    json = json.concat(add);

    JSONresult = json;
  }

  function arrowXY(x1, y1, x2, y2, t) {
    var dist = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
   
    if (x1 === x2) {
      if (t === 1) return {x: x2-4, y: y2};
      else         return {x: x2+4, y: y2};
    }
    
    if (y1 === y2) {
      if (t === 1) return {x: x2, y: y2-4};
      else         return {x: x2, y: y2+4};
    }
    
    var m1 = (y2 - y1)/(x2-x1);
    var c1 = y1 - m1*x1;
    var m2 = -1 / m1;
    var c2 = y2 - m2*x2;
    var d = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    
    var v = 4;
    d = d*d + v*v;
    var D = d;
    var z1 = c2 - y1;
    
    var a = 1 + m2*m2;
    var b = 2*m2*z1 - 2*x1;
    var c = x1*x1 + z1*z1 - D;
    
    var delta = b*b - 4*a*c;
    
    delta = Math.sqrt(delta);
    
    var x_1 = (-b+delta)/(2*a);
    var y_1 = m2*x_1 + c2;
    
    var x_2 = (-b-delta)/(2*a);
    var y_2 = m2*x_2 + c2;
    
    if (t === 2) return {x : x_1, y: y_1};
    else         return {x : x_2, y: y_2};
  }

  function weightXY(x1, y1, x2, y2, t, curve) {
    var dist = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

    var x2 = (x1+x2)/2;
    var y2 = (y1+y2)/2;
    
    if (x1 === x2) {
      if (t === 2) return {x: x2+16, y: y2};
      else         return {x: x2-16, y: y2};
    }
    
    if (y1 === y2) {
      if (t === 2) return {x: x2 , y: y2+16};
      else         return {x: x2, y: y2-16};
    }

    var m1 = (y2 - y1)/(x2-x1);
    var c1 = y1 - m1*x1;
    var m2 = -1 / m1;
    var c2 = y2 - m2*x2;
    var d = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
    
    var v = 16;
    if (curve === 1) v = 50;
    if (curve === 2) v = 18;
    
    d = d*d + v*v;
    var D = d;
    var z1 = c2 - y1;
    
    var a = 1 + m2*m2;
    var b = 2*m2*z1 - 2*x1;
    var c = x1*x1 + z1*z1 - D;
    
    var delta = b*b - 4*a*c;
    
    delta = Math.sqrt(delta);
    
    var x_1 = (-b+delta)/(2*a);
    var y_1 = m2*x_1 + c2;
    
    var x_2 = (-b-delta)/(2*a);
    var y_2 = m2*x_2 + c2;
    
    if (t === 2) return {x : x_1, y: y_1};
    else return {x : x_2, y: y_2};
  }

  function mousedown() {
    svg.classed('active', true);
    if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

    // insert new node at point
    var point = d3.mouse(this), node = {id: lastNodeId};

    // find new last node ID
    countNodeId[lastNodeId]++;
    for (var i = 0; i < maxNumberVertex; i++)
      if (countNodeId[i] === 0) {
        lastNodeId = i;
        break;
      }

    node.x = point[0];
    node.y = point[1];

    node.x = parseInt(node.x) - parseInt(node.x) % grid;
    node.y = parseInt(node.y) - parseInt(node.y) % grid;
    nodes.push(node);
    restart();
  }

  function mousemove() {
    if (!mousedown_node) return;
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    restart();
  }

  function mouseup() {
    if (mousedown_node) drag_line.classed('hidden', true); // hide drag line
    // because :active only works in WebKit?
    svg.classed('active', false);
    // clear mouse event vars
    resetMouseVars();
  }

  function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
      return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
      links.splice(links.indexOf(l), 1);
    });
  }

  var lastKeyDown = -1;
  var drag = d3.behavior.drag().on("drag", function(d) {
    var dragTarget = d3.select(this).select('circle');
    var new_cx, new_cy;
    dragTarget.attr("cx", function() {
      new_cx = d3.mouse($("svg")[0])[0];
      return new_cx;
    })
    .attr("cy", function() {
      new_cy = d3.mouse($("svg")[0])[1];
      return new_cy;
    });
    d.x = new_cx;
    d.y = new_cy;
    d.x = parseInt(d.x) - parseInt(d.x) % grid;
    d.y = parseInt(d.y) - parseInt(d.y) % grid;
    restart();
  });

  function keydown() {
    //d3.event.preventDefault();
    lastKeyDown = d3.event.keyCode;
   
    if (d3.event.keyCode === 17) { // ctrl
      circle.call(drag);
      svg.classed('ctrl', true);
    }
   
    if (!selected_node && !selected_link) return;
    
    switch (d3.event.keyCode) {
      case 46: // delete
        if (selected_node) {
          nodes.splice(nodes.indexOf(selected_node), 1);
          spliceLinksForNode(selected_node);
          countNodeId[selected_node.id] = 0;
          for (var i = 0; i < maxNumberVertex; i++)
            if (countNodeId[i] === 0) {
              lastNodeId = i;
              break;
            }
        }
        else if (selected_link)
          links.splice(links.indexOf(selected_link), 1);
        selected_link = null;
        selected_node = null;
        restart();
        break;
      case 13: // enter
        if (selected_link && UNWEIGHTED === false) {
          while (true) {
            var newWeight = prompt("Enter new weight: (<= 99)");
            if (newWeight <= 99) break;
          }
          var idx = links.indexOf(selected_link);
          links[idx].weight = newWeight;
        }
        restart();
        break;
    }
  }

  function keyup() {
    lastKeyDown = -1;
    if (d3.event.keyCode === 17) { // ctrl
      circle.on('mousedown.drag', null)
            .on('touchstart.drag', null);
      svg.classed('ctrl', false);
    }
  }

  svg.on('mousedown', mousedown)
     .on('mousemove', mousemove)
     .on('mouseup', mouseup);
  d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
  restart();
}



function write(bool1, bool2) {
  var toWrite = '\
  <script>var JSONresult;</script>\
    <div id="main">\
      <div id="draw-status"><p>Status</p></div>\
      <div id="draw-warn"><p>No Warning</p></div>\
      <div id="draw-err"><p>No Error</p></div>\
      <div id="viz">\
\
        <svg onClick = "GraphVisu(' + bool1 + ',' + bool2 + '); " width="640" height="360"><defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="6" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5" fill="#000"></path></marker></defs><path class="link dragline hidden" d="M0,0L0,0"></path><g><path class="link" d="M108.48528137423857,108.48528137423857L191.51471862576142,191.51471862576142"></path><path class="link" d="M208.48528137423858,208.48528137423858L291.5147186257614,291.5147186257614"></path></g><g><g><circle class="node" r="16" cx="100" cy="100" style="fill: rgb(238, 238, 238);"></circle><text x="100" y="105.33333333333333" class="id">0</text></g><g><circle class="node" r="16" cx="200" cy="200" style="fill: rgb(238, 238, 238);"></circle><text x="200" y="205.33333333333334" class="id">1</text></g><g><circle class="node" r="16" cx="300" cy="300" style="fill: rgb(238, 238, 238);"></circle><text x="300" y="305.3333333333333" class="id">2</text></g></g><g></g>\
        <text x = "250" y = "100"> &bull; Click on empty space to add vertex</text>\
        <text x = "250" y = "125"> &bull; Drag from vertex to vertex to add edge</text>\
        <text x = "250" y = "150"> &bull; Select + Delete to delete vertex/edge</text>\
        <text x = "250" y = "175"> &bull; Select Edge + Enter to change edge\'s weight</text>\
      </svg>\
    </div>\
\
\
    <div id="drawgraph-actions">\
      <p onclick=drawCancel()>Cancel</p>\
      <p onclick=GraphVisu(' + bool1 + ',' + bool2 + ')>Clear</p>\
      <p onclick=drawDone()>Done</p>\
      <form id="drawgraph-form">\
        <!--<input type="checkbox" id="submit" name="submit" value="submit" checked="checked">Submit drawn graph to database for random graph and online quiz purposes\
        <br>--><input type="checkbox" id="copy" name="submit" value="submit" checked="checked">Copy JSON text to clipboard\
      </form>\
    </div>\
\
  ';
        // <text x = "250" y = "200"> &bull; Press Ctrl to Drag vertex around</text>\
  $('#drawgraph').html(toWrite);
  $('#copy').removeAttr('checked');
}

// function drawDone() {
//   if (!gtWidget.draw()) return false;
//   gtWidget.stopLoop();
//   $('#drawgraph').fadeOut();
//   $('#dark-overlay').fadeOut();
// }

// function drawCancel() {
//   gtWidget.stopLoop();
//   $('#drawgraph').fadeOut();
//   $('#dark-overlay').fadeOut();
// }

// function drawGraph() {
//   if (mode == "exploration") {
//     $('#dark-overlay').fadeIn(function() {
//       $('#drawgraph').fadeIn();
//     });
//     gtWidget.startLoop();
//   }
// }