// Defines ONE vertex object
// Set styles in properties.js and the CSS files!!!

var GraphPolygonWidget = function(polygonId, pointList) {
  var self = this;
  var defaultAnimationDuration = 250; // millisecond

  var polygon = null;
  var state = null;

  var attributeList = {
    "polygon": {
      "class": null,
      "points": null,
      "fill": null,
      "stroke-width": null,
      "opacity": null
    }
  }

  init();

  this.redraw = function(duration) {
    draw(duration);
  }

  // Specifies the duration of the animation in milliseconds
  // If unspecified or illegal value, default duration applies. 
  this.showPolygon = function() {
    if (state == null || state == undefined) {
      state = POLYGON_DEFAULT;
    }
    attributeList["polygon"]["class"]         = graphPolygonProperties["polygon"]["class"];
    attributeList["polygon"]["stroke-width"]  = graphPolygonProperties["polygon"]["stroke-width"];
    attributeList["polygon"]["fill"]          = graphPolygonProperties["polygon"][state]["fill"];
    attributeList["polygon"]["opacity"]       = graphPolygonProperties["polygon"][state]["opacity"];
  }

  this.hidePolygon = function() {
    attributeList["polygon"]["opacity"]       = 0;
  }

  // Removes the vertex (no animation)
  // If you want animation, hide & redraw the vertex first, then call this function
  this.removePolygon = function() {
    polygon.remove();
  }

  this.statePolygon = function(stateName) {
    state = stateName;
    var key;
    for (key in graphPolygonProperties["polygon"][state])
      attributeList["polygon"][key] = graphPolygonProperties["polygon"][state][key];
  }

  this.getAttributes = function() {
    return deepCopy(attributeList);
  }

  this.getClassNumber = function() {
    return polygonId;
  }

  // Initialize polygon
  function init() {
    polygon = polygonSvg.append("polygon");
    
    attributeList["polygon"]["class"] = "p"+polygonId;
    var pointListText = "";
    for (key in pointList) {
      pointListText = pointListText + pointList[key].x + "," + pointList[key].y + " ";
    }
    attributeList["polygon"]["points"] = pointListText;
    attributeList["polygon"]["fill"] = graphPolygonProperties["polygon"]["default"]["fill"];
    attributeList["polygon"]["stroke-width"] = 0;
    attributeList["polygon"]["opacity"] = 1.0;

    polygon.attr("class", attributeList["polygon"]["class"])
      .attr("points", attributeList["polygon"]["points"])
      .attr("fill", attributeList["polygon"]["fill"])
      .attr("stroke-width", attributeList["polygon"]["stroke-width"])
      .attr("opacity", attributeList["polygon"]["opacity"]);
  }

  // Refreshes the vertex image
  // "dur" specifies the duration of the animation in milliseconds
  // If unspecified or illegal value, default duration applies. 
  function draw(dur) {
    if (dur == null || isNaN(dur)) dur = defaultAnimationDuration;
    if (dur <= 0) dur = 1;
    polygon.transition()
      .duration(dur)
      .attr("points", attributeList["polygon"]["points"])
      .attr("fill", attributeList["polygon"]["fill"])
      .attr("stroke-width", attributeList["polygon"]["stroke-width"])
      .attr("opacity", attributeList["polygon"]["opacity"]);
  }
}